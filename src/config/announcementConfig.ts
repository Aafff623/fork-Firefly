import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 侧栏近况条：状态入口，不是欢迎语
	title: "此刻",

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
};
