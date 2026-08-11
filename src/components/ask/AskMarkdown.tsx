/**
 * /ask 富文本：单次 GFM 渲染（不用 HeroUI Markdown 的 marked.lexer 分块，
 * 分块会把表格拆烂，只剩最后一块能显示）。
 */
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

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

const components: Components = {
	a: ({ href, children, ...props }) => (
		<a href={href} target="_blank" rel="noopener noreferrer" {...props}>
			{children}
		</a>
	),
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

type Props = {
	children: string;
	className?: string;
};

export default function AskMarkdown({ children, className }: Props) {
	const content = normalizeAskMarkdown(children || "");
	return (
		<div
			className={`ask-markdown markdown${className ? ` ${className}` : ""}`}
			data-slot="ask-markdown"
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
				rehypePlugins={[rehypeKatex]}
				components={components}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
