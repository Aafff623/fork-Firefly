// 站点导航（藏经阁）配置：方案二「层级分类 + 独立路由侧边栏」
// 层级铁律：一级模块（独立路由 /nav/<slug>/）+ 二级子类（页内锚点），深度 ≤ 2
export type NavSite = {
	title: string; // 站点名称
	url?: string; // 站点地址（外链站必填；站内合集条目由 collectionSlug 生成）
	collectionSlug?: string; // 站内合集入口（collectionsConfig.items 的 slug）：整卡站内跳转，不弹预览
	desc?: string; // 一行简介（卡片展示）
	detail?: string; // 长介绍（预览卡右侧，空行分段）
	screenshots?: string[]; // UI 截图轮播（R2 图床 URL，如 https://img.threetwoa.live/nav/xxx.png）
	icon?: string; // iconify 图标名（如 "simple-icons:github"）；缺省用首字母方块
	emoji?: string; // emoji 图标（站内合集条目与 collectionsConfig.emoji 对齐）；优先级低于 icon
	tags?: string[]; // 标签
	pinned?: boolean; // 是否进总览页「常用」行
	preview?: boolean; // 是否允许预览弹层；缺省 true，无 screenshots 且无 detail 时自动退化为整卡直链
	enabled?: boolean; // 是否启用，缺省 true
};

export type NavSubCategory = {
	id: string; // 页内锚点 id（英文 kebab-case，与映射表一致）
	name: string; // 子类名（如「学习平台」）
	desc?: string; // 收录范围说明（区头副标题）
	icon?: string; // 子类 iconify 图标
	enabled?: boolean; // 是否启用，缺省 true
	sites: NavSite[]; // 子类下站点
};

export type NavModule = {
	slug: string; // 路由段：/nav/<slug>/
	name: string; // 一级模块名（含序号，如「一、学习进修」）
	icon?: string; // 模块 iconify 图标
	weight: number; // 权重，数字越大排序越靠前
	enabled?: boolean; // 是否启用，缺省 true
	subcategories: NavSubCategory[]; // 二级子类
};

export type NavSitesPageConfig = {
	title?: string; // 页面标题，留空则使用 i18n 中的翻译
	description?: string; // 页面描述，留空则使用 i18n 中的翻译
};
