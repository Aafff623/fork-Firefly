/**
 * 分类条 pill 图标（Lucide via astro-icon）。
 * key = 文章 frontmatter `category` 原文；未命中走 defaultIcon。
 * 时间轴 / 主页 pill 在 CategoryBar 里单独写，不走本表。
 */
export const categoryIconConfig = {
	defaultIcon: "lucide:tag",
	icons: {
		"Agentic Coding": "lucide:bot",
		写作: "lucide:pen-line",
		指南: "lucide:compass",
		功能: "lucide:blocks",
		中转: "lucide:waypoints",
		羊毛揭秘: "lucide:scan-search",
		"skill 测评": "lucide:flask-conical",
		示例: "lucide:sparkles",
		前端开发: "lucide:layout-dashboard",
	} as Record<string, string>,
} as const;

export function categoryIconName(category: string): string {
	return categoryIconConfig.icons[category] ?? categoryIconConfig.defaultIcon;
}
