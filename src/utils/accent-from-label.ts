/**
 * 按标签/分类名哈希映射到稳定点缀色（同名同色）。
 * 色板复用主题 --accent-* / --hue-*，无需手维护大表。
 */

const ACCENT_PALETTE = [
	"var(--accent-indigo)",
	"var(--accent-violet)",
	"var(--accent-cool)",
	"var(--accent-rose)",
	"var(--accent-berry)",
	"var(--primary)",
	"oklch(0.55 0.14 var(--hue-sky))",
	"oklch(0.52 0.12 var(--hue-teal))",
	"oklch(0.52 0.12 var(--hue-green))",
	"oklch(0.55 0.12 var(--hue-mint))",
	"oklch(0.58 0.14 var(--hue-amber))",
	"oklch(0.58 0.13 var(--hue-gold))",
	"oklch(0.56 0.14 var(--hue-coral))",
] as const;

/** FNV-1a 风格哈希 → 色板索引 */
function hashLabel(label: string): number {
	const s = label.trim().toLowerCase();
	let h = 2166136261;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

/** 返回可用作 CSS `color` / `--tag-accent` 的颜色值 */
export function accentFromLabel(label: string): string {
	const key = label.trim() || "uncategorized";
	const idx = hashLabel(key) % ACCENT_PALETTE.length;
	return ACCENT_PALETTE[idx];
}

/** 写成内联 style，供 Astro 模板挂到链接上 */
export function tagAccentStyle(label: string): string {
	return `--tag-accent: ${accentFromLabel(label)}`;
}
