import type { ProfileConfig } from "../types/profileConfig";

export const profileConfig: ProfileConfig = {
	// 头像
	// 图片路径支持三种格式：
	// 1. public 目录（以 "/" 开头，不优化）："/assets/images/avatar.webp"
	// 2. src 目录（不以 "/" 开头，自动优化但会增加构建时间，推荐）："assets/images/avatar.webp"
	// 3. 远程 URL："https://example.com/avatar.jpg"
	avatar: "assets/images/avatar.webp",

	// 侧栏头像装饰框（显示设置可切换；默认金属细环 SVG）
	avatarFrame: {
		enabled: true,
		defaultId: "S3-metallic",
		frames: [
			{
				id: "C3-conic-spin",
				kind: "css",
				cssClass: "af-conic-spin",
			},
			{
				id: "C2-dual-soft",
				kind: "css",
				cssClass: "af-dual-soft",
			},
			{
				id: "C6-metallic",
				kind: "css",
				cssClass: "af-metallic",
			},
			{
				id: "C5-stars-css",
				kind: "css",
				cssClass: "af-stars",
			},
			{
				id: "S3-metallic",
				kind: "svg",
				src: "/assets/images/avatar-frames/metallic.svg",
			},
			{
				id: "S6-laurel",
				kind: "svg",
				src: "/assets/images/avatar-frames/laurel.svg",
			},
		],
	},

	// 名字（GitHub display name）
	name: "threetwoa",

	// 个人签名
	bio: "少写一点胶水代码，多留一点判断。中北软件 · Java & Python · Agent。",

	// 链接配置（对齐 GitHub profile / README Contact）
	// UI 通用：lucide；品牌：fa7-brands / simple-icons
	// 访问 https://icones.js.org/ 获取图标代码
	// showName: true 时显示图标和名称，false 时只显示图标
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/Aafff623",
			showName: false,
		},
		{
			name: "Bilibili",
			icon: "simple-icons:bilibili",
			url: "https://space.bilibili.com/549916339",
			showName: false,
		},
		{
			name: "Email",
			icon: "lucide:mail",
			url: "mailto:laiyif68@gmail.com",
			showName: false,
		},
		{
			name: "Twitter",
			icon: "fa7-brands:x-twitter",
			url: "https://x.com/FanLaiyi26341",
			showName: false,
		},
		{
			name: "Telegram",
			icon: "fa7-brands:telegram",
			url: "https://t.me/threetwoa",
			showName: false,
		},
	],
};
