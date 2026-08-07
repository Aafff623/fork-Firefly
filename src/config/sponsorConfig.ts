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
	// QR 图：public/assets/images/sponsor/{alipay,wechat}.png
	methods: [
		{
			name: "支付宝",
			icon: "fa7-brands:alipay",
			qrCode: "/assets/images/sponsor/alipay.png",
			description: "打开支付宝，扫一扫完成打赏",
			enabled: true,
		},
		{
			name: "微信",
			icon: "fa7-brands:weixin",
			qrCode: "/assets/images/sponsor/wechat.png",
			description: "打开微信，扫一扫完成打赏",
			enabled: true,
		},
	],

	// 打赏者列表：复制下方「模板块」取消注释并改字段即可渲染
	sponsors: [
		/*
		{
			name: "访客昵称",
			avatar: "/assets/images/sponsor/avatars/example.png",
			amount: "¥6.66",
			date: "2026-08-07",
			message: "文章很有帮助，小小支持一下～",
			link: "https://example.com",
			method: "微信",
		},
		{
			name: "匿名支持者",
			amount: "¥1.00",
			date: "2026-08-01",
			message: "继续加油",
			method: "支付宝",
		},
		*/
	],
};
