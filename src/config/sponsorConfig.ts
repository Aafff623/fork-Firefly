import type { SponsorConfig } from "../types/sponsorConfig";

export const sponsorConfig: SponsorConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 打赏用途说明
	usage:
		"如果你愿意支持 threetwoa 继续写博客、打磨 Agent 工作流，打赏会用于站点维护与内容创作。",

	// 是否显示打赏者列表
	showSponsorsList: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否在文章详情页底部显示打赏按钮（打赏保留在 /sponsor/ 页，文内只做分享）
	showButtonInPost: false,

	// 打赏方式列表
	// 暂不展示支付方式；收到新的收款素材后再在此添加。
	methods: [],

	// 打赏者列表（可选）
	sponsors: [],
};
