---
title: 8 月 10 日这期早报：OpenRouter 上 GLM 5.2 被打到地板价
published: 2026-08-10
updated: 2026-08-13T10:58:00
description: 选题来自橘鸦 8 月 10 日早报。OpenRouter 上部分供应商把 GLM 5.2 打到很低，没写窗口。Boris 说提示词注入在 Claude 侧已基本压住，别当成你可以关防护。
image: ./cover.jpg
tags: [早报, GLM, OpenRouter, Claude Code]
category: 早报
collections: [ai-morning-brief]
draft: false
lang: ''
slug: ai-morning-brief-2026-08-10
pinned: false
comment: true
---

本期选题来自[橘鸦早报 2026-08-10](https://daily.juya.uk/issues/2026-08-10/)（[RSS](https://daily.juya.uk/rss.xml)，文字版 [daily.juya.uk](https://daily.juya.uk/)）。目录当探索方向，正文不搬。下面每条是原题、原始出处、我自己的判断。B 站 / YouTube 只当片单，口播不上站。

视频版：[哔哩哔哩](https://www.bilibili.com/video/BV1UPuX6XEVi) ｜ [YouTube](https://www.youtube.com/watch?v=MNXFaFBsm3k)。

那天橘鸦只出了 4 条。人事传闻和算力园区丢掉。剩下 2 条都跟明天的模型和账单有关。

## OpenRouter 上的 GLM 5.2，有人在地板价出

这不是智谱官方 Coding Plan 改价。渠道折扣说没就没，别截一张图当月预算。

原题：[OpenRouter 上 GLM 5.2 模型出现大幅折扣定价](https://openrouter.ai/z-ai/glm-5.2)。模型页上，部分供应商把 GLM 5.2 打到很低。原因和截止日期都没写。同一页上 Fireworks 国际刊例仍是大约 $1.40 / $4.40，和 Cursor Other Models 那档对得上；更低的是别的供应商在抢量。

对账仍看 [比价那篇](/posts/aug-coding-model-discounts-2026-08/) 里的国际刊例和 Cursor Other Models。真要走 OpenRouter，打开供应商列表看当时价，锁死供应商，不要把「今天看到的地板价」写进下个月的测算。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-10/)。

![OpenRouter 上 GLM 5.2 模型页 OG](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-10/openrouter-glm52-og.jpg)

*图：OpenRouter `z-ai/glm-5.2` 模型页 Open Graph。来源：[openrouter.ai/z-ai/glm-5.2](https://openrouter.ai/z-ai/glm-5.2)（2026-08-13 抓取）。版权归 OpenRouter / Z.AI。*

## Boris 说提示词注入基本压住了，别关自己的防护

「基本解决」是他们线上模型的自我评估，不是你仓库可以关掉人工确认。

原题：[Claude Code 主创称通过多层防御 Claude 已基本解决提示词注入威胁](https://x.com/bcherny/status/2086520950259118464)。Boris Cherny 说 Anthropic 用模型训练、输入探测器、意图分类器叠起来，未见过的注入攻击成功率能压到接近零。他也建议：读不信任来源时，用拿不到 ssh 密码这类凭证的 subagent。

auto mode 默认（见 [8 月 8 日那期](/posts/ai-morning-brief-2026-08-08/)）反而更依赖这层分类器。官方那张评测图里，Claude 各档开 auto mode 对 720 次未见过的注入是零成功；同一套题打 Codex 的 Auto-review 大约 5.83%。这是他们雇的第三方评测，不是你关确认之后的安全证明。凭证还是别让主会话摸到。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-10/)。

![Anthropic 提示词注入评测图](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-10/claude-prompt-injection-chart.jpg)

*图：auto mode 开启时，官方展示的注入攻击成功率对比。来源：[claude.com/blog/auto-mode-default-in-claude-code](https://claude.com/blog/auto-mode-default-in-claude-code)（2026-08-13 抓取）。版权归 Anthropic。*
