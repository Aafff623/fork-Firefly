---
name: github-weekly-hot
description: >-
  把 IT咖啡馆《Github一周热点》官方 Atom 当成选题目录，抽出仓库 URL，
  对照 GitHub 公开页写成 Firefly「GitHub 每周热榜」合集一期（判断稿，不搬原文）。
  触发词：跑一期热榜、写 GitHub 周榜、GitHub 每周热榜、github weekly、
  IT咖啡馆周刊、github-weekly-hot、githubweekly。
  默认进 _draftbox；用户说「发 / 从草稿箱出来 / 可以发了」才出箱 + validate_post + site-cascade。
compatibility: Firefly 项目根。Python 3 stdlib（validate_post.py）。Windows PowerShell OK。
---

# github-weekly-hot — 周刊目录 → 园主视角热榜

IT咖啡馆官方周刊当**项目目录**，按 [`references/owner-priority.md`](references/owner-priority.md) 筛 3–7 个仓，写成合集 `github-weekly-hot` 一期。Firefly 发的是核对过的判断，不是周刊正文搬家。

合集已登记：`src/config/collectionsConfig.ts` → slug `github-weekly-hot`。分类词表：「开源」（`CONTEXT.md`）。成帖红线同 `knowledge-output`（无 H1、`title` 无 emoji/颜文字、半角冒号改全角「：」、英文 em dash / en dash 归零、禁课件腔标题）。

## 何时用 / 不用

- **用**：用户说「跑一期热榜 / 写 GitHub 周榜 / GitHub 每周热榜」。
- **不用**：Obsidian → `ob2blog`；Knowledge → `knowledge-output`；日更图卡 `github-trending-11-cards-*` 不是本合集。默认禁止 MiniMax 付费生图，除非用户当场授权合集封面。

## 信息源（只订这一条主源）

| 项 | URL |
|---|---|
| Atom（主入口） | `https://itcoffee66.github.io/githubweekly/feed.xml` |
| 文字版站点 | `https://itcoffee66.github.io/githubweekly/` |
| 该期 HTML | `https://itcoffee66.github.io/githubweekly/{n}.html` |
| 该期 Markdown（只抽目录） | `https://raw.githubusercontent.com/itcoffee66/githubweekly/main/_weekly/{n}.md` |
| 源码仓 | `https://github.com/itcoffee66/githubweekly` |
| B 站空间（片单） | `https://space.bilibili.com/65564239` |

禁止把公共 RSSHub、微信公众号、掘金旧专栏、CSDN 转写当主源。不要订仓库根 `rss.xml`。掘金专栏约停在 42 期；文字仓常比视频晚几天。**feed 没有的期号不要编。** 视频已出、文字未出：最多汇报「B 站可能已更新、feed 仍停在 N」，不要靠口播凑一期。

## 引用口径（版权）

`githubweekly` **没有 LICENSE**。`CONTRIBUTING.md` 只允许往他们自己的 Jekyll 站加稿，不是转载许可。

每条只写：

1. **仓库全名**（`owner/repo`，链 GitHub）
2. **园主判断**（人话；依据 README / 许可证 / 最近 push / 自己核对的 stars）
3. 文末「本期参考」：该期 `{n}.html` + 对应 B 站 BV（查到才链）

禁止：整段摘抄 `_weekly/*.md`、blockquote 复述金句、搬周刊封面、把口播写成正文、把 CSDN「转写来源：IT咖啡馆」洗成自己的原文。

安全向仓库（逆向、渗透、扫描器）：只写它是什么、适合谁、授权边界。禁止利用步骤、payload、PoC。

## 工作流

```
1 fetch   → Atom feed.xml
2 parse   → 最新期号、标题、summary、/{n}.html
3 catalog → 拉 _weekly/{n}.md，只抽「## N. 名称」+ github.com 链接
4 filter  → references/owner-priority.md 筛 3–7 个仓库
5 verify  → README / 许可证 / 最近 push / stars
6 write   → 判断稿；文首声明目录来自周刊、正文不搬
7 images  → 每仓一张 banner/OG；Web 化后上传 R2
8 place   → 同号碰撞规则决定 slug / 草稿或正式
9 cover   → 有合集封面文件才拷到该帖 cover.jpg
10 gate   → 没说「发」：_draftbox + draft: true，validate，不 emit
            说「发」：出箱 + draft: false + validate + site-cascade --emit-dynamic
```

### 1. 拉取与解析

在 Firefly 根目录（Windows 用 `curl.exe`）：

```powershell
curl.exe -sS -L -A "Mozilla/5.0" --max-time 30 -o "$env:TEMP/githubweekly-feed.xml" "https://itcoffee66.github.io/githubweekly/feed.xml"
```

记下期号 `N`、`<published>`（用作 `published`）、`<summary>`（只当筛选短名）、原文 `https://itcoffee66.github.io/githubweekly/{n}.html`。`<updated>` 是站点最近生成时间，可能晚于 `<published>`。

目录不够用时再拉 raw Markdown。只保留 `## 数字. 项目名` 和行内 `https://github.com/owner/repo`。丢掉段落评论、「one more thing」资料分享（除非用户点名且资料本身是可链的公开报告）。

### 2. 筛选

读 [`references/owner-priority.md`](references/owner-priority.md)。选出 **3–7 个仓库**。P0 优先；P0 不足再补 P1；P2 默认不写。不够 3 个就少写，不要凑数。

### 3. 成稿（本合集额外）

1. 文首必须声明：本期项目目录来自 IT咖啡馆周刊第 N 期，正文不搬，判断来自 GitHub 公开页。
2. H2 用 `owner/repo`；可用站点已有的 `::github{repo="owner/repo"}`，不要另做图卡流水线。
3. 文末「本期参考」后停。不要「总结」节。
4. 成稿过 humanizer-tta；禁止「调用了 skill」等工具痕迹。
5. `published` = 周刊期号日。`updated` = 落盘当下（含时分）。

Frontmatter 模板：

```yaml
title: GitHub 每周热榜第 124 期：短钩子判断句
published: 2026-07-25          # 周刊 <published> 日期
updated: 2026-08-13T01:40:00   # 落盘当下，带时分
description: 一两句。点名筛了哪几个仓、判断是啥。
image: ./cover.jpg
tags: [开源, GitHub, …命中的工具/项目]
category: 开源
collections: [github-weekly-hot]
sourceLink: https://itcoffee66.github.io/githubweekly/124.html
draft: true                    # 正式发才改 false
lang: ''
slug: github-weekly-hot-124
pinned: false
comment: true
```

### 4. 配图与 R2

- **每条至少一张相关图**。优先：仓库 banner / OG / README 演示帧。不要空洞装饰图，不要 MiniMax 乱画。
- **正文大图不进 git**：上传 Cloudflare R2 后用公网 URL。桶 **`firefly-comment`**，公网 **`https://img.threetwoa.live`**。object key：`posts/github-weekly-hot-{N}/<ascii-name>.jpg`。不要写到 `threetwoa-blog-assets`（该桶无 `img.` 域），不要用 GitHub raw 当长期图。
- Web 化：转 JPG；过宽压到约 1200–1600px。上传后必须 `GET` 该公网 URL，确认 **HTTP 200** 再写入 markdown。失败就汇报卡点，禁止假装已上 R2。
- 密钥只读本机 env / `.env`，不入库、不打印。上传途径同早报：`R2_*` SigV4、Cloudflare API `PUT .../r2/buckets/firefly-comment/objects/{key}`、或 `npx wrangler r2 object put`。本地缓存放 `.scratch/` 或 `%TEMP%`（已 gitignore）。
- 合集小封面 `public/assets/collections/github-weekly-hot.jpg` 可入库；有该文件才拷为该帖 `cover.jpg` 并写 `image: ./cover.jpg`。没有就留空。

正文写法：

```markdown
![说明](https://img.threetwoa.live/posts/github-weekly-hot-N/foo.jpg)

*图：一句话说明。来源：[仓或官网](https://example.com)（抓取日）。*
```

### 5. 同号碰撞（写死）

先扫 `src/content/posts/github-weekly-hot-{N}/` 与 `src/content/posts/_draftbox/github-weekly-hot-{N}/`。

| 情况 | 动作 |
|---|---|
| `posts/` 已有该期正式帖 | **禁止覆盖**。跳过该期。用户要补漏：仅当用户点名才用 `-b` 后缀 |
| 仅 `_draftbox/` 有该期 | 默认**更新**该草稿（仍 `draft: true`），除非用户说跳过 |
| 两边都没有 | 按第 6 步落盘 |
| feed 最新期已写过、没有更新 | 停手汇报，不要拿 GitHub Trending 日榜冒充「第 N+1 期」 |

已有日更卡 `github-trending-11-cards-*` **不要**改 `collections` 塞进本合集。

### 6. 落盘分流

| 用户口令 | 路径 | `draft` | git / 级联 |
|---|---|---|---|
| 没说发 / 草稿 / 先本地 | `_draftbox/github-weekly-hot-{N}/` | `true` | **禁止** `git add` 箱内正文；**禁止** `--emit-dynamic` |
| 「发 / 从草稿箱出来 / 可以发了」 | `posts/github-weekly-hot-{N}/` | `false` | validate → `site-cascade --emit-dynamic`；确认后才 commit/push |
| 园主说已抽查、草稿也要入库 | 仍可留在 `_draftbox/` | `true` | 仅该期 `git add -f`；不要改 `.gitignore` 全局放行 |

### 7. 校验与收尾

```bash
python .cursor/skills/ob2blog/scripts/validate_post.py src/content/posts/_draftbox/github-weekly-hot-N/index.md
```

正式发把路径换成 `src/content/posts/...`，再：

```bash
python .cursor/skills/site-cascade/scripts/cascade_check.py --slug github-weekly-hot-N --emit-dynamic --blurb "口语短批注"
```

草稿箱不跑 `--emit-dynamic`。未获准不 `git commit` / `push`。

## 工作区根是上一级 `blog/` 时

仓内真源是 `Firefly/.cursor/skills/github-weekly-hot/`。若 Cursor 工作区根是 `blog/`，按 `AGENTS.md` 在 `blog/.cursor/skills/github-weekly-hot` 建 **目录联接（junction）** 指向本目录；不要物理复制正文。本技能不在 `blog/` 下建副本。

## 汇报（每次跑完）

- 周刊期号 / feed `<updated>` / `<published>`
- 目录里有哪些仓、选了哪几个、各条 P0/P1、为什么
- 每个入选仓的 GitHub URL（已打开核对）
- 每条配图的 R2 公网 URL 是否 GET 200（失败写原因）
- 落盘路径（draftbox 还是 posts）
- `validate_post.py` 结果
- 是否 emit 动态（草稿必须否）
- 未决：等园主说「可以发了」再出箱；文字仓落后视频时据实写
