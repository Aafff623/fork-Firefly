/**
 * 分类条「分色印章」：图标 + 固定点缀色 + 窄屏两字简称。
 * key = 文章 frontmatter `category` 原文；未命中走 defaultIcon / 哈希兜底色。
 * 时间轴 / 主页 / 更多 在 CategoryBar 里走 nav 专用色，不走本表。
 */
import { accentFromLabel } from "../utils/accent-from-label";

export const categoryIconConfig = {
	defaultIcon: "lucide:stamp",
	icons: {
		"Agentic Coding": "lucide:bot",
		写作: "lucide:pen-line",
		指南: "lucide:compass",
		功能: "lucide:blocks",
		中转: "lucide:waypoints",
		羊毛揭秘: "lucide:ticket-percent",
		"skill 测评": "lucide:flask-conical",
		示例: "lucide:sparkles",
		前端开发: "lucide:code-xml",
		修行: "lucide:sprout",
	} as Record<string, string>,
	accents: {
		"Agentic Coding": "var(--accent-violet)",
		写作: "var(--accent-cool)",
		指南: "oklch(0.52 0.12 var(--hue-teal))",
		功能: "var(--accent-indigo)",
		中转: "oklch(0.55 0.14 var(--hue-sky))",
		羊毛揭秘: "oklch(0.58 0.14 var(--hue-amber))",
		"skill 测评": "var(--accent-berry)",
		示例: "var(--accent-rose)",
		前端开发: "oklch(0.52 0.12 var(--hue-green))",
		修行: "oklch(0.55 0.12 var(--hue-mint))",
	} as Record<string, string>,
	shortLabels: {
		"Agentic Coding": "Agent",
		"skill 测评": "测评",
		前端开发: "前端",
		羊毛揭秘: "羊毛",
	} as Record<string, string>,
} as const;

const NAV_ACCENT = {
	home: "var(--primary)",
	archive: "oklch(0.58 0.13 var(--hue-gold))",
	more: "var(--accent-cool)",
} as const;

export function categoryIconName(category: string): string {
	return categoryIconConfig.icons[category] ?? categoryIconConfig.defaultIcon;
}

export function categoryAccent(category: string): string {
	return categoryIconConfig.accents[category] ?? accentFromLabel(category);
}

/** 写成内联 style：分类条用 --cat-accent，侧栏 / 元信息沿用 --tag-accent */
export function categoryAccentStyle(category: string): string {
	const color = categoryAccent(category);
	return `--cat-accent: ${color}; --tag-accent: ${color}`;
}

export function categoryNavAccentStyle(
	kind: keyof typeof NAV_ACCENT,
): string {
	return `--cat-accent: ${NAV_ACCENT[kind]}`;
}

/** 窄屏印章底下的两字（或短英文词） */
export function categoryShortLabel(name: string): string {
	const key = name.trim();
	if (!key) return key;
	if (categoryIconConfig.shortLabels[key]) {
		return categoryIconConfig.shortLabels[key];
	}
	if (/[\u4e00-\u9fff]/.test(key)) return key.slice(0, 2);
	const word = key.split(/\s+/)[0] || key;
	return word.slice(0, 5);
}
