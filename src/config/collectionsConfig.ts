import type { CollectionsConfig } from "../types/collectionsConfig";

/**
 * 人工策展合集登记（配置驱动）。
 * 文章 frontmatter 写 `collections: [slug, ...]` 即可入合集（多对多）。
 * 合集展示顺序 = 数组顺序；description 用于总览卡片与详情页头部。
 *
 * 新增合集背景：MiniMax style-taste **17 卡通人物风**（日历封面同族 soft pixel chibi，静图非 GIF）。
 * 落盘 `public/assets/collections/<slug>.jpg`（建议 4:3）；人物上半、下半留白保字。
 * Prompt 规范见 `.cursor/skills/firefly-minimax-media/references/prompt-craft.md` →「17 · 卡通人物风」。
 */
export const collectionsConfig: CollectionsConfig = {
	items: [
		{
			slug: "agentic-coding",
			name: "Agentic Coding 实践",
			description: "用 AI 写码：Harness、Agent 工作流、工具链实测与避坑。",
			emoji: "🤖",
			cover: "/assets/collections/agentic-coding.jpg",
		},
		{
			slug: "vibe-coding",
			name: "Vibe Coding 教程索引",
			description: "鱼皮 vibe-coding 系列导读：基础、技巧、工具与 MCP 索引。",
			emoji: "🚀",
			cover: "/assets/collections/vibe-coding.jpg",
		},
		{
			slug: "mcp-recommend",
			name: "MCP 推荐",
			description: "MCP 工具链与生态：协议、推荐与落地实践。",
			emoji: "🔌",
			cover: "/assets/collections/mcp-recommend.jpg",
		},
		{
			slug: "transit-relay",
			name: "中转 Relay 评测",
			description: "GPT / Codex 中转方案、额度与压测实录。",
			emoji: "🔁",
			cover: "/assets/collections/transit-relay.jpg",
		},
		{
			slug: "windows-discipline",
			name: "Windows 编码纪律",
			description: "中文 Windows 下的编码与 Shell 治理：UTF-8、GBK、CC Switch。",
			emoji: "🪟",
			cover: "/assets/collections/windows-discipline.jpg",
		},
		{
			slug: "media-workflow",
			name: "MiniMax 媒体工作流",
			description: "封面、配音、音乐、短视频：MiniMax 出媒体全流程。",
			emoji: "🎨",
			cover: "/assets/collections/media-workflow.jpg",
		},
		{
			slug: "firefly-guide",
			name: "Firefly 主题指南",
			description: "本站主题的二次开发与使用：配置、桌宠、评论。",
			emoji: "🍀",
			cover: "/assets/collections/firefly-guide.jpg",
		},
	],
};
