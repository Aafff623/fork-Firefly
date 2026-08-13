import { ChainOfThought } from "@heroui-pro/react/chain-of-thought";
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
	useCallback,
	useEffect,
	useRef,
	useState,
	type ReactElement,
	type ReactNode,
} from "react";
import { readAskSse } from "@/utils/ask-sse";
import AskMarkdown from "./AskMarkdown";
import {
	AskFollowUps,
	AskGrokComposer,
	AskSourcesPill,
	buildFollowUps,
} from "./AskGrokBits";
import {
	DEFAULT_ASK_PERSONA,
	getAskPersona,
	type AskPersonaId,
} from "@/utils/ask-personas";

/** trailingSlash: always → 末尾斜杠 */
const ASK_API = "/api/ask/";
const IS_DEV = import.meta.env.DEV;

const SUGGESTIONS = [
	"这个博客用了什么技术栈？",
	"怎么部署这个博客？",
	"园主最近写了什么？",
	"站点有哪些合集可以看？",
] as const;

type Source = { title: string; url: string; icon?: string };

type AskHit = {
	title: string;
	url: string;
	snippet: string;
	score: number;
	date?: string;
	icon?: string;
};

type RetrieveMeta = {
	scanned: number;
	elapsedMs: number;
	matched: number;
	cached: false;
};

type TraceStep = {
	id: string;
	label: string;
	/** 纯文本摘要，便于调试面板 */
	summary: string;
	hits?: AskHit[];
};

type Message = {
	id: string;
	role: "assistant" | "user";
	text: string;
	sources?: Source[];
	followUps?: string[];
	trace?: TraceStep[];
	/** 正在接收 MaxKB SSE */
	streaming?: boolean;
};

type LiveStep = {
	id: string;
	label: string;
	body: ReactNode;
	summary: string;
	hits?: AskHit[];
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

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
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

async function ensureSession(tokenRef: { current: string | null }, chatIdRef: { current: string | null }) {
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

function HitsList({ hits }: { hits: AskHit[] }) {
	if (!hits.length) {
		return (
			<p className="ask-cot-muted">
				未命中站内文章，将主要依赖模型既有上下文作答（不会使用预制答案）。
			</p>
		);
	}
	return (
		<ul className="ask-cot-hits">
			{hits.map((h) => (
				<li key={`${h.url}-${h.title}`}>
					<a href={h.url} target="_blank" rel="noopener noreferrer">
						{h.title}
					</a>
					{h.date ? <span className="ask-cot-date">{h.date}</span> : null}
					{typeof h.score === "number" && h.score > 0 && h.score < 100 ? (
						<span className="ask-cot-date">分 {h.score.toFixed(1)}</span>
					) : null}
					{h.snippet ? <p>{h.snippet}</p> : null}
				</li>
			))}
		</ul>
	);
}

function TraceBlock({
	steps,
	expanded,
	streaming,
}: {
	steps: TraceStep[];
	/** 思考中 / 回答流式中：展开；答完：折叠 */
	expanded: boolean;
	streaming?: boolean;
}) {
	if (!steps.length) return null;
	return (
		<ChainOfThought
			key={expanded ? "trace-open" : "trace-closed"}
			defaultExpanded={expanded}
			isStreaming={!!streaming && expanded}
		>
			<ChainOfThought.Trigger>
				{streaming && expanded
					? `思考中…（${steps.length}）`
					: expanded
						? "检索过程"
						: "查看检索过程"}
			</ChainOfThought.Trigger>
			<ChainOfThought.Content>
				<ChainOfThought.Steps>
					{steps.map((step) => (
						<ChainOfThought.Step key={step.id} label={step.label}>
							{step.hits ? (
								<>
									{step.summary && !step.hits.length ? (
										<p className="ask-cot-muted">{step.summary}</p>
									) : null}
									<HitsList hits={step.hits} />
								</>
							) : (
								<span className="ask-cot-muted" style={{ whiteSpace: "pre-wrap" }}>
									{step.summary}
								</span>
							)}
						</ChainOfThought.Step>
					))}
				</ChainOfThought.Steps>
			</ChainOfThought.Content>
		</ChainOfThought>
	);
}

export default function AskChat(): ReactElement {
	const [messages, setMessages] = useState<Message[]>([]);
	const [value, setValue] = useState("");
	const [status, setStatus] = useState<ChatStatus>("ready");
	const [thinking, setThinking] = useState(false);
	const [liveSteps, setLiveSteps] = useState<LiveStep[]>([]);
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
	const [themeClass, setThemeClass] = useState<"light" | "dark">(() =>
		typeof document !== "undefined" && document.documentElement.classList.contains("dark")
			? "dark"
			: "light",
	);

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

	useEffect(() => {
		const sync = () => {
			setThemeClass(
				document.documentElement.classList.contains("dark") ? "dark" : "light",
			);
		};
		sync();
		const obs = new MutationObserver(sync);
		obs.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => obs.disconnect();
	}, []);

	const pushLive = useCallback((step: LiveStep) => {
		setLiveSteps((prev) => {
			const i = prev.findIndex((s) => s.id === step.id);
			if (i >= 0) {
				const next = prev.slice();
				next[i] = step;
				return next;
			}
			return [...prev, step];
		});
	}, []);

	const sendText = useCallback(
		async (raw: string, opts?: { force?: boolean; regenerate?: boolean }) => {
			const text = raw.trim();
			if (!text) return;
			if (!opts?.force && status !== "ready") return;

			abortRef.current?.abort();
			const ac = new AbortController();
			abortRef.current = ac;

			lastUserRef.current = text;
			if (!opts?.regenerate) {
				const userMessage: Message = {
					id: `u-${Date.now()}`,
					role: "user",
					text,
				};
				setMessages((prev) => [...prev, userMessage]);
			}
			setValue("");
			setStatus("submitted");
			setThinking(true);
			setLiveSteps([]);

			const trace: TraceStep[] = [];
			const record = (step: Omit<LiveStep, "body"> & { body?: ReactNode }) => {
				const live: LiveStep = {
					id: step.id,
					label: step.label,
					summary: step.summary,
					hits: step.hits,
					body: step.body ?? step.summary,
				};
				pushLive(live);
				const t: TraceStep = {
					id: step.id,
					label: step.label,
					summary: step.summary,
					hits: step.hits,
				};
				const idx = trace.findIndex((x) => x.id === t.id);
				if (idx >= 0) trace[idx] = t;
				else trace.push(t);
			};

			const assistantId = `a-${Date.now()}`;

			try {
				const understood = understandQuestion(text);
				record({
					id: "understand",
					label: "理解问题",
					summary: understood,
				});

				// 会话与检索并行；检索始终现算（无答案缓存）
				record({
					id: "scope",
					label: "检索范围",
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
					label: "检索范围",
					summary: scopeSummary,
				});

				// 逐条亮出真实命中（展示节奏，不是假装搜索）
				const revealed: AskHit[] = [];
				if (!retrieved.hits.length) {
					record({
						id: "hits",
						label: "未命中站内文",
						summary:
							retrieved.intent === "site-meta"
								? "站内少有「部署本站」专文；将依据站点硬事实（Astro / Vercel / pnpm）作答，不会拿无关「部署」文凑数。"
								: "本轮关键词未在标题/摘要/标签/正文中找到足够相关条目；将主要依赖模型上下文作答，不会背预制答案。",
						hits: [],
						body: <HitsList hits={[]} />,
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
							label,
							summary: revealed
								.map(
									(h, j) =>
										`${j + 1}. ${h.title}${h.date ? `（${h.date}）` : ""}${typeof h.score === "number" ? ` · 分 ${h.score.toFixed(1)}` : ""} — ${h.snippet}`,
								)
								.join("\n"),
							hits: revealed.slice(),
							body: <HitsList hits={revealed.slice()} />,
						});
						if (i < retrieved.hits.length - 1) await sleep(140);
					}
				}

				record({
					id: "answer",
					label: "生成回答",
					summary: "根据本轮命中段落与会话上下文实时生成（流式）…",
				});

				const fromSite: Source[] = retrieved.hits.map((h) => ({
					title: h.title,
					url: h.url,
					icon: h.icon,
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
				setLiveSteps([]);

				const res = await fetch(`${ASK_API}?action=chat`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						token: tokenRef.current,
						chatId: chatIdRef.current,
						message: text,
						hits: retrieved.hits,
						intent: retrieved.intent,
						persona: personaId,
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
									}
								: m,
						),
					);
					return;
				}

				const { text: full, last } = await readAskSse(res, {
					signal: ac.signal,
					onDelta: (_delta, fullText) => {
						setMessages((prev) =>
							prev.map((m) =>
								m.id === assistantId ? { ...m, text: fullText, streaming: true } : m,
							),
						);
					},
				});

				const fromKb: Source[] = (last?.paragraph_list || []).map((p) => ({
					title: p.title || p.document_name || "文章",
					url: p.source_url || "#",
				}));
				const seen = new Set<string>();
				const sources: Source[] = [];
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
									trace: trace.map((t) =>
										t.id === "answer"
											? { ...t, summary: "回答已生成。" }
											: t,
									),
								}
							: m,
					),
				);
			} catch (err) {
				if (err instanceof DOMException && err.name === "AbortError") {
					setMessages((prev) =>
						prev.map((m) =>
							m.id === assistantId && m.streaming
								? { ...m, streaming: false, text: m.text || "（已中断）" }
								: m,
						),
					);
					return;
				}
				const detail = err instanceof Error ? err.message : "";
				const looksDown =
					/MaxKB|不可达|ECONNREFUSED|Failed to fetch|网络/i.test(detail) || !detail;
				const errText = looksDown
					? "本机问答服务（MaxKB）没在跑。请先打开 Docker Desktop，启动 MaxKB 容器（端口 8080），再刷新本页重试。"
					: `出了点问题：${detail}`;

				setMessages((prev) => {
					const has = prev.some((m) => m.id === assistantId);
					if (has) {
						return prev.map((m) =>
							m.id === assistantId
								? {
										...m,
										streaming: false,
										text: errText,
										trace: trace.length ? trace.map((t) => ({ ...t })) : m.trace,
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
							trace: trace.length ? trace.map((t) => ({ ...t })) : undefined,
						},
					];
				});
			} finally {
				setThinking(false);
				setLiveSteps([]);
				setStatus("ready");
			}
		},
		[pushLive, status, personaId],
	);

	const handleStop = useCallback(() => {
		abortRef.current?.abort();
		setThinking(false);
		setLiveSteps([]);
		setStatus("ready");
		setMessages((prev) =>
			prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
		);
	}, []);

	const handleSubmit = () => {
		void sendText(value);
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
					const atBottom = ta.scrollTop + ta.clientHeight >= ta.scrollHeight - 1;
					if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) return;
				}
			}

			const hasOverflow = viewport.scrollHeight > viewport.clientHeight + 1;
			if (hasOverflow && viewport.contains(e.target as Node)) {
				const atTop = viewport.scrollTop <= 0;
				const atBottom = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1;
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
			data-theme={themeClass}
			className={`ask-heroui-root ${themeClass} flex w-full flex-col overflow-hidden`}
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
								<PromptSuggestion.Title>有什么想了解的？</PromptSuggestion.Title>
								<PromptSuggestion.Description>
									问一句，我先在数字花园文章库里检索，再基于命中内容回答。也可以点下面的建议直接开始。
								</PromptSuggestion.Description>
							</PromptSuggestion.Header>
							<PromptSuggestion.Group label="你可以试着问：">
								<PromptSuggestion.Items>
									{SUGGESTIONS.map((prompt) => (
										<PromptSuggestion.Item key={prompt} onPress={() => handleSuggestion(prompt)}>
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
									{message.trace?.length ? (
										<TraceBlock
											steps={message.trace}
											expanded={!!message.streaming}
											streaming={!!message.streaming}
										/>
									) : null}

									<ChatMessage.Content>
										{message.streaming ? (
											message.text ? (
												<div className="ask-markdown markdown" data-slot="ask-markdown">
													<StreamMarkdown isStreaming>{message.text}</StreamMarkdown>
												</div>
											) : (
												<div className="flex items-center gap-3 py-1">
													<ChatLoader.Dots />
													<TextShimmer>正在流式生成回答…</TextShimmer>
												</div>
											)
										) : (
											<AskMarkdown>{message.text}</AskMarkdown>
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
														.catch(() => setActionHint("复制失败，请手动选择文本"));
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
													votes[message.id] === "down" ? "ask-action-active" : "",
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
								<ChainOfThought defaultExpanded isStreaming>
									<ChainOfThought.Trigger>
										{liveSteps.some((s) => s.id === "answer")
											? "思考完成，准备生成回答…"
											: `思考过程（${Math.max(liveSteps.length, 1)}）`}
									</ChainOfThought.Trigger>
									<ChainOfThought.Content>
										<ChainOfThought.Steps>
											{liveSteps.map((step) => (
												<ChainOfThought.Step key={step.id} label={step.label}>
													{step.body}
												</ChainOfThought.Step>
											))}
										</ChainOfThought.Steps>
									</ChainOfThought.Content>
								</ChainOfThought>
								<div className="flex items-center gap-3 pt-2">
									<ChatLoader.Dots />
									<TextShimmer>
										{liveSteps.at(-1)?.label ?? "开始思考…"}
									</TextShimmer>
								</div>
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
					/>
					<p className="ask-grok-disclaimer">AI 回答仅供参考，重要信息请核实</p>
				</div>
			</div>

		</div>
	);
}
