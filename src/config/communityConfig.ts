export const communityConfig = {
	repository: "Aafff623/fork-Firefly",
	discussionsUrl: "https://github.com/Aafff623/fork-Firefly/discussions",
	newDiscussionUrl:
		"https://github.com/Aafff623/fork-Firefly/discussions/new?category=general",
	profileUrl: "https://github.com/Aafff623",
	channels: [
		{
			name: "公告",
			description: "站点更新、维护说明与重要变更。",
			icon: "lucide:megaphone",
			url: "https://github.com/Aafff623/fork-Firefly/discussions/categories/announcements",
		},
		{
			name: "交流",
			description: "围绕文章、工具、学习和数字花园自由讨论。",
			icon: "lucide:messages-square",
			url: "https://github.com/Aafff623/fork-Firefly/discussions/categories/general",
		},
		{
			name: "问答",
			description: "把具体问题说清楚，一起留下可复用的答案。",
			icon: "lucide:circle-help",
			url: "https://github.com/Aafff623/fork-Firefly/discussions/categories/q-a",
		},
		{
			name: "想法",
			description: "收集功能建议、内容选题和还没长成的点子。",
			icon: "lucide:lightbulb",
			url: "https://github.com/Aafff623/fork-Firefly/discussions/categories/ideas",
		},
	],
} as const;
