import { ChatConversation } from "@heroui-pro/react/chat-conversation";
import { ChatLoader } from "@heroui-pro/react/chat-loader";
import { ChatMessage } from "@heroui-pro/react/chat-message";
import { ChatMessageActions } from "@heroui-pro/react/chat-message-actions";
import { StreamMarkdown } from "@heroui-pro/react/markdown";
import type { ChatStatus } from "@heroui-pro/react/prompt-input";
import { PromptSuggestion } from "@heroui-pro/react/prompt-suggestion";
import { TextShimmer } from "@heroui-pro/react/text-shimmer";
import { Share2 } from "lucide-react";
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
import {
	AskAttachmentChips,
	AskFollowUps,
	AskGrokComposer,
	AskSourcesPill,
	buildFollowUps,
} from "./AskGrokBits";
import AskMarkdown, {
	askMarkdownComponents,
	linkifyCitations,
} from "./AskMarkdown";
import { AskThinking } from "./AskThinking";
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

type RetrieveMeta = {
	scanned: number;
	elapsedMs: number;
	matched: number;
	cached: false;
};

type Message = {
	id: string;
	role: "assistant" | "user";
	text: string;
	sources?: AskSource[];
	followUps?: string[];
	trace?: TraceStep[];
	/** reasoning_content 聚合（MaxKB 上游为思考模型时到达） */
	reasoning?: string;
	/** 思考+检索总耗时（首个正文 token 到达时刻） */
	thinkMs?: number;
	attachments?: AskAttachment[];
	/** 正在接收 MaxKB SSE */
	streaming?: boolean;
};

function understandQuestion(q: string): string {
	const trimmed = q.trim();
	if (/最近|近期|写了什么|新笔记|新文章/.test(trimmed)) {
		return "理解为：你想看园主最近在数字花园里写了哪些笔记。";
	}
	if (trimmed.length <= 48) {
		return `理解为：你想了解「${trimmed}」。`;
	}
	return `理解为：你想了解「${trimmed.slice(0, 48)}…」。`;
}

/** 豆包式耗时文案：<1s 记「1 秒内」，其余取整秒 */
function fmtThinkDuration(ms: number): string {
	return ms < 1000
		? "用时 1 秒内"
		: `用时 ${Math.max(1, Math.round(ms / 1000))} 秒`;
}

function fmtBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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

async function retrieveHits(message: string): Promise<{
	labels: string[];
	intent: AskIntent;
	hits: AskHit[];
	scope: string;
	meta: RetrieveMeta;
}> {
	const res = await fetch(`${ASK_API}?action=retrieve`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-cache",
		},
		cache: "no-store",
		body: JSON.stringify({ message, limit: 6 }),
	});
	const data = (await res.json()) as {
		code?: number;
		message?: string;
		data?: {
			labels?: string[];
			/** 旧字段兼容 */
			terms?: string[];
			intent?: AskIntent;
			hits?: AskHit[];
			scope?: string;
			meta?: Partial<RetrieveMeta>;
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
		labels: data.data.labels || data.data.terms || [],
		intent,
		hits: data.data.hits || [],
		scope: data.data.scope || "本站文章库",
		meta: {
			scanned: Number(meta?.scanned) || 0,
			elapsedMs: Number(meta?.elapsedMs) || 0,
			matched: Number(meta?.matched) || 0,
			cached: false,
		},
	};
}

export default function AskChat(): ReactElement {
	const [messages, setMessages] = useState<Message[]>([]);
	const [value, setValue] = useState("");
	const [status, setStatus] = useState<ChatStatus>("ready");
	const [thinking, setThinking] = useState(false);
	const [liveTrace, setLiveTrace] = useState<TraceStep[]>([]);
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
	const shellRef = useRef<HTMLDivElement>(null);
	const viewportRef = useRef<HTMLDivElement>(null);

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

	// 暗色适配只认站点的 html.dark（CSS 祖先选择器），组件不再自算主题：
	// 之前组件自己挂 data-theme 在水合时被 React 卡死在 light，暗色下题卡一直发白。

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
							id: `at-${Date.now()}-${picked.length}`,
							name: f.name,
							size: f.size,
							mime: f.type,
							kind: "image",
							dataUrl,
						});
					} else {
						const text = await readFileAsText(f);
						picked.push({
							id: `at-${Date.now()}-${picked.length}`,
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
			if (!opts?.force && status !== "ready") return;

			abortRef.current?.abort();
			const ac = new AbortController();
			abortRef.current = ac;

			lastUserRef.current = text;
			const t0 = performance.now();
			if (!opts?.regenerate) {
				const userMessage: Message = {
					id: `u-${Date.now()}`,
					role: "user",
					text,
					attachments: turnAttachments.length ? turnAttachments : undefined,
				};
				setMessages((prev) => [...prev, userMessage]);
			}
			setValue("");
			setAttachments([]);
			setStatus("submitted");
			setThinking(true);
			setLiveTrace([]);

			/** record：出现新步骤时把前面的 running 步收尾；同 id 覆盖（渐进展示） */
			const trace: TraceStep[] = [];
			const record = (step: Omit<TraceStep, "status">) => {
				for (const t of trace) if (t.status === "running") t.status = "done";
				const t: TraceStep = { ...step, status: "running" };
				const idx = trace.findIndex((x) => x.id === t.id);
				if (idx >= 0) trace[idx] = t;
				else trace.push(t);
				setLiveTrace(trace.map((x) => ({ ...x })));
			};
			/** 收尾：全部打勾；stillAnswering 时「生成回答」步保持 running（流式中仍在作答） */
			const finalizeTrace = (stillAnswering = false): TraceStep[] =>
				trace.map((t) =>
					stillAnswering && t.id === "answer" ? t : { ...t, status: "done" },
				);

			const assistantId = `a-${Date.now()}`;

			try {
				const understood = understandQuestion(
					text || turnAttachments.map((a) => a.name).join("、"),
				);
				record({
					id: "understand",
					kind: "parse",
					label: "解析问题",
					summary: understood,
				});

				// 会话与检索并行；检索始终现算（无答案缓存）
				record({
					id: "scope",
					kind: "search",
					label: "检索站内文章",
					summary: "正在扫描本站文章库并打分（非缓存）…",
				});
				const [, retrieved] = await Promise.all([
					ensureSession(tokenRef, chatIdRef),
					retrieveHits(text),
				]);
				if (ac.signal.aborted) throw new DOMException("Aborted", "AbortError");
				setStatus("streaming");

				const labelText =
					retrieved.labels.length > 0
						? retrieved.labels.join(" · ")
						: "（未抽出可用关键词）";
				const { scanned, elapsedMs, matched } = retrieved.meta;
				const scopeSummary =
					retrieved.intent === "recent"
						? `去向：${retrieved.scope}\n策略：按发布时间取最新笔记\n扫描 ${scanned} 篇 · 耗时 ${elapsedMs}ms · 无答案缓存`
						: retrieved.intent === "site-meta"
							? `去向：${retrieved.scope}\n策略：本站元问题（优先 Firefly/主题文档，忽略「部署」泛匹配）\n关注点：${labelText}\n扫描 ${scanned} 篇 · 候选 ${matched} · 耗时 ${elapsedMs}ms · 无答案缓存`
							: `去向：${retrieved.scope}\n关注点：${labelText}\n扫描 ${scanned} 篇 · 相关候选 ${matched} · 耗时 ${elapsedMs}ms · 无答案缓存`;
				record({
					id: "scope",
					kind: "search",
					label: "检索站内文章",
					summary: scopeSummary,
				});

				if (turnAttachments.length) {
					const lines = turnAttachments.map((a) => {
						const how =
							a.kind === "text"
								? `文本 · ${fmtBytes(a.size)} · 已注入`
								: `图片 · ${fmtBytes(a.size)} · 仅展示`;
						return `- ${a.name}（${how}）`;
					});
					record({
						id: "attachment",
						kind: "attachment",
						label: `读取附件 ${turnAttachments.length} 个`,
						summary: lines.join("\n"),
					});
				}

				// 逐条亮出真实命中（展示节奏，不是假装搜索）
				const revealed: AskHit[] = [];
				if (!retrieved.hits.length) {
					record({
						id: "hits",
						kind: "read",
						label: "未命中站内文",
						summary:
							retrieved.intent === "site-meta"
								? "站内少有「部署本站」专文；将依据站点硬事实（Astro / Vercel / pnpm）作答，不会拿无关「部署」文凑数。"
								: "本轮关键词未在标题/摘要/标签/正文中找到足够相关条目；将主要依赖模型上下文作答，不会背预制答案。",
					});
				} else {
					for (let i = 0; i < retrieved.hits.length; i++) {
						if (ac.signal.aborted) {
							throw new DOMException("Aborted", "AbortError");
						}
						revealed.push(retrieved.hits[i]);
						const label =
							retrieved.intent === "recent"
								? `最近 ${revealed.length}/${retrieved.hits.length} 篇`
								: retrieved.intent === "site-meta"
									? `本站相关 ${revealed.length}/${retrieved.hits.length}`
									: `命中 ${revealed.length}/${retrieved.hits.length} 篇`;
						record({
							id: "hits",
							kind: "read",
							label,
							hits: revealed.slice(),
						});
						if (i < retrieved.hits.length - 1) await sleep(120);
					}
				}

				record({
					id: "answer",
					kind: "answer",
					label: "生成回答",
					summary: "根据本轮命中段落与会话上下文实时生成（流式）…",
				});

				const fromSite: AskSource[] = retrieved.hits.map((h) => ({
					title: h.title,
					url: h.url,
					icon: h.icon,
					snippet: h.snippet,
					date: h.date,
				}));

				setMessages((prev) => [
					...prev,
					{
						id: assistantId,
						role: "assistant",
						text: "",
						streaming: true,
						sources: fromSite.length ? fromSite : undefined,
						trace: trace.map((t) => ({ ...t })),
					},
				]);
				setThinking(false);
				setLiveTrace([]);

				const payloadAttachments: AskAttachmentPayload[] = turnAttachments.map(
					(a) => ({ name: a.name, kind: a.kind, text: a.text }),
				);

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
					const snap = reasoningRef.current;
					setMessages((prev) =>
						prev.map((m) =>
							m.id === assistantId ? { ...m, reasoning: snap } : m,
						),
					);
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
						// 首个正文 token（reasoning 帧不算）：思考链收尾、计时定格
						if (!firstTokenAt && fullText) {
							firstTokenAt = performance.now();
							// 首个正文 token：思考链收尾（answer 步留到作答完成），计时定格
							const done = finalizeTrace(true);
							const thinkMs = firstTokenAt - t0;
							setMessages((prev) =>
								prev.map((m) =>
									m.id === assistantId
										? {
												...m,
												text: fullText,
												streaming: true,
												trace: done,
												thinkMs,
											}
										: m,
								),
							);
							return;
						}
						setMessages((prev) =>
							prev.map((m) =>
								m.id === assistantId
									? { ...m, text: fullText, streaming: true }
									: m,
							),
						);
					},
				});

				const fromKb: AskSource[] = (last?.paragraph_list || []).map((p) => ({
					title: p.title || p.document_name || "文章",
					url: p.source_url || "#",
				}));
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
				setMessages((prev) => {
					const has = prev.some((m) => m.id === assistantId);
					if (has) {
						return prev.map((m) =>
							m.id === assistantId
								? {
										...m,
										streaming: false,
										text: errText,
										trace: traceSnapshot ?? m.trace,
										thinkMs: m.thinkMs ?? performance.now() - t0,
									}
								: m,
						);
					}
					return [
						...prev,
						{
							id: assistantId,
							role: "assistant",
							text: errText,
							trace: traceSnapshot,
							thinkMs: performance.now() - t0,
						},
					];
				});
			} finally {
				setThinking(false);
				setLiveTrace([]);
				setStatus("ready");
			}
		},
		[status, personaId],
	);

	const handleStop = useCallback(() => {
		abortRef.current?.abort();
		setThinking(false);
		setLiveTrace([]);
		setStatus("ready");
		setActionHint("已停止生成");
		setMessages((prev) =>
			prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
		);
	}, []);

	const handleSubmit = () => {
		void sendText(value, { attachments });
	};

	const handleSuggestion = (prompt: string) => {
		setValue(prompt);
		void sendText(prompt);
	};

	const handleRegenerate = useCallback(
		(assistantId: string) => {
			if (status !== "ready") return;
			let question = "";
			setMessages((prev) => {
				const idx = prev.findIndex((m) => m.id === assistantId);
				if (idx < 0) return prev;
				question = findPrecedingUserText(prev, assistantId);
				// 去掉该条助手回复及其后内容，再重跑
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
		[sendText, status],
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

	useEffect(() => {
		const shell = shellRef.current;
		const viewport = viewportRef.current;
		if (!shell || !viewport) return;

		const onWheel = (e: WheelEvent) => {
			const delta = e.deltaY;
			if (!delta) return;

			const ta = shell.querySelector("textarea");
			if (ta && (e.target === ta || ta.contains(e.target as Node))) {
				if (ta.scrollHeight > ta.clientHeight + 1) {
					const atTop = ta.scrollTop <= 0;
					const atBottom =
						ta.scrollTop + ta.clientHeight >= ta.scrollHeight - 1;
					if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) return;
				}
			}

			const hasOverflow = viewport.scrollHeight > viewport.clientHeight + 1;
			if (hasOverflow && viewport.contains(e.target as Node)) {
				const atTop = viewport.scrollTop <= 0;
				const atBottom =
					viewport.scrollTop + viewport.clientHeight >=
					viewport.scrollHeight - 1;
				if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) return;
			}

			e.preventDefault();
			window.scrollBy({ top: delta, left: 0, behavior: "auto" });
		};

		shell.addEventListener("wheel", onWheel, { passive: false });
		return () => shell.removeEventListener("wheel", onWheel);
	}, []);

	const empty = messages.length === 0 && !thinking;
	const persona = getAskPersona(personaId);

	return (
		<div
			ref={shellRef}
			className="ask-heroui-root flex w-full flex-col overflow-hidden"
		>
			<img
				className="ask-card-char"
				src={persona.avatar}
				alt=""
				aria-hidden="true"
				decoding="async"
			/>
			<ChatConversation ref={viewportRef} className="flex-1 min-h-0">
				<ChatConversation.Content className="ask-conversation-pad mx-auto w-full max-w-[714px] flex-col gap-8 pb-8 pt-8">
					{empty ? (
						<PromptSuggestion className="mx-auto w-full py-6">
							<PromptSuggestion.Header>
								<PromptSuggestion.Title>
									有什么想了解的？
								</PromptSuggestion.Title>
								<PromptSuggestion.Description>
									问一句，我先在数字花园文章库里检索，再基于命中内容回答。也可以点下面的建议直接开始。
								</PromptSuggestion.Description>
							</PromptSuggestion.Header>
							<PromptSuggestion.Group label="你可以试着问：">
								<PromptSuggestion.Items>
									{SUGGESTIONS.map((prompt) => (
										<PromptSuggestion.Item
											key={prompt}
											onPress={() => handleSuggestion(prompt)}
										>
											{prompt}
										</PromptSuggestion.Item>
									))}
								</PromptSuggestion.Items>
							</PromptSuggestion.Group>
						</PromptSuggestion>
					) : null}

					{messages.map((message) =>
						message.role === "user" ? (
							<ChatMessage.User key={message.id}>
								<ChatMessage.Bubble>
									<ChatMessage.Content>{message.text}</ChatMessage.Content>
									{message.attachments?.length ? (
										<AskAttachmentChips items={message.attachments} />
									) : null}
								</ChatMessage.Bubble>
							</ChatMessage.User>
						) : (
							<ChatMessage.Assistant key={message.id}>
								<ChatMessage.Avatar
									show
									alt={persona.label}
									src={persona.avatar}
									fallback={persona.label.slice(0, 1)}
								/>
								<ChatMessage.Body>
									{message.trace?.length || message.reasoning ? (
										<AskThinking
											steps={message.trace ?? []}
											reasoning={message.reasoning}
											running={!!message.streaming && !message.text}
											durationText={
												typeof message.thinkMs === "number"
													? fmtThinkDuration(message.thinkMs)
													: ""
											}
										/>
									) : null}

									<ChatMessage.Content>
										{message.streaming ? (
											message.text ? (
												<div
													className="ask-markdown markdown"
													data-slot="ask-markdown"
												>
													<StreamMarkdown
														isStreaming
														caret="block"
														components={askMarkdownComponents(message.sources)}
													>
														{linkifyCitations(message.text, message.sources)}
													</StreamMarkdown>
												</div>
											) : (
												<div className="flex items-center gap-3 py-1">
													<ChatLoader.Dots />
													<TextShimmer>正在流式生成回答…</TextShimmer>
												</div>
											)
										) : (
											<AskMarkdown sources={message.sources}>
												{message.text}
											</AskMarkdown>
										)}
									</ChatMessage.Content>

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
												{debugOpen[message.id] ? "收起原文" : "调试：查看原文"}
											</button>
											{debugOpen[message.id] ? (
												<pre className="ask-debug-pre">{message.text}</pre>
											) : null}
										</div>
									) : null}

									{!message.streaming ? (
										<ChatMessageActions>
											<ChatMessageActions.Copy
												aria-label="复制"
												tooltip="复制"
												onPress={() => {
													void copyText(message.text)
														.then(() => setActionHint("已复制回答"))
														.catch(() =>
															setActionHint("复制失败，请手动选择文本"),
														);
												}}
											/>
											<ChatMessageActions.Regenerate
												aria-label="重新生成"
												tooltip="重新生成"
												onPress={() => handleRegenerate(message.id)}
											/>
											<ChatMessage.Action
												aria-label="导出 Markdown"
												tooltip="导出本轮对话 Markdown"
												onPress={() => handleExportMd(message.id, message.text)}
											>
												<Share2 className="size-4" />
											</ChatMessage.Action>
											<ChatMessageActions.ThumbsUp
												aria-label="有用"
												tooltip="有用"
												className={[
													"ask-vote-up",
													votes[message.id] === "up" ? "ask-action-active" : "",
													voteAnim[message.id] === "pop" ? "is-pop" : "",
												]
													.filter(Boolean)
													.join(" ")}
												onPress={() => handleVote(message.id, "up")}
											/>
											<ChatMessageActions.ThumbsDown
												aria-label="不太对"
												tooltip="不太对"
												className={[
													"ask-vote-down",
													votes[message.id] === "down"
														? "ask-action-active"
														: "",
													voteAnim[message.id] === "shake" ? "is-shake" : "",
												]
													.filter(Boolean)
													.join(" ")}
												onPress={() => handleVote(message.id, "down")}
											/>
										</ChatMessageActions>
									) : null}

									{!message.streaming && message.followUps?.length ? (
										<AskFollowUps
											items={message.followUps}
											onPick={(q) => {
												setValue(q);
												void sendText(q);
											}}
										/>
									) : null}
								</ChatMessage.Body>
							</ChatMessage.Assistant>
						),
					)}

					{thinking ? (
						<ChatMessage.Assistant>
							<ChatMessage.Avatar
								show
								alt={persona.label}
								src={persona.avatar}
								fallback={persona.label.slice(0, 1)}
							/>
							<ChatMessage.Body>
								<AskThinking steps={liveTrace} running defaultOpen />
							</ChatMessage.Body>
						</ChatMessage.Assistant>
					) : null}
				</ChatConversation.Content>
				<ChatConversation.ScrollButton />
			</ChatConversation>

			<div className="ask-grok-dock">
				<div className="ask-grok-dock-inner">
					{actionHint ? (
						<p className="ask-action-hint" role="status">
							{actionHint}
						</p>
					) : null}
					<AskGrokComposer
						value={value}
						onValueChange={setValue}
						onSubmit={handleSubmit}
						onStop={handleStop}
						status={status}
						persona={personaId}
						onPersonaChange={setPersonaId}
						plusSuggestions={SUGGESTIONS}
						onPickSuggestion={handleSuggestion}
						attachments={attachments}
						onRemoveAttachment={(id) =>
							setAttachments((prev) => prev.filter((a) => a.id !== id))
						}
						onPickFiles={(files) => void pickFiles(files)}
					/>
					<p className="ask-grok-disclaimer">AI 回答仅供参考，重要信息请核实</p>
				</div>
			</div>
		</div>
	);
}

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}
