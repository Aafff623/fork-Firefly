---
title: 8 月 8 日这期早报：Claude Code 默认放手，OpenCode 把 Flash 加倍了
published: 2026-08-08
updated: 2026-08-13T10:56:00
description: 选题来自橘鸦 8 月 8 日早报。Claude Code 8 月 14 日起 auto mode 变默认，分类器开销不再另收费。OpenCode Go 的 DeepSeek Flash 限时翻倍，没写截止日期。
image: ./cover.jpg
tags: [早报, Claude Code, OpenCode, DeepSeek]
category: 早报
collections: [ai-morning-brief]
draft: false
lang: ''
slug: ai-morning-brief-2026-08-08
pinned: false
comment: true
---

本期选题来自[橘鸦早报 2026-08-08](https://daily.juya.uk/issues/2026-08-08/)（[RSS](https://daily.juya.uk/rss.xml)，文字版 [daily.juya.uk](https://daily.juya.uk/)）。目录当探索方向，正文不搬。下面每条是原题、原始出处、我自己的判断。B 站 / YouTube 只当片单，口播不上站。

视频版：[哔哩哔哩](https://www.bilibili.com/video/BV1stuK6DEMS) ｜ [YouTube](https://www.youtube.com/watch?v=odAEMFHsSKs)。

那天能改明天工具和账单的，我只留下 2 条。Astra 推迟、Fable 生物安全、视频模型、Kimi 逃逸测试，跟写代码的日账单无关，不写。Codex 重置当时还是传闻，真事落在 9 日那期。

## Claude Code 8 月 14 日起，auto mode 变默认

默认放手不等于更安全。分类器拦的是它认为危险的命令，拦不住你自己把密钥写进提示词。

[Anthropic 8 月 7 日博文](https://claude.com/blog/auto-mode-default-in-claude-code)写：8 月 14 日起，Pro / Max / Team 新会话默认走 auto mode。已经自己钉死默认值的人，可能弹一次是否切换；钉死的不变。分类器每步工具调用会多吃一点 token，**从发文当天起**这部分开销不再向这三档另收费。会话之间能互发消息，只传任务摘要，不传完整历史。Enterprise、API、Bedrock 当时仍是 opt-in，给管理员留审查窗口。

他们自己的数字更扎眼：权限提示有 97% 会被点过；1053 名付费测试者里，人只拦住 13.6% 的危险命令，auto mode 拦住 89%。Windows 仓我这边还得看客户端哪天跟上，别默认「14 号全球一齐切」。手册：[Claude Code](/posts/claude-code-handbook/)。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-08/)。

![Anthropic auto mode 与人工审批对比图](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-08/claude-auto-mode-chart.jpg)

*图：官方实验图，人工拦住 13.6%，auto mode 拦住 89%。来源：[claude.com/blog/auto-mode-default-in-claude-code](https://claude.com/blog/auto-mode-default-in-claude-code)（2026-08-13 抓取）。版权归 Anthropic。*

## OpenCode Go 把 DeepSeek Flash 用量翻倍了

限时加倍就是窗口。适合拿去打短循环，不适合当长期产能规划。

原题：[OpenCode宣布OpenCode Go的DeepSeek Flash使用量限时翻倍](https://x.com/opencode/status/2085621778039087160)。官方账号说 Go 方案里 DeepSeek Flash 限时加倍。**没写截止日期。**

官方 API 那边 DeepSeek 已经在说要涨，见 [比价那篇](/posts/aug-coding-model-discounts-2026-08/)。OpenCode 怎么接，还是 [OpenCode 手册](/posts/opencode-handbook/)。窗口一关，产能立刻腰斩，别按翻倍后的吞吐量排迭代。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-08/)。

![OpenCode 官网社交图](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-08/opencode-og.jpg)

*图：OpenCode 站点 Open Graph。来源：[opencode.ai](https://opencode.ai/)（2026-08-13 抓取）。版权归 OpenCode / Anomaly。*
