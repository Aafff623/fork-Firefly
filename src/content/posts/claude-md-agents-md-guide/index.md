---
title: CLAUDE.md 和 AGENTS.md：写给人的 README，不够
published: 2026-08-11
description: AI 要的是命令、红线与坑点。CLAUDE.md 吃 Claude Code；多工具混用优先 AGENTS.md，写薄再补。
image: ./cover.jpg
tags: [CLAUDE.md, AGENTS.md, Agent 工程, 规范]
category: Agentic Coding
draft: false
lang: ''
slug: claude-md-agents-md-guide
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/a18792721831/article/details/156729996
---

`README.md` 给人装环境看；AI 要的是「怎么构建、怎么测、踩过哪些坑、绝不能碰什么」。缺这份说明书，就会反复犯同样的风格错误，团队每人一套结果。

## 两个文件怎么站位

| 文件 | 定位 | 谁吃 |
|---|---|---|
| `CLAUDE.md` | Claude Code 专属记忆，启动自动加载 | Claude Code |
| `AGENTS.md` | 开放标准，跨工具项目说明 | Cursor / Codex / Copilot / Gemini CLI 等 |

只吃 Claude Code → 维护 `CLAUDE.md` 就够。多工具混用 → 优先 `AGENTS.md`，或两份共存、内容按工具微调。

## CLAUDE.md 的层级（从近到远）

1. 当前目录 `CLAUDE.local.md`（私有，勿提交）
2. 当前目录 `CLAUDE.md`（项目共享）
3. 父目录 `CLAUDE.md`（Monorepo 继承）
4. `~/.claude/CLAUDE.md`（全局）

在 `packages/frontend/` 干活时，会叠读子包 + 根目录配置。团队约定进 `CLAUDE.md`，个人偏好进 `CLAUDE.local.md`。

## 该写什么（两边差不多）

少写宣传稿，多写「命令 + 红线」：

- 常用命令：dev / build / test / lint / typecheck / db
- 代码风格与命名（ESM vs CJS、PascalCase 组件等）
- 目录地图与关键入口文件
- Git / PR 约定
- 环境变量前缀、禁止硬编码、统一走哪层封装
- 高频 FAQ（装依赖、连库失败之类）

语气可以硬一点：`IMPORTANT` / `YOU MUST` / `NEVER` 对关键红线有效。Claude Code 对话里按 `#` 能把当轮结论追加进 `CLAUDE.md`；`/init` 能生成骨架，但别指望骨架够用。

## AGENTS.md 的就近原则

聊天里的直接指令 > 离当前编辑文件最近的 `AGENTS.md` > 根目录 `AGENTS.md`。Monorepo 按 `web` / `api` / `shared` 各放一份，比堆一个巨型根文件干净。

和 `CLAUDE.md` 比：内容都是自由 Markdown；差别主要在工具覆盖面和优先级细节（CC 有 local 覆盖与全局档）。

## 写薄还是写厚

别一次灌满。像调 Prompt：先放命令和三条红线，跑几轮再补架构说明。配置越长，越容易互相打架、越吃上下文。能拆子目录就拆。

## 相关阅读

- [Cursor 规则别瞎塞：三层各管各的](/posts/cursor-rules-three-layers/)
- [还在「会聊天」阶段，就别指望 Vibe 封神](/posts/vibe-chat-to-workflow-system/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/a18792721831/article/details/156729996)
