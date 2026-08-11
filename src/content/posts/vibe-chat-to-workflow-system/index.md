---
title: 还在「会聊天」阶段，就别指望 Vibe 封神
published: 2026-08-11
description: 把 Claude Code 从会写代码的聊天框，升级成 CLAUDE.md → Skills → Subagents → Hooks → MCP → Plugins 的工程梯子。
image: ./cover.jpg
tags: [Vibe Coding, CLAUDE.md, Skills, Subagents, 工作流]
category: Agentic Coding
draft: false
lang: ''
slug: vibe-chat-to-workflow-system
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/yangshangwei/article/details/158319117
---

很多人用 Claude Code 的体感是：能懂仓库、能改多文件、能跑命令，比补全像同事。但「还行」到「封神」的差距，通常不在模型，而在有没有把聊天框做成**可复用的工程工作流系统**。

这篇的贡献是一张升级地图，不是又一份安装教程。

## 扩展层怎么对齐传统工程平台

官方叫 extension layer。按职责叠起来，几乎就是平台思维换皮：

| 层 | 组件 | 干啥 |
|---|---|---|
| 规范 | CLAUDE.md | 每次会话加载的项目宪法 |
| 流程 | Skills（含 slash commands） | 按需加载的可调用工作流 |
| 角色 | Subagents | 隔离上下文、并行专项 |
| 自动化 | Hooks | 事件前后跑确定性脚本 |
| 集成 | MCP | 接 Jira / Drive / 内网工具 |
| 分发 | Plugins / marketplace | 团队一键安装 |

对应关系：policy → workflow → agent → automation → integration → distribution。Vibe 想规模化，走的是这条梯子，不是把 Prompt 写得更花。

## CLAUDE.md：不是 README，是会话入口系统提示

删行判断标准好用：

> 删掉这一行，Claude 会不会更容易犯错？不会就删。

适合写：代码推不出来的团队约定、必须跑的检查、分支/部署策略、非显然坑点（某测试要本地 Redis 等）。`/init` 只当起点，必须人工去噪。分层：`~/.claude/` 全局、仓库根、monorepo 父目录、`@import` 拆详细文档、`CLAUDE.local.md` 放不进仓的私有偏好。

**写规则 + 命令 + 坑点，别写教程。** 教程放 docs，用引用挂上。

## Skills：把重复劳动产品化

slash commands 已并入 Skills：`.claude/commands/review.md` 与 `.claude/skills/review/SKILL.md` 都能出 `/review`。个人技能放 `~/.claude/skills/`，团队共享进仓库 `.claude/skills/`。

高 ROI 起步建议：`/review-pr`、`/deploy-staging`、`/write-tests`。文中 `/review-pr` 形态值得抄：`SKILL.md`（步骤）+ `checklist.md`（勾选项），输出直接可贴 PR 描述。经验型活动变成流程型产物，新人少漏项。

## Subagents / Hooks / MCP：别一上来全开

- **Subagent**：主会话会被「读海量文件 + 多轮推理」撑爆时再用；安全审查、性能追踪、文档生成最典型。角色 + 输出结构写死，比「帮我看看有没有安全问题」稳。  
- **Hooks**：必须发生的动作（格式化、lint、关键用例）用脚本钉死；会话启动喂上下文仍用 CLAUDE.md，别混。  
- **MCP**：接真实世界系统时再上，上限更高，也更贵、更要权限治理。

## 按这个顺序上，别一次全开

1. 一天内落 CLAUDE.md（命令 / 硬约束 / 坑点）  
2. 一周做 2～3 个最高 ROI Skills  
3. 上安全 / 性能 / 文档类 Subagents  
4. Hooks 把「必须发生」变确定性  
5. 需要接外部系统再上 MCP  
6. 插件化分发，新人安装即得  

规则当代码养：PR、review、版本化。发现 AI 反复问已写明的事，说明规则不清或被淹没，定期瘦身。

## 相关阅读

- [CLAUDE.md 和 AGENTS.md：写给人的 README，不够](/posts/claude-md-agents-md-guide/)
- [MCP、Skills、Plugin 不是三选一](/posts/mcp-skills-plugin-boundaries/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/yangshangwei/article/details/158319117)
