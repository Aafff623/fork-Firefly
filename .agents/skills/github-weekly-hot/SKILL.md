---
name: github-weekly-hot
description: >-
  把 IT咖啡馆《Github一周热点》官方 Atom 当成选题目录，抽出仓库 URL，
  对照 GitHub 公开页写成 Firefly「GitHub 每周热榜」合集一期（判断稿，不搬原文）。
  触发词：跑一期热榜、写 GitHub 周榜、GitHub 每周热榜、github weekly、
  IT咖啡馆周刊、github-weekly-hot、githubweekly。
  默认进 _draftbox；用户说「发 / 从草稿箱出来 / 可以发了」才出箱 + validate_post + site-cascade。
compatibility: Firefly 项目根。Python 3 stdlib。Windows PowerShell OK。
---

# github-weekly-hot — 周刊目录 → 园主视角热榜

IT咖啡馆官方周刊当**项目目录**，按 [`references/owner-priority.md`](references/owner-priority.md) 筛 3–7 个仓。发的是核对过的判断，不是周刊搬家。

合集：`github-weekly-hot`。分类：「开源」。  
落盘 / R2 / lint / cascade：[`../_shared/periodical.md`](../_shared/periodical.md)。

## 何时用 / 不用

- **用**：跑一期热榜 / GitHub 每周热榜（也可由 `knowledge-extract` 渠道 4 交接过来）。
- **不用**：渠道 1–3 的 Knowledge 成帖（那是 `knowledge-output`）；日更图卡 `github-trending-11-cards-*` 不是本合集。只使用已有的官方或合规素材，不调用外部图片生成。

## 信息源（只订这一条）

| 项 | URL |
|---|---|
| Atom | `https://itcoffee66.github.io/githubweekly/feed.xml` |
| 文字版 | `https://itcoffee66.github.io/githubweekly/` |
| 该期 HTML | `https://itcoffee66.github.io/githubweekly/{n}.html` |
| 该期 MD（只抽目录） | `https://raw.githubusercontent.com/itcoffee66/githubweekly/main/_weekly/{n}.md` |
| 源码仓 | `https://github.com/itcoffee66/githubweekly` |
| B 站（片单） | `https://space.bilibili.com/65564239` |

禁止把 RSSHub、公众号、掘金旧专栏、CSDN 转写当主源。不要订仓库根 `rss.xml`。**feed 没有的期号不要编。** 视频已出、文字未出：汇报「B 站可能已更新、feed 仍停在 N」，不要靠口播凑一期。

## 引用口径

`githubweekly` **没有 LICENSE**。每条只写：仓库全名（链 GitHub）+ 园主判断（README / 许可证 / 最近 push / stars）+ 文末「本期参考」（`{n}.html` + 查到的 BV）。

禁止：摘抄 `_weekly/*.md`、搬封面、把口播写成正文。安全向仓库只写它是什么、适合谁、授权边界；禁止利用步骤 / payload / PoC。

## 工作流

```
1 fetch   → Atom feed.xml（curl.exe）
2 parse   → 期号 N、<published>、/{n}.html
3 catalog → 拉 _weekly/{n}.md，只抽「## N. 名称」+ github.com 链接
4 filter  → owner-priority.md 筛 3–7 个仓
5 verify  → README / 许可证 / 最近 push / stars
6 write   → 判断稿；文首声明目录来自周刊、正文不搬
7 images  → 仓 banner/OG/README 帧 → periodical.md 上传 R2
8 place   → 碰撞 + 草稿/正式（periodical.md）
9 cover   → 有 public/assets/collections/github-weekly-hot.jpg 才拷 cover.jpg
10 gate   → 没说「发」：_draftbox + validate，不 emit
```

```powershell
curl.exe -sS -L -A "Mozilla/5.0" --max-time 30 -o "$env:TEMP/githubweekly-feed.xml" "https://itcoffee66.github.io/githubweekly/feed.xml"
```

丢掉段落评论、「one more thing」资料分享（除非用户点名且资料本身可链）。H2 用 `owner/repo`；可用 `::github{repo="owner/repo"}`。文末「本期参考」后停。

slug：`github-weekly-hot-{N}`。R2 key：`posts/github-weekly-hot-{N}/<ascii>.jpg`。  
已有日更卡 `github-trending-11-cards-*` **不要**改 `collections` 塞进本合集。

```yaml
title: GitHub 每周热榜第 124 期：短钩子判断句
published: 2026-07-25
updated: 2026-08-13T01:40:00
description: 一两句。点名筛了哪几个仓、判断是啥。
image: ./cover.jpg
tags: [开源, GitHub, …命中的工具/项目]
category: 开源
collections: [github-weekly-hot]
sourceLink: https://itcoffee66.github.io/githubweekly/124.html
draft: true
lang: ''
slug: github-weekly-hot-124
pinned: false
comment: true
```

园主说已抽查、草稿也要入库：仍可留 `_draftbox/`，仅该期 `git add -f`；不要改 `.gitignore` 全局放行。

## 汇报

期号 / feed `<updated>` / `<published>`；目录里有哪些仓、选了哪几个、P0/P1；入选仓 GitHub URL；R2 GET 200；落盘路径；`validate_post` 全文；是否 emit；文字仓落后视频时据实写。
