import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 侧栏不定期惊喜入口（粉系标题 + 图标；文案由园主随缘更换）
	title: "不期而至",

	content:
		"正在把 AI 工具锻成可复用、能上线的工作流；少写一点代码，多留一点架构的余白。新笔记会陆续放进博客与数字花园。",

	icon: "lucide:sparkles",
	type: "info",
	closable: true,

	link: {
		enable: true,
		text: "走进数字花园",
		url: "https://threetwoa-digital-garden.vercel.app",
		external: true,
	},

	// mast 下方：不定期惊喜信封（换新时请 bump version）
	loveLetter: {
		enable: true,
		version: "2026-08-02",
		note: "点开惊喜",
		heading: "致每一位路过的你",
		message:
			"谢谢你停在这里。愿你被温柔以待，也愿你带着一点勇气继续往前——这是我留给访客的小小礼物。",
	},
};
