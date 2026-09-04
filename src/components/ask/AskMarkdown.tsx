/**
 * /ask 富文本：单次 GFM 渲染（不用 HeroUI Markdown 的 marked.lexer 分块，
 * 分块会把表格拆烂，只剩最后一块能显示）。
 * 引用：模型按提示词在句末标 [n]（n 对应站内检索结果编号）→
 * linkifyCitations 把 [n] 转成真链接，渲染层识别纯数字链接换成可悬停角标。
 */
import { ExternalLink } from "lucide-react";
import type { ReactElement } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { SourceHoverCard } from "./Sources";
import type { AskSource } from "./ask-types";

/** 模型偶尔仍输出「链接：/posts/…」纯文本 → 收成可点 Markdown */
export function normalizeAskMarkdown(src: string): string {
	let md = src.replace(/\r\n/g, "\n").trim();
	if (!md) return md;

	// 1. 《标题》/「标题」 + 下一行「链接：url」→ [标题](url)
	md = md.replace(
		/(^|\n)(\d+\.\s*)(?:《([^》]+)》|「([^」]+)」|([^\n]+?))\s*\n\s*链接[：:]\s*(\/[^\s]+|https?:\/\/[^\s]+)/g,
		(_m, pre, num, t1, t2, t3, url) => {
			const title = (t1 || t2 || t3 || "").trim().replace(/\*+/g, "");
			return `${pre}${num}**[${title}](${url.trim()})**`;
		},
	);

	// 2. 单独残留的「链接：/path」→ 可点链接
	md = md.replace(
		/(^|\n)\s*链接[：:]\s*(\/[^\s]+|https?:\/\/[^\s]+)/g,
		(_m, pre, url) => `${pre}→ [${url.trim()}](${url.trim()})`,
	);

	// 3. 「看点：…」收成引用块（若尚未是 >）
	md = md.replace(/(^|\n)\s*看点[：:]\s*(?!>)/g, "$1> **看点：** ");

	// 4. 表格修补
	md = md.replace(/([^\n|])\n(\|[^\n]+\|)\n/g, "$1\n\n$2\n");
	md = md.replace(/｜/g, "|");
	md = md.replace(/\|(\s*)[—–−‐]+(\s*\|)/g, (_m, a, b) => `|${a}---${b}`);
	md = md.replace(
		/(^|\n)(\|[^\n]+\|)(\n)(?!\|[\s:|-]+\|)(\|[^\n]+\|)/g,
		(_m, pre, header, nl, row) => {
			const cols = header.split("|").filter((c: string) => c.length > 0).length;
			const sep = `|${Array.from({ length: cols }, () => " --- ").join("|")}|`;
			return `${pre}${header}${nl}${sep}${nl}${row}`;
		},
	);

	return md;
}

/** [n]（n ≤ 来源数）→ [n](来源url)；跳过代码围栏段，避免改坏代码块 */
export function linkifyCitations(md: string, sources?: AskSource[]): string {
	if (!sources?.length || !md) return md;
	const parts = md.split(/(```[\s\S]*?(?:```|$))/g);
	return parts
		.map((part, i) => {
			if (i % 2 === 1) return part;
			return part.replace(/\[(\d{1,2})\]/g, (m, n) => {
				const src = sources[Number(n) - 1];
				return src ? `[${n}](${src.url})` : m;
			});
		})
		.join("");
}

/** 纯数字链接 → 可悬停引用角标；其余照常渲染 */
function makeComponents(sources?: AskSource[]): Components {
	const findSource = (href: string): AskSource | undefined => {
		if (!sources?.length) return undefined;
		const key = decodeURIComponent(href || "");
		return sources.find((s) => s.url === key);
	};
	return {
		a: ({ href, children, ...props }) => {
			const text = typeof children === "string" ? children.trim() : "";
			const src = /^\d+$/.test(text) && href ? findSource(href) : undefined;
			if (src && text) {
				return (
					<sup className="ask-cite" data-cite={text}>
						<SourceHoverCard
							title={src.title}
							url={src.url}
							snippet={src.snippet}
							date={src.date}
						>
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={`来源 ${text}：${src.title}`}
							>
								{text}
							</a>
						</SourceHoverCard>
					</sup>
				);
			}
			return (
				<a href={href} target="_blank" rel="noopener noreferrer" {...props}>
					{children}
					{href && /^https?:\/\//.test(href) ? (
						<ExternalLink
							className="ask-md-link-ext"
							aria-hidden="true"
							width={12}
							height={12}
						/>
					) : null}
				</a>
			);
		},
		blockquote: ({ children, ...props }) => (
			<blockquote className="ask-md-quote" {...props}>
				{children}
			</blockquote>
		),
		strong: ({ children, ...props }) => (
			<strong className="ask-md-strong" {...props}>
				{children}
			</strong>
		),
		em: ({ children, ...props }) => (
			<em className="ask-md-em" {...props}>
				{children}
			</em>
		),
		table: ({ children, ...props }) => (
			<div className="ask-md-table-wrap" data-slot="ask-md-table-wrap">
				<table {...props}>{children}</table>
			</div>
		),
	};
}

type Props = {
	children: string;
	className?: string;
	/** 行内角标 [n] 的映射来源 */
	sources?: AskSource[];
	/** 流式中：末尾挂打字光标 */
	streaming?: boolean;
};

export default function AskMarkdown({
	children,
	className,
	sources,
	streaming = false,
}: Props): ReactElement {
	const content = linkifyCitations(
		normalizeAskMarkdown(children || ""),
		sources,
	);
	return (
		<div
			className={`ask-markdown markdown${className ? ` ${className}` : ""}`}
			data-slot="ask-markdown"
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
				rehypePlugins={[rehypeKatex]}
				components={makeComponents(sources)}
			>
				{content}
			</ReactMarkdown>
			{streaming ? <span className="ask-caret" aria-hidden="true" /> : null}
		</div>
	);
}
