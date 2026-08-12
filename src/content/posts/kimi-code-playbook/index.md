---
title: Kimi Code 手册：Hook 闸门与工具死循环
published: 2026-08-12
updated: 2026-08-12
description: PreToolUse 验证怎么写稳，以及 max_steps / 禁相同重试如何掐断工具死循环。99 元 workbench 展示文不并入。
image: ./cover.jpg
tags: [Kimi, Agent, Hooks, CLI]
themeTags: [PreToolUse, loop_control, config.toml, Ralph]
category: Agentic Coding
collections: [agentic-coding-core, tool-kimi-code]
draft: false
lang: ''
slug: kimi-code-playbook
pinned: false
comment: true
---

本文合并自：[`kimi-code-hook-verify`](/posts/kimi-code-hook-verify/)、[`kimi-cli-tool-loop`](/posts/kimi-cli-tool-loop/)。跨宿主迁移草稿未出箱，暂不并。

## Hook：入口闸

PreToolUse：`matcher` 写清（如 `^Read$`）。Windows 路径禁 `~`。验证分三层：配置加载 → 单测 → 实弹。可加 `loop_control` 与重试策略配合。

## 死循环：重试闸

现象：Read 同参连环 failed；换宿主同模型也可能复现——模型不记失败 + loop 过松。

`~/.kimi-code/config.toml` 建议收紧：

- `max_steps_per_turn`：30–60（默认可到 ~1000）  
- `max_retries_per_step`：1–2  
- 关掉过松的 Ralph 类自动续跑  

提示词加硬规则：「失败即停 / Do not retry identical failed tool calls」。先 `ls` 再 `Read`；连环 failed 立刻 Esc；主动 `/compact`。

## 落地清单

1. Hook 先验通，再谈自动。  
2. 死循环先收配置，再改提示词。  
3. 工具过载时减挂载，别加模型。  
