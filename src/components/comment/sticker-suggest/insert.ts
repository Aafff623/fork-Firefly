/** 将候选写入 textarea：优先 Waline 短码，避免长 Markdown 撑乱光标/选区 */ // 中文注释

import type { SuggestItem } from "@/lib/sticker-suggest/types";

function escapeAlt(title: string): string {
	return title.replace(/[[\]]/g, "");
}

/**
 * 从 CDN 文件名推导 Waline 短码（与视觉层 emojiMap 的 :bb_xxx: 一致）。
 * 短码仅约 10 字符，长 Markdown 约 70+，会让透明 textarea 选区严重错位。
 */ // 中文注释
export function srcToWalineShortcode(src: string): string | null {
	const matched = src.match(
		/\/([a-z0-9_]+)\.(?:png|gif|webp|jpe?g)(?:\?|#|$)/i,
	);
	if (!matched?.[1]) return null;
	return `:${matched[1]}:`;
}

/** 把历史 ![sticker:…](url) 草稿迁成短码 */ // 中文注释
export function migrateStickerMarkdownInText(value: string): string {
	return value.replace(
		/!\[sticker:[^\]]*\]\((https?:\/\/[^)\s]+)\)/gi,
		(full, url: string) => srcToWalineShortcode(url) ?? full,
	);
}

/**
 * 优先短码；无法推导时才退回 sticker Markdown（行内小图）。
 */ // 中文注释
export function buildSuggestMarkdown(item: SuggestItem): string {
	const shortcode = srcToWalineShortcode(item.src);
	if (shortcode) return shortcode;
	return `![sticker:${escapeAlt(item.title)}](${item.src})`;
}

export type InsertTokenRange = {
	start: number;
	end: number;
};

/**
 * 在触发词之后插入表情（不删原文）。
 */ // 中文注释
export function insertSuggestMarkdown(
	editor: HTMLTextAreaElement,
	item: SuggestItem,
	tokenRange?: InsertTokenRange | null,
): void {
	const md = buildSuggestMarkdown(item);
	const v = editor.value;
	const insertAt = tokenRange ? tokenRange.end : editor.selectionStart;
	const after = tokenRange ? tokenRange.end : editor.selectionEnd;
	editor.value = `${v.slice(0, insertAt)}${md}${v.slice(after)}`;
	const pos = insertAt + md.length;
	editor.focus();
	editor.setSelectionRange(pos, pos);
	editor.dispatchEvent(new Event("input", { bubbles: true }));
	editor.dispatchEvent(new Event("change", { bubbles: true }));
}
