---
title: GitHub 每周热榜第 124 期：Kimi Code 还在推，免费网关别当水龙头
published: 2026-07-25
updated: 2026-08-13T10:50:00
description: 目录来自 IT咖啡馆第 124 期。筛了 Kimi Code、OmniRoute、Openship、Hallmark、Buzz。判断对着 GitHub 公开页，不搬周刊正文。
image: ./cover.jpg
tags: [开源, GitHub, Kimi Code, OmniRoute, Openship, Hallmark, Buzz]
category: 开源
collections: [github-weekly-hot]
sourceLink: https://itcoffee66.github.io/githubweekly/124.html
draft: true
lang: ''
slug: github-weekly-hot-124
pinned: false
comment: true
---

本期项目目录来自 [IT咖啡馆《GitHub一周热点》第 124 期](https://itcoffee66.github.io/githubweekly/124.html)（[Atom](https://itcoffee66.github.io/githubweekly/feed.xml)，文字站 [githubweekly](https://itcoffee66.github.io/githubweekly/)）。周刊只当索引。下面每条是仓库全名、GitHub 链，判断来自 README、许可证和最近 push，**不搬原文**。B 站视频只当片单，口播不上站。

周刊目录五个仓全留下了：三个 P0（编程 Agent、统一网关、自托管部署），两个 P1（设计 Skill、人机工作台）。文末两份算力 / Token 白皮书是资料分享，默认不写。

星标数字是 **2026-08-13** 对着 GitHub 核的，不是 7 月 25 日那期的截图。仓还在推，数字会变。配图优先搬仓库自己的 banner / OG / README 演示帧，传到本站 R2 后再嵌正文，不长期外链 GitHub raw。

## MoonshotAI/kimi-code

[MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) · MIT · 约 6443 star · 8 月 12 日还在 push

::github{repo="MoonshotAI/kimi-code"}

![Kimi Code 终端会话演示，截自仓库 README 顶部 intro.gif 首帧](https://img.threetwoa.live/posts/github-weekly-hot-124/kimi-code.jpg)

*图：README 顶部 `docs/media/intro.gif` 首帧。来源：[MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code)（2026-08-13）。*

README 把它写成跑在终端里的编程 Agent：读改代码、跑命令、搜文件、拉网页，再按反馈决定下一步。默认接月之暗面的 Kimi，也可以配别的兼容上游。安装不绑 Node，macOS / Linux 走 `install.sh`，Windows 走官方 `install.ps1`。Windows 要先有 Git for Windows，因为默认壳是捆绑的 Git Bash；Bash 装在非默认路径时，设 `KIMI_SHELL_PATH` 指向 `bash.exe`。装完新开一个壳，`kimi --version` 能印出版本再进项目。

第一次进交互界面跑 `/login`，选 Kimi Code OAuth，或月之暗面开放平台 API key。登录之后它才肯干活。内置子代理是 `coder` / `explore` / `plan`，各自隔离上下文，主对话不至于被探路刷屏。MCP 用 `/mcp-config` 对话式加，不必手改 JSON。技能、MCP、数据源可以从市场或任意 GitHub 仓装，安装时会标信任级别。生命周期 Hook 能在危险工具调用前拦一道、记审计、弹桌面通知。ACP 子命令 `kimi acp` 能让 Zed / JetBrains 直接开会话，登录过一次就够。README 还写了视频输入：把录屏或演示片丢进对话，让 Agent 看你说不清的那一段。

这是入口仓，不是权重仓。想跟 Coding Plan 对齐，先看它还在不在更新，再去对账 [Kimi Code 手册](/posts/kimi-code-handbook/)。手册里踩过的 Hook 和死循环，不会因为换了安装脚本就消失。Windows 上没 Git Bash 就启动不了，别把锅扣给模型。本地从源码开发要 Node ≥ 24.15 和 pnpm，那是给贡献者的，日常用官方安装脚本即可。

## diegosouzapw/OmniRoute

[diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) · MIT · 约 4.6 万 star · 8 月 12 日还在 push

::github{repo="diegosouzapw/OmniRoute"}

![OmniRoute 仓库 banner，来自默认分支 images/omniroute.png](https://img.threetwoa.live/posts/github-weekly-hot-124/omniroute.jpg)

*图：仓库 `images/omniroute.png`。来源：[diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute)（2026-08-13）。*

一个 OpenAI 兼容口，背后接一堆 provider，给 Claude Code、Codex、Cursor、OpenCode 用。当前默认分支在 `release/v3.8.50`。README 自己报的目录规模是 338 个 provider、1200+ 模型，还加了视觉的 modality bridge。免费层写在首页那串「每月免费 token」里，方法论在 `docs/reference/FREE_TIERS.md`：按文档里的免费档汇总，两周对着线上目录复核一次，**涨也跌**。提供商砍免费档，数字就掉；新的进来，数字才爬。他们声明只公布目录算出来的数，不把最好情况四舍五入。

高层次用法就一件事：把网关起在本机，工具的 Base URL 指到本机 20128 端口的 `/v1`。README 给了 Docker 映射 20128、npm 包 `omniroute`，以及仪表盘 `/dashboard/free-tiers`。还可以挂 MCP / REST，让 Agent 自己查路由和额度。密钥仍在你这边填，网关只是把碎片免费层收成一条口。

适合把额度收成一条本地兼容口。公司代码、客户数据、生产密钥不要往随机免费上游送。额度规则变了，网关也救不了。羊毛和线路的对账，还是看 [薅羊毛专区](/collections/wool-freebies/)，别在这期里重新开一张价目表。星标高、更新勤，不等于 SLA。

## oblien/openship

[oblien/openship](https://github.com/oblien/openship) · Apache-2.0 · 约 1.06 万 star · 8 月 11 日还在 push

::github{repo="oblien/openship"}

![Openship 官方 Open Graph 图，来自 openship.io 站点 og:image](https://img.threetwoa.live/posts/github-weekly-hot-124/openship.jpg)

*图：官网 Open Graph。来源：[openship.io](https://openship.io)（2026-08-13）。仓库没有独立 banner，用站点 og:image。*

自托管部署台：指着 GitHub 仓、本地目录或预构建产物，走完检测、构建、运行、反代、Let's Encrypt。框架从 `package.json`、lockfile、compose 猜栈，零配置也能跑；要控的话写 `openship.json`。独行用桌面端，控制面只在本机活着，经 SSH 推服务器，不把控制面暴露到公网。要 push-to-deploy、团队共用、或让应用就住在那台盒子上，才上常驻 `openship up`。Linux 有 Docker 时默认 Compose 模式（Postgres、Redis、API、仪表盘、OpenResty 占 80/443）；macOS / Windows 或没 Docker 则走 bare，控制面常驻，应用仍部署到远端。另有 Openship Cloud，完全不想运维时用。

Agent 写得快，卡住的经常是「这东西怎么持续挂出去」。Openship 吃的是这个痛。接口有桌面、Web、CLI，还有 MCP 和 REST；MCP 只暴露主动选择的路由，每次重验权限，凭证类接口不会变成工具。复杂 monorepo、私有 registry、多环境权限，README 没打包票。Docker Compose 自托管那条是 Linux host 网络，还要挂宿主机 Docker socket，只适合信任的机器。文档还在补。先拿一个小站试你的栈，再决定要不要把主站迁过去。本站默认还是 Vercel，这期不改部署策略。

## Nutlope/hallmark

[Nutlope/hallmark](https://github.com/Nutlope/hallmark) · MIT · 约 2.4 万 star · 8 月 6 日还在 push

::github{repo="Nutlope/hallmark"}

![Hallmark 官方 OG 图，来自仓库 site/OG-hallmark.png](https://img.threetwoa.live/posts/github-weekly-hot-124/hallmark.jpg)

*图：仓库 `site/OG-hallmark.png`。来源：[Nutlope/hallmark](https://github.com/Nutlope/hallmark)（2026-08-13）。*

给 Claude Code / Cursor / Codex 读的设计规则，Together AI 出品。先选页面宏观结构，再套二十一个主题之一，出门前过五十七道 slop 检测，外加一轮发出前的自我批评。它要挡的是「又一张同款紫渐变落地页」：两个不同 brief 不该只是换色。四个动词：默认出新页；`audit` 只打清单不改代码；`redesign` 留文案、信息架构和品牌，扔掉旧结构重做视觉；`study` 从截图或网址抽 DNA（宏观结构、字体配对、颜色锚点），拒绝像素克隆和付费模板，必要时吐一份可带走的 `design.md`。目录里没有合适主题时，会切到安静的 Custom 分支，从零配色排版，仍走同一套检测。

安装：`npx skills add nutlope/hallmark`，重跑即更新。也可以把 `SKILL.md` 加 `references/` 拷进 Claude Code 的 skills 目录、Cursor 的 `.cursor/rules/hallmark.mdc`（只要正文、不要 frontmatter），或 Codex 的 skills 路径。规则真身在仓里的 Skill 文件，配方在 `docs/recipes.md`。演示站 [usehallmark.com](https://www.usehallmark.com) 能看不同 brief 长成不同形状。

本仓已经在用这套规则。新开页面可以让 Agent 走它；已有手感的长文不必整站重烤。它挡的是默认脸，不是设计师。Skill 怎么进工具链，见 [Agent Skills 手册](/posts/agent-skills-handbook/)。

## block/buzz

[block/buzz](https://github.com/block/buzz) · Apache-2.0 · 约 2.7 万 star · 8 月 12 日还在 push

::github{repo="block/buzz"}

![Buzz 频道线程截图，来自仓库 docs/assets/screenshots/channel-thread.png](https://img.threetwoa.live/posts/github-weekly-hot-124/buzz.jpg)

*图：仓库 `docs/assets/screenshots/channel-thread.png`。来源：[block/buzz](https://github.com/block/buzz)（2026-08-13）。不是 GitHub 自动生成的 OG。*

Block 开源的人机共用工作台。底层是你自己的 Nostr relay：消息、反应、workflow、review、git 事件都是 signed event，人一把钥匙，Agent 一把钥匙。默认一个 relay URL 就是一个 community。Agent 是频道成员，不是挂在边上的机器人，开仓、送补丁、跑 workflow、进语音 huddle 的表面面积和人一样，审计链也一样。桌面端是 Tauri，有 macOS / Linux / Windows 安装包；Windows 构建未签名，SmartScreen 会拦，Agent 壳仍依赖 Git Bash。本地开发要 Docker 加 Hermit（或 Rust 1.88+、Node 24、pnpm、just），`just dev` 起 relay（本机 3000 端口的 WebSocket）和桌面端。生产 Compose 在 `deploy/compose/`，根目录 compose 只给日常开发。给 Agent 用时设 `BUZZ_PRIVATE_KEY`，走 `buzz-cli`（JSON 进 JSON 出）或 ACP（Goose / Codex / Claude Code）。

愿景是把 Slack + GitHub + CI + 任务板收成同一本事件账。README 自己把「跨 relay 声誉、推送通知」放在意见栏，workflow 审批门还在接线。issue 还很多，别当成熟替代品。个人仓库继续用 GitHub 就够。真要试，先自托管看审计链，不要把生产密钥交给「频道里的那个 Agent 成员」。它也不是区块链，只是签名事件。

## 本期参考

- 文字：[GitHub一周热点第 124 期](https://itcoffee66.github.io/githubweekly/124.html)
- 视频片单：[IT咖啡馆 B 站空间](https://space.bilibili.com/65564239)（合集「GitHub一周热点汇总」）。公共接口今晚拿不到稳定 BV，不编链。
- 目录源：[feed.xml](https://itcoffee66.github.io/githubweekly/feed.xml)。截至 8 月 13 日文字仓仍停在 124；B 站侧栏已经能看到 125 期标题，**没有对应 html/md 之前，不写第 125 期**。
