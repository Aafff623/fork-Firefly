---
title: 分层越清晰，Claude Code 越稳
published: 2026-08-10
updated: 2026-08-10T18:16:00
description: 别把一切塞进一个胖 CLAUDE.md。按主题拆层、按需加载，Claude Code 才稳得住。
image: ./cover.jpg
tags: [Claude Code, 项目结构]
category: Agentic Coding
draft: false
lang: ''
slug: claude-code-project-structure
pinned: false
comment: true
---

分层越清晰，Claude Code 越稳定。

很多人仓库里只有一个胖 `CLAUDE.md`——项目概览、风格、命令、权限、临时私货全往里塞。能跑，但不耐长：上下文越来越重，改一条怕牵一片，团队也难共享。

可维护的做法是把配置拆成多层：会话记忆、MCP、权限设置、按主题 rules、斜杠 commands、按需 skills、角色 agents、事件 hooks。配置多了，别全塞一个文件。

下面这张「CLAUDE CODE 项目结构」信息图把左树右说明一次摊开；文案尽量跟图面走。

## 总览：一张树看完落点

图左是推荐树，图右是八块作用。路径示意（与图一致）：

```text
CLAUDE.md
CLAUDE.local.md
.mcp.json
.claude/
  settings.json
  settings.local.json
  rules/
    code-style.md
    testing.md
    api-conventions.md
  commands/
    review.md
    fix-issue.md
  skills/
    deploy/
      SKILL.md
      deploy-config.md
  agents/
    code-reviewer.md
    security-auditor.md
  hooks/
    validate-bash.sh
```

## CLAUDE.md：会话开箱的项目记忆

路径：仓库根 `CLAUDE.md`，可用 `CLAUDE.local.md` 覆盖。

图面作用：

- 会在会话开始时加载
- 定义项目概览、技术栈和常用命令
- 包含编码约定与架构说明
- 支持通过 `CLAUDE.local.md` 进行覆盖

只放「每次会话都成立」的高信号约定；细则按主题拆进 `rules/`，流程进 `skills/` / `commands/`。

## .mcp.json：MCP 集成怎么挂进仓库

路径：仓库根 `.mcp.json`。

图面作用：

- 存放 MCP 集成配置
- 可连接 GitHub、JIRA、Slack、DBs
- 可通过 git 在团队内共享

这是「连外部」的配置位，不是再往 `CLAUDE.md` 里贴一长串服务说明。和 [MCP / Skills / CLI 怎么分工](/posts/mcp-skills-cli-relationship/) 那篇分工不同：本篇只标落点。

## settings.json：权限、模型与 hooks 开关

路径：`.claude/settings.json`，可用 `.claude/settings.local.json` 覆盖。

图面作用：

- 控制权限与工具访问
- 定义模型选择和 hooks
- 支持 `settings.local.json` 覆盖

团队共享默认权限与模型偏好；本机私货进 `*.local.json`，别把个人密钥和临时放开写进会进 git 的那份。

## rules/：按主题拆的模块化规矩

路径：`.claude/rules/`（图例：`code-style.md`、`testing.md`、`api-conventions.md`）。

图面作用：

- 按主题拆分的模块化 `.md` 文件
- 覆盖风格、测试、API 设计等内容
- 可作用于特定文件或路径

风格、测试、接口约定各自成篇，比堆进一个巨型 `CLAUDE.md` 好改、好 review。

## commands/：可重复的斜杠工作流

路径：`.claude/commands/`（图例：`review.md`、`fix-issue.md`）。

图面作用：

- 自定义斜杠命令（`/project:<name>`）
- 用于可重复执行的工作流
- 支持执行 shell 命令

「每次都要走同一套审查 / 修 issue」→ 写成 command，别口头复读。

## skills/：按需加载，上下文更轻

路径：`.claude/skills/<name>/`（图例：`deploy/SKILL.md`、`deploy-config.md`）。

图面作用：

- 会根据任务上下文自动触发
- 仅在需要时加载
- 保持上下文更轻量

和「每次会话都加载」的 `CLAUDE.md` 对照着看：Skill 是任务触发才进场，不是常驻说明书。

## agents/：带角色、隔离上下文的子代理

路径：`.claude/agents/`（图例：`code-reviewer.md`、`security-auditor.md`）。

图面作用：

- 带有明确角色的专子 agent
- 拥有隔离的上下文窗口
- 可配置自定义工具和模型偏好

审查、安全审计这类「换一副脑子」的活，适合独立 agent，而不是在主会话里口头扮演。

## hooks/：工具前后的事件脚本

路径：`.claude/hooks/`（图例：`validate-bash.sh`）。

图面作用：

- 事件驱动脚本（工具调用前/后）
- 自动执行校验、lint 和格式化
- 阻止不安全操作

必须每次发生的强制门禁 → hooks；可重复但按需触发的流程 → commands / skills。

## 怎么拆：按主题拆、按需加载

选型就一句：**按主题拆文件，按需加载进上下文。**

| 放哪 | 典型信号 |
|---|---|
| `CLAUDE.md` | 每次会话都要成立的事实与禁令 |
| `.mcp.json` | 外部系统连接，可团队共享 |
| `settings*.json` | 权限、模型、hooks 开关 |
| `rules/` | 风格 / 测试 / API 等主题模块 |
| `commands/` | 斜杠可重复工作流 |
| `skills/` | 任务触发才加载的能力包 |
| `agents/` | 角色隔离的子代理 |
| `hooks/` | 工具前后强制校验 |

配置一多，优先拆层，而不是继续加厚那一个 `CLAUDE.md`。

先把树拆开，再谈某一层写多厚——顺序反了，又会回到「一个文件扛所有」。
