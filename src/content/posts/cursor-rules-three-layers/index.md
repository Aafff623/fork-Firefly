---
title: Cursor 规则别瞎塞：三层各管各的
published: 2026-08-11
description: User Rules / Project Rules / AGENTS.md 分家：个人偏好进本机，项目约定进仓库，跨工具说明书落 AGENTS.md。
image: ./cover.jpg
tags: [Cursor, Rules, AGENTS.md, mdc, 工作流]
category: 指南
draft: false
lang: ''
slug: cursor-rules-three-layers
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/2501_90900354/article/details/162235212
---

新开 Chat，模型不记得上次你吼过什么。项目背景、编码习惯、业务红线，不写进「规则层」，就只能每轮复读。Cursor 把这件事拆成三层，搞混了就会污染上下文。

## 三层各管什么

| 层 | 放哪 | 谁看得见 | 适合写什么 |
|---|---|---|---|
| User Rules | Cursor 设置（本机/账号） | 只有你 | 中文回复、别乱 commit、个人节奏 |
| Project Rules | `.cursor/rules/*.mdc` | 进 Git 的团队 | 技术栈、按文件类型的规范 |
| AGENTS.md | 仓库根或子目录 | 团队 + 多工具 | 项目说明书、跨 Cursor/CC/Codex 共用 |

核心分家：**项目相关进仓库，个人偏好进 User Rules。** 把「本项目用 Vue 3」塞进 User Rules，换仓库也会跟着污染，还没法共享。

## `.mdc` 的四种挂载方式

单条建议压在 50 行内，一个主题一个文件。

| 模式 | 怎么配 | 什么时候进上下文 |
|---|---|---|
| Always | `alwaysApply: true` | 每次 Agent 对话 |
| Intelligent | 有 `description`，无 globs | Agent 自己判断相关再挂 |
| Globs | `globs: **/*.vue` | 改到/引用到匹配文件 |
| Manual | 无 description、无 globs | 聊天里 `@规则名` |

需要「只在改某类文件时生效」就上 globs；需要跨工具就别指望 `.mdc`，那是 Cursor 专用。

## AGENTS.md 和 Memories 别混

`AGENTS.md` 是纯 Markdown，靠目录位置划范围：根目录≈全仓，`frontend/AGENTS.md` 只在该子树工作。Cursor 会在 Agent 开聊时自动注入，不是等你 `@` 再 Read。

Memories（「记住：本项目用 Vue」）可控性弱、难版本管理。项目背景和硬规范优先写 `.mdc` / `AGENTS.md`。

冲突时官方大致是：Team Rules → Project Rules / AGENTS.md → User Rules。个人全局挡不住项目约定。

## 多数团队怎么组合

```text
project/
├── AGENTS.md                 # 跨工具：背景、怎么跑、架构
└── .cursor/rules/
    ├── vue-patterns.mdc      # Cursor：Vue 文件规范
    └── api-conventions.mdc   # Cursor：API 约定
```

User Rules 只留「对我自己有用」的几条。规则越长越多时，拆 `.mdc`；要给 Claude Code / Copilot 一起吃，优先把说明书落在 `AGENTS.md`。

## 选型就看这张表

| 你想解决什么 | 用什么 |
|---|---|
| 个人沟通风格 | User Rules |
| 项目背景 + 按文件精细控制 | `.cursor/rules/*.mdc` |
| 简单说明 + 跨工具 | `AGENTS.md` |
| 都要 | 三者组合，别把项目背景塞进 User Rules |

## 相关阅读

- [CLAUDE.md 和 AGENTS.md：写给人的 README，不够](/posts/claude-md-agents-md-guide/)
- [Cursor Skills：路径放错等于没装](/posts/cursor-skills-install-paths/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/2501_90900354/article/details/162235212)
