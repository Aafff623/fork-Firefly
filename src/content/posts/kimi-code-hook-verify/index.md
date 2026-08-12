---
title: Kimi Code 的 hook 装好不算完，怎么证明它真在拦？
published: 2026-08-07
updated: 2026-08-12
description: Kimi Code 的 PreToolUse hook 装好不代表真在拦。记一套三层验证法（配置层/单测层/实弹层），顺带修掉 matcher 不锚定、Windows 下 ~ 路径哑火两个配置坑，以及博客卡片边框颜色公式漂移。
image: ./cover.jpg
tags: [Kimi, Agent, Hooks, CLI]
themeTags: [kimi-code, pretooluse-hook, hook验证, 边框漂移, loop-control, 防护验证]
category: Agentic Coding
collections: [tool-kimi-code]
draft: false
lang: ""
slug: kimi-code-hook-verify
pinned: false
comment: true
---

> **本文内容已合并至《[Kimi Code 手册：Hook 闸门与工具死循环](/posts/kimi-code-playbook/)》。**  
> 下面只保留摘要；完整对照请看核心文。

Kimi Code 的 PreToolUse hook 装好不代表真在拦。记一套三层验证法（配置层/单测层/实弹层），顺带修掉 matcher 不锚定、Windows 下 ~ 路径哑火两个配置坑，以及博客卡片边框颜色公式漂移。

核心文：[《Kimi Code 手册：Hook 闸门与工具死循环》](/posts/kimi-code-playbook/)
