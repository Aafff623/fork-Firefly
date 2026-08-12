---
title: OpenCode 路由手册：Luna / Flash / MiniMax 与 Go 额度
published: 2026-08-12
updated: 2026-08-12
description: Luna 做路由验收、Flash 跑纯文本、MiniMax 管媒体；再补 OpenCode Go + DeepSeek V4 Flash 的额度与托管注意点。记忆共享见记忆手册。
image: ./cover.jpg
tags: [OpenCode, DeepSeek, MiniMax, Agent]
themeTags: [Luna, Flash, Go, CC Switch]
category: Agentic Coding
collections: [agentic-coding-core, tool-opencode]
draft: false
lang: ''
slug: opencode-routing-playbook
pinned: false
comment: true
---

本文合并自：[`opencode-luna-deepseek-minimax`](/posts/opencode-luna-deepseek-minimax/)、[`opencode-go-deepseek-v4-flash`](/posts/opencode-go-deepseek-v4-flash/)。Auto Memory 共享见 [`agent-memory-playbook`](/posts/agent-memory-playbook/)。

## 三角色

| 角色 | 干什么 |
|---|---|
| **Luna** | 路由与验收，别让执行模型自己改需求 |
| **Flash** | 纯文本执行，便宜快跑 |
| **MiniMax** | 媒体生成，额度另算 |

靠**委派契约**防失忆：谁可以改计划、谁只能执行，写进规则。

## Go 额度注意

首月优惠常见；经 CC Switch 拐进 Claude Code 时确认真正命中的后端。China-hosted 要显式 opt-in。额度常跨模型共享——画图会吃推理份额。

## 落地清单

1. 路由 / 执行 / 媒体分模型。  
2. 契约写清，禁止执行侧偷偷改 Spec。  
3. 查额度时按「全家桶共享」估算。  
