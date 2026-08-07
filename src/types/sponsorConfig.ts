// 打赏方式类型
export type SponsorMethod = {
	name: string; // 打赏方式名称，如 "支付宝"、"微信"、"PayPal"
	icon?: string; // 图标名称（Iconify 格式），如 "fa7-brands:alipay"
	qrCode?: string; // 收款码图片路径（相对于 public 目录），可选
	link?: string; // 打赏链接 URL，可选。如果提供，会显示跳转按钮
	description?: string; // 描述文本
	enabled: boolean; // 是否启用
};

// 打赏者列表项（复制 sponsorConfig 内模板块填写即可）
export type SponsorItem = {
	name: string; // 显示名；匿名可写「匿名支持者」
	avatar?: string; // 头像：public 相对路径或 https 外链
	amount?: string; // 金额展示，如 "¥6.66"（可选）
	date?: string; // ISO 日期，如 "2026-08-07"（可选）
	message?: string; // 留言/感谢语（可选）
	link?: string; // 主页或社交链接（可选）
	method?: string; // 渠道标签，如 "微信" / "支付宝"（可选）
};

// 打赏配置
export type SponsorConfig = {
	title?: string; // 页面标题，默认使用 i18n
	description?: string; // 页面描述文本
	usage?: string; // 打赏用途说明
	methods: SponsorMethod[]; // 打赏方式列表
	sponsors?: SponsorItem[]; // 打赏者列表（可选）
	showSponsorsList?: boolean; // 是否显示打赏者列表，默认 true
	showComment?: boolean; // 是否显示评论区，默认 false
	showButtonInPost?: boolean; // 是否在文章详情页底部显示打赏按钮，默认 true
};
