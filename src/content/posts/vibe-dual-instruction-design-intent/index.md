---
title: AI 听不懂你，多半是饲料喂错了
published: 2026-08-11
description: 别只靠口头 Prompt：源文件当知识底座、代码绘图优先、双重指令同时喂人和喂 AI。
image: ./cover.jpg
tags: [Vibe Coding, 上下文, Mermaid, Sphinx, 设计意图]
category: 指南
draft: true
lang: ''
slug: vibe-dual-instruction-design-intent
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/jxm_csdn/article/details/156755978
---

「Vibe Coding」落到复杂项目，瓶颈很少是模型智商，更多是上下文质量。这篇 CSDN 文把问题拆成三层：数据源、视觉语言、文档工程。核心判断很硬：**别再只靠口头 Prompt，改去搭一条「设计意图 → 代码」的语义链路**。

## 喂源文件，别喂渲染后的 HTML

公司文档常托管成 Sphinx/HTML。对 AI 来说那是低信噪比垃圾餐：导航壳、脚本标签吃 Token，长文分页还切断章节链路。

实操优先级：

1. 本地 clone 文档库，`.rst` / `.md` 直接进 Workspace  
2. 内网文档用 MCP 读 GitLab **Raw File**（保纯净，也更好过安全审计）  
3. 别靠爬网页当知识库

源文件才是 AI 的母语：结构完整、标记干净。

## 图给 AI 看：代码绘图 > 截图

原则：**代码 > 图片**。

| 场景 | 优先 | 别指望 |
|---|---|---|
| 依赖树 / 拓扑 | Graphviz DOT | 纯 PNG / Drawio 截图 |
| 业务流程 | Mermaid | 「你看这张图……」口头描述 |
| UI 草图 | HTML + Tailwind 伪代码 | 只丢 Figma 截图（除非你真上传且模型能看图） |

HTML/Tailwind 伪代码的优势是同构：AI 训练里见过海量同类结构，间距、圆角、对齐可以无损落到 React/Vue，少一层「猜设计」。

## 「双重指令」：给人渲染，也给 AI 原文

Sphinx 场景里经典矛盾：

- 人要看渲染效果 → `raw:: html`  
- AI 要读源码文本 → `literalinclude`

只写 `raw`，再在聊天里说「请去读某某文件」，作者管这叫「反 Vibe」：逼模型从理解模式切到搜索模式，阅读流断了。

解法：两段叠在一起。人类页面走 `raw`；同一份 HTML 再用 `literalinclude` 展开进上下文，Cursor / Claude Code 扫文档时即读即懂。Graphviz 的 `.. graphviz::` 本身就具备「能渲染 + 文本可读」双重属性。

样式坑：Sphinx 主题往往不带 Tailwind。草图可用「Tailwind 类名（给 AI）+ 内联 style（给人预览）」混写，两边都不瞎。

## 认清上限在哪

Vibe 的上限，不在「你会不会说话」，在「你会不会搭上下文」。

RST/MD 当知识底座，Mermaid/PlantUML/Graphviz 当逻辑语言，双重指令消掉「文档给人 vs 给 AI」的裂缝。文档、草图、代码一旦同构，工具才像合伙人，而不只是补全器。

## 相关阅读

- [三天搭完 TaskFlow，真正卡人的不是 Prompt](/posts/vibe-web-taskflow-pitfalls/)
- [还在「会聊天」阶段，就别指望 Vibe 封神](/posts/vibe-chat-to-workflow-system/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/jxm_csdn/article/details/156755978)
