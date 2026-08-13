---
name: ai-morning-brief
description: >-
  从橘鸦Juya 早报 RSS 按园主焦点筛选 3–7 条，写成 Firefly「AI 早报」合集一期（判断稿，不转载全文）。
  触发词：跑一期早报、写早报、AI 早报、橘鸦早报、juya daily、morning brief、
  今天的早报、发早报、早报草稿、ai-morning-brief。
  默认进 _draftbox；用户说「发 / 从草稿箱出来 / 可以发了」才出箱 + validate_post + site-cascade。
compatibility: Firefly 项目根。Python 3 stdlib（validate_post.py）。Windows PowerShell OK。
---

# ai-morning-brief — 橘鸦 RSS → 园主视角早报

把橘鸦Juya 的每日报告当成**选题目录**，按园主平常盯的焦点筛 3–7 条，写成合集 `ai-morning-brief` 的一期。Firefly 发的是筛选和判断，不是橘鸦正文搬家。

合集已登记：`src/config/collectionsConfig.ts` → slug `ai-morning-brief`。分类词表：「早报」（`CONTEXT.md`）。

## 何时用 / 不用

- **用**：用户说「跑一期早报 / 写早报 / 今天的早报 / 发早报」；或要按橘鸦 RSS 出合集稿。
- **不用**：Obsidian 笔记成帖 → `ob2blog`；Knowledge 素材成帖 → `knowledge-output`；封面/配音/BGM → `firefly-minimax-media`。**默认禁止 MiniMax 付费生图**；仅当官方 OG / 产品图 / 公告截图都抓不到、且用户当场要配图，才过 `scripts/check_quota.py` 再生成。

## 信息源（只订这一个）

| 项 | URL |
|---|---|
| RSS（主入口） | `https://daily.juya.uk/rss.xml` |
| 文字版站点 | `https://daily.juya.uk/` |
| 当日 Markdown | `https://daily.juya.uk/markdown/YYYY-MM-DD.md` |
| 当日 HTML | `https://daily.juya.uk/issues/YYYY-MM-DD/` |

禁止再接一堆 B 站 UP / 公共 RSSHub / IT之家当主源。已发的 `ai-morning-brief-2026-08-13` 是 IT之家过渡期，**不要用新源覆盖它**。

## 引用口径（版权）

橘鸦报告是探索方向 / 选题标准，不是可转载全文。旧 README 曾标 CC BY-NC；B 站稿**禁转载**（不扒口播、字幕、逐字稿）。

每条必须写（判断稿，不是橘鸦搬家）：

1. **原题**（链原始出处，不是只链橘鸦）
2. **原始出处链接**（官网 / 推文 / 论文 / 公众号原文）
3. 一句「来自橘鸦早报」（链当日 `issues/YYYY-MM-DD/`）
4. **充分转述事实 + 有肉的园主判断**（见下「条内篇幅」）
5. **至少一张相关配图**（见「配图与 R2」）

禁止：整篇转载橘鸦正文、blockquote 复述他的摘要、把视频口播写成正文、三句话打发 P0。可以更充分转述原站事实，判断要落到工具 / 账单 / 明天能不能改套餐。视频版只给 B 站 / YouTube 链当片单。

## 工作流

```
1 fetch   → RSS；需要完整目录时再读当日 markdown/YYYY-MM-DD.md
2 parse   → 期号日期、各条标题、原链、B 站/YouTube 链
3 filter  → 按 references/owner-priority.md 筛 3–7 条（宁缺毋滥）
4 write   → 判断稿；每条 150–400 字；文首声明选题来自橘鸦、不搬全文
5 images  → 每条至少一张官方 OG/产品图/公告截图；Web 化后上传 R2
6 place   → 同日碰撞规则（见下）决定 slug / 草稿或正式
7 cover   → 拷 public/assets/collections/ai-morning-brief.jpg → 该帖 cover.jpg（合集小封面可留 git；正文大图走 R2）
8 gate    → 用户没说「发」：_draftbox + draft: true，validate，不 emit
            用户说「发」：出箱 + draft: false + validate + site-cascade --emit-dynamic
```

### 1. 拉取

在 Firefly 根目录（Windows 用 `curl.exe`，不要管道给不存在的 `head`）：

```powershell
curl.exe -sS -L -A "Mozilla/5.0" --max-time 30 -o "$env:TEMP/juya-rss.xml" "https://daily.juya.uk/rss.xml"
```

RSS `<item><title>` 一般是 `YYYY-MM-DD`；`<link>` 指向 `/issues/YYYY-MM-DD/`。`lastBuildDate` 是最新一期。

目录不够用时再拉：`https://daily.juya.uk/markdown/YYYY-MM-DD.md`（概览列表 + 各条原链，仍禁止把正文搬进帖）。

### 2. 解析

每期记下：

- 期号日期（用作 slug 日期）
- 概览里每条：标题、原始 URL、橘鸦条目序号
- 页头「视频版」的 B 站 / YouTube URL（只作片单）

不要把 `<content:encoded>` 全文当可发布正文。

### 3. 筛选

读 [`references/owner-priority.md`](references/owner-priority.md)。选出 **3–7 条**。P0 优先；P0 不足再补 P1；P2 默认不写。不够 3 条就少写，不要凑数。

### 4. 成稿红线

复用 `knowledge-output` 成帖红线，早报额外钉死：

1. 正文从 `##` 起，**无 H1**；`title` 只在 frontmatter，**无 emoji / 颜文字**。
2. 半角冒号 `:` 全部改全角「：」（frontmatter 与 Markdown 链里的 `https://` 除外）。时间写成「13 点」或「13：00」，禁止正文 `13:00`。
3. 英文 em dash（—）/ en dash（–）归零；中文破折号「——」可用。
4. H2/H3 禁课件腔：`总结` / `收束` / `要点` / `概述` / `写在最后` / `Key Takeaways`。
5. 文首必须声明：本期选题来自橘鸦早报 RSS，不搬全文。
6. 成稿过 humanizer-tta（人话、有判断）；禁止「调用了 skill」等工具痕迹。

#### 条内篇幅（硬规则）

每条建议 **150–400 字**中文（P0 写够，不要三句话打发；特别短的 P1 也至少把事实和判断写全）。结构：

1. 短判断句（这事改不改明天的模型 / 账单 / 工具链）
2. 发生了什么：时间、产品、谁说的、关键数字（从**原站**转述，不搬橘鸦段落）
3. 对写代码或账单的影响（套餐、额度、Harness、Windows、站内手册 / 比价帖）
4. 原链（官网优先）

需要时链站内比价 `aug-coding-model-discounts-2026-08` 或对应手册。写完最后一条就停，不要「总结」节。

#### 配图与 R2（硬规则）

- **每条新闻至少一张相关图**。优先：原文章 / 官网 **OG**、产品页主视觉、官方公告截图。不要空洞装饰图、不要无关风景、不要用 MiniMax 乱画一张「科技感」。
- **新图不进 git**：正文大图（及新的大封面）上传 Cloudflare R2 后，用公网 URL。本地只留 `.scratch/` 或 `tmp/` 处理缓存（已 gitignore）。存量合集小封面 `cover.jpg` 可继续拷 `public/assets/collections/ai-morning-brief.jpg`。
- 桶：**`firefly-comment`**（自定义域已绑）。公网：**`https://img.threetwoa.live`**。不要写到 `threetwoa-blog-assets`（该桶无 `img.` 域）。
- object key：`posts/ai-morning-brief-YYYY-MM-DD/<ascii-name>.jpg`
- Web 化：转 JPG；过宽压到约 1200–1600px；体积控制（常见几十到一两百 KB）。RGBA 先贴深色底再压扁。
- 正文写法：

```markdown
![说明](https://img.threetwoa.live/posts/ai-morning-brief-YYYY-MM-DD/foo.jpg)

*图：一句话说明。来源：[原页](https://example.com)（抓取日）。版权归某某。*
```

- 上传后必须 `GET` 该公网 URL，确认 **HTTP 200** 再写入 markdown。失败就汇报卡点，**禁止假装已经上了 R2**（不要写死链、不要改用未授权的第三方图床充数）。
- 上传途径（密钥只读本机 env / `.env`，不入库、不打印 secret）：
  1. `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` / `R2_PUBLIC_BASE_URL` → S3 兼容 PutObject（实现可参考 `src/pages/api/comment-image.ts` 的 SigV4，或 skill 内 `scripts/upload_r2.py`）
  2. 本机没有 R2_* 时：Cloudflare API `PUT /accounts/{account_id}/r2/buckets/firefly-comment/objects/{object_key}`（MCP `user-cloudflare` 的 `execute` 可以；`user-cloudflare-bindings` **没有** object put，不要盲调）
  3. `npx wrangler r2 object put`（需已 `wrangler login`）
- MiniMax 付费生图：仅官方图实在没有、且 `scripts/check_quota.py` 过门禁；默认抓原文章 / 官网图。

Frontmatter 模板：

```yaml
title: 8 月 12 日这期早报：短钩子判断句
published: 2026-08-12          # 橘鸦期号日期
updated: 2026-08-13T01:25:00   # 落盘当下，带时分
description: 一两句。点名筛了啥、判断是啥。
image: ./cover.jpg
tags: [早报, …命中的工具/厂商]
category: 早报
collections: [ai-morning-brief]
draft: true                    # 正式发才改 false
lang: ''
slug: ai-morning-brief-2026-08-12
pinned: false
comment: true
```

`published` = 橘鸦期号日。`updated` = 落盘当下（含时分），避免同日多帖撞时间戳。

### 5. 同日碰撞（写死）

先扫：

- `src/content/posts/ai-morning-brief-YYYY-MM-DD/`
- `src/content/posts/_draftbox/ai-morning-brief-YYYY-MM-DD/`

| 情况 | 动作 |
|---|---|
| `posts/` 已有该日正式帖 | **禁止覆盖**。跳过该日。用户要补漏：用下一个未占用日期，或仅当用户点名才用 `-b` 后缀 |
| 该日是 `2026-08-13` | **永不以橘鸦稿覆盖**（IT之家第一期）。最多加一句不伤结构的脚注：下期起主源改橘鸦 RSS（正文用全角「：」） |
| 仅 `_draftbox/` 有该日 | 默认**更新**该草稿（仍 `draft: true`），除非用户说跳过 |
| 两边都没有 | 按「落盘分流」落盘 |

最新橘鸦期若是 08-12、而 08-13 已占用：草稿写 `ai-morning-brief-2026-08-12`，不要去改 08-13 正文结构。

### 6. 落盘分流

| 用户口令 | 路径 | `draft` | git / 级联 |
|---|---|---|---|
| 没说发 / 草稿 / 先本地 | `_draftbox/ai-morning-brief-YYYY-MM-DD/` | `true` | **禁止** `git add` 箱内正文；**禁止** `--emit-dynamic` |
| 「发 / 从草稿箱出来 / 可以发了」 | `posts/ai-morning-brief-YYYY-MM-DD/` | `false` | validate → `site-cascade --emit-dynamic`；确认后才 commit/push |

封面：复制 `public/assets/collections/ai-morning-brief.jpg` 为该帖 `cover.jpg`（小封面可留 git）。正文大图走 R2，见「配图与 R2」。默认禁止 MiniMax 付费生图。

### 7. 校验与收尾

```bash
python .cursor/skills/ob2blog/scripts/validate_post.py src/content/posts/_draftbox/ai-morning-brief-YYYY-MM-DD/index.md
```

正式发把路径换成 `src/content/posts/...`，再：

```bash
python .cursor/skills/site-cascade/scripts/cascade_check.py --slug ai-morning-brief-YYYY-MM-DD --emit-dynamic --blurb "口语短批注"
```

草稿箱不跑 `--emit-dynamic`。未获准不 `git commit` / `push`。

## 工作区根是上一级 `blog/` 时

仓内真源是 `Firefly/.cursor/skills/ai-morning-brief/`。若 Cursor 工作区根是 `blog/`，按 `AGENTS.md` 在 `blog/.cursor/skills/ai-morning-brief` 建 **目录联接（junction）** 指向本目录；`Firefly/.agents/skills/` 与全局 `~/.agents` / `~/.claude` 同名目录亦应是 junction。**不要物理复制正文**。本技能不在 `blog/` 下建副本。

## 汇报（每次跑完）

- 橘鸦期号 / RSS `lastBuildDate`
- 选了哪几条、各条 P0/P1、为什么
- 每条配了几张图、R2 公网 URL 是否 GET 200（失败写原因和下一步，不装成功）
- 落盘路径（draftbox 还是 posts）
- `validate_post.py` 结果
- 是否 emit 动态（草稿必须否；已有「新笔记」动态的 slug **不要重复** `--emit-dynamic`）
- 未决：等园主说「可以发了」再出箱
