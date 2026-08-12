---
title: 工具失败还在原参数重试：掐断 Kimi 死循环
published: 2026-08-04
updated: 2026-08-12
description: 截图验证里 Read 连环 failed，多半不是宿主坑：模型不记失败，默认循环上限又太松。收紧 loop_control，提示词写清失败即停。
image: ./cover.jpg
tags: [Kimi, Agent, Hooks, CLI]
themeTags: [循环控制, 截图验证, 失败即停]
category: Agentic Coding
collections: [tool-kimi-code]
draft: false
lang: ""
slug: kimi-cli-tool-loop
pinned: false
comment: true
author: threetwoa
---

> **本文内容已合并至《[Kimi Code 手册：Hook 闸门与工具死循环](/posts/kimi-code-playbook/)》。**  
> 下面只保留摘要；完整对照请看核心文。

截图验证里 Read 连环 failed，多半不是宿主坑：模型不记失败，默认循环上限又太松。收紧 loop_control，提示词写清失败即停。

核心文：[《Kimi Code 手册：Hook 闸门与工具死循环》](/posts/kimi-code-playbook/)
