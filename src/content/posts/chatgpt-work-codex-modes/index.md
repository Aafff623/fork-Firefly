---
title: Chat、Work、Codex：先选模式再选模型
published: 2026-08-12
updated: 2026-08-12
description: ChatGPT 里想清楚、Work 出成品、Codex 改代码——模式选错再强模型也费额度。附 Instant/Sol/Terra/Luna 选用直觉。
image: ./cover.jpg
tags: [Codex, ChatGPT, Agent]
themeTags: [Work, Instant, Sol, Terra, Luna]
category: Agentic Coding
collections: [agentic-coding-core]
draft: false
lang: ''
slug: chatgpt-work-codex-modes
pinned: false
comment: true
---

本文合并自：[`chatgpt-chat-work-codex`](/posts/chatgpt-chat-work-codex/)。Codex 实战细则见 [`codex-practice-playbook`](/posts/codex-practice-playbook/)。

## 先选模式

| 模式 | 适合 | 不适合 |
|---|---|---|
| **Chat** | 想清楚、对比方案、抠需求 | 直接当 IDE |
| **Work** | 要可交付成品（文档/表/轻应用） | 大仓库深度改码 |
| **Codex** | 改代码、PR、测试闭环 | 纯聊概念 |

## 再选模型档

Instant / Sol / Terra / Luna：短平快 → 深推理逐步升。画图与长推理分额度看。中转池细节见 [`transit-relay-playbook`](/posts/transit-relay-playbook/)。

## 落地清单

1. 开口前先报模式。  
2. 模式对了再谈模型。  
3. 改码任务默认 Codex + 验收标准。  
