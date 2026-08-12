import type { CollectionsConfig } from "../types/collectionsConfig";

/**
 * 人工策展合集登记（配置驱动）。
 * 文章 frontmatter 写 `collections: [slug, ...]` 即可入合集（多对多）。
 * 合集展示顺序 = 数组顺序；description 用于总览卡片与详情页头部。
 *
 * 分层：
 * - 一级（无 parent）：总览页卡片
 * - 二级（有 parent）：挂在一级详情页内，不单独出现在总览墙
 *
 * 当前嵌套：
 * - `ai-coding-tools` ← tool-claude-code / kimi / opencode / cursor / pi
 * - `course-geektime` ← 四门极客时间课
 * 一级另含：`wool-freebies`（薅羊毛专区）等
 */
export const collectionsConfig: CollectionsConfig = {
	items: [
		// ── 专题系列（一级）──
		{
			slug: "agentic-workflow",
			name: "Agentic Workflow",
			description:
				"跨工具工作流：MiniMax 媒体管线、Windows 编码治理、视觉外挂等可复用打法。",
			emoji: "⚙️",
			cover: "/assets/collections/agentic-workflow.jpg",
		},
		{
			slug: "transit-relay",
			name: "中转站评测",
			description: "GPT / Codex 中转方案、额度与压测实录。",
			emoji: "🔁",
			cover: "/assets/collections/transit-relay.jpg",
		},
		{
			slug: "vibe-tutorial-index",
			name: "鱼皮VibeCoding",
			description:
				"鱼皮 Vibe Coding 系列导读：基础、工具、实战部署、模型、学习、变现与热文索引。",
			emoji: "🚀",
			cover: "/assets/collections/vibe-coding.jpg",
		},

		// ── 课程合集（一级：极客时间 → 二级：各门课）──
		{
			slug: "course-geektime",
			name: "极客时间",
			description: "极客时间 AI 相关训练营结课笔记与选课对比。",
			emoji: "📚",
			cover: "/assets/collections/course-geektime.jpg",
		},
		{
			slug: "course-geektime-agent-fullstack",
			name: "AI Agent 全栈工程师",
			description: "14 周全栈 Agent 工程平台训练营结课笔记与拆解。",
			emoji: "📚",
			cover: "/assets/collections/course-geektime-agent-fullstack.jpg",
			parent: "course-geektime",
		},
		{
			slug: "course-geektime-agentic-product",
			name: "Agentic AI 产品",
			description: "8 周零代码 Agentic AI 产品训练营结课笔记。",
			emoji: "📚",
			cover: "/assets/collections/course-geektime-agentic-product.jpg",
			parent: "course-geektime",
		},
		{
			slug: "course-geektime-enterprise-coding",
			name: "企业级 AI 编程",
			description: "SDD × Harness，11 周企业级 AI 编程实战营结课笔记。",
			emoji: "📚",
			cover: "/assets/collections/course-geektime-enterprise-coding.jpg",
			parent: "course-geektime",
		},
		{
			slug: "course-geektime-bootcamps",
			name: "三门训练营对比",
			description: "三门 AI 训练营大纲对比与选课重点。",
			emoji: "📚",
			cover: "/assets/collections/course-geektime-bootcamps.jpg",
			parent: "course-geektime",
		},

		// ── AI 编程工具（一级 + 二级）──
		{
			slug: "ai-coding-tools",
			name: "AI 编程工具",
			description:
				"Claude Code、Kimi、OpenCode、Cursor、Pi 等工具上手、技巧与 Harness 生态。",
			emoji: "🧰",
			cover: "/assets/collections/ai-coding-tools.jpg",
		},
		{
			slug: "tool-claude-code",
			name: "Claude Code",
			description: "美化、记忆、Skill 加载、Harness 生态与 Claude Code 专文。",
			emoji: "🟣",
			cover: "/assets/collections/tool-claude-code.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-kimi-code",
			name: "Kimi Code",
			description: "Hook 验证、工具循环、从 Claude 迁移等 Kimi 专文。",
			emoji: "🌙",
			cover: "/assets/collections/tool-kimi-code.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-opencode",
			name: "OpenCode",
			description: "OpenCode + Luna / DeepSeek 协作配置与迁移实践。",
			emoji: "📂",
			cover: "/assets/collections/tool-opencode.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-cursor",
			name: "Cursor",
			description: "Cursor 侧 Harness 迁移与 Claude 规矩搬运。",
			emoji: "⬡",
			cover: "/assets/collections/tool-cursor.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-pi",
			name: "Pi Coding Agent",
			description: "Pi 开荒、记忆机制、主题状态栏与 provider 排错。",
			emoji: "π",
			cover: "/assets/collections/tool-pi.jpg",
			parent: "ai-coding-tools",
		},

		// ── Agentic Coding（一级 · 共性创意）──
		{
			slug: "agentic-coding",
			name: "Agentic Coding",
			description: "AI 编程过程中的创意、奇技与工程化想法（不绑单一工具）。",
			emoji: "💡",
			cover: "/assets/collections/agentic-coding.jpg",
		},
		{
			slug: "agentic-coding-core",
			name: "Agentic Coding 核心长文",
			description:
				"由碎片帖合并的对照长文（statusline / MCP·Skills / 记忆等）。",
			emoji: "📎",
			cover: "/assets/collections/agentic-coding.jpg",
		},

		// ── 测评（一级）──
		{
			slug: "review-skill-mcp",
			name: "Skill 与 MCP 测评",
			description: "Skill、MCP 与相关工具链的实测与横评。",
			emoji: "🔌",
			cover: "/assets/collections/mcp-recommend.jpg",
		},

		// ── tta 系列技能（一级 · 自研 skill 规范与迭代）──
		{
			slug: "tta-skills",
			name: "tta 系列技能",
			description: "自研 tta 系列 AI skill 的规范、迭代与实战。",
			emoji: "🛠️",
			cover: "/assets/collections/tta-skills.jpg",
		},

		// ── 羊毛 / 限免情报（一级）──
		{
			slug: "wool-freebies",
			name: "薅羊毛专区",
			description:
				"各厂商 AI 订阅、模型限免、申请试用与积分活动的可维护情报汇总（以博客文章收录）。",
			emoji: "🎟️",
			cover: "/assets/collections/wool-freebies.jpg",
		},

		// ── CSDN 技术教程（一级）──
		{
			slug: "csdn-tech-tutorials",
			name: "CSDN技术教程",
			description:
				"从 CSDN 精选提炼的 Vibe / Agent 工程 / MCP·Skills / 终端美化实战笔记。",
			emoji: "📘",
			cover: "/assets/collections/csdn-tech-tutorials.jpg",
		},

		// ── 小林coding 学习笔记（一级）──
		{
			slug: "xiaolincoding",
			name: "小林coding",
			description:
				"小林coding 图解 / 面经的个人学习笔记与导读合集（非原文镜像）。",
			emoji: "📗",
			cover: "/assets/collections/xiaolincoding.jpg",
		},
	],
};
