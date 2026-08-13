---
title: 8 月 7 日这期早报：ChatGPT 换皮了，Codex 那档没动
published: 2026-08-07
updated: 2026-08-13T10:55:00
description: 选题来自橘鸦 8 月 7 日早报。ChatGPT 侧 GPT-5.6 Sol 只动聊天，Work / Codex 没升。GLM-5.3 还只是「很快」。Tibo 自己说重置私信六分钟一条。Agent Plugins 是分发格式，不是新模型。
image: ./cover.jpg
tags: [早报, Codex, ChatGPT, GLM, Cursor, MCP]
category: 早报
collections: [ai-morning-brief]
draft: false
lang: ''
slug: ai-morning-brief-2026-08-07
pinned: false
comment: true
---

本期选题来自[橘鸦早报 2026-08-07](https://daily.juya.uk/issues/2026-08-07/)（[RSS](https://daily.juya.uk/rss.xml)，文字版 [daily.juya.uk](https://daily.juya.uk/)）。目录当探索方向，正文不搬。下面每条是原题、原始出处、我自己的判断。B 站 / YouTube 只当片单，口播不上站。

视频版：[哔哩哔哩](https://www.bilibili.com/video/BV1aKus6mE4E) ｜ [YouTube](https://www.youtube.com/watch?v=MTy85wuJNYc)。

那天目录十几条。按 Coding Plan、Harness、Cursor / Claude Code / Codex 筛了 4 条。Wan 视频、宇树入股、音箱传闻那些先不写。

## ChatGPT 换了 5.6，写代码那条线没换

别把聊天窗口的手感拿去对 Agent 账单。标题容易看成「全线升了」，官方自己把范围写死了。

[OpenAI 8 月 6 日这篇](https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/)说：Plus / Pro 的 **Chat** 体验换成针对闲聊调过的 GPT-5.6 Sol，回答更收、事实更稳，还加了一根思考量滑条。免费档默认改 GPT-5.6 Luna，并预告给无限文本；难问题走新的 Think 按钮。文里写得很清楚：这版 Sol **只动 Chat**，Work 和 Codex 里的 GPT-5.6 Sol 不受影响。

写代码的人明天打开 Codex，模型名还是原来那档。聊天变顺不等于 Coding Plan / API 换了计价，也不等于 Agent 循环变聪明。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-07/)。

![ChatGPT 免费档 Think 按钮与升级提示](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-07/chatgpt-56-sol-free.jpg)

*图：OpenAI 博文里的 ChatGPT 免费档界面（Think / 升级提示）。来源：[openai.com/index/improving-gpt-5-6-sol-in-chatgpt](https://openai.com/index/improving-gpt-5-6-sol-in-chatgpt/)（2026-08-13 抓取）。版权归 OpenAI。*

## 唐杰说 GLM-5.3「很快」，别改套餐

两个字不是发版通知。没有日期，没有价，没有白名单。

原题：[智谱创始人唐杰称 GLM-5.3 将很快发布](https://x.com/jietang/status/2085275443914256513)。有人在 X 上问档期，唐杰回「很快」。产品页、Coding Plan、Cursor Other Models 当时都没有 5.3 这档可对的价。

现在写代码仍按 GLM-5.2 和 [八月中旬那篇比价](/posts/aug-coding-model-discounts-2026-08/) 对账。真上了再看 Coding Plan 收不收、Cursor Other Models 挂不挂、国际刊例是不是还是 $1.4 / $4.4。把「很快」写进月预算，是给自己挖坑。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-07/)。

![智谱开放平台产品图](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-07/zhipu-glm-product.jpg)

*图：智谱开放平台产品视觉。来源：[bigmodel.cn](https://www.bigmodel.cn/)（2026-08-13 抓取）。版权归智谱 AI。*

## Tibo 六分钟收一条重置私信

这不是官方额度政策，是负责人在说需求有多密。别把「私信求重置」当成稳定续杯手段。

原题：[Codex 负责人 Tibo 称平均每约 6 分钟收到一条重置请求](https://x.com/thsottiaux/status/2085221386713198988)。他自己用 Codex 拉了统计：重置私信和邮件平均六分钟一条，偶尔会给带反馈的人开。后面 8 月 9 日、11 日他真冲了两次额度，源头就是这周这股压力。

套餐条款没改。ChatGPT Work / Codex 付费档该怎么耗，还是看 [Codex 手册](/posts/codex-handbook/)，不要把负责人心情写进自己的月预算。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-07/)。

![OpenAI Codex 仓库 GitHub Open Graph](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-07/codex-repo-og.jpg)

*图：openai/codex 仓库 GitHub Open Graph。来源：[github.com/openai/codex](https://github.com/openai/codex)（2026-08-13 抓取）。版权归 OpenAI。*

## Agent 插件想一次打包，进 Cursor 和 ChatGPT

这是分发格式，不是新模型。你现在的 `SKILL.md` 不会隔夜通用。

原题：[Vercel 联合 OpenAI 等多方推出 Agent Plugins 1.0.0 标准](https://vercel.com/blog/introducing-agent-plugins)。把 Agent Skills 和 MCP server 打进同一目录，声称打包一次，ChatGPT、Cursor、VS Code 能自己发现。规范站在 [agent-plugins.org](https://agent-plugins.org/)。目录里至少要有 `plugin.json`，再加 `skills/`、`mcp.json`，客户端专属的 hooks 仍放各家自己的子目录。

真要跟，看 Cursor / Claude Code 客户端认不认这个清单，别先把仓库插件全改格式。手册仍看 [Agent Skills](/posts/agent-skills-handbook/) 和 [MCP](/posts/mcp-handbook/)。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-07/)。

![Vercel Agent Plugins 官方 OG](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-07/vercel-agent-plugins-og.jpg)

*图：Vercel 介绍 Agent Plugins 的官方 OG。来源：[vercel.com/blog/introducing-agent-plugins](https://vercel.com/blog/introducing-agent-plugins)（2026-08-13 抓取）。版权归 Vercel。*
