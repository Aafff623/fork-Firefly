---
name: ai-morning-brief
description: >-
  从橘鸦Juya 早报 RSS 按园主焦点筛选 3–7 条，写成 Firefly「AI 早报」合集一期（判断稿，不转载全文）。
  触发词：跑一期早报、写早报、AI 早报、橘鸦早报、juya daily、morning brief、
  今天的早报、发早报、早报草稿、ai-morning-brief。
  默认进 _draftbox；用户说「发 / 从草稿箱出来 / 可以发了」才出箱 + validate_post + site-cascade。
compatibility: Firefly 项目根。Python 3 stdlib。Windows PowerShell OK。
---

# ai-morning-brief — 橘鸦 RSS → 园主视角早报

橘鸦每日报告当**选题目录**，按园主焦点筛 3–7 条写成合集 `ai-morning-brief` 一期。发的是筛选和判断，不是橘鸦搬家。

合集：`src/config/collectionsConfig.ts` → `ai-morning-brief`。分类：「早报」。  
落盘 / R2 / lint / cascade：[`../_shared/periodical.md`](../_shared/periodical.md)。  
筛选词表：[`references/owner-priority.md`](references/owner-priority.md)。

## 何时用 / 不用

- **用**：跑一期早报 / 今天的早报（也可由 `knowledge-extract` 渠道 4 交接过来）。
- **不用**：渠道 1–3 的 Knowledge 成帖（那是 `knowledge-output`）。只使用已有的官方或合规素材，不调用外部图片生成。
- **不用接 RSS MCP**：不接 glean / zenfeed / TrendRadar，也不用本机 `user-aigc-news` 榜单当主源。拉取橘鸦 RSS 只用 `curl.exe`（见下）。

## 信息源（只订这一个）

| 项 | URL |
|---|---|
| RSS | `https://daily.juya.uk/rss.xml` |
| 文字版 | `https://daily.juya.uk/` |
| 当日 MD | `https://daily.juya.uk/markdown/YYYY-MM-DD.md` |
| 当日 HTML | `https://daily.juya.uk/issues/YYYY-MM-DD/` |

禁止再接一堆 B 站 UP / RSSHub / IT之家 / 通用 RSS 阅读器 MCP 当主源。`ai-morning-brief-2026-08-13` 是 IT之家过渡期，**不要用新源覆盖它**。

## 引用口径

每条必须有：原题（链原始出处）+ 原始 URL + 一句「来自橘鸦早报」（链当日 issues）+ 转述事实与园主判断 + 至少一张相关图（R2）。

禁止：转载橘鸦正文、blockquote 复述他的摘要、扒口播/字幕。视频只给 B 站 / YouTube 当片单。

## 工作流

```
1 fetch   → RSS（Windows 用 curl.exe）；目录不够再读当日 markdown
2 parse   → 期号日期、各条标题、原链、视频链
3 filter  → owner-priority.md 筛 3–7 条（宁缺毋滥）
4 write   → 判断稿；每条 150–400 字；文首声明选题来自橘鸦、不搬全文
5 images  → 官方 OG/产品图/公告截图 → 按 periodical.md 上传 R2
6 place   → 碰撞规则 + 草稿/正式分流（periodical.md）
7 cover   → 若存在则拷 public/assets/collections/ai-morning-brief.jpg → cover.jpg
8 gate    → 没说「发」：_draftbox + validate，不 emit
            说「发」：出箱 + validate + cascade --emit-dynamic --blurb
```

拉取：

```powershell
curl.exe -sS -L -A "Mozilla/5.0" --max-time 30 -o "$env:TEMP/juya-rss.xml" "https://daily.juya.uk/rss.xml"
```

RSS `<item><title>` 一般是 `YYYY-MM-DD`。不要把 `<content:encoded>` 当可发布正文。

### 条内结构

1. 短判断句（改不改明天的模型 / 账单 / 工具链）
2. 发生了什么：时间、产品、谁说的、关键数字（从**原站**转述）
3. 对写代码或账单的影响
4. 原链（官网优先）

需要时链站内比价 `aug-coding-model-discounts-2026-08`。写完最后一条就停，不要「总结」节。

### 本合集例外

| 情况 | 动作 |
|---|---|
| 该日是 `2026-08-13` | **永不以橘鸦稿覆盖**（IT之家第一期）。最多加一句脚注：下期起主源改橘鸦（正文用全角「：」） |
| 最新橘鸦是 08-12、而 08-13 已占用 | 草稿写 `ai-morning-brief-2026-08-12`，不要改 08-13 结构 |

slug：`ai-morning-brief-YYYY-MM-DD`。R2 key：`posts/ai-morning-brief-YYYY-MM-DD/<ascii>.jpg`。

```yaml
title: 8 月 12 日这期早报：短钩子判断句
published: 2026-08-12
updated: 2026-08-13T01:25:00
description: 一两句。点名筛了啥、判断是啥。
image: ./cover.jpg
tags: [早报, …命中的工具/厂商]
category: 早报
collections: [ai-morning-brief]
draft: true
lang: ''
slug: ai-morning-brief-2026-08-12
pinned: false
comment: true
```

## 汇报

橘鸦期号 / `lastBuildDate`；选了哪几条、P0/P1、为什么；每条 R2 URL 是否 GET 200；落盘路径；`validate_post` 全文；是否 emit；未决：等「可以发了」再出箱。
