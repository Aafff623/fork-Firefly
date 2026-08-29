// 成就徽章（摘星录）配置类型

export type AchievementTier = "gold" | "silver" | "bronze";

export type AchievementBadge = {
	id: string; // 唯一标识
	name: string; // 徽章名；未解锁建议写「????」保持悬念
	icon: string; // lucide 图标名（如 lucide:pen-line）；未解锁统一 lucide:lock
	tier: AchievementTier; // 金 / 银 / 铜
	date?: string; // 达成日期，如 2026.08；未解锁留空
	desc?: string; // 徽章背后的故事，点击弹窗展示
	unlocked: boolean; // false = 灰星占位，不可点击
};

export type AchievementsPageConfig = {
	title?: string; // 页面标题，留空默认「摘星录」
	description?: string; // 页面描述
};
