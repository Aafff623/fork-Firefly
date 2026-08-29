import {
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/navBarConfig";

// ============================================================================
// 导航栏配置 - 根据顺序动态生成导航栏链接
// NavBar Configuration - Dynamically generate navigation bar links based on order
// UI chrome 统一 Lucide outline（品牌外链仍可用 fa7-brands）
// ============================================================================
const getDynamicNavBarConfig = (): NavBarConfig => {
	// 基础导航栏链接
	const links: NavBarLink[] = [];

	// 主页
	links.push(LinkPresets.Home);

	// 文章及其子菜单
	links.push({
		name: "文章",
		url: "#",
		icon: "lucide:book-open",
		children: [
			// 时间轴
			LinkPresets.Archive,

			// 分类
			LinkPresets.Categories,

			// 合集
			LinkPresets.Collections,

			// 标签
			LinkPresets.Tags,
		],
	});

	//社交及其子菜单
	links.push({
		name: "社交",
		url: "#",
		icon: "lucide:users",
		children: [
			// 社区
			LinkPresets.Community,

			// 友链
			LinkPresets.Friends,

			// 留言
			LinkPresets.Guestbook,
		],
	});

	// 我的及其子菜单
	links.push({
		name: "我的",
		url: "#",
		icon: "lucide:user",
		children: [
			// 动态
			LinkPresets.Dynamic,

			// 摘星录（成就徽章墙）
			LinkPresets.Achievements,

			// 相册
			LinkPresets.Gallery,

			// 追番
			LinkPresets.Anime,

			// 番组计划
			LinkPresets.Bangumi,

			// 问答助手
			LinkPresets.Ask,
		],
	});

	// 关于及其子菜单
	links.push({
		name: "关于",
		url: "#",
		icon: "lucide:info",
		children: [
			// 打赏
			LinkPresets.Sponsor,

			// 关于页面
			LinkPresets.About,
		],
	});

	// 自定义导航栏链接
	links.push({
		name: "链接",
		url: "#",
		icon: "lucide:link",
		// 子菜单
		children: [
			// 站点导航（藏经阁）
			LinkPresets.NavSites,

			{
				name: "GitHub",
				url: "https://github.com/Aafff623",
				external: true,
				icon: "fa7-brands:github",
			},
			{
				name: "Digital Garden",
				url: "https://threetwoa-digital-garden.vercel.app",
				external: true,
				icon: "lucide:trees",
			},
		],
	});

	return { links } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

// ============================================================================
// 链接预设 - 可自由自定义导航栏链接的名称、图标和URL
// Link Presets - Allows free customization of the name, icon and URL of navigation bar links
// ============================================================================
export const LinkPresets: Record<string, NavBarLink> = {
	Home: {
		name: "主页",
		url: "/",
		icon: "lucide:house",
	},
	Dynamic: {
		name: "动态",
		url: "/dynamic/",
		icon: "lucide:messages-square",
		pageKey: "dynamic",
	},
	Community: {
		name: "社区",
		url: "/community/",
		icon: "lucide:badge-info",
		pageKey: "community",
	},
	Archive: {
		name: "时间轴",
		url: "/timeline/",
		icon: "lucide:history",
	},
	Categories: {
		name: "分类",
		url: "/categories/",
		icon: "lucide:folder-open",
	},
	Collections: {
		name: "合集",
		url: "/collections/",
		icon: "lucide:library",
	},
	Tags: {
		name: "标签",
		url: "/tags/",
		icon: "lucide:tag",
	},
	Friends: {
		name: "友链",
		url: "/friends/",
		icon: "lucide:link-2",
		pageKey: "friends",
	},
	Sponsor: {
		name: "打赏",
		url: "/sponsor/",
		icon: "lucide:heart",
		pageKey: "sponsor",
	},
	Guestbook: {
		name: "留言",
		url: "/guestbook/",
		icon: "lucide:message-circle",
		pageKey: "guestbook",
	},
	About: {
		name: "关于我",
		url: "/about/",
		icon: "lucide:badge-info",
	},
	Bangumi: {
		name: "番组计划",
		url: "/bangumi/",
		icon: "lucide:clapperboard",
		pageKey: "bangumi",
	},
	Gallery: {
		name: "相册",
		url: "/gallery/",
		icon: "lucide:images",
		pageKey: "gallery",
	},
	Anime: {
		name: "追番",
		url: "/anime/",
		icon: "lucide:tv",
		pageKey: "anime",
	},
	Ask: {
		name: "问答",
		url: "/ask/",
		icon: "lucide:bot-message-square",
		pageKey: "ask",
	},
	NavSites: {
		name: "藏经阁",
		url: "/nav/",
		icon: "lucide:library-big",
		pageKey: "navSites",
	},
	Achievements: {
		name: "摘星录",
		url: "/achievements/",
		icon: "lucide:sparkles",
		pageKey: "achievements",
	},
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
