import {
	HoverCardContent,
	HoverCardRoot,
	HoverCardTrigger,
} from "@heroui-pro/react/hover-card";
import {
	ArrowUp,
	ChevronDown,
	ExternalLink,
	FileText,
	Mic,
	Paperclip,
	Plus,
	Square,
	X,
} from "lucide-react";
import {
	type FormEvent,
	type KeyboardEvent,
	type ReactElement,
	type ReactNode,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import {
	ASK_PERSONAS,
	type AskPersonaId,
	getAskPersona,
} from "@/utils/ask-personas";
import {
	ASK_IMAGE_ACCEPT,
	ASK_TEXT_ACCEPT,
	type AskAttachment,
	type AskSource,
} from "./ask-types";

export type { AskSource } from "./ask-types";

/** @deprecated 用 AskPersonaId */
export type AskModelMode = AskPersonaId;

/** 站内同源图标；禁止 Google s2（国内常裂） */
export const SITE_ICON = "/favicon/firefly-32.png";

function sourceIcon(src?: AskSource) {
	if (src?.icon) return src.icon;
	const url = src?.url || "";
	if (!url || url.startsWith("/") || url.startsWith("#")) return SITE_ICON;
	try {
		const u = new URL(
			url,
			typeof window !== "undefined" ? window.location.origin : "https://local",
		);
		if (
			typeof window !== "undefined" &&
			u.hostname === window.location.hostname
		) {
			return SITE_ICON;
		}
	} catch {
		return SITE_ICON;
	}
	return SITE_ICON;
}

/** 主流引用卡惯例：域名展示去 www，短且可读 */
export function sourceDomain(url: string): string {
	try {
		return new URL(url, window.location.origin).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

function trimTitle(title: string, max = 18) {
	const t = title.trim();
	return t.length > max ? `${t.slice(0, max)}…` : t;
}

/** Grok 风格：根据上一问 + 来源拼 3 条追问 */
export function buildFollowUps(userQ: string, sources: AskSource[]): string[] {
	const q = userQ.replace(/[？?。！!\s]+$/g, "").trim();
	const out: string[] = [];
	if (sources[0]?.title) {
		out.push(`展开讲讲「${trimTitle(sources[0].title)}」里的关键点`);
	}
	if (sources[1]?.title) {
		out.push(`对比一下和「${trimTitle(sources[1].title)}」有什么不同`);
	}
	if (/部署|vercel|edgeone|上线/i.test(q)) {
		out.push("补充一下常见部署踩坑和排查顺序");
	} else if (/技术栈|astro|hero/i.test(q)) {
		out.push("这些技术各自负责站点的哪一层？");
	} else if (/最近|写了什么|新笔记/i.test(q)) {
		out.push("哪几篇最值得先读？给个阅读顺序");
	} else if (/合集|系列|分类/i.test(q)) {
		out.push("挑一个合集，列里面代表性的 3 篇");
	} else if (q) {
		out.push(`用三条要点再概括「${trimTitle(q, 22)}」`);
	}
	out.push("还有哪些相关文章值得接着看？");
	const seen = new Set<string>();
	return out
		.filter((s) => {
			if (seen.has(s)) return false;
			seen.add(s);
			return true;
		})
		.slice(0, 3);
}

/**
 * 悬停引用卡（豆包/Kimi 式）：favicon + 标题 + 域名 + 摘要 + 打开原文提示。
 * 思考链命中行、行内引用角标、来源列表三处共用。
 */
export function SourceHoverCard({
	title,
	url,
	snippet,
	date,
	children,
}: {
	title: string;
	url: string;
	snippet?: string;
	date?: string;
	children: ReactNode;
}): ReactElement {
	return (
		<HoverCardRoot openDelay={140} closeDelay={120}>
			<HoverCardTrigger>{children}</HoverCardTrigger>
			<HoverCardContent placement="top">
				<div className="ask-cite-card">
					<div className="ask-cite-card-head">
						<img
							className="ask-cite-card-icon"
							src={SITE_ICON}
							alt=""
							width={20}
							height={20}
							loading="lazy"
							decoding="async"
						/>
						<div className="ask-cite-card-meta">
							<p className="ask-cite-card-title">{title}</p>
							<p className="ask-cite-card-domain">
								{sourceDomain(url)}
								{date ? ` · ${date}` : ""}
							</p>
						</div>
					</div>
					{snippet ? <p className="ask-cite-card-snippet">{snippet}</p> : null}
					<p className="ask-cite-card-open">
						打开原文
						<ExternalLink
							className="ask-cite-card-open-icon"
							aria-hidden="true"
						/>
					</p>
				</div>
			</HoverCardContent>
		</HoverCardRoot>
	);
}

/** Grok：重叠 favicon + “N sources” pill，点开行级来源列表（悬停出引用卡） */
export function AskSourcesPill({
	sources,
}: {
	sources: AskSource[];
}): ReactElement | null {
	const [open, setOpen] = useState(false);
	const preview = sources.slice(0, 3);
	if (!sources.length) return null;

	return (
		<div className={`ask-sources${open ? " is-open" : ""}`}>
			<button
				type="button"
				className="ask-sources-pill"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
			>
				<span className="ask-sources-favicons" aria-hidden="true">
					{preview.map((s) => (
						<img
							key={`${s.url}-${s.title}`}
							className="ask-sources-favicon"
							src={sourceIcon(s)}
							alt=""
							width={18}
							height={18}
							loading="lazy"
							decoding="async"
							onError={(e) => {
								e.currentTarget.src = SITE_ICON;
							}}
						/>
					))}
				</span>
				<span className="ask-sources-count">{sources.length} sources</span>
			</button>
			{open ? (
				<ul className="ask-sources-list">
					{sources.map((s, i) => (
						<li key={`${s.url}-${s.title}`}>
							<SourceHoverCard
								title={s.title}
								url={s.url}
								snippet={s.snippet}
								date={s.date}
							>
								<a
									href={s.url}
									target="_blank"
									rel="noopener noreferrer"
									className="ask-sources-row"
								>
									<span className="ask-sources-idx" aria-hidden="true">
										{i + 1}
									</span>
									<img
										className="ask-sources-row-icon"
										src={sourceIcon(s)}
										alt=""
										width={16}
										height={16}
										loading="lazy"
										decoding="async"
										onError={(e) => {
											e.currentTarget.src = SITE_ICON;
										}}
									/>
									<span className="ask-sources-row-main">
										<span className="ask-sources-row-title">{s.title}</span>
										<span className="ask-sources-row-domain">
											{sourceDomain(s.url)}
											{s.date ? ` · ${s.date}` : ""}
										</span>
									</span>
									<ExternalLink
										className="ask-sources-row-ext"
										aria-hidden="true"
									/>
								</a>
							</SourceHoverCard>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

/** Grok：↳ 后续相关提问 */
export function AskFollowUps({
	items,
	onPick,
}: {
	items: string[];
	onPick: (q: string) => void;
}): ReactElement | null {
	if (!items.length) return null;
	return (
		<ul className="ask-followups">
			{items.map((q) => (
				<li key={q}>
					<button
						type="button"
						className="ask-followup-item"
						onClick={() => onPick(q)}
					>
						<span className="ask-followup-arrow" aria-hidden="true">
							↳
						</span>
						<span>{q}</span>
					</button>
				</li>
			))}
		</ul>
	);
}

/** 附件 chips：图片缩略 / 文件图标 + 名字 + 大小 + 移除 */
export function AskAttachmentChips({
	items,
	removable = false,
	onRemove,
}: {
	items: AskAttachment[];
	removable?: boolean;
	onRemove?: (id: string) => void;
}): ReactElement | null {
	if (!items.length) return null;
	return (
		<div className="ask-attach-row">
			{items.map((a) => (
				<span
					key={a.id}
					className="ask-attach-chip"
					title={`${a.name} · ${fmtSize(a.size)}`}
				>
					{a.kind === "image" && a.dataUrl ? (
						<img className="ask-attach-thumb" src={a.dataUrl} alt={a.name} />
					) : (
						<FileText className="ask-attach-fileicon" aria-hidden="true" />
					)}
					<span className="ask-attach-name">{trimTitle(a.name, 24)}</span>
					<span className="ask-attach-size">{fmtSize(a.size)}</span>
					{removable && onRemove ? (
						<button
							type="button"
							className="ask-attach-remove"
							aria-label={`移除附件 ${a.name}`}
							onClick={() => onRemove(a.id)}
						>
							<X aria-hidden="true" />
						</button>
					) : null}
				</span>
			))}
		</div>
	);
}

function fmtSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type ComposerProps = {
	value: string;
	onValueChange: (v: string) => void;
	onSubmit: () => void;
	onStop: () => void;
	status: "ready" | "submitted" | "streaming" | "error";
	persona: AskPersonaId;
	onPersonaChange: (p: AskPersonaId) => void;
	plusSuggestions: readonly string[];
	onPickSuggestion: (q: string) => void;
	attachments: AskAttachment[];
	onRemoveAttachment: (id: string) => void;
	onPickFiles: (files: FileList | null) => void;
};

/** Grok 风格输入条：左 + · 输入 · 人物选择/麦 · 外侧发送圆钮；+ 菜单含上传附件 */
export function AskGrokComposer({
	value,
	onValueChange,
	onSubmit,
	onStop,
	status,
	persona,
	onPersonaChange,
	plusSuggestions,
	onPickSuggestion,
	attachments,
	onRemoveAttachment,
	onPickFiles,
}: ComposerProps): ReactElement {
	const [plusOpen, setPlusOpen] = useState(false);
	const [personaOpen, setPersonaOpen] = useState(false);
	const [listening, setListening] = useState(false);
	const [micHint, setMicHint] = useState<string | null>(null);
	const plusRef = useRef<HTMLDivElement>(null);
	const personaRef = useRef<HTMLDivElement>(null);
	const taRef = useRef<HTMLTextAreaElement>(null);
	const fileRef = useRef<HTMLInputElement>(null);
	const personaListId = useId();
	const busy = status === "streaming" || status === "submitted";
	const current = getAskPersona(persona);

	useEffect(() => {
		const onDoc = (e: PointerEvent) => {
			const t = e.target as Node;
			if (plusRef.current && !plusRef.current.contains(t)) setPlusOpen(false);
			if (personaRef.current && !personaRef.current.contains(t))
				setPersonaOpen(false);
		};
		document.addEventListener("pointerdown", onDoc);
		return () => document.removeEventListener("pointerdown", onDoc);
	}, []);

	useEffect(() => {
		if (!micHint) return;
		const t = window.setTimeout(() => setMicHint(null), 2200);
		return () => window.clearTimeout(t);
	}, [micHint]);

	const submit = (e?: FormEvent) => {
		e?.preventDefault();
		if (busy) {
			onStop();
			return;
		}
		if (!value.trim() && !attachments.length) return;
		onSubmit();
	};

	const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	};

	const toggleMic = () => {
		const SR =
			typeof window !== "undefined"
				? (
						window as unknown as {
							SpeechRecognition?: new () => SpeechRecognition;
							webkitSpeechRecognition?: new () => SpeechRecognition;
						}
					).SpeechRecognition ||
					(
						window as unknown as {
							webkitSpeechRecognition?: new () => SpeechRecognition;
						}
					).webkitSpeechRecognition
				: undefined;
		if (!SR) {
			setMicHint("当前浏览器暂不支持语音输入");
			return;
		}
		if (listening) {
			setListening(false);
			return;
		}
		try {
			const rec = new SR();
			rec.lang = "zh-CN";
			rec.interimResults = false;
			rec.onresult = (ev: SpeechRecognitionEvent) => {
				const said = ev.results[0]?.[0]?.transcript?.trim();
				if (said) onValueChange(value ? `${value.trim()} ${said}` : said);
				setListening(false);
			};
			rec.onerror = () => {
				setListening(false);
				setMicHint("语音识别中断了");
			};
			rec.onend = () => setListening(false);
			setListening(true);
			rec.start();
		} catch {
			setMicHint("无法启动麦克风");
			setListening(false);
		}
	};

	return (
		<>
			<AskAttachmentChips
				items={attachments}
				removable
				onRemove={onRemoveAttachment}
			/>
			<div className="ask-grok-row">
				<form className="ask-grok-bar" onSubmit={submit}>
					<div className="ask-grok-plus-wrap" ref={plusRef}>
						<button
							type="button"
							className={`ask-grok-plus${plusOpen ? " is-open" : ""}`}
							aria-label="更多"
							aria-expanded={plusOpen}
							onClick={() => {
								setPlusOpen((v) => !v);
								setPersonaOpen(false);
							}}
						>
							<Plus className="size-5" strokeWidth={2} />
						</button>
						{plusOpen ? (
							<div className="ask-grok-menu" role="menu">
								<p className="ask-grok-menu-title">快速开问</p>
								{plusSuggestions.map((q) => (
									<button
										key={q}
										type="button"
										role="menuitem"
										className="ask-grok-menu-item"
										onClick={() => {
											setPlusOpen(false);
											onPickSuggestion(q);
										}}
									>
										{q}
									</button>
								))}
								<hr className="ask-grok-menu-sep" />
								<button
									type="button"
									role="menuitem"
									className="ask-grok-menu-item ask-grok-menu-attach"
									onClick={() => {
										setPlusOpen(false);
										fileRef.current?.click();
									}}
								>
									<Paperclip
										className="size-4"
										strokeWidth={2}
										aria-hidden="true"
									/>
									<span>
										上传附件
										<span className="ask-grok-menu-sub">
											文本会参与回答 · 图片仅展示
										</span>
									</span>
								</button>
							</div>
						) : null}
						<input
							ref={fileRef}
							type="file"
							multiple
							hidden
							accept={`${ASK_TEXT_ACCEPT},${ASK_IMAGE_ACCEPT}`}
							onChange={(e) => {
								onPickFiles(e.target.files);
								e.target.value = "";
							}}
						/>
					</div>

					<textarea
						ref={taRef}
						className="ask-grok-input"
						rows={1}
						value={value}
						placeholder={
							attachments.length ? "给附件配一句问题，或直接发送…" : "问点什么…"
						}
						disabled={busy}
						onChange={(e) => onValueChange(e.target.value)}
						onKeyDown={onKeyDown}
					/>

					<div className="ask-grok-aside">
						<div className="ask-grok-model-wrap" ref={personaRef}>
							<button
								type="button"
								className="ask-grok-model"
								aria-haspopup="listbox"
								aria-expanded={personaOpen}
								aria-controls={personaListId}
								aria-label={`当前助手：${current.label}`}
								onClick={() => {
									setPersonaOpen((v) => !v);
									setPlusOpen(false);
								}}
							>
								<img
									className="ask-grok-model-avatar"
									src={current.avatar}
									alt=""
									width={18}
									height={18}
								/>
								<span>{current.label}</span>
								<ChevronDown className="size-3.5 opacity-70" strokeWidth={2} />
							</button>
							{personaOpen ? (
								<div
									id={personaListId}
									className="ask-grok-menu ask-grok-model-menu ask-persona-menu"
									role="listbox"
								>
									{ASK_PERSONAS.map((opt) => (
										<button
											key={opt.id}
											type="button"
											role="option"
											aria-selected={persona === opt.id}
											className={`ask-grok-menu-item ask-persona-item${persona === opt.id ? " is-active" : ""}`}
											onClick={() => {
												onPersonaChange(opt.id);
												setPersonaOpen(false);
											}}
										>
											<img src={opt.avatar} alt="" width={28} height={28} />
											<span className="ask-persona-meta">
												<span className="ask-persona-name">{opt.label}</span>
												<span className="ask-persona-blurb">{opt.blurb}</span>
											</span>
										</button>
									))}
								</div>
							) : null}
						</div>

						<button
							type="button"
							className={`ask-grok-mic${listening ? " is-live" : ""}`}
							aria-label={listening ? "停止语音输入" : "语音输入"}
							onClick={toggleMic}
						>
							<Mic className="size-4" strokeWidth={2} />
						</button>
					</div>
				</form>

				<button
					type="button"
					className={`ask-grok-send${busy ? " is-stop" : ""}`}
					aria-label={busy ? "停止生成" : "发送"}
					disabled={!busy && !value.trim() && !attachments.length}
					onClick={() => submit()}
				>
					{busy ? (
						<Square className="size-3.5" fill="currentColor" />
					) : (
						<ArrowUp className="size-4" strokeWidth={2.5} />
					)}
				</button>

				{micHint ? (
					<p className="ask-grok-mic-hint" role="status">
						{micHint}
					</p>
				) : null}
			</div>
		</>
	);
}

/* Minimal SpeechRecognition typings for browsers that expose it */
interface SpeechRecognition extends EventTarget {
	lang: string;
	interimResults: boolean;
	start: () => void;
	onresult: ((ev: SpeechRecognitionEvent) => void) | null;
	onerror: (() => void) | null;
	onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
	results: { [index: number]: { [index: number]: { transcript: string } } };
}
