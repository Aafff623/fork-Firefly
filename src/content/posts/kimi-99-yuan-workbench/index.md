---
title: 99 块的 Kimi，帮我把一整面 Workbench 搬进了仓库
published: 2026-08-08
description: 顺手让 Kimi Code CLI 维护一下 agentic-workbench，结果它自己把 17 个主题的资产工作台、玻璃拟态主题、SaaS 成品页全给整利索了。99 元的套餐，干出了「你按模板攒的」的完成度，盘点一下它交付了什么。
image: ./cover.jpg
tags: [Kimi, Agent, Workbench, 玻璃拟态, 资产库]
category: Agentic Coding
collections: [tool-agent]
draft: false
lang: zh-CN
slug: kimi-99-yuan-workbench
pinned: false
comment: true
updated: 2026-08-08T12:00:00
---

前两天把 `agentic-workbench` 这个项目丢给 Kimi Code CLI 维护，本来只想让它补个主题。结果它不光把主题加了，还顺手把整个工作台的规则、文档、预览壳全给理顺了。我回过神来看 git log，才发现这一整面 Workbench 都是它这轮搭起来的。有点被惊到，写下来记录一下它到底交付了什么。

## 一句话：一个能用的资产工作台

`agentic-workbench` 是「个人上下文优先的 UI 组件资产与视觉样式探索工作台」。说人话就是：**一堆散落的 UI 模板和设计素材，不该躺在 zip 里睡大觉，而是拆成能独立打开、能预览、能翻找的主题项目**。

这轮 Kimi 干的，是把散装素材整理成 17 个自包含主题：

| 类型 | 数量 | 例子 |
|---|---|---|
| 资产型 | 9 个 | aceternity / herouiv3 / hallmark / glass-ui / auroraqua / ui-ux-pro-max |
| 模板型 | 8 个 | shadcn-studio / tinyship / supastarter / mvpfast / vibecoding |

每个主题都是标准「五件套」：README + AGENTS + CLAUDE + CONTEXT + LANGUAGES，配 assets、docs、产品层。别的 Agent 进来照着 README 就能启动预览，不用再翻原始 zip。

## 它这轮新增的：glass-ui-assets

这次重点加的是 **glass-ui-assets**（玻璃拟态 UI 设计资产库）：

- **20 张组件参考图**：white-light 白光玻璃 11 张 + thin-glass 超薄玻璃 9 张，覆盖导航栏、按钮、图表、模态框、命令面板全系列
- **2 份设计规范**：ClauseOS 企业合规 SaaS 设计系统 v2.0 + WenXiBuddy 复刻提示词包 v1.0
- **画廊预览壳**：tab + iframe 的静态画廊，20 张图三个 tab 切换，端口 8879
- **SaaS 成品页**：一个 35KB 的 `dashboard.html`，把 ClauseOS 的 Token 直接落地成可交互后台（侧边导航、模态、⌘K 命令面板都能点）

这不是「把素材堆上去」那种敷衍，是真能打开看、能翻图、能抄 Token 的完成度。

## 真正让我服气的三个点

1. **规则的自觉性**：它主动对齐了仓库的 `port-registry`（端口唯一事实源）、ADR 0016 扁平主题布局、project-init 五件套骨架。不是我提醒的，是它自己查的。
2. **文档的克制**：上游素材只读，不擅自改图改规范；README 里不塞绝对路径不塞私钥；macOS 的资源叉文件主动剔除。
3. **收尾的规整**：461 个 commit 的仓库，这轮 commit 信息干净（`feat(glass-ui-assets)` / `docs(workbench)` / `docs(commit-history)` 分门别类），git log 读起来像正规开源项目。

## 99 元套餐，值不值

最让我意外的是：这是 **99 元/月的 Kimi 套餐**干出来的，不是 200 刀的 Claude 订阅，也不是开 API 按 token 烧。模型本身能不能打是一回事，**它有没有把「维护一个仓库该有的姿势」内化成习惯**是另一回事。这一轮它显然是会的。

当然不是无脑吹。中途它也有几次文档路径指错、计数对不齐，得我纠。但纠完它能记住，下一轮不再犯。这个「被纠正后不重复踩」的特质，比一次完美交付更难得。

## 收个尾

如果你也有个「素材越堆越多但没人整理」的仓库，丢给 Kimi 试试。它也许不能一次写对，但它的下限是「完整、自洽、可运行」，这个下限对整理型任务来说，恰恰是最稀缺的。

一句话：**99 块的 Kimi，干出了你按模板攒一星期才能攒出来的完成度。** 这轮我服。
