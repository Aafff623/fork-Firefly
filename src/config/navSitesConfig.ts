import type {
	NavModule,
	NavSite,
	NavSitesPageConfig,
	NavSubCategory,
} from "../types/navSitesConfig";
import { collectionsConfig } from "./collectionsConfig";

// 可以在 src/pages/nav/index.astro 的页面标题/描述中覆盖（留空走 i18n）

// 站点导航页面配置
export const navSitesPageConfig: NavSitesPageConfig = {
	title: "",
	description: "",
};

// 园内藏品（站内合集）模块：只登记 slug（名称/简介/emoji 以 collectionsConfig 为真源），
// 点击整卡站内跳转 /collections/<slug>/，不弹预览。篇数由页面构建时统计。数量红线豁免。
export const navCollectionsModule: {
	slug: string;
	name: string;
	icon?: string;
	weight: number;
	subcategory: Pick<NavSubCategory, "id" | "name" | "desc" | "icon">;
	slugs: string[];
} = {
	slug: "collections",
	name: "六、园内藏品",
	icon: "lucide:library-big",
	weight: 50,
	subcategory: {
		id: "site-collections",
		name: "站内合集",
		desc: "博客自有合集入口，随 collectionsConfig 自动增减",
	},
	slugs: [
		// 修行系二级（园主指定示例：散人小沅）
		"sanren-xiaoyuan",
		"xiulianzhe-xiaoye",
		"xuancheng-xiansheng",
		"lin-xiaoding",
		"guashi-xuanling",
		"up-shanzha",
		// 一级频道
		"xiuxing",
	],
};

// 模块化骨架（按 weight 降序；enabled: false 可临时下架整个模块/子类/单站）
// 治理红线：每子类 5–15 条，<3 提议合并、>15 提议细分
// 设计文档：docs/outputs/prd/nav-sites-directory/structure-scheme2.md
export const navModulesConfig: NavModule[] = [
	{
		slug: "learning",
		name: "一、学习进修",
		icon: "lucide:graduation-cap",
		weight: 100,
		subcategories: [
			{
				id: "study-platforms",
				name: "学习平台",
				desc: "在线课程、编程训练营、免费系统教程",
				icon: "lucide:school",
				sites: [
					{
						title: "小林 coding",
						url: "https://xiaolincoding.com",
						desc: "图解网络与图解系统",
						tags: ["后端", "面试"],
						detail:
							"小林 coding 以图解方式讲解计算机网络与操作系统，适合后端面试复习与基础巩固。站内《图解网络》《图解系统》是长期更新的免费开源教程。",
					},
					{
						title: "LeetCode 中国",
						url: "https://leetcode.cn",
						desc: "算法刷题与题库",
						icon: "simple-icons:leetcode",
						tags: ["算法"],
					},
				],
			},
			{
				id: "official-docs",
				name: "官方文档",
				desc: "语言 / 框架 / AI 模型的权威文档与 API 参考",
				icon: "lucide:book-marked",
				sites: [
					{
						title: "MDN Web Docs",
						url: "https://developer.mozilla.org",
						desc: "Web 标准权威参考",
						icon: "simple-icons:mdnwebdocs",
						tags: ["前端", "标准"],
						pinned: true,
					},
					{
						title: "Astro Docs",
						url: "https://docs.astro.build",
						desc: "本站框架的官方文档",
						icon: "simple-icons:astro",
						tags: ["Astro", "SSG"],
					},
					{
						title: "Tailwind CSS",
						url: "https://tailwindcss.com",
						desc: "原子化 CSS 框架",
						icon: "simple-icons:tailwindcss",
						tags: ["CSS"],
					},
					{
						title: "React",
						url: "https://react.dev",
						desc: "React 官方文档",
						icon: "fa7-brands:react",
						tags: ["前端"],
					},
					{
						title: "Anthropic Docs",
						url: "https://docs.anthropic.com",
						desc: "Claude 官方文档与 Cookbook",
						icon: "fa7-brands:github",
						tags: ["文档", "Claude"],
					},
					{
						title: "OpenAI Docs",
						url: "https://platform.openai.com/docs",
						desc: "OpenAI 平台文档",
						tags: ["文档", "API"],
					},
					{
						title: "Model Context Protocol",
						url: "https://modelcontextprotocol.io",
						desc: "MCP 协议规范与示例",
						tags: ["MCP", "协议"],
					},
				],
			},
			{
				id: "practice-cases",
				name: "实战与案例",
				desc: "项目实战、开源解读、刷题与问答",
				icon: "lucide:flask-conical",
				sites: [
					{
						title: "Hugging Face",
						url: "https://huggingface.co",
						desc: "开源模型与数据集的第一站",
						icon: "fa7-brands:hugging-face",
						tags: ["模型", "数据集"],
						pinned: true,
					},
					{
						title: "LangChain",
						url: "https://www.langchain.com",
						desc: "LLM 应用编排框架",
						tags: ["框架"],
					},
					{
						title: "Stack Overflow",
						url: "https://stackoverflow.com",
						desc: "程序员问答社区",
						icon: "fa7-brands:stack-overflow",
						tags: ["问答"],
					},
				],
			},
		],
	},
	{
		slug: "tools",
		name: "二、效率工具",
		icon: "lucide:wrench",
		weight: 90,
		subcategories: [
			{
				id: "productivity",
				name: "生产力软件",
				desc: "笔记、任务管理、协同办公",
				icon: "lucide:notebook-pen",
				sites: [
					{
						title: "Excalidraw",
						url: "https://excalidraw.com",
						desc: "手绘风白板与架构草图",
						icon: "simple-icons:excalidraw",
						tags: ["白板", "图表"],
						pinned: true,
					},
				],
			},
			{
				id: "dev-toolbox",
				name: "开发者工具箱",
				desc: "本地开发辅助、容器、版本控制",
				icon: "lucide:terminal",
				sites: [
					{
						title: "Regex101",
						url: "https://regex101.com",
						desc: "正则表达式在线调试",
						tags: ["正则"],
					},
					{
						title: "Can I Use",
						url: "https://caniuse.com",
						desc: "浏览器兼容性查询",
						tags: ["兼容性"],
					},
				],
			},
			{
				id: "online-tools",
				name: "在线工具",
				desc: "免安装网页工具：格式转换、图像处理、AI 辅助",
				icon: "lucide:globe",
				sites: [],
			},
		],
	},
	{
		slug: "creators",
		name: "三、优质创作者",
		icon: "lucide:users",
		weight: 80,
		subcategories: [
			{
				id: "tech-creators",
				name: "编程与 AI 方向",
				desc: "技术教学、源码解读、行业社区",
				icon: "lucide:code-2",
				sites: [
					{
						title: "V2EX",
						url: "https://v2ex.com",
						desc: "创意工作者社区",
						tags: ["社区"],
					},
				],
			},
			{
				id: "science-creators",
				name: "知识科普方向",
				desc: "计算机基础、科技史、硬核科普",
				icon: "lucide:lightbulb",
				sites: [],
			},
			{
				id: "humanities-creators",
				name: "人文与效率方向",
				desc: "读书方法、学习法、数字生活",
				icon: "lucide:feather",
				sites: [
					{
						title: "少数派",
						url: "https://sspai.com",
						desc: "高质量数字指南",
						tags: ["效率", "数码"],
					},
				],
			},
		],
	},
	{
		slug: "reading",
		name: "四、阅读空间",
		icon: "lucide:book-open",
		weight: 70,
		subcategories: [
			{
				id: "ebooks",
				name: "电子书资源",
				desc: "免费书库、聚合搜索引擎、公开讲义库",
				icon: "lucide:library",
				sites: [],
			},
			{
				id: "reading-platforms",
				name: "读书平台",
				desc: "正版阅读应用、书评社区、数字图书馆",
				icon: "lucide:book-heart",
				sites: [],
			},
		],
	},
	{
		slug: "entertainment",
		name: "五、影音·动漫·番剧",
		icon: "lucide:clapperboard",
		weight: 60,
		subcategories: [
			{
				id: "movies",
				name: "在线影视",
				desc: "免费无广告站点（支持「备用」标记）",
				icon: "lucide:film",
				sites: [],
			},
			{
				id: "anime",
				name: "动漫番剧",
				desc: "新番时间表、经典补番、剧场版专区",
				icon: "lucide:tv",
				sites: [],
			},
			{
				id: "aggregators",
				name: "资源聚合与导航",
				desc: "综合搜索引擎、GitHub 维护的资源清单",
				icon: "lucide:compass",
				sites: [],
			},
		],
	},
];

// 站内合集条目 → NavSite 形态（名称/简介/emoji 查 collectionsConfig，缺登记的 slug 静默跳过）
const toCollectionNavSite = (slug: string): NavSite | null => {
	const item = collectionsConfig.items.find((c) => c.slug === slug);
	if (!item) return null;
	return {
		title: item.name,
		collectionSlug: item.slug,
		desc: item.description,
		emoji: item.emoji,
		preview: false,
	};
};

// 获取启用的模块（模块/子类/站点三级过滤 + 园内藏品注入，按 weight 降序）
export const getEnabledNavModules = (): NavModule[] => {
	const modules: NavModule[] = navModulesConfig
		.filter((module) => module.enabled !== false)
		.map((module) => ({
			...module,
			subcategories: module.subcategories
				.filter((sub) => sub.enabled !== false)
				.map((sub) => ({
					...sub,
					sites: sub.sites.filter((site) => site.enabled !== false),
				})),
		}))
		.filter((module) => module.subcategories.length > 0);

	if (navCollectionsModule.slugs.length > 0) {
		const sites = navCollectionsModule.slugs
			.map(toCollectionNavSite)
			.filter((site): site is NavSite => site !== null);
		if (sites.length > 0) {
			modules.push({
				slug: navCollectionsModule.slug,
				name: navCollectionsModule.name,
				icon: navCollectionsModule.icon,
				weight: navCollectionsModule.weight,
				subcategories: [
					{
						...navCollectionsModule.subcategory,
						sites,
					},
				],
			});
		}
	}

	return modules.sort((a, b) => b.weight - a.weight);
};

// 获取置顶的「常用」站点（跨模块，按出现顺序去重）
export const getEnabledNavSites = (): NavSite[] => {
	const seen = new Set<string>();
	const pinned: NavSite[] = [];
	for (const module of getEnabledNavModules()) {
		for (const sub of module.subcategories) {
			for (const site of sub.sites) {
				if (!site.pinned) continue;
				const key = site.url || site.collectionSlug || site.title;
				if (seen.has(key)) continue;
				seen.add(key);
				pinned.push(site);
			}
		}
	}
	return pinned;
};

// 站点是否可弹预览：站内合集条目整卡跳转，永不弹层；外链站需有截图或长介绍
export const isNavSitePreviewable = (site: NavSite): boolean => {
	if (site.collectionSlug) return false;
	if (site.preview === false) return false;
	return Boolean(
		(site.screenshots && site.screenshots.length > 0) || site.detail,
	);
};
