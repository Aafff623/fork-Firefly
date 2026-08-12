---
title: Pi Coding Agent 手册：极简内核、扩展补齐与 GLM 死循环
published: 2026-08-12
updated: 2026-08-12
description: Pi 官方故意不带全家桶。怎么用 extension 补器官、Windows 编码坑、以及 GLM thinking 死循环的 provider 错配，一篇收齐。记忆机制见已合并的记忆手册。
image: ./cover.jpg
tags: [Pi, Agent, GLM, AI Coding]
themeTags: [extension, zai, thinkingFormat, observational-memory]
category: Agentic Coding
collections: [agentic-coding-core, tool-pi]
draft: false
lang: ''
slug: pi-coding-agent-playbook
pinned: false
comment: true
---

本文合并自：[`pi-coding-agent-setup`](/posts/pi-coding-agent-setup/)、[`pi-glm-thinking-loop-fix`](/posts/pi-glm-thinking-loop-fix/)。长期记忆见 [`agent-memory-playbook`](/posts/agent-memory-playbook/)；statusLine 见 [`agent-statusline-compare`](/posts/agent-statusline-compare/)。

## 定位

Pi = 极简内核。官方故意不带 MCP / 子 agent / plan / todo / 后台 bash——用 `pi install npm:…` 按需补：adapter → subagents → memory。配置在 `~/.pi/agent/settings.json`。

## 常见坑

- **非交互 bash 不读 `.bashrc`**：Windows 用 `setx LANG` / `PYTHONUTF8` 固化  
- Pi **不解析** `${KEY}` 环境变量插值  
- MCP 名称撞 command + url 会怪  
- 看图：GLM-5.2 纯文本；多媒体靠其它模型回退  

记忆扩展：handoff + observational-memory（hermes 记忆已换代，别再装旧包）。

## GLM thinking 死循环

根因经常是 **provider 错配**：Anthropic 兼容端点丢掉 `reasoning_content`。GLM Preserved Thinking 要 `thinkingFormat: "zai"`，默认 provider 指到 `zai-coding-cn` 一类正确端点。Goose / OpenClaw 等同坑。

## 落地清单

1. 先接受「内核瘦」，再列 extension 清单。  
2. thinking 死循环先查 provider，别先骂模型。  
3. 主题/状态栏互斥规则见 statusLine 对照文。  
