---
title: 对话即代码：Vibe 入门坐标
published: 2026-08-04
updated: 2026-08-11T11:20:00
description: Vibe 00–02 基础必读 + 60/90 薄入口：概念、首作、路线图与 FAQ 的索引摘要，链回鱼皮 AI 导航 / GitHub。
tags: [Vibe Coding, 教程索引, 鱼皮, ai-guide]
themeTags: [索引摘要, 鱼皮, ai-guide]
category: Agentic Coding
collections: [vibe-tutorial-index]
draft: false
lang: ""
slug: vibe-basics-index
pinned: false
comment: true
author: threetwoa
sourceLink: https://ai.codefather.cn/vibe
image: ./cover.jpg
---

鱼皮那套 Vibe Coding 教程很长，全搬进博客没意义。这篇只覆盖**基础必读**（00 / 01 / 02）和同级薄入口（60 资源大全、90 常见问题）：按他的目录立标题、每章给能带走的摘要、原文挂回 AI 导航 / 开源仓。细节去原文；这里当索引和导航。

[系列总览 · 鱼皮 AI 导航](https://ai.codefather.cn/vibe) · [GitHub · liyupi/ai-guide](https://github.com/liyupi/ai-guide)

## 怎么读这篇

| 你想 | 建议 |
|---|---|
| 第一次碰 Vibe Coding | 00 → 01，当天做出第一个网页 |
| 想规划学习路径 | 02 六阶段路线图，对照自己缺哪块 |
| 找工具 / 模板 / 资讯 | 60 鱼皮 AI 导航导读 |
| 卡在某个具体问题 | 90 FAQ 速查，没有再社区问 |

摘要基于公开正文提炼，不是逐字搬运。配图为章节小长条信息图，点击可进原文；操作步骤以原文为准。

## 00 Vibe Coding 简介

Vibe Coding = 用人话和 AI 聊天写代码：你负责「要做什么」，AI 负责「怎么做」，多轮迭代。和传统编程比，核心从背语法变成讲需求；几天能上手，但大项目仍有 UI 同质化、代码不可控等坑。三个常见误解：不是作弊、不会不学、不只玩具。

[![00 原文](./images/cite-00-concept.jpg)](https://ai.codefather.cn/library/2010974735415316482)

[原文 · 00 Vibe Coding 简介](https://ai.codefather.cn/library/2010974735415316482) · [GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/00%20Vibe%20Coding%20%E7%AE%80%E4%BB%8B.md)

## 01 快速上手 Vibe Coding

10 分钟做出待办类网页并 Publish 上线。准备浏览器 + Bolt.new（国内可换 NoCode / 秒哒）+ GitHub；写清功能/界面需求 → 多轮微调 → 测功能 → 一键发布。对话要点：需求具体、一次别改太多、bug 描述现象。跑通后再进工具/实战板块。

[![01 原文](./images/cite-01-ship.jpg)](https://ai.codefather.cn/library/2010974736249982977)

[原文 · 01 快速上手](https://ai.codefather.cn/library/2010974736249982977) · [GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/01%20%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B%20Vibe%20Coding.md)

## 02 AI 编程学习路线

六阶段地图：入门（概念 + 零代码出作品）→ 工具（Cursor / Codex / Claude Code）→ 核心技能（需求、提示词、上下文、Git、部署）→ 实战（小工具 → 全栈 → AI 应用）→ 进阶（失败模式、成本、变现）→ 持续学习。小工具够用前两段；系统掌握约 2～3 个月。

[![02 原文](./images/cite-02-roadmap.jpg)](https://ai.codefather.cn/library/2062514924696948738)

[原文 · 02 学习路线](https://ai.codefather.cn/library/2062514924696948738) · [GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/02%20AI%20%E7%BC%96%E7%A8%8B%E5%AD%A6%E4%B9%A0%E8%B7%AF%E7%BA%BF.md)

## 60 Vibe Coding 资源大全

鱼皮 AI 导航（ai.codefather.cn）导读：上千 AI 工具、Vibe/OpenClaw 教程库、提示词模板、MCP+Skills、热点资讯、交流社区。找资源的一站式入口；资源再多也要动手做。

[![60 原文](./images/cite-60-resources.jpg)](https://ai.codefather.cn/library/2010974737051095041)

[原文 · 60 资源大全](https://ai.codefather.cn/library/2010974737051095041) · [GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/60%20Vibe%20Coding%20%E8%B5%84%E6%BA%90%E5%A4%A7%E5%85%A8.md)

## 90 Vibe Coding 常见问题和解决

FAQ 速查：概念（和传统编程区别、幻觉、MVP）→ 工具选型（Cursor、模型、Bolt vs v0、免费够不够）→ 使用技巧（报错、技术栈跑偏、死循环）→ 部署/成本/安全。卡住先搜本章。

[![90 原文](./images/cite-90-faq.jpg)](https://ai.codefather.cn/library/2010974738795925506)

[原文 · 90 常见问题](https://ai.codefather.cn/library/2010974738795925506) · [GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/90%20Vibe%20Coding%20%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E5%92%8C%E8%A7%A3%E5%86%B3.md)

## 出处与边界

| 项 | 说明 |
|---|---|
| 原作 | 程序员鱼皮 · [ai-guide](https://github.com/liyupi/ai-guide) · [AI 导航 /vibe](https://ai.codefather.cn/vibe) |
| 本篇 | 基础必读 + 60/90 薄入口；索引 + 精炼摘要 |
| 未做 | 不镜像全文、不搬运图床整包；70 概念与热文见 [概念与热文](/posts/vibe-concepts-hotposts-index/)，不在此重复 |
| 相关阅读 | [工具栈三岔](/posts/vibe-coding-tools-index/) · [项目实战](/posts/vibe-projects-index/) · [模型横评](/posts/vibe-models-index/) · [对话与回路](/posts/vibe-coding-tips-index/) · [编程学习](/posts/vibe-learning-index/) · [产品变现](/posts/vibe-monetize-index/) · [概念与热文](/posts/vibe-concepts-hotposts-index/) · [MCP 薄笔记](/posts/vibe-mcp-index/) · [OpenClaw 索引](/posts/openclaw-tutorial-index/) · [合集 鱼皮VibeCoding](/collections/vibe-tutorial-index/) |
