---
title: GLM-5.2 在 Pi 里 thinking 死循环，问题不在模型，在 provider 配错了
published: 2026-08-06
updated: 2026-08-12
description: Pi 接智谱 GLM-5.2 时 thinking 阶段反复重复 50+ 次、工具调用卡死。根因不是模型不支持 thinking，而是自定义 provider 走了 Anthropic 兼容端点，丢了 GLM 的 Preserved Thinking 协议。换内置 zai-coding-cn 一行配置解决。
image: ./cover.jpg
tags: [Pi, Agent, GLM]
category: Agentic Coding
collections: [tool-pi]
draft: false
lang: ''
slug: pi-glm-thinking-loop-fix
pinned: false
comment: true
---

> **本文内容已合并至《[Pi Coding Agent 手册：极简内核、扩展补齐与 GLM 死循环](/posts/pi-coding-agent-playbook/)》。**  
> 下面只保留摘要；完整对照请看核心文。

Pi 接智谱 GLM-5.2 时 thinking 阶段反复重复 50+ 次、工具调用卡死。根因不是模型不支持 thinking，而是自定义 provider 走了 Anthropic 兼容端点，丢了 GLM 的 Preserved Thinking 协议。换内置 zai-coding-cn 一行配置解决。

核心文：[《Pi Coding Agent 手册：极简内核、扩展补齐与 GLM 死循环》](/posts/pi-coding-agent-playbook/)
