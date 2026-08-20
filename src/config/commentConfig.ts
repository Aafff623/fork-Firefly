import type { CommentConfig } from "../types/commentConfig";

export const commentConfig: CommentConfig = {
	// 评论系统类型: none, twikoo, waline, giscus, disqus, artalk
	// 主评论使用 GitHub Discussions；动态时间线的逐条回复显式保留 Waline。
	// 决策见 docs/adr/0006-giscus-with-waline-dynamic-channel.md
	type: "giscus",

	//twikoo评论系统配置
	twikoo: {
		envId: "https://twikoo.vercel.app",
		// 设置 Twikoo 评论系统语言
		lang: "zh-CN",
		// 是否启用文章访问量统计功能
		visitorCount: true,
		// Twikoo JS 文件地址，支持 CDN 链接
		// 中国推荐1: https://registry.npmmirror.com/twikoo/1.7.14/files/dist/twikoo.min.js
		// 中国推荐2: https://s4.zstatic.net/npm/twikoo@1.7.14/dist/twikoo.min.js
		// 国际推荐: https://cdn.jsdelivr.net/npm/twikoo@1.7.14/dist/twikoo.min.js
		jsUrl: "https://cdn.jsdelivr.net/npm/twikoo@1.7.14/dist/twikoo.min.js",
		// Twikoo 自定义 CSS 文件地址，为空则不加载
		cssUrl: "/assets/css/twikoo-custom.css",
	},

	//waline评论系统配置
	waline: {
		// 自建服务端（Vercel + Neon）。必须用 Production 稳定域名，禁止 Preview hash URL
		serverURL: "https://threetwoa-waline.vercel.app",
		// 设置 Waline 评论系统语言
		lang: "zh-CN",
		// 表情预设（CDN；含静图/可带动图包）。搜索 GIF：客户端默认启用 Giphy，无需额外配置
		emoji: [
			"https://unpkg.com/@waline/emojis@1.4.0/qq",
			"https://unpkg.com/@waline/emojis@1.4.0/weibo",
			"https://unpkg.com/@waline/emojis@1.4.0/bilibili",
			"https://unpkg.com/@waline/emojis@1.4.0/bmoji",
		],
		// 评论登录模式。可选值如下：
		//   'enable'   —— 默认，允许访客匿名评论和用第三方 OAuth 登录评论，兼容性最佳。
		//   'force'    —— 强制必须登录后才能评论，适合严格社区，关闭匿名评论。
		//   'disable'  —— 禁止所有登录和 OAuth，仅允许匿名评论（填写昵称/邮箱），适用于极简留言。
		login: "enable",
		// 是否启用文章访问量统计功能
		visitorCount: true,
		// 边打字边推梗图（L1 词表；Agent=DeepSeek 官网，默认关） // 中文注释
		stickerSuggest: {
			enabled: false,
			debounceMs: 300,
			minChars: 2,
			maxResults: 6,
			// true 时未命中走 DeepSeek（需 DEEPSEEK_API_KEY） // 中文注释
			agentEnabled: false,
			endpoint: "/api/comment-sticker-suggest/",
		},
	},

	// artalk评论系统配置
	artalk: {
		// artalk后端程序 API 地址
		server: "https://artalk.example.com/",
		// 设置 Artalk 语言
		locale: "zh-CN",
		// 是否启用文章访问量统计功能
		visitorCount: true,
	},

	// GitHub Discussions 评论。repo/category ID 已于 2026-08-20 通过 GitHub GraphQL 复核。
	giscus: {
		repo: "Aafff623/fork-Firefly",
		repoId: "R_kgDOToSNAw",
		category: "Announcements",
		categoryId: "DIC_kwDOToSNA84DCe8K",
		mapping: "pathname",
		strict: "0",
		reactionsEnabled: "1",
		emitMetadata: "0",
		inputPosition: "bottom",
		lang: "zh-CN",
		loading: "lazy",
	},

	//disqus评论系统配置
	disqus: {
		// 获取 Disqus 评论系统
		shortname: "",
	},
};
