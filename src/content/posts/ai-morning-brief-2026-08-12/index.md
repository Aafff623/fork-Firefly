---
title: 8 月 12 日这期早报：ZCode 冲额度，Codex 开始从 Claude 搬家
published: 2026-08-12
updated: 2026-08-13T11:00:00
description: 选题来自橘鸦 8 月 12 日早报。GLM Coding Plan 重置了额度，Codex 能从 Claude Code / Cursor 导配置，WorkBuddy 能手机遥控电脑 Agent。
image: ./cover.jpg
tags: [早报, GLM, Codex, Claude Code, Cursor, Grok, OpenCode, WorkBuddy]
category: 早报
collections: [ai-morning-brief]
draft: false
lang: ''
slug: ai-morning-brief-2026-08-12
pinned: false
comment: true
---

本期选题来自[橘鸦早报 2026-08-12](https://daily.juya.uk/issues/2026-08-12/)（[RSS](https://daily.juya.uk/rss.xml)，文字版 [daily.juya.uk](https://daily.juya.uk/)）。他的目录当探索方向，正文不搬。下面每条是原题、原始出处、我自己的判断。B 站 / YouTube 只当片单，口播不上站。

视频版：[哔哩哔哩](https://www.bilibili.com/video/BV1xvuy68EhB) ｜ [YouTube](https://www.youtube.com/watch?v=aTajT28wNGE)。

橘鸦那天目录二十多条。按我平时盯的 Coding Plan、Harness、Cursor / Claude Code / OpenCode / WorkBuddy 筛了 6 条。融资、人事、世界模型那些先不写。DeepSeek 那个 Harness 公众号没有可点的产品页，不写。

## GLM 把订阅额度冲了一次

额度重置比「突破一百万」值钱。闲时任务如果真不扣积分，对写代码的人比新 UI 有用。

原题：[智谱 ZCode：达成 100 万用户并重置全体订阅用户额度](https://mp.weixin.qq.com/s/NwVPQ8zsyIp8BC0Z1dN90g)。百万用户是公关口径。真事是 **8 月 11 日 13 点** 把全体 GLM Coding Plan 用户额度重置了，还上了低峰闲时任务（官方说不扣额度）、Goal、Subagents、手机遥控。

套餐价和还在不在打折，对账看 [八月中旬那篇比价](/posts/aug-coding-model-discounts-2026-08/)。重置是一次性满血，不是把周限额改大。闲时任务「不扣额度」以控制台实扣为准，别只信稿里那句。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-12/)。

![智谱开放平台产品图](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-12/zhipu-glm-product.jpg)

*图：智谱开放平台产品视觉。来源：[bigmodel.cn](https://www.bigmodel.cn/)（2026-08-13 抓取）。版权归智谱 AI。*

## Codex 开始从 Claude 和 Cursor 挖墙

这是工具商在抢你已经写好的规矩。导入不等于能跑。

原题：[ChatGPT 桌面应用和 Codex CLI 上线从其他 Agent 导入功能](https://learn.chatgpt.com/docs/import)。ChatGPT 桌面能从 Claude Code、Claude Cowork、Cursor 导指令、Skills、MCP、hooks、subagents，还能开自动同步。Codex CLI 打 `/import` 也能从 Claude Code 和 Cursor 导，最多拉最近 30 天里 50 条会话。官方写了：原应用的配置不会被改掉；MCP 可能要重新登录；hooks 行为导入后可能不一样。

我这边 [把 Claude 的规矩搬去 Cursor](/posts/cursor-claude-harness-migration/) 踩过：路径、Skill 加载、Windows 编码，复制过去经常是半残。OpenAI 这步说明 Codex 想当默认壳，不是说明你的 `CLAUDE.md` 一夜之间在 Codex 里生效。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-12/)。

![ChatGPT / Codex 导入文档 OG](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-12/chatgpt-import-og.jpg)

*图：ChatGPT 文档「从其他 Agent 导入」页 Open Graph。来源：[learn.chatgpt.com/docs/import](https://learn.chatgpt.com/docs/import)（2026-08-13 抓取）。版权归 OpenAI。*

## Claude Code 被接进企业审计口

个人仓库暂时无感。它说明 Anthropic 把 Claude Code 当能过合规的产品，不是终端玩具。

原题：[Anthropic 拓展面向 Enterprise 客户的 Compliance API](https://claude.com/blog/compliance-api-cowork-and-claude-code)。Compliance API 现在能拉 Claude Cowork 和 Claude Code（CLI / 桌面）的会话和元数据，Enterprise Beta。

你在公司仓里用 Claude Code 乱打密钥，以后审计能顺着 API 翻出来。这不是恐吓个人玩家，是提醒：公司仓把 Claude Code 当「私人玩具终端」的日子，在收口。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-12/)。

![Anthropic Compliance API 博文 OG](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-12/claude-compliance-og.jpg)

*图：Anthropic Compliance API 博文 Open Graph。来源：[claude.com/blog/compliance-api-cowork-and-claude-code](https://claude.com/blog/compliance-api-cowork-and-claude-code)（2026-08-13 抓取）。版权归 Anthropic。*

## Grok Bot 先给 Cursor 顶配

Bot 和模型不是一回事：有 Ultra 才能玩 Bot，有 Pro 只能摸后来那档 4.6 折扣。

原题：[SpaceXAI 发布 Grok Bot，Elon Musk 预告本周推出 Grok 4.6](https://x.ai/news/introducing-grok-bot)。Grok Bot 是带云端电脑的 Agent，早期测试给 SuperGrok Heavy、**Cursor Ultra**、**Cursor Teams Premium**，桌面和 iOS。官方自己写：它不太像「先搭 workflow」，更像给同事派活；Bot 有自己的云电脑，你走开它还在跑。

8 月 12 日这期橘鸦还只是预告。13 日夜里 Grok 4.6 已经进 Cursor，半价窗口大概到 8 月 19 日，见 [已发的 13 日早报](/posts/ai-morning-brief-2026-08-13/) 和比价那篇。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-12/)。

![Grok Bot 官方公告 OG](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-12/grok-bot-og.jpg)

*图：SpaceXAI 介绍 Grok Bot 的官方 OG。来源：[x.ai/news/introducing-grok-bot](https://x.ai/news/introducing-grok-bot)（2026-08-13 抓取）。版权归 SpaceXAI / xAI。*

## WorkBuddy 能用手机遥控电脑上的 Agent

远程开闸等于远程能把仓库跑起来。锁屏还在跑的话，密钥、`git push`、乱改文件的风险一起变大。

原题：[WorkBuddy上线多端同步功能，支持手机远程控制电脑Agent](https://mp.weixin.qq.com/s/XKDwvBBnSvhcXdHGSZPNPQ)。腾讯这步把 PC、App、小程序的任务和产物打通，手机可以授权或停掉电脑端 Agent，也能一台手机切多台电脑。官方还写了锁屏远程：电脑开着不会自动休眠，手机锁屏仍能控。

怎么蒸 Skill，仍看 [WorkBuddy 手册](/posts/workbuddy-handbook/)。这期只记：多端已经能动手，不是还在 PPT 里。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-12/)。

![WorkBuddy 官网](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-12/workbuddy-website.jpg)

*图：WorkBuddy 官网截图。来源：[workbuddy.ai](https://workbuddy.ai/)（站内手册 2026-08 已用同一张产品页）。版权归腾讯。*

## Nemotron 在 OpenCode 上先免费用

免费窗口没写截止日期。适合拿来试长循环，不适合当唯一生产模型。

原题：[NVIDIA 推出 Nemotron 3.5 Lightning 模型](https://developer.nvidia.com/blog/nvidia-nemotron-3-5-lightning-delivers-fast-accurate-specialized-task-execution-for-long-running-agents/)。30B MoE，激活 3B，1M 上下文，官方往长跑 Agent 的执行层推。权重开源，OpenRouter 和 **OpenCode 写了免费**。

OpenCode 怎么接，还是看 [OpenCode 手册](/posts/opencode-handbook/)。免费一停，立刻要面对要不要改路由。别把「OpenCode 上免费」理解成 NVIDIA 官方永远白送。来自[橘鸦早报](https://daily.juya.uk/issues/2026-08-12/)。

![NVIDIA Nemotron 3.5 Lightning 博文图](https://img.threetwoa.live/posts/ai-morning-brief-2026-08-12/nemotron-lightning.jpg)

*图：NVIDIA 开发者博客 Nemotron 3.5 Lightning 配图。来源：[developer.nvidia.com](https://developer.nvidia.com/blog/nvidia-nemotron-3-5-lightning-delivers-fast-accurate-specialized-task-execution-for-long-running-agents/)（2026-08-13 抓取）。版权归 NVIDIA。*
