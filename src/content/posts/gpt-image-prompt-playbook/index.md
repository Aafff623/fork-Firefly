---
title: GPT Image 提示词手册：槽位、风格合同与 UI 分层
published: 2026-08-12
updated: 2026-08-12
description: 合并提示词包、旅行海报槽位、古风六式、宋韵校园工作流与 UI 分层切图要点——先锁布局与身份，再谈好看。
image: ./cover.jpg
tags: [GPT Image, 提示词, Agent]
themeTags: [LAYOUT_LOCK, 风格合同, 分层 PNG, 槽位]
category: 指南
collections: [agentic-coding-core]
draft: false
lang: ''
slug: gpt-image-prompt-playbook
pinned: false
comment: true
---

本文合并自：[`gpt-image2-prompt-pack`](/posts/gpt-image2-prompt-pack/)、[`gpt-cartoon-travel-poster-prompt`](/posts/gpt-cartoon-travel-poster-prompt/)、[`ancient-women-costume-six-styles`](/posts/ancient-women-costume-six-styles/)、[`song-era-campus-gpt-image2-workflow`](/posts/song-era-campus-gpt-image2-workflow/)、[`gpt-image2-ui-layer-slice`](/posts/gpt-image2-ui-layer-slice/)。

## 通用规矩

- 用**槽位**改项，别整段重写散文 prompt  
- **LAYOUT_LOCK**：先正交总平面 / 构图骨架  
- **风格合同**：写清排除项（如禁明清/日式串味）  
- 人物身份锁死：发型/服/配色/场景五维，禁笼统「古装长发」  
- 旅行海报：五槽 + 调色板；扁平矢量 4:5；禁「电影感」冲约束  

## UI 分层

流程：prompt → screen → refine → layers。一次只改一点。中文可读性要验；导出分层 PNG 便于二次编辑。Image2 出的是图，不是 mesh——3D 交互另走参数化管线（见源帖 sketch 篇导流）。

## 落地清单

1. 先合同后出图。  
2. 槽位化，可回归。  
3. UI 图与 3D/版式图鉴分文维护。  
