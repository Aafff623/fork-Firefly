import type { CollectionsConfig } from "../types/collectionsConfig";

/**
 * 人工策展合集（配置驱动）。
 * 文章 frontmatter `collections: [slug, ...]`（多对多，允许跨一级复用）。
 *
 * 层级：
 * - 一级（无 parent）：知识树频道，出现在 `/collections/` 总览
 * - 二级（有 parent）：工具夹 / 方法夹 / 来源夹；只在一级详情页出场
 * 第三层这轮用手册章节顶着，不登记成合集夹。
 * 极客时间四门课是既有三级叶子，仍挂在 `course-geektime` 下。
 *
 * output 发布岗只缓存一二级（干什么 / 什么样的文章该进），不记文章名单：
 * 合集由 post-publish 成帖时按本文件一二级挂载；不另存缓存
 *
 * 现行一级：AI 编程工具 · Agentic Workflow · 视觉媒体 · 模型评测 ·
 * 大模型概述 · Java 全栈工程师 · 课程推荐 · 求职攻略 · 前端工程 ·
 * 后端 · 数据库 · 运维 · 产品经理 · 文史 · 本站系列
 */
export const collectionsConfig: CollectionsConfig = {
	items: [
		// ── 1. AI 编程工具 ──
		{
			slug: "ai-coding-tools",
			name: "AI 编程工具",
			description:
				"Harness 产品夹：Claude Code、OpenCode、Cursor、Kimi、Codex、Pi、Kiro、ZCode 等。工具专文挂二级；跨工具方法另见 Agentic Workflow。",
			emoji: "🧰",
			cover: "/assets/collections/ai-coding-tools.jpg",
		},
		{
			slug: "tool-claude-code",
			name: "Claude Code",
			description: "版本、CLAUDE.md、MCP、Hooks、美化与真实 workflow。",
			emoji: "🟣",
			cover: "/assets/collections/tool-claude-code.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-opencode",
			name: "OpenCode",
			description: "路由协作、记忆嫁接与 DeepSeek 刀法。",
			emoji: "📂",
			cover: "/assets/collections/tool-opencode.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-cursor",
			name: "Cursor",
			description: "三层规则、Skills 路径、外壳美化与 AGENTS.md 实践。",
			emoji: "⬡",
			cover: "/assets/collections/tool-cursor.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-kimi-code",
			name: "Kimi Code CLI",
			description: "Workbench、Hook 校验、死循环刹车。",
			emoji: "🌙",
			cover: "/assets/collections/tool-kimi-code.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-codex",
			name: "Codex",
			description: "Chat / Work 分工、实践心得、AGENTS.md 与长期拴绳。",
			emoji: "⬛",
			cover: "/assets/collections/tool-codex.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-pi",
			name: "Pi Coding Agent",
			description: "Extension 开荒、记忆、主题与 provider 排错。",
			emoji: "π",
			cover: "/assets/collections/tool-pi.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-kiro",
			name: "Kiro",
			description: "Harness 缰绳体感与 Claude 协作。",
			emoji: "🪢",
			cover: "/assets/collections/tool-kiro.jpg",
			parent: "ai-coding-tools",
		},
		{
			slug: "tool-zcode",
			name: "ZCode",
			description: "智谱 ZCode / ADE 工作台。有帖再往这里挂。",
			emoji: "Z",
			parent: "ai-coding-tools",
		},

		// ── 2. Agentic Workflow ──
		{
			slug: "agentic-workflow",
			name: "Agentic Workflow",
			description:
				"跨工具沉淀：Vibe Coding、Spec Coding、Harness Engineering，以及大佬链路与工程方法。可与工具夹双挂。",
			emoji: "⚙️",
			cover: "/assets/collections/agentic-workflow.jpg",
		},
		{
			slug: "vibe-tutorial-index",
			name: "Vibe Coding 导读",
			description: "鱼皮系列索引墙：入门、工具、实战、模型、学习与变现。",
			emoji: "🚀",
			cover: "/assets/collections/vibe-coding.jpg",
			parent: "agentic-workflow",
		},
		{
			slug: "csdn-tech-tutorials",
			name: "Vibe 踩坑实录",
			description: "从会聊天到能交付的踩坑短篇（CSDN 精选提炼）。",
			emoji: "📘",
			cover: "/assets/collections/csdn-tech-tutorials.jpg",
			parent: "agentic-workflow",
		},

		// ── 3. 视觉媒体 ──
		{
			slug: "visual-media",
			name: "视觉媒体",
			description:
				"海报与版式、提示词资产、视频与手绘素材整理。前端工程实现见「前端工程」。",
			emoji: "🎬",
			cover: "/assets/collections/visual-media.jpg",
		},

		// ── 4. 模型评测 ──
		{
			slug: "model-eval",
			name: "模型评测",
			description:
				"厂商新模型实测，以及中转 / 羊毛场景里真正跑得动的模型评测。",
			emoji: "🧪",
			cover: "/assets/collections/model-eval.jpg",
		},
		{
			slug: "transit-relay",
			name: "中转实测",
			description: "GPT / Codex 中转方案、额度与压测实录。",
			emoji: "🔁",
			cover: "/assets/collections/transit-relay.jpg",
			parent: "model-eval",
		},
		{
			slug: "wool-freebies",
			name: "羊毛与限免实测",
			description: "订阅、限免、试用情报里带模型水位判断的篇目。",
			emoji: "🎟️",
			cover: "/assets/collections/wool-freebies.jpg",
			parent: "model-eval",
		},

		// ── 5. 大模型概述 ──
		{
			slug: "llm-overview",
			name: "大模型概述",
			description:
				"RAG、MoE、应用栈与底层概念，以及 Python 库地图。实测跑分见「模型评测」。",
			emoji: "🧠",
			cover: "/assets/collections/llm-overview.jpg",
		},

		// ── 6. Java 全栈工程师 ──
		{
			slug: "java-fullstack",
			name: "Java 全栈工程师",
			description:
				"Java+AI 全栈工程师体系课：从单体到分布式、微服务、AI 融合与云原生部署的完整学习路径。",
			emoji: "☕",
			cover: "/assets/collections/java-fullstack.jpg",
		},
		{
			slug: "java-fullstack-intro",
			name: "开篇导学",
			description: "课程导学与 Java+AI 全栈工程师概论。",
			emoji: "📖",
			cover: "/assets/collections/java-fullstack-intro.jpg",
			parent: "java-fullstack",
		},
		{
			slug: "java-fullstack-spring",
			name: "Spring 全家桶",
			description: "Spring 核心、Spring MVC、Spring Data、Spring Security。",
			emoji: "🌱",
			cover: "/assets/collections/java-fullstack-spring.jpg",
			parent: "java-fullstack",
		},
		{
			slug: "java-fullstack-frontend-basic",
			name: "前端基础",
			description: "Thymeleaf 模板引擎与 Bootstrap 样式框架。",
			emoji: "🎨",
			cover: "/assets/collections/java-fullstack-frontend-basic.jpg",
			parent: "java-fullstack",
		},
		{
			slug: "java-fullstack-monolith",
			name: "单体实战：仿小红书",
			description: "从零到一构建仿小红书单体全栈项目。",
			emoji: "📕",
			cover: "/assets/collections/java-fullstack-monolith.jpg",
			parent: "java-fullstack",
		},
		{
			slug: "java-fullstack-distributed",
			name: "分布式进阶",
			description: "分布式原理、Git、Redis、Kafka、MongoDB、Nginx、Prometheus 与演进实战。",
			emoji: "🌐",
			cover: "/assets/collections/java-fullstack-distributed.jpg",
			parent: "java-fullstack",
		},
		{
			slug: "java-fullstack-microservices",
			name: "前后端分离与微服务",
			description: "Vue 3、前后端分离实战、微服务架构设计、Spring Cloud 与改造实战。",
			emoji: "🧩",
			cover: "/assets/collections/java-fullstack-microservices.jpg",
			parent: "java-fullstack",
		},
		{
			slug: "java-fullstack-ai-cloud",
			name: "AI 赋能与云原生",
			description: "Spring AI、AI 融合实战、Docker、Kubernetes 与部署运维。",
			emoji: "🤖",
			cover: "/assets/collections/java-fullstack-ai-cloud.jpg",
			parent: "java-fullstack",
		},

		// ── 7. 课程推荐 ──
		{
			slug: "courses",
			name: "课程推荐",
			description: "训练营与课程拆解。下面按机构 / 系列挂二级。",
			emoji: "📚",
			cover: "/assets/collections/courses.jpg",
		},
		{
			slug: "course-geektime",
			name: "极客时间",
			description: "极客时间 AI 相关训练营结课笔记与选课对比。",
			emoji: "📚",
			cover: "/assets/collections/course-geektime.jpg",
			parent: "courses",
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

		// ── 8. 求职攻略 ──
		{
			slug: "career-guide",
			name: "求职攻略",
			description: "校招路径、社招轮次、转岗与面经。",
			emoji: "🧭",
			cover: "/assets/collections/career-guide.jpg",
		},
		{
			slug: "xiaolincoding",
			name: "小林coding",
			description: "图解 / 面经的个人导读（非原文镜像）。",
			emoji: "📗",
			cover: "/assets/collections/xiaolincoding.jpg",
			parent: "career-guide",
		},

		// ── 9. 领域工程 ──
		{
			slug: "frontend-eng",
			name: "前端工程",
			description:
				"小程序、Lottie、SVG 动效、纯 CSS、3D 等实现向。海报和视频生成见「视觉媒体」。",
			emoji: "🧩",
			cover: "/assets/collections/frontend-eng.jpg",
		},
		{
			slug: "backend",
			name: "后端",
			description: "服务端、接口与业务系统。有帖再往这里挂。",
			emoji: "🗄️",
			cover: "/assets/collections/backend.jpg",
		},
		{
			slug: "database",
			name: "数据库",
			description: "库表、查询与数据系统设计。有帖再往这里挂。",
			emoji: "🗃️",
			cover: "/assets/collections/database.jpg",
		},
		{
			slug: "ops",
			name: "运维",
			description: "Linux、网络、K8s 与术语图解。",
			emoji: "🛠️",
			cover: "/assets/collections/ops.jpg",
		},
		{
			slug: "product",
			name: "产品经理",
			description: "人效、精益、成本与产品判断。有帖再往这里挂。",
			emoji: "📋",
			cover: "/assets/collections/product.jpg",
		},

		// ── 10. 文史 ──
		{
			slug: "humanities",
			name: "文史",
			description:
				"历史、神话、人物与地图。神话地图先占坑；以后史识、人物也可往这里挂。",
			emoji: "📜",
			cover: "/assets/collections/humanities.jpg",
		},

		// ── 11. 修行 ──
		{
			slug: "xiuxing",
			name: "修行",
			description:
				"修仙、修行、玄学世界观与灵性实证。人身难得，这一世怎么修、修到哪里。按 UP 主分二级：散人小沅 / 修炼者小烨 / 玄成先生 / 林晓丁 / 卦师玄灵 / up主山吒。",
			emoji: "🧘",
			cover: "/assets/collections/xiuxing.jpg",
		},
		{
			slug: "sanren-xiaoyuan",
			name: "散人小沅",
			description: "人间规则、能量系统与世界运转的底层逻辑。",
			emoji: "🏔️",
			cover: "/assets/collections/sanren-xiaoyuan.jpg",
			parent: "xiuxing",
		},
		{
			slug: "xiulianzhe-xiaoye",
			name: "修炼者小烨",
			description: "修行实证体验、修仙路径与心性淬炼。",
			emoji: "🌿",
			cover: "/assets/collections/xiulianzhe-xiaoye.jpg",
			parent: "xiuxing",
		},
		{
			slug: "xuancheng-xiansheng",
			name: "玄成先生",
			description: "地府、因果、幽冥问答与死后世界。",
			emoji: "🌒",
			cover: "/assets/collections/xuancheng-xiansheng.jpg",
			parent: "xiuxing",
		},
		{
			slug: "lin-xiaoding",
			name: "林晓丁",
			description: "阳间修行指南、功德与实践。",
			emoji: "🕯️",
			cover: "/assets/collections/lin-xiaoding.jpg",
			parent: "xiuxing",
		},
		{
			slug: "guashi-xuanling",
			name: "卦师玄灵",
			description: "起卦问九幽：阴间生存指南系列与修真四族大解析。",
			emoji: "🔮",
			cover: "/assets/collections/guashi-xuanling.jpg",
			parent: "xiuxing",
		},
		{
			slug: "up-shanzha",
			name: "up主山吒",
			description: "山吒的宇宙观：入世、出世与世界真相三部曲的玄学思考。",
			emoji: "🌌",
			cover: "/assets/collections/up-shanzha.jpg",
			parent: "xiuxing",
		},

		// ── 12. 本站系列 ──
		{
			slug: "site-series",
			name: "本站系列",
			description:
				"园主本站：部署与域名、桌宠、发文流水线等站点自身记录。",
			emoji: "🏡",
			cover: "/assets/collections/site-series.jpg",
		},
	],
};
