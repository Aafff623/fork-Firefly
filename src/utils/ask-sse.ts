/**
 * MaxKB SSE 解析：data: { content, is_end, … }\n\n
 * content 为增量片段，需追加；末包常 content:"" + is_end:true。
 */

export type AskSseEvent = {
	content?: string;
	is_end?: boolean;
	reasoning_content?: string;
	chat_id?: string;
	chat_record_id?: string;
	paragraph_list?: Array<{
		title?: string;
		document_name?: string;
		source_url?: string;
		content?: string;
	}>;
	[key: string]: unknown;
};

export function parseSseBuffer(buffer: string): {
	events: AskSseEvent[];
	rest: string;
} {
	const parts = buffer.split("\n\n");
	const rest = parts.pop() ?? "";
	const events: AskSseEvent[] = [];

	for (const part of parts) {
		const lines = part.split("\n");
		const dataLines: string[] = [];
		for (const line of lines) {
			if (line.startsWith("data:")) {
				dataLines.push(line.slice(5).trimStart());
			}
		}
		if (!dataLines.length) continue;
		const raw = dataLines.join("\n").trim();
		if (!raw || raw === "[DONE]") continue;
		try {
			const ev = JSON.parse(raw) as AskSseEvent;
			// OpenAI 兼容上游（StepFun）把增量嵌在 choices[0].delta 里；
			// 提升到顶层，MaxKB 的顶层 content / reasoning_content 不受影响。
			const delta = (
				ev as {
					choices?: Array<{
						delta?: { content?: unknown; reasoning_content?: unknown };
					}>;
				}
			).choices?.[0]?.delta;
			if (delta) {
				if (typeof delta.content === "string" && ev.content === undefined) {
					ev.content = delta.content;
				}
				if (
					typeof delta.reasoning_content === "string" &&
					ev.reasoning_content === undefined
				) {
					ev.reasoning_content = delta.reasoning_content;
				}
			}
			events.push(ev);
		} catch {
			/* 半截 JSON 留给 rest 不成立：整帧坏了就跳过 */
		}
	}

	return { events, rest };
}

export type ReadAskSseOptions = {
	onDelta: (delta: string, fullText: string, event: AskSseEvent) => void;
	onEnd?: (fullText: string, last: AskSseEvent | null) => void;
	signal?: AbortSignal;
};

export async function readAskSse(
	response: Response,
	options: ReadAskSseOptions,
): Promise<{ text: string; last: AskSseEvent | null }> {
	const { onDelta, onEnd, signal } = options;
	if (!response.body) {
		throw new Error("响应没有可读流");
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	let fullText = "";
	let last: AskSseEvent | null = null;
	let ended = false;

	const abort = () => {
		try {
			void reader.cancel();
		} catch {
			/* ignore */
		}
	};
	if (signal) {
		if (signal.aborted) {
			abort();
			throw new DOMException("Aborted", "AbortError");
		}
		signal.addEventListener("abort", abort, { once: true });
	}

	try {
		while (true) {
			if (signal?.aborted) {
				throw new DOMException("Aborted", "AbortError");
			}
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			// 兼容 CRLF 上游：先标准化为 LF 再解析
			buffer = buffer.replace(/\r\n/g, "\n");
			const parsed = parseSseBuffer(buffer);
			buffer = parsed.rest;

			for (const ev of parsed.events) {
				last = ev;
				const delta = typeof ev.content === "string" ? ev.content : "";
				if (delta) {
					fullText += delta;
				}
				// reasoning_content 常随 content:"" 的空帧到达，不能只认 delta
				if (delta || typeof ev.reasoning_content === "string") {
					onDelta(delta, fullText, ev);
				}
				if (ev.is_end) {
					ended = true;
					onEnd?.(fullText, last);
					return { text: fullText, last };
				}
			}
		}

		// 尾缓冲
		if (buffer.trim()) {
			const parsed = parseSseBuffer(`${buffer}\n\n`);
			for (const ev of parsed.events) {
				last = ev;
				const delta = typeof ev.content === "string" ? ev.content : "";
				if (delta) {
					fullText += delta;
				}
				if (delta || typeof ev.reasoning_content === "string") {
					onDelta(delta, fullText, ev);
				}
				if (ev.is_end) ended = true;
			}
		}

		if (!ended) onEnd?.(fullText, last);
		return { text: fullText, last };
	} finally {
		if (signal) signal.removeEventListener("abort", abort);
		try {
			reader.releaseLock();
		} catch {
			/* ignore */
		}
	}
}
