---
title: pi 默认是个失忆的 agent，我扒了扒它靠什么记住事
published: 2026-08-07
updated: 2026-08-12
description: pi 原生不带长期记忆，关掉会话就失忆。扒了一遍 pi-hermes-memory 扩展的三层架构、policy-only 注入策略、Standing Instructions 和六个后台机制（⚠️ 该扩展已于 2026-08-08 换 pi-observational-memory，本文留作历史参考）。
image: ./cover.png
tags: [Pi, Agent]
themeTags: [pi-hermes-memory, pi-observational-memory, 记忆机制, policy-only, standing-instructions, auto-consolidation, FTS5, 已迁移, extension]
category: Agentic Coding
collections: [tool-pi]
draft: false
lang: ""
slug: pi-agent-memory-mechanism
pinned: false
comment: true
---

> **本文内容已合并至《[Agent 记忆手册：Auto Memory、claude-mem、八策略与跨工具共享](/posts/agent-memory-playbook/)》。**  
> 下面只保留摘要，完整对照与选型请看核心长文。原配置碎片与配图仍可在本页历史版本 / 资源目录中查阅。

pi 原生不带长期记忆，关掉会话就失忆。扒了一遍 pi-hermes-memory 扩展的三层架构、policy-only 注入策略、Standing Instructions 和六个后台机制（⚠️ 该扩展已于 2026-08-08 换 pi-observational-memory，本文留作历史参考）。

合并后的核心文：[《Agent 记忆手册：Auto Memory、claude-mem、八策略与跨工具共享》](/posts/agent-memory-playbook/)
