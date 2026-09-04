/**
 * /ask 主聊天组件（自写，无 HeroUI）。
 * 状态机：idle → thinking（检索+思考）→ streaming（正文流出）→ idle。
 * 状态行只说真话：检索结果一次性展示，不做假节奏；
 * reasoning_content 实时进 DeepSeek 式折叠思考面板。
 */
import { Copy, Loader2, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import {
	type ReactElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	type AskPersonaId,
	DEFAULT_ASK_PERSONA,
	getAskPersona,
} from "@/utils/ask-personas";
import { readAskSse } from "@/utils/ask-sse";
import AskMarkdown from "./AskMarkdown";
import { AskThinking } from "./AskThinking";
import { AskComposer } from "./Composer";
import { AskFollowUps, buildFollowUps, fmtBytes } from "./FollowUps";
import { AskSourcesPill } from "./Sources";
import {
	ASK_IMAGE_MAX_BYTES,
	ASK_TEXT_MAX_BYTES,
	type AskAttachment,
	type AskAttachmentPayload,
	type AskHit,
	type AskSource,
	type TraceStep,
} from "./ask-types";

/** trailingSlash: always → 末尾斜杠 */
const ASK_API = "/api/ask/";
const IS_DEV = import.meta.env.DEV;

const SUGGESTIONS = [
	"这个博客用了什么技术栈？",
	"怎么部署这个博客？",
	"园主最近写了什么？",
	"站点有哪些合集可以看？",
] as const;

const MAX_ATTACHMENTS = 4;

type ChatStatus = "idle" | "thinking" | "streaming";

type Message = {
	id: string;
	role: "assistant" | "user";
	text: string;
	sources?: AskSource[];
	followUps?: string[];
	trace?: TraceStep[];
	/** reasoning_content 聚合 */
	reasoning?: string;
	/** 检索+思考总耗时（首个正文 token 到达时刻） */
	thinkMs?: number;
	attachments?: AskAttachment[];
	/** 正在接收 SSE */
	streaming?: boolean;
};

/** 耗时文案：<1s 记「1 秒内」，其余取整秒 */
function fmtThinkDuration(ms: number): string {
	return ms < 1000
		? "用时 1 秒内"
		: `用时 ${Math.max(1, Math.round(ms / 1000))} 秒`;
}

function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result ?? ""));
		r.onerror = () => reject(r.error);
		r.readAsText(file);
	});
}

function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result ?? ""));
		r.onerror = () => reject(r.error);
		r.readAsDataURL(file);
	});
}

async function copyText(text: string) {
	await navigator.clipboard.writeText(text);
}

function findPrecedingUserText(
	messages: Message[],
	assistantId: string,
): string {
	const idx = messages.findIndex((m) => m.id === assistantId);
	if (idx < 0) return "";
	for (let i = idx - 1; i >= 0; i--) {
		if (messages[i].role === "user") return messages[i].text;
	}
	return "";
}

function downloadTurnMarkdown(opts: {
	question: string;
	answer: string;
	personaLabel: string;
}) {
	const now = new Date();
	const stamp = [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, "0"),
		String(now.getDate()).padStart(2, "0"),
		"-",
		String(now.getHours()).padStart(2, "0"),
		String(now.getMinutes()).padStart(2, "0"),
	].join("");
	const origin =
		typeof globalThis.location?.origin === "string"
			? globalThis.location.origin
			: "";
	const page = origin ? `${origin}/ask/` : "/ask/";
	const md = [
		"# 数字花园 · 问答记录",
		"",
		`- 时间：${now.toLocaleString("zh-CN", { hour12: false })}`,
		`- 角色：${opts.personaLabel}`,
		`- 页面：${page}`,
		"",
		"## 用户",
		"",
		opts.question.trim() || "（无）",
		"",
		"## 助手",
		"",
		opts.answer.trim() || "（无）",
		"",
	].join("\n");
	const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `firefly-ask-${stamp}.md`;
	a.click();
	URL.revokeObjectURL(url);
}

async function ensureSession(
	tokenRef: { current: string | null },
	chatIdRef: { current: string | null },
) {
	if (tokenRef.current && chatIdRef.current) return;
	const res = await fetch(`${ASK_API}?action=session`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
	});
	const data = (await res.json()) as {
		code?: number;
		message?: string;
		data?: { token?: string; chatId?: string };
	};
	if (data.code !== 200 || !data.data?.token || !data.data?.chatId) {
		throw new Error(data.message || "无法创建问答会话");
	}
	tokenRef.current = data.data.token;
	chatIdRef.current = data.data.chatId;
}

type AskIntent = "recent" | "keyword" | "site-meta";

type RetrieveResult = {
	labels: string[];
	intent: AskIntent;
	hits: AskHit[];
	scope: string;
	meta: { scanned: number; elapsedMs: number; matched: number };
};

async function retrieveHits(message: string): Promise<RetrieveResult> {
	const res = await fetch(`${ASK_API}?action=retrieve`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		cache: "no-store",
		body: JSON.stringify({ message, limit: 6 }),
	});
	const data = (await res.json()) as {
		code?: number;
		message?: string;
		data?: {
			labels?: string[];
			intent?: AskIntent;
			hits?: AskHit[];
			scope?: string;
			meta?: Partial<RetrieveResult["meta"]>;
		};
	};
	if (data.code !== 200 || !data.data) {
		throw new Error(data.message || "本站检索失败");
	}
	const meta = data.data.meta;
	const intent: AskIntent =
		data.data.intent === "recent"
			? "recent"
			: data.data.intent === "site-meta"
				? "site-meta"
				: "keyword";
	return {
		labels: data.data.labels || [],
		intent,
		hits: data.data.hits || [],
		scope: data.data.scope || "本站文章库",
		meta: {
			scanned: Number(meta?.scanned) || 0,
			elapsedMs: Number(meta?.elapsedMs) || 0,
			matched: Number(meta?.matched) || 0,
		},
	};
}


export default function AskChat({
	mode = "page",
}: {
	/** page = /ask 全功能页；widget = 浮窗轻量（跳过检索与思考链，直发直答） */
	mode?: "page" | "widget";
}): ReactElement {
	const [messages, setMessages] = useState<Message[]>([]);
	const [value, setValue] = useState("");
	const [status, setStatus] = useState<ChatStatus>("idle");
	const [attachments, setAttachments] = useState<AskAttachment[]>([]);
	const [debugOpen, setDebugOpen] = useState<Record<string, boolean>>({});
	const [votes, setVotes] = useState<Record<string, "up" | "down" | undefined>>(
		{},
	);
	const [voteAnim, setVoteAnim] = useState<
		Record<string, "pop" | "shake" | undefined>
	>({});
	const [actionHint, setActionHint] = useState<string | null>(null);
	const [personaId, setPersonaId] = useState<AskPersonaId>(DEFAULT_ASK_PERSONA);
	const lastUserRef = useRef("");
	const tokenRef = useRef<string | null>(null);
	const chatIdRef = useRef<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const convRef = useRef<HTMLDivElement>(null);
	const stickRef = useRef(true);

	useEffect(() => {
		if (!actionHint) return;
		const t = window.setTimeout(() => setActionHint(null), 2200);
		return () => window.clearTimeout(t);
	}, [actionHint]);

	useEffect(() => {
		return () => {
			abortRef.current?.abort();
		};
	}, []);

	/** 流式时若用户没往上翻，保持吸底 */
	useEffect(() => {
		const el = convRef.current;
		if (!el || !stickRef.current) return;
		el.scrollTop = el.scrollHeight;
	}, [messages]);

	const handleConvScroll = useCallback(() => {
		const el = convRef.current;
		if (!el) return;
		stickRef.current =
			el.scrollHeight - el.scrollTop - el.clientHeight < 48;
	}, []);

	/** 流式节流：累积增量 → 每 80ms 落一次 setState */
	const streamBuf = useRef<{ text: string; reasoning: string }>({
		text: "",
		reasoning: "",
	});
	const streamTimer = useRef<number | null>(null);
	const flushStream = useCallback((assistantId: string) => {
		const snap = { ...streamBuf.current };
		setMessages((prev) =>
			prev.map((m) =>
				m.id === assistantId
					? {
							...m,
							text: snap.text,
							reasoning: snap.reasoning || m.reasoning,
							streaming: true,
						}
					: m,
			),
		);
	}, []);
	const queueStream = useCallback(
		(assistantId: string) => {
			if (streamTimer.current !== null) return;
			streamTimer.current = window.setTimeout(() => {
				streamTimer.current = null;
				flushStream(assistantId);
			}, 80);
		},
		[flushStream],
	);

	const pickFiles = useCallback(
		async (files: FileList | null) => {
			if (!files?.length) return;
			const picked: AskAttachment[] = [];
			for (const f of Array.from(files)) {
				if (picked.length + attachments.length >= MAX_ATTACHMENTS) {
					setActionHint(`一次最多带 ${MAX_ATTACHMENTS} 个附件`);
					break;
				}
				const isImage = f.type.startsWith("image/");
				if (isImage && f.size > ASK_IMAGE_MAX_BYTES) {
					setActionHint(`「${f.name}」超过 2MB，未添加`);
					continue;
				}
				if (!isImage && f.size > ASK_TEXT_MAX_BYTES) {
					setActionHint(`「${f.name}」超过 200KB，未添加`);
					continue;
				}
				try {
					if (isImage) {
						const dataUrl = await readFileAsDataUrl(f);
						picked.push({
							id: crypto.randomUUID(),
							name: f.name,
							size: f.size,
							mime: f.type,
							kind: "image",
							dataUrl,
						});
					} else {
						const text = await readFileAsText(f);
						picked.push({
							id: crypto.randomUUID(),
							name: f.name,
							size: f.size,
							mime: f.type || "text/plain",
							kind: "text",
							text,
						});
					}
				} catch {
					setActionHint(`「${f.name}」读取失败`);
				}
			}
			if (picked.length) {
				setAttachments((prev) =>
					[...prev, ...picked].slice(0, MAX_ATTACHMENTS),
				);
				setActionHint(`已添加 ${picked.length} 个附件`);
			}
		},
		[attachments.length],
	);

	const patchAssistant = useCallback(
		(assistantId: string, patch: Partial<Message>) => {
			setMessages((prev) =>
				prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
			);
		},
		[],
	);

	/** 浮窗轻量发送：跳过检索与思考链，直发（答案仍带 markdown 渲染与来源） */
	const sendLiteText = useCallback(
		async (raw: string) => {
			const text = raw.trim();
			if (!text) return;
			abortRef.current?.abort();
			const ac = new AbortController();
			abortRef.current = ac;
			lastUserRef.current = text;
			setMessages((prev) => [
				...prev,
				{ id: crypto.randomUUID(), role: "user", text },
			]);
			setValue("");
			setStatus("thinking");
			const assistantId = crypto.randomUUID();
			setMessages((prev) => [
				...prev,
				{ id: assistantId, role: "assistant", text: "", streaming: true },
			]);
				try {
					// 边收边流式展示（与 page 路径同款 80ms 节流）
					streamBuf.current = { text: "", reasoning: "" };
					const { text: full, sources } = await (async () => {
						const acStream = ac;
						await ensureSession(tokenRef, chatIdRef);
						const res = await fetch(`${ASK_API}?action=chat`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								token: tokenRef.current,
								chatId: chatIdRef.current,
								message: text,
								hits: [],
								persona: personaId,
							}),
							signal: acStream.signal,
						});
						const ctype = res.headers.get("content-type") || "";
						if (!res.ok || !ctype.includes("text/event-stream")) {
							let errMsg = `HTTP ${res.status}`;
							try {
								const errBody = (await res.json()) as { message?: string };
								errMsg = errBody.message || errMsg;
							} catch {
								/* keep */
							}
							throw new Error(errMsg);
						}
						const { text: fullText, last } = await readAskSse(res, {
							signal: acStream.signal,
							onDelta: (_d, full) => {
								streamBuf.current.text = full;
								queueStream(assistantId);
							},
						});
						const srcs: AskSource[] = (last?.paragraph_list || []).map(
							(p) => ({
								title: p.title || p.document_name || "文章",
								url: p.source_url || "#",
							}),
						);
						return { text: fullText, sources: srcs };
					})();
					if (streamTimer.current !== null) {
						window.clearTimeout(streamTimer.current);
						streamTimer.current = null;
					}
					flushStream(assistantId);
					setMessages((prev) =>
						prev.map((m) =>
							m.id === assistantId
								? {
										...m,
										streaming: false,
										text: full || "（没拿到回答）",
										sources: sources.length ? sources : undefined,
									}
								: m,
						),
					);
				} catch (err) {
					const isAbort = err instanceof DOMException && err.name === "AbortError";
					setMessages((prev) =>
						prev.map((m) =>
							m.id === assistantId
								? {
										...m,
										streaming: false,
										text: isAbort
											? m.text || "（已中断）"
											: `出了点问题：${err instanceof Error ? err.message : "未知错误"}`,
									}
								: m,
						),
					);
				} finally {
					if (streamTimer.current !== null) {
						window.clearTimeout(streamTimer.current);
						streamTimer.current = null;
					}
					setStatus("idle");
				}
			},
			[personaId, patchAssistant, flushStream, queueStream],
		);

	const sendText = useCallback(
		async (
			raw: string,
			opts?: {
				force?: boolean;
				regenerate?: boolean;
				attachments?: AskAttachment[];
			},
		) => {
			const turnAttachments = opts?.attachments ?? [];
			const text = raw.trim();
			if (!text && !turnAttachments.length) return;
			if (!opts?.force && status !== "idle") return;

			abortRef.current?.abort();
			const ac = new AbortController();
			abortRef.current = ac;

			lastUserRef.current = text;
			const t0 = performance.now();
			if (!opts?.regenerate) {
				setMessages((prev) => [
					...prev,
					{
						id: crypto.randomUUID(),
						role: "user",
						text,
						attachments: turnAttachments.length ? turnAttachments : undefined,
					},
				]);
			}
			setValue("");
			setAttachments([]);
			setStatus("thinking");
			stickRef.current = true;

			/** record：出现新步骤时把前面的 running 步收尾；同 id 覆盖 */
			const trace: TraceStep[] = [];
			const record = (step: Omit<TraceStep, "status">) => {
				for (const t of trace) if (t.status === "running") t.status = "done";
				const t: TraceStep = { ...step, status: "running" };
				const idx = trace.findIndex((x) => x.id === t.id);
				if (idx >= 0) trace[idx] = t;
				else trace.push(t);
				setMessages((prev) =>
					prev.map((m) =>
						m.id === assistantId
							? { ...m, trace: trace.map((x) => ({ ...x })) }
							: m,
					),
				);
			};
			const finalizeTrace = (stillAnswering = false): TraceStep[] =>
				trace.map((t) =>
					stillAnswering && t.id === "answer" ? t : { ...t, status: "done" },
				);

			const assistantId = crypto.randomUUID();
			// 先把助手占位消息放进去（trace 靠 record 渐进填）
			setMessages((prev) => [
				...prev,
				{
					id: assistantId,
					role: "assistant",
					text: "",
					streaming: false,
					trace: [],
				},
			]);

			try {
				// 会话与检索并行；检索始终现算（无答案缓存）
				record({
					id: "retrieve",
					kind: "search",
					label: "检索站内文章",
				});
				const [, retrieved] = await Promise.all([
					ensureSession(tokenRef, chatIdRef),
					retrieveHits(text),
				]);
				if (ac.signal.aborted) throw new DOMException("Aborted", "AbortError");

				const { scanned, elapsedMs, matched } = retrieved.meta;
				record({
					id: "retrieve",
					kind: "search",
					label: retrieved.hits.length
						? `已找到 ${retrieved.hits.length} 篇相关笔记`
						: "未命中站内文",
					summary: retrieved.hits.length
						? `扫描 ${scanned} 篇 · 候选 ${matched} · ${elapsedMs}ms`
						: `扫描 ${scanned} 篇 · ${elapsedMs}ms · 本轮无高相关条目`,
					hits: retrieved.hits,
				});

				if (turnAttachments.length) {
					record({
						id: "attachment",
						kind: "attachment",
						label: `读取附件 ${turnAttachments.length} 个`,
						summary: turnAttachments
							.map(
								(a) =>
									`- ${a.name}（${a.kind === "text" ? `文本 · ${fmtBytes(a.size)} · 已注入` : `图片 · ${fmtBytes(a.size)} · 仅展示`}）`,
							)
							.join("\n"),
					});
				}

				const fromSite: AskSource[] = retrieved.hits.map((h) => ({
					title: h.title,
					url: h.url,
					icon: h.icon,
					snippet: h.snippet,
					date: h.date,
				}));
				patchAssistant(assistantId, {
					sources: fromSite.length ? fromSite : undefined,
				});

				record({
					id: "answer",
					kind: "answer",
					label: "生成回答",
				});
				setStatus("streaming");

				const payloadAttachments: AskAttachmentPayload[] =
					turnAttachments.map((a) => ({
						name: a.name,
						kind: a.kind,
						text: a.text,
					}));

				const res = await fetch(`${ASK_API}?action=chat`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						token: tokenRef.current,
						chatId: chatIdRef.current,
						message: text || "请结合我上传的附件回答。",
						hits: retrieved.hits,
						intent: retrieved.intent,
						persona: personaId,
						attachments: payloadAttachments,
					}),
					signal: ac.signal,
				});

				const ctype = res.headers.get("content-type") || "";

				if (!res.ok || ctype.includes("application/json")) {
					let errMsg = `HTTP ${res.status}`;
					try {
						const errBody = (await res.json()) as {
							code?: number;
							message?: string;
						};
						errMsg = errBody.message || errMsg;
					} catch {
						/* keep */
					}
					setMessages((prev) =>
						prev.map((m) =>
							m.id === assistantId
								? {
										...m,
										streaming: false,
										text: `出了点问题：${errMsg}`,
										trace: finalizeTrace(),
										thinkMs: performance.now() - t0,
									}
								: m,
						),
					);
					return;
				}

				/** reasoning_content 兼容增量/全量两种上游行为 */
				const reasoningRef = { current: "" };
				const appendReasoning = (rc: string) => {
					const cur = reasoningRef.current;
					reasoningRef.current =
						rc.startsWith(cur) && rc.length > cur.length ? rc : cur + rc;
				};
				let firstTokenAt = 0;

				const { text: full, last } = await readAskSse(res, {
					signal: ac.signal,
					onDelta: (_delta, fullText, ev) => {
						const rc =
							typeof ev.reasoning_content === "string"
								? ev.reasoning_content
								: "";
						if (rc) appendReasoning(rc);
						streamBuf.current = {
							text: fullText,
							reasoning: reasoningRef.current,
						};
						// 首个正文 token：思考链收尾（answer 步留到作答完成），计时定格
						if (!firstTokenAt && fullText) {
							firstTokenAt = performance.now();
							patchAssistant(assistantId, {
								trace: finalizeTrace(true),
								thinkMs: firstTokenAt - t0,
							});
						}
						queueStream(assistantId);
					},
				});

				// 流结束：冲掉节流里最后一批
				if (streamTimer.current !== null) {
					window.clearTimeout(streamTimer.current);
					streamTimer.current = null;
				}
				flushStream(assistantId);

				const fromKb: AskSource[] = (last?.paragraph_list || []).map(
					(p) => ({
						title: p.title || p.document_name || "文章",
						url: p.source_url || "#",
					}),
				);
				const seen = new Set<string>();
				const sources: AskSource[] = [];
				for (const s of [...fromSite, ...fromKb]) {
					const key = `${s.url}|${s.title}`;
					if (seen.has(key) || s.url === "#") continue;
					seen.add(key);
					sources.push(s);
				}

				setMessages((prev) =>
					prev.map((m) =>
						m.id === assistantId
							? {
									...m,
									streaming: false,
									text: full || "（没拿到回答）",
									sources: sources.length ? sources : undefined,
									followUps: buildFollowUps(text, sources),
									trace: finalizeTrace(),
									reasoning: reasoningRef.current || undefined,
									thinkMs: m.thinkMs ?? performance.now() - t0,
								}
							: m,
					),
				);
			} catch (err) {
				if (err instanceof DOMException && err.name === "AbortError") {
					setMessages((prev) =>
						prev.map((m) =>
							m.id === assistantId && m.streaming
								? {
										...m,
										streaming: false,
										text: m.text || "（已中断）",
										trace: finalizeTrace(),
										thinkMs: m.thinkMs ?? performance.now() - t0,
									}
								: m,
						),
					);
					return;
				}
				const detail = err instanceof Error ? err.message : "";
				const looksDown =
					/MaxKB|不可达|ECONNREFUSED|Failed to fetch|网络/i.test(detail) ||
					!detail;
				const errText = looksDown
					? "本机问答服务（MaxKB）没在跑。请先打开 Docker Desktop，启动 MaxKB 容器（端口 8080），再刷新本页重试。"
					: `出了点问题：${detail}`;

				const traceSnapshot = trace.length ? finalizeTrace() : undefined;
				setMessages((prev) =>
					prev.map((m) =>
						m.id === assistantId
							? {
									...m,
									streaming: false,
									text: errText,
									trace: traceSnapshot ?? m.trace,
									thinkMs: performance.now() - t0,
								}
							: m,
					),
				);
			} finally {
				// 冲掉可能挂起的节流定时器，否则它会把已收尾的消息改回 streaming
				if (streamTimer.current !== null) {
					window.clearTimeout(streamTimer.current);
					streamTimer.current = null;
				}
				setStatus("idle");
			}
		},
		[status, personaId, flushStream, queueStream, patchAssistant],
	);

	const handleStop = useCallback(() => {
		abortRef.current?.abort();
		if (streamTimer.current !== null) {
			window.clearTimeout(streamTimer.current);
			streamTimer.current = null;
		}
		setStatus("idle");
		setActionHint("已停止生成");
		setMessages((prev) =>
			prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
		);
	}, []);

	const handleSubmit = () => {
		if (status !== "idle") {
			handleStop();
		}
		if (mode === "widget") {
			void sendLiteText(value);
			return;
		}
		void sendText(value, { force: true, attachments });
	};

	const handleSuggestion = (prompt: string) => {
		if (status !== "idle") handleStop();
		setValue(prompt);
		if (mode === "widget") {
			void sendLiteText(prompt);
			return;
		}
		void sendText(prompt, { force: true });
	};

	const handleRegenerate = useCallback(
		(assistantId: string) => {
			let question = "";
			setMessages((prev) => {
				const idx = prev.findIndex((m) => m.id === assistantId);
				if (idx < 0) return prev;
				question = findPrecedingUserText(prev, assistantId);
				return prev.slice(0, idx);
			});
			if (!question && lastUserRef.current) question = lastUserRef.current;
			if (!question) {
				setActionHint("没有可重新生成的问题");
				return;
			}
			setActionHint("正在重新生成…");
			queueMicrotask(() => {
				void sendText(question, { force: true, regenerate: true });
			});
		},
		[sendText],
	);

	const handleVote = useCallback((messageId: string, next: "up" | "down") => {
		setVotes((prev) => {
			const cur = prev[messageId];
			const cleared = cur === next ? undefined : next;
			if (cleared === "up") {
				queueMicrotask(() => {
					setVoteAnim((a) => ({ ...a, [messageId]: "pop" }));
					setActionHint("感谢反馈：有用");
				});
			} else if (cleared === "down") {
				queueMicrotask(() => {
					setVoteAnim((a) => ({ ...a, [messageId]: "shake" }));
					setActionHint("已记下：不太对");
				});
			} else {
				queueMicrotask(() => setActionHint(null));
			}
			return { ...prev, [messageId]: cleared };
		});
		window.setTimeout(() => {
			setVoteAnim((a) => ({ ...a, [messageId]: undefined }));
		}, 520);
	}, []);

	const handleExportMd = useCallback(
		(assistantId: string, answer: string) => {
			const question =
				findPrecedingUserText(messages, assistantId) ||
				lastUserRef.current ||
				"（无问题）";
			try {
				downloadTurnMarkdown({
					question,
					answer,
					personaLabel: getAskPersona(personaId).label,
				});
				setActionHint("已下载本轮对话 Markdown");
			} catch {
				setActionHint("下载失败，请重试");
			}
		},
		[messages, personaId],
	);

	const empty = messages.length === 0;
	const busy = status !== "idle";
	const persona = getAskPersona(personaId);
	const isWidget = mode === "widget";

	return (
		<div className={`ask-root${isWidget ? " compact" : ""}`}>
			<div
				className="ask-conv"
				ref={convRef}
				onScroll={handleConvScroll}
				role="log"
				aria-live="polite"
			>
				<div className="ask-conv-inner">
					{empty ? (
						<div className="ask-welcome">
							{isWidget ? (
								<h2>有什么想了解的？</h2>
							) : (
								<div className="ask-welcome-head">
									<img
										className="ask-char"
										src={persona.avatar}
										alt=""
										aria-hidden="true"
										decoding="async"
									/>
									<h2>有什么想了解的？</h2>
								</div>
							)}
							<p>
								问一句，我先在数字花园文章库里检索，再基于命中内容回答。也可以点下面的建议直接开始。
							</p>
							<p className="ask-welcome-sugg-label">你可以试着问：</p>
							<div className="ask-welcome-sugg">
								{SUGGESTIONS.map((prompt) => (
									<button
										key={prompt}
										type="button"
										className="ask-sugg"
										onClick={() => handleSuggestion(prompt)}
									>
										{prompt}
									</button>
								))}
							</div>
						</div>
					) : null}

					{messages.map((message) =>
						message.role === "user" ? (
							<div key={message.id} className="ask-msg user">
								<div className="ask-msg-body">
									<div className="ask-bubble">
										{message.text}
										{message.attachments?.length ? (
											<AskAttachmentChipsReadonly
												items={message.attachments}
											/>
										) : null}
									</div>
								</div>
							</div>
						) : (
							<div key={message.id} className="ask-msg assistant">
								<img
									className="ask-msg-avatar"
									alt={persona.label}
									src={persona.avatar}
								/>
								<div className="ask-msg-body">
									{!isWidget && (message.trace?.length || message.reasoning) ? (
										<AskThinking
											steps={message.trace ?? []}
											reasoning={message.reasoning}
											running={busy && !message.text && !message.streaming}
											durationText={
												typeof message.thinkMs === "number"
													? fmtThinkDuration(message.thinkMs)
													: ""
											}
											defaultOpen
										/>
									) : null}

									<div className="ask-bubble ask-bubble-md">
										{message.streaming || message.text ? (
											<AskMarkdown
												sources={message.sources}
												streaming={message.streaming}
											>
												{message.text}
											</AskMarkdown>
										) : (
											<div className="ask-loading">
												<span className="ask-dots">
													<span />
													<span />
													<span />
												</span>
												<span>正在生成回答…</span>
											</div>
										)}
									</div>

									{!message.streaming && message.sources?.length ? (
										<AskSourcesPill sources={message.sources} />
									) : null}

									{!message.streaming && IS_DEV ? (
										<div className="ask-debug">
											<button
												type="button"
												className="ask-debug-toggle"
												onClick={() =>
													setDebugOpen((prev) => ({
														...prev,
														[message.id]: !prev[message.id],
													}))
												}
											>
												{debugOpen[message.id]
													? "收起原文"
													: "调试：查看原文"}
											</button>
											{debugOpen[message.id] ? (
												<pre className="ask-debug-pre">{message.text}</pre>
											) : null}
										</div>
									) : null}

									{!message.streaming && message.text ? (
										<div className="ask-actions">
											<button
												type="button"
												className="ask-action"
												aria-label="复制"
												title="复制"
												onClick={() => {
													void copyText(message.text)
														.then(() => setActionHint("已复制回答"))
														.catch(() =>
															setActionHint("复制失败，请手动选择文本"),
														);
												}}
											>
												<Copy />
											</button>
											<button
												type="button"
												className="ask-action"
												aria-label="重新生成"
												title="重新生成"
												onClick={() => handleRegenerate(message.id)}
											>
												<Loader2 />
											</button>
											<button
												type="button"
												className="ask-action"
												aria-label="导出 Markdown"
												title="导出本轮对话 Markdown"
												onClick={() => handleExportMd(message.id, message.text)}
											>
												<Share2 />
											</button>
											<button
												type="button"
												className={[
													"ask-action",
													votes[message.id] === "up"
														? "ask-action-active"
														: "",
													voteAnim[message.id] === "pop" ? "is-pop" : "",
												]
													.filter(Boolean)
													.join(" ")}
												aria-label="有用"
												title="有用"
												onClick={() => handleVote(message.id, "up")}
											>
												<ThumbsUp />
											</button>
											<button
												type="button"
												className={[
													"ask-action",
													votes[message.id] === "down"
														? "ask-action-active"
														: "",
													voteAnim[message.id] === "shake" ? "is-shake" : "",
												]
													.filter(Boolean)
													.join(" ")}
												aria-label="不太对"
												title="不太对"
												onClick={() => handleVote(message.id, "down")}
											>
												<ThumbsDown />
											</button>
										</div>
									) : null}

									{!message.streaming && message.followUps?.length ? (
										<AskFollowUps
											items={message.followUps}
											onPick={(q) => handleSuggestion(q)}
										/>
									) : null}
								</div>
							</div>
						),
					)}
				</div>
			</div>

			<div className="ask-dock">
				<div className="ask-dock-inner">
					{actionHint ? (
						<p className="ask-action-hint" role="status">
							{actionHint}
						</p>
					) : null}
					<AskComposer
						value={value}
						onValueChange={setValue}
						onSubmit={handleSubmit}
						onStop={handleStop}
						busy={busy}
						persona={personaId}
						onPersonaChange={setPersonaId}
						plusSuggestions={SUGGESTIONS}
						onPickSuggestion={handleSuggestion}
						attachments={attachments}
						onRemoveAttachment={(id) =>
							setAttachments((prev) => prev.filter((a) => a.id !== id))
						}
						onPickFiles={(files) => void pickFiles(files)}
						allowAttachments={!isWidget}
					/>
					{isWidget ? null : (
						<p className="ask-disclaimer">
							AI 回答仅供参考，重要信息请核实
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

/** 用户消息里的附件展示（不可移除） */
function AskAttachmentChipsReadonly({
	items,
}: {
	items: AskAttachment[];
}): ReactElement | null {
	if (!items.length) return null;
	return (
		<span className="ask-attach-row" style={{ padding: "0.4rem 0 0" }}>
			{items.map((a) => (
				<span
					key={a.id}
					className="ask-attach-chip"
					title={`${a.name} · ${fmtBytes(a.size)}`}
				>
					{a.kind === "image" && a.dataUrl ? (
						<img className="ask-attach-thumb" src={a.dataUrl} alt={a.name} />
					) : null}
					<span className="ask-attach-name">{a.name}</span>
					<span className="ask-attach-size">{fmtBytes(a.size)}</span>
				</span>
			))}
		</span>
	);
}
