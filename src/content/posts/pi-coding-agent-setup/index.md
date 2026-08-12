---
title: pi coding agent 开荒：原生没长的器官，extension 一件件补
published: 2026-08-06
updated: 2026-08-12
description: pi coding agent 走"极简内核 + 扩展补齐"路线：官方明言不带 MCP / 子 agent / plan 模式，靠 pi-mcp-adapter、pi-subagents + 记忆扩展一件件补。记录 GLM-5.2 纯文本的视觉回退、LANG 非交互 bash 的坑，以及后来补的 dynamic-workflows 编排层与本地扩展工具（持续维护）。
image: ./cover.jpg
tags: [Pi, Agent, GLM]
themeTags: [pi-coding-agent, GLM-5.2, pi-mcp-adapter, pi-subagents, pi-observational-memory, pi-dynamic-workflows, 视觉回退, LANG, 持续维护]
category: Agentic Coding
collections: [tool-pi]
draft: false
lang: ""
slug: pi-coding-agent-setup
pinned: false
comment: true
---

> **本文内容已合并至《[Pi Coding Agent 手册：极简内核、扩展补齐与 GLM 死循环](/posts/pi-coding-agent-playbook/)》。**  
> 下面只保留摘要；完整对照请看核心文。

pi coding agent 走"极简内核 + 扩展补齐"路线：官方明言不带 MCP / 子 agent / plan 模式，靠 pi-mcp-adapter、pi-subagents + 记忆扩展一件件补。记录 GLM-5.2 纯文本的视觉回退、LANG 非交互 bash 的坑，以及后来补的 dynamic-workflows 编排层与本地扩展工具（持续维护）。

核心文：[《Pi Coding Agent 手册：极简内核、扩展补齐与 GLM 死循环》](/posts/pi-coding-agent-playbook/)
