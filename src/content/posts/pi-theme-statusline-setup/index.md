---
title: pi 的脸也是能整的：主题挑一个，状态栏挑一个，别贪
published: 2026-08-06
updated: 2026-08-12
description: pi 默认那张脸能用但想换。美化分两类：主题是 JSON 颜色方案，多装互不影响；状态栏是 TS 扩展，抢 footer 渲染权只能装一个。记录 Catppuccin + pi-inline-statusline 的最稳组合，以及两个真坑：glm 系列不支持 thinking、enabledModels 会反噬默认模型。
image: ./cover.jpg
tags: [Pi, 美化]
themeTags: [pi-coding-agent, Catppuccin, pi-inline-statusline, theme, statusline, enabledModels, GLM-5.2, 美化配置]
category: Agentic Coding
collections: [tool-pi]
draft: false
slug: pi-theme-statusline-setup
pinned: false
comment: true
---

> **本文内容已合并至《[终端 statusLine 对照：HUD、ccstatusline、原生脚本、会话标题与 Pi](/posts/agent-statusline-compare/)》。**  
> 下面只保留摘要，完整对照与选型请看核心长文。原配置碎片与配图仍可在本页历史版本 / 资源目录中查阅。

pi 默认那张脸能用但想换。美化分两类：主题是 JSON 颜色方案，多装互不影响；状态栏是 TS 扩展，抢 footer 渲染权只能装一个。记录 Catppuccin + pi-inline-statusline 的最稳组合，以及两个真坑：glm 系列不支持 thinking、enabledModels 会反噬默认模型。

合并后的核心文：[《终端 statusLine 对照：HUD、ccstatusline、原生脚本、会话标题与 Pi》](/posts/agent-statusline-compare/)
