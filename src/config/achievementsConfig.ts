import type {
	AchievementBadge,
	AchievementsPageConfig,
} from "../types/achievementsConfig";

// ============================================================================
// 摘星录 · 成就徽章墙配置
// 下面均为演示数据，请替换为你自己的成就。
// 徽章 unlocked:false 即为「灰星」占位（尚未达成的目标）。
// ============================================================================

export const achievementsPageConfig: AchievementsPageConfig = {
	title: "", // 留空默认「摘星录」
	description: "每一枚徽章都是一颗亲手摘下的星。墙上看星图，也见来时的路。",
};

// 徽章墙（展示顺序即数组顺序）
export const achievementsBadges: AchievementBadge[] = [
	{
		id: "first-post",
		name: "落笔",
		icon: "lucide:pen-line",
		tier: "bronze",
		date: "2023.03",
		desc: "在博客写下第一篇文章。万事开头难，开了头就不难。",
		unlocked: true,
	},
	{
		id: "hundred-posts",
		name: "笔耕不辍",
		icon: "lucide:flame",
		tier: "silver",
		date: "2023.11",
		desc: "累计发布 100 篇文章。数字本身不重要，重要的是没有停。",
		unlocked: true,
	},
	{
		id: "theme-maker",
		name: "造轮者",
		icon: "lucide:palette",
		tier: "gold",
		date: "2024.02",
		desc: "独立完成博客主题的深度定制，从配色到组件一手包办。",
		unlocked: true,
	},
	{
		id: "oss-first",
		name: "开源初啼",
		icon: "lucide:sprout",
		tier: "silver",
		date: "2024.05",
		desc: "第一个开源项目收获第 50 个 star。",
		unlocked: true,
	},
	{
		id: "half-marathon",
		name: "破风",
		icon: "lucide:footprints",
		tier: "gold",
		date: "2024.10",
		desc: "完成人生第一场半程马拉松，配速比预期快了两分钟。",
		unlocked: true,
	},
	{
		id: "photo-wall",
		name: "捕光",
		icon: "lucide:camera",
		tier: "bronze",
		date: "2025.01",
		desc: "相册模块上线，第一次办了自己的线上小影展。",
		unlocked: true,
	},
	{
		id: "read-52",
		name: "五十二卷",
		icon: "lucide:book-open",
		tier: "gold",
		date: "2025.12",
		desc: "一年读完 52 本书，平均每周一本，笔记写满三个本子。",
		unlocked: true,
	},
	{
		id: "friends-30",
		name: "以文会友",
		icon: "lucide:handshake",
		tier: "silver",
		date: "2026.04",
		desc: "博客友链突破 30 位，认识了天南海北写字的人。",
		unlocked: true,
	},
	{
		id: "xiuxian-60",
		name: "玄灵成书",
		icon: "lucide:scroll",
		tier: "gold",
		date: "2026.07",
		desc: "修仙系列 60 篇完结撒花，卦师玄灵的故事告一段落。",
		unlocked: true,
	},
	{
		id: "badge-wall",
		name: "摘星人",
		icon: "lucide:star",
		tier: "gold",
		date: "2026.08",
		desc: "搭起这面星墙——你正在看的这一枚。",
		unlocked: true,
	},
	// 未解锁的三颗灰星：留作目标位
	{
		id: "todo-talk",
		name: "????",
		icon: "lucide:lock",
		tier: "gold",
		unlocked: false,
	},
	{
		id: "todo-trail",
		name: "????",
		icon: "lucide:lock",
		tier: "gold",
		unlocked: false,
	},
	{
		id: "todo-1000",
		name: "????",
		icon: "lucide:lock",
		tier: "gold",
		unlocked: false,
	},
];

export const getUnlockedBadges = (): AchievementBadge[] =>
	achievementsBadges.filter((b) => b.unlocked);
