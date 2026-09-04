/**
 * 追问列表（Grok ↳ 后续相关提问）+ 附件 chips。
 * 追问文案由 buildFollowUps 生成（轻启发式，无模型参与）。
 */
import { FileText, X } from "lucide-react";
import type { ReactElement } from "react";
import type { AskAttachment, AskSource } from "./ask-types";

function trimTitle(title: string, max = 18) {
	const t = title.trim();
	return t.length > max ? `${t.slice(0, max)}…` : t;
}

/** 根据上一问 + 来源拼 3 条追问 */
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

/** ↳ 后续相关提问列表 */
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

export function fmtBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** 附件 chips：图片缩略 / 文件图标 + 名字 + 大小 + 可移除 */
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
					title={`${a.name} · ${fmtBytes(a.size)}`}
				>
					{a.kind === "image" && a.dataUrl ? (
						<img className="ask-attach-thumb" src={a.dataUrl} alt={a.name} />
					) : (
						<FileText className="ask-attach-fileicon" aria-hidden="true" />
					)}
					<span className="ask-attach-name">{trimTitle(a.name, 24)}</span>
					<span className="ask-attach-size">{fmtBytes(a.size)}</span>
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
