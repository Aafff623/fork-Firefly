import getReadingTime from "reading-time";

export type PostListSummary = {
	description: string;
	words: number;
	minutes: number;
};

function stripFrontmatter(markdown: string): string {
	return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

/**
 * 列表页只需要可读文本，不应为此执行 Astro 的完整 Markdown 渲染链。
 * 这里保留标题、链接文字、图片 alt 和代码内容，和 remark 的文本统计口径接近。
 */
function toPlainText(markdown: string): string {
	return stripFrontmatter(markdown)
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")
		.replace(/^\s*(?:[-*+] |\d+\. )/gm, "")
		.replace(/```[^\n]*|```/g, "")
		.replace(/[`*_~>|]/g, " ")
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function getFirstParagraph(markdown: string): string {
	for (const block of stripFrontmatter(markdown).split(/\r?\n\s*\r?\n/)) {
		if (/^\s*(?:#{1,6}\s|```)/.test(block)) continue;
		const paragraph = toPlainText(block);
		if (paragraph) return paragraph;
	}
	return "";
}

export function getPostListSummary(
	body: string,
	description: string,
): PostListSummary {
	const plainText = toPlainText(body);
	const readingTime = getReadingTime(plainText);

	return {
		description: description.trim() || getFirstParagraph(body),
		words: readingTime.words,
		minutes: Math.max(1, Math.round(readingTime.minutes)),
	};
}
