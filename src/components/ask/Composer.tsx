/**
 * 输入条：Grok 式胶囊（左 + / 输入 / 人设选择 / 麦 / 发送圆钮）。
 * 修复点：Enter 加 IME isComposing 判断（中文选词回车不再误发送）。
 */
import { ArrowUp, ChevronDown, Mic, Paperclip, Plus, Square } from "lucide-react";
import {
	type KeyboardEvent,
	type ReactElement,
	type SyntheticEvent,
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
} from "./ask-types";
import { AskAttachmentChips } from "./FollowUps";

/* Minimal SpeechRecognition typings for browsers that expose it */
interface SpeechRecognitionLike extends EventTarget {
	lang: string;
	interimResults: boolean;
	start: () => void;
	onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
	onerror: (() => void) | null;
	onend: (() => void) | null;
}
interface SpeechRecognitionEventLike extends Event {
	results: { [index: number]: { [index: number]: { transcript: string } } };
}

type ComposerProps = {
	value: string;
	onValueChange: (v: string) => void;
	onSubmit: () => void;
	onStop: () => void;
	busy: boolean;
	persona: AskPersonaId;
	onPersonaChange: (p: AskPersonaId) => void;
	plusSuggestions: readonly string[];
	onPickSuggestion: (q: string) => void;
	attachments: AskAttachment[];
	onRemoveAttachment: (id: string) => void;
	onPickFiles: (files: FileList | null) => void;
	/** widget 模式传 false：附件不参与 lite 直发，隐藏入口避免半接线 */
	allowAttachments?: boolean;
};

export function AskComposer({
	value,
	onValueChange,
	onSubmit,
	onStop,
	busy,
	persona,
	onPersonaChange,
	plusSuggestions,
	onPickSuggestion,
	attachments,
	onRemoveAttachment,
	onPickFiles,
	allowAttachments = true,
}: ComposerProps): ReactElement {
	const [plusOpen, setPlusOpen] = useState(false);
	const [personaOpen, setPersonaOpen] = useState(false);
	const [listening, setListening] = useState(false);
	const [micHint, setMicHint] = useState<string | null>(null);
	const plusRef = useRef<HTMLDivElement>(null);
	const personaRef = useRef<HTMLDivElement>(null);
	const fileRef = useRef<HTMLInputElement>(null);
	const personaListId = useId();
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

	const submit = (e?: SyntheticEvent) => {
		e?.preventDefault();
		if (busy) {
			onStop();
			return;
		}
		if (!value.trim() && !attachments.length) return;
		onSubmit();
	};

	const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		// 中文输入法选词回车（composition 中）不触发发送
		if (e.nativeEvent.isComposing) return;
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
							SpeechRecognition?: new () => SpeechRecognitionLike;
							webkitSpeechRecognition?: new () => SpeechRecognitionLike;
						}
					).SpeechRecognition ||
					(
						window as unknown as {
							webkitSpeechRecognition?: new () => SpeechRecognitionLike;
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
			rec.onresult = (ev: SpeechRecognitionEventLike) => {
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
			<div className="ask-composer-row">
				<form className="ask-composer" onSubmit={submit}>
					<div className="ask-pop-wrap" ref={plusRef}>
						<button
							type="button"
							className={`ask-composer-btn${plusOpen ? " is-open" : ""}`}
							aria-label="更多"
							aria-expanded={plusOpen}
							onClick={() => {
								setPlusOpen((v) => !v);
								setPersonaOpen(false);
							}}
						>
							<Plus strokeWidth={2} />
						</button>
						{plusOpen ? (
							<div className="ask-menu" role="menu">
								<p className="ask-menu-title">快速开问</p>
								{plusSuggestions.map((q) => (
									<button
										key={q}
										type="button"
										role="menuitem"
										className="ask-menu-item"
										onClick={() => {
											setPlusOpen(false);
											onPickSuggestion(q);
										}}
									>
										{q}
									</button>
								))}
								{allowAttachments ? (
									<>
										<hr className="ask-menu-sep" />
										<button
											type="button"
											role="menuitem"
											className="ask-menu-item ask-menu-item-attach"
											onClick={() => {
												setPlusOpen(false);
												fileRef.current?.click();
											}}
										>
											<Paperclip
												style={{ width: "1rem", height: "1rem" }}
												strokeWidth={2}
												aria-hidden="true"
											/>
											<span>
												上传附件
												<span className="ask-menu-sub">
													文本会参与回答 · 图片仅展示
												</span>
											</span>
										</button>
									</>
								) : null}
							</div>
						) : null}
						{allowAttachments ? (
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
						) : null}
					</div>

					<textarea
						className="ask-composer-input"
						rows={1}
						value={value}
						placeholder={
							attachments.length ? "给附件配一句问题，或直接发送…" : "问点什么…"
						}
						onChange={(e) => onValueChange(e.target.value)}
						onKeyDown={onKeyDown}
					/>

					<div className="ask-pop-wrap" ref={personaRef}>
						<button
							type="button"
							className="ask-persona-btn"
							aria-haspopup="listbox"
							aria-expanded={personaOpen}
							aria-controls={personaListId}
							aria-label={`当前助手：${current.label}`}
							onClick={() => {
								setPersonaOpen((v) => !v);
								setPlusOpen(false);
							}}
						>
							<img src={current.avatar} alt="" />
							<span>{current.label}</span>
							<ChevronDown
								style={{ width: "0.875rem", height: "0.875rem", opacity: 0.7 }}
								strokeWidth={2}
							/>
						</button>
						{personaOpen ? (
							<div
								id={personaListId}
								className="ask-menu right"
								role="listbox"
							>
								{ASK_PERSONAS.map((opt) => (
									<button
										key={opt.id}
										type="button"
										role="option"
										aria-selected={persona === opt.id}
										className={`ask-menu-item ask-persona-item${persona === opt.id ? " is-active" : ""}`}
										onClick={() => {
											onPersonaChange(opt.id);
											setPersonaOpen(false);
										}}
									>
										<img src={opt.avatar} alt="" />
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
						className={`ask-composer-btn${listening ? " is-live" : ""}`}
						aria-label={listening ? "停止语音输入" : "语音输入"}
						onClick={toggleMic}
					>
						<Mic style={{ width: "1rem", height: "1rem" }} strokeWidth={2} />
					</button>
				</form>

				<button
					type="button"
					className={`ask-send${busy ? " is-stop" : ""}`}
					aria-label={busy ? "停止生成" : "发送"}
					disabled={!busy && !value.trim() && !attachments.length}
					onClick={() => submit()}
				>
					{busy ? (
						<Square style={{ width: "0.875rem", height: "0.875rem" }} fill="currentColor" />
					) : (
						<ArrowUp strokeWidth={2.5} />
					)}
				</button>

				{micHint ? (
					<p className="ask-mic-hint" role="status">
						{micHint}
					</p>
				) : null}
			</div>
		</>
	);
}
