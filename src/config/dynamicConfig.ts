import type { DynamicConfig } from "@/types/dynamicConfig";

export const dynamicConfig: DynamicConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 动态头像和名称的跳转地址，支持站内路径或完整 URL
	profileUrl: "/about/",

	// 是否为每条动态启用评论，需要先在 commentConfig.ts 启用评论系统
	showComment: true,

	// 滚动懒加载：每次追加条数（首屏同批 SSR，避免整表塞进 hydration）
	itemsPerPage: 8,

	/**
	 * 发布时定位（方案 A / PRD dynamic-location）。
	 * - home：常驻地，IP 失败或关闭 ipGeo 时回落
	 * - ipGeo：发布脚本直连 IP 粗定位（绕开代理）；前端不定位
	 * 单条仍可用 frontmatter / CLI `--location` 覆盖。
	 */
	location: {
		home: "山西 · 运城",
		ipGeo: true,
	},

	/** @deprecated 兼容旧读路径；新逻辑以 location.home 为准 */
	defaultLocation: "山西 · 运城",

	// 动态数据 json 地址，本地默认 "/api/dynamic.json"
	// 可改为第三方接口地址；数据结构可打开该地址参考
	// 当 memos.enable 为 true 时，此配置会被忽略
	apiUrl: "/api/dynamic.json",

	// ========== Memos 配置 ==========
	// 启用后客户端会直接从 Memos API 实时获取数据，apiUrl 配置将被忽略
	// Memos 记得配置 CORS，否则可能会出现跨域问题
	memos: {
		// 是否启用 Memos 数据源
		enable: false,

		// Memos 实例地址
		apiUrl: "https://memos.example.com",

		// Memos 用户标识，如 "users/你的memos用户名"，用于过滤指定用户的动态
		parent: "users/threetwoa",
	},
};
