# 合集心智模型（一二级缓存）

output 路由用。**只记一级 / 二级夹：干什么、什么样的文章该进。**
不记文章名单，不记三级课表/手册章节正文。

真源：`src/config/collectionsConfig.ts`。每次 output 开跑先：

```bash
python .cursor/skills/knowledge-output/scripts/sync_collection_model.py
# 有 added/removed/renamed →
python .cursor/skills/knowledge-output/scripts/sync_collection_model.py --apply
```

双挂：跨树才写两个 slug（例 `tool-claude-code` + `agentic-workflow`）。
已挂二级则不必再挂它的一级父夹（一级页会滚子夹文章）。
对不上现有夹：提案新 L1/L2，园主点头再改配置；禁止私自开空壳。

## L1 `ai-coding-tools` · AI 编程工具
purpose: Harness 产品夹：Claude Code、OpenCode、Cursor、Kimi、Codex、Pi、Kiro、ZCode 等。工具专文挂二级；跨工具方法另见 Agentic Workflow。
route: Harness 产品夹：Claude Code、OpenCode、Cursor、Kimi、Codex、Pi、Kiro、ZCode 等。工具专文挂二级；跨工具方法另见 Agentic Workflow。

### L2 `tool-claude-code` · Claude Code
parent: ai-coding-tools
purpose: 版本、CLAUDE.md、MCP、Hooks、美化与真实 workflow。
route: CC 本体（CLAUDE.md / MCP / Hooks / 美化 / 工作流）挂本夹。跨工具的工程方法另加 `agentic-workflow`。

### L2 `tool-opencode` · OpenCode
parent: ai-coding-tools
purpose: 路由协作、记忆嫁接与 DeepSeek 刀法。
route: 路由协作、记忆嫁接与 DeepSeek 刀法。

### L2 `tool-cursor` · Cursor
parent: ai-coding-tools
purpose: 三层规则、Skills 路径、外壳美化与 AGENTS.md 实践。
route: Cursor 本体（规则 / Skills / 外壳 / AGENTS.md 实践）挂本夹。跨工具的 AGENTS 方法论另加 `agentic-workflow`。

### L2 `tool-kimi-code` · Kimi Code CLI
parent: ai-coding-tools
purpose: Workbench、Hook 校验、死循环刹车。
route: Workbench、Hook 校验、死循环刹车。

### L2 `tool-codex` · Codex
parent: ai-coding-tools
purpose: Chat / Work 分工、实践心得、AGENTS.md 与长期拴绳。
route: Chat / Work 分工、实践心得、AGENTS.md 与长期拴绳。

### L2 `tool-pi` · Pi Coding Agent
parent: ai-coding-tools
purpose: Extension 开荒、记忆、主题与 provider 排错。
route: Extension 开荒、记忆、主题与 provider 排错。

### L2 `tool-kiro` · Kiro
parent: ai-coding-tools
purpose: Harness 缰绳体感与 Claude 协作。
route: Harness 缰绳体感与 Claude 协作。

### L2 `tool-zcode` · ZCode
parent: ai-coding-tools
purpose: 智谱 ZCode / ADE 工作台。有帖再往这里挂。
route: 智谱 ZCode / ADE 工作台。有帖再往这里挂。

## L1 `agentic-workflow` · Agentic Workflow
purpose: 跨工具沉淀：Vibe Coding、Spec Coding、Harness Engineering，以及大佬链路与工程方法。可与工具夹双挂。
route: 跨工具方法（Vibe / Spec / Harness、大佬链路）挂本夹。点名某一家工具的专文挂对应 tool-*，方法文可双挂。

### L2 `vibe-tutorial-index` · Vibe Coding 导读
parent: agentic-workflow
purpose: 鱼皮系列索引墙：入门、工具、实战、模型、学习与变现。
route: 鱼皮系列索引墙：入门、工具、实战、模型、学习与变现。

### L2 `csdn-tech-tutorials` · Vibe 踩坑实录
parent: agentic-workflow
purpose: 从会聊天到能交付的踩坑短篇（CSDN 精选提炼）。
route: 从会聊天到能交付的踩坑短篇（CSDN 精选提炼）。

## L1 `visual-media` · 视觉媒体
purpose: 海报与版式、提示词资产、视频与手绘生成、MiniMax 做片。前端工程实现见「前端工程」。
route: 海报、版式、提示词资产、视频/手绘生成、MiniMax 做片挂本夹。前端实现（Lottie/SVG/小程序）走 `frontend-eng`。

## L1 `model-eval` · 模型评测
purpose: 厂商新模型实测，以及中转 / 羊毛场景里真正跑得动的模型评测。
route: 厂商实测、中转/羊毛里真正测模型的篇。概念综述走 `llm-overview`。

### L2 `transit-relay` · 中转实测
parent: model-eval
purpose: GPT / Codex 中转方案、额度与压测实录。
route: GPT / Codex 中转方案、额度与压测实录。

### L2 `wool-freebies` · 羊毛与限免实测
parent: model-eval
purpose: 订阅、限免、试用情报里带模型水位判断的篇目。
route: 订阅、限免、试用情报里带模型水位判断的篇目。

## L1 `llm-overview` · 大模型概述
purpose: RAG、MoE、应用栈与底层概念，以及 Python 库地图。实测跑分见「模型评测」。
route: RAG / MoE / 库地图等概念向。跑分实测走 `model-eval`（含中转/羊毛二级）。

## L1 `ai-morning-brief` · AI 早报
purpose: 按期 AI 资讯摘要：官方渠道与可核对来源为主，B 站等视频源只作片单线索。
route: 只收合集 skill 出的早报一期。普通 Knowledge 笔记不要挂这里。

## L1 `github-weekly-hot` · GitHub 每周热点
purpose: 按期自写的开源项目解读。周刊只当目录；日更热榜卡不进本夹。
route: 只收合集 skill 出的热榜一期。普通笔记不要挂这里。

## L1 `courses` · 课程推荐
purpose: 训练营与课程拆解。下面按机构 / 系列挂二级。
route: 训练营与课程拆解。下面按机构 / 系列挂二级。

### L2 `course-geektime` · 极客时间
parent: courses
purpose: 极客时间 AI 相关训练营结课笔记与选课对比。
route: 极客时间 AI 相关训练营结课笔记与选课对比。
leaves: `course-geektime-agent-fullstack`, `course-geektime-agentic-product`, `course-geektime-enterprise-coding`, `course-geektime-bootcamps`  # 三级夹，仅当正文就是该课/该叶才挂；不在本缓存展开

## L1 `career-guide` · 求职攻略
purpose: 校招路径、社招轮次、转岗与面经。
route: 校招路径、社招轮次、转岗与面经。

### L2 `xiaolincoding` · 小林coding
parent: career-guide
purpose: 图解 / 面经的个人导读（非原文镜像）。
route: 图解 / 面经的个人导读（非原文镜像）。

## L1 `frontend-eng` · 前端工程
purpose: 小程序、Lottie、SVG 动效、纯 CSS、3D 等实现向。海报和视频生成见「视觉媒体」。
route: 小程序、Lottie、SVG、纯 CSS、3D 等**实现向**挂本夹。生成海报/视频走 `visual-media`。

## L1 `backend` · 后端
purpose: 服务端、接口与业务系统。有帖再往这里挂。
route: 服务端、接口与业务系统。有帖再往这里挂。

## L1 `database` · 数据库
purpose: 库表、查询与数据系统设计。有帖再往这里挂。
route: 库表、查询与数据系统设计。有帖再往这里挂。

## L1 `ops` · 运维
purpose: Linux、网络、K8s 与术语图解。
route: Linux、网络、K8s 与术语图解。

## L1 `product` · 产品经理
purpose: 人效、精益、成本与产品判断。有帖再往这里挂。
route: 人效、精益、成本与产品判断。有帖再往这里挂。

## L1 `humanities` · 文史
purpose: 历史、神话、人物与地图。神话地图先占坑；以后史识、人物也可往这里挂。
route: 历史、神话、人物与地图。神话地图先占坑；以后史识、人物也可往这里挂。

## L1 `site-series` · 本站系列
purpose: 园主本站：部署与域名、桌宠、发文流水线等站点自身记录。
route: 本站部署、域名、桌宠、发文流水线。工具手册不要挂这里。
