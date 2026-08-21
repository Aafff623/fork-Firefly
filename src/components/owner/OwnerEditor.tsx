import {
	Archive,
	Bold,
	Code,
	Heading2,
	ImagePlus,
	Italic,
	Link,
	Quote,
	Save,
} from "lucide-react";
import {
	type ClipboardEvent,
	type DragEvent,
	type JSX,
	type KeyboardEvent,
	type MouseEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type SessionData = {
	authenticated?: boolean;
	role?: "owner" | "user";
	csrf?: string;
	dev?: boolean;
};

type PostData = {
	ok?: boolean;
	source?: string;
	baseSha?: string;
	path?: string;
	error?: string;
};

type Tool = Readonly<{
	label: string;
	icon: typeof Bold;
	prefix: string;
	suffix?: string;
	placeholder?: string;
}>;

const tools: readonly Tool[] = [
	{ label: "二级标题", icon: Heading2, prefix: "## ", placeholder: "标题" },
	{
		label: "加粗",
		icon: Bold,
		prefix: "**",
		suffix: "**",
		placeholder: "重点",
	},
	{
		label: "斜体",
		icon: Italic,
		prefix: "*",
		suffix: "*",
		placeholder: "文字",
	},
	{
		label: "行内代码",
		icon: Code,
		prefix: "`",
		suffix: "`",
		placeholder: "code",
	},
	{ label: "引用", icon: Quote, prefix: "> ", placeholder: "引用" },
	{
		label: "链接",
		icon: Link,
		prefix: "[",
		suffix: "](https://)",
		placeholder: "链接文字",
	},
] as const;

export default function OwnerEditor({
	slug,
}: Readonly<{ slug: string }>): JSX.Element {
	const textarea = useRef<HTMLTextAreaElement>(null);
	const fileInput = useRef<HTMLInputElement>(null);
	const [source, setSource] = useState("");
	const [baseSha, setBaseSha] = useState("");
	const [csrf, setCsrf] = useState("");
	const [state, setState] = useState<"loading" | "ready" | "guest" | "error">(
		"loading",
	);
	const [message, setMessage] = useState("正在核对园主身份…");
	const [busy, setBusy] = useState(false);
	const [context, setContext] = useState<{ x: number; y: number } | null>(null);

	useEffect(() => {
		void (async () => {
			try {
				const sessionResponse = await fetch("/api/auth/session/", {
					credentials: "same-origin",
				});
				const session = (await sessionResponse.json()) as SessionData;
				if (
					!session.authenticated ||
					session.role !== "owner" ||
					!session.csrf
				) {
					setState("guest");
					setMessage("请先使用园主 GitHub 账号登录。");
					return;
				}
				setCsrf(session.csrf);
				if (!slug) {
					setState("error");
					setMessage("请从文章页点击“编辑”，或在地址中提供 post 参数。");
					return;
				}
				const postResponse = await fetch(
					`/api/owner/post/?slug=${encodeURIComponent(slug)}`,
					{
						credentials: "same-origin",
					},
				);
				const post = (await postResponse.json()) as PostData;
				if (!postResponse.ok || !post.source || !post.baseSha)
					throw new Error(post.error || "读取失败");
				setSource(post.source);
				setBaseSha(post.baseSha);
				setState("ready");
				setMessage(
					session.dev ? "DEV 园主会话：保存只写本地工作区" : "已连接园主会话",
				);
			} catch (error) {
				setState("error");
				setMessage(error instanceof Error ? error.message : "编辑器初始化失败");
			}
		})();
	}, [slug]);

	useEffect(() => {
		if (!context) return;
		const closeContext = () => setContext(null);
		const closeOnEscape = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") closeContext();
		};
		window.addEventListener("pointerdown", closeContext);
		window.addEventListener("keydown", closeOnEscape);
		return () => {
			window.removeEventListener("pointerdown", closeContext);
			window.removeEventListener("keydown", closeOnEscape);
		};
	}, [context]);

	const applyTool = (tool: Tool) => {
		const editor = textarea.current;
		if (!editor) return;
		const start = editor.selectionStart;
		const end = editor.selectionEnd;
		const selected = source.slice(start, end) || tool.placeholder || "";
		const replacement = `${tool.prefix}${selected}${tool.suffix || ""}`;
		setSource(`${source.slice(0, start)}${replacement}${source.slice(end)}`);
		setContext(null);
		requestAnimationFrame(() => {
			editor.focus();
			editor.setSelectionRange(
				start + tool.prefix.length,
				start + tool.prefix.length + selected.length,
			);
		});
	};

	const save = async () => {
		if (!csrf || !slug || busy) return;
		setBusy(true);
		setMessage("正在保存…");
		try {
			const response = await fetch("/api/owner/post/", {
				method: "PUT",
				credentials: "same-origin",
				headers: { "Content-Type": "application/json", "x-firefly-csrf": csrf },
				body: JSON.stringify({ slug, source, baseSha }),
			});
			const data = (await response.json()) as PostData;
			if (!response.ok || !data.baseSha)
				throw new Error(data.error || "保存失败");
			setBaseSha(data.baseSha);
			setMessage("已原子写入本地文章；请回到文章页复核渲染。 ");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "保存失败");
		} finally {
			setBusy(false);
		}
	};

	const archive = async () => {
		if (!csrf || !slug || busy) return;
		const phrase = window.prompt(
			`软删除会移入可恢复归档。请输入：ARCHIVE ${slug}`,
		);
		if (phrase !== `ARCHIVE ${slug}`) return;
		setBusy(true);
		try {
			const response = await fetch("/api/owner/post/", {
				method: "DELETE",
				credentials: "same-origin",
				headers: { "Content-Type": "application/json", "x-firefly-csrf": csrf },
				body: JSON.stringify({ slug, baseSha, confirmation: phrase }),
			});
			const data = (await response.json()) as PostData;
			if (!response.ok) throw new Error(data.error || "归档失败");
			setState("error");
			setMessage("文章已移入可恢复归档，未执行远程硬删除。");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "归档失败");
		} finally {
			setBusy(false);
		}
	};

	const uploadImage = async (file: File) => {
		if (!csrf || !file.type.startsWith("image/")) return;
		setBusy(true);
		setMessage("正在校验并上传图片…");
		try {
			const form = new FormData();
			form.set("slug", slug);
			form.set("image", file);
			const response = await fetch("/api/owner/image/", {
				method: "POST",
				credentials: "same-origin",
				headers: { "x-firefly-csrf": csrf },
				body: form,
			});
			const data = (await response.json()) as {
				markdownPath?: string;
				error?: string;
			};
			if (!response.ok || !data.markdownPath)
				throw new Error(data.error || "图片上传失败");
			const editor = textarea.current;
			const at = editor?.selectionStart;
			const markdown = `![${file.name.replace(/\.[^.]+$/, "")}](${data.markdownPath})`;
			setSource((current) => {
				const insertAt = Math.min(at ?? current.length, current.length);
				return `${current.slice(0, insertAt)}${markdown}${current.slice(insertAt)}`;
			});
			setMessage("图片已按内容哈希去重并插入正文。");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "图片上传失败");
		} finally {
			setBusy(false);
		}
	};

	const onPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
		const image = [...event.clipboardData.files].find((file) =>
			file.type.startsWith("image/"),
		);
		if (image) {
			event.preventDefault();
			void uploadImage(image);
		}
	};

	const onDrop = (event: DragEvent<HTMLTextAreaElement>) => {
		const image = [...event.dataTransfer.files].find((file) =>
			file.type.startsWith("image/"),
		);
		if (image) {
			event.preventDefault();
			void uploadImage(image);
		}
	};

	const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (!(event.ctrlKey || event.metaKey)) return;
		if (event.key.toLowerCase() === "s") {
			event.preventDefault();
			void save();
		} else if (event.key.toLowerCase() === "b") {
			event.preventDefault();
			applyTool(tools[1]);
		} else if (event.key.toLowerCase() === "i") {
			event.preventDefault();
			applyTool(tools[2]);
		}
	};

	const onContextMenu = (event: MouseEvent<HTMLTextAreaElement>) => {
		if (event.currentTarget.selectionStart === event.currentTarget.selectionEnd)
			return;
		event.preventDefault();
		setContext({ x: event.clientX, y: event.clientY });
	};

	if (state !== "ready") {
		return (
			<section className="owner-editor-state" aria-live="polite">
				<p>{message}</p>
				{state === "guest" && (
					<a
						href={`/api/auth/github/start/?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
					>
						使用 GitHub 登录
					</a>
				)}
			</section>
		);
	}

	return (
		<section className="owner-editor-shell">
			<header className="owner-editor-head">
				<div>
					<p className="owner-editor-kicker">OWNER WORKBENCH</p>
					<h1>{slug}</h1>
					<p role="status">{message}</p>
				</div>
				<div className="owner-editor-actions">
					<button type="button" onClick={() => void save()} disabled={busy}>
						<Save size={17} />
						保存
					</button>
					<button
						type="button"
						className="danger"
						onClick={() => void archive()}
						disabled={busy}
					>
						<Archive size={17} />
						归档
					</button>
				</div>
			</header>
			<nav className="owner-editor-toolbar" aria-label="Markdown 工具栏">
				{tools.map((tool) => {
					const ToolIcon = tool.icon;
					return (
						<button
							key={tool.label}
							type="button"
							title={tool.label}
							aria-label={tool.label}
							onClick={() => applyTool(tool)}
						>
							<ToolIcon size={17} />
						</button>
					);
				})}
				<button
					type="button"
					title="插入图片"
					aria-label="插入图片"
					onClick={() => fileInput.current?.click()}
				>
					<ImagePlus size={17} />
				</button>
				<input
					ref={fileInput}
					type="file"
					accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
					hidden
					onChange={(event) => {
						const file = event.target.files?.[0];
						if (file) void uploadImage(file);
						event.target.value = "";
					}}
				/>
			</nav>
			<div className="owner-editor-grid">
				<label className="owner-editor-pane">
					<span>Markdown 源码</span>
					<textarea
						ref={textarea}
						value={source}
						onChange={(event) => setSource(event.target.value)}
						onPaste={onPaste}
						onDrop={onDrop}
						onDragOver={(event) => event.preventDefault()}
						onKeyDown={onKeyDown}
						onContextMenu={onContextMenu}
						spellCheck={false}
					/>
				</label>
				<section className="owner-editor-pane">
					<span>GFM 快速预览</span>
					<small className="owner-editor-preview-note">
						最终以文章页为准；MDX、KaTeX、指令与代码组不会在此完全还原。
					</small>
					<article className="owner-editor-preview">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{source.replace(/^---[\s\S]*?---\s*/, "")}
						</ReactMarkdown>
					</article>
				</section>
			</div>
			{context && (
				<div
					className="owner-editor-context"
					role="menu"
					style={{ left: context.x, top: context.y }}
					onPointerDown={(event) => event.stopPropagation()}
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
				>
					{tools.slice(1).map((tool) => (
						<button
							key={tool.label}
							type="button"
							role="menuitem"
							onClick={() => applyTool(tool)}
						>
							{tool.label}
						</button>
					))}
				</div>
			)}
		</section>
	);
}
