---
name: dynamic-post
description: >-
  在 Firefly 博客发布一条「最新动态」（碎碎念 / 心情 / 进展 / 吐槽 / 配图分享）。
  触发词：发个动态、发布动态、写条动态、dynamic、碎碎念、发个心情、记录一下此刻、
  帮我发一条、new-dynamic、动态配图、同步一条动态到博客。任何「把一句即时的想法/状态/图片
  发到博客动态流」的诉求都用本技能——轻量、单条、即时，区别于 knowledge-output（长文成帖）
  与 ob2blog（Obsidian 同步）。本技能熟悉动态全链路：内容集合 schema、API 图片抽取、
  kind 启发式分类、配图缩略图规范、侧栏/时间线渲染、pnpm new-dynamic 脚本。
compatibility: 默认博客仓库根 D:\OneDrive\Desktop\blog\Firefly（含 src/content.config.ts）。配图压缩用 Python PIL（可选）。
---

# dynamic-post — Firefly 最新动态发布

把一句即时的想法、状态、心情或配图，发布成博客「最新动态」流里的一条。动态是**短内容**——不进 `posts/`、不走成帖流程、不需要标题，发完即时出现在 `/dynamic/` 时间线和首页侧栏。

本技能是**唯一真源**，全局 `~/.agents/skills/dynamic-post/` 是指向本目录的 junction（防漂移）。在任意工作区都可触发——若当前不在博客仓库，先按「第 0 步」定位仓库再落盘。

## 第 0 步：定位博客仓库

默认博客仓库根：`D:\OneDrive\Desktop\blog\Firefly`（含 `src/content.config.ts`）。

- 当前已在该仓库内 → 直接用。
- 不在 → 先确认仓库存在（`ls "D:/OneDrive/Desktop/blog/Firefly/src/content/dynamic"`）；用户告知了别的路径时以用户为准。
- 后续所有路径都相对博客仓库根。

## 何时用 / 不用

- **用**：发一条即时动态、碎碎念、心情、进展、吐槽，或带一两张配图的分享；在别的工作区想「把这段感想同步到博客动态」。
- **不用**：有主题、有结构、值得长期归档的长内容 → 走 `knowledge-output`（成帖）或 `ob2blog`（Obsidian）。动态 ≠ 博客文章。

## 动态的本质（先理解，再动手）

动态流是**时间线**，读者扫的是「文字主体 + 可选小配图」：

- **文字永远是主体**：一两句话，最多一个短段落或列表，别写成小作文。
- **配图是点缀**：流里以缩略图呈现（单图约 16rem 宽 / 11rem 高，多图成网格），点击才看大图。图「粗略可读」即可，细节交给点击放大。
- **即时性**：带当前时间戳，是「此刻」的记录，不追求永恒价值。

## 发布流程（四步）

```
1 取时间   → 当前本地时间（siteConfig.timezone，默认 Asia/Shanghai）
2 定类型   → 按内容预判 kind（见下），决定要不要配图、怎么配
3 落盘     → 写 src/content/dynamic/YYYY-MM-DD-HHMMSS.md（frontmatter 仅 published）
4 配图     → 有图则压到规范尺寸，放 public/assets/dynamic/，正文引用
```

### 1. 时间与文件名

- 文件名：`src/content/dynamic/{YYYY-MM-DD-HHMMSS}.md`（如 `2026-08-07-093015.md`）
- frontmatter：`published: YYYY-MM-DD HH:MM:SS`
- 纯文字快捷方式：`pnpm new-dynamic "<内容>"`（自动生成时间戳文件）；有图或需精细控制时直接 Write。

### 2. 动态类型（kind 启发式）

kind 由 `src/utils/dynamic-utils.ts` 的 `detectDynamicKind` 在客户端**自动判定**，frontmatter 不用写。理解规则能帮你预判渲染效果：

| kind | 判定条件 | 视觉 | 适用 |
|---|---|---|---|
| `gallery` 图集 | 图片 >1 张 | 缩略图网格 | 多图分享 |
| `note` 笔记 | 含「发布了新笔记」或 `/posts/` 链接 | 笔记样式（引用块批注） | 发文联动 |
| `status` 动态 | 其余（0 或 1 张图） | 纯文字 / 文字+单图 | 大多数碎碎念 |

手动发的动态几乎都是 `status`（单图）或 `gallery`（多图）。若要链到某帖，用 `/posts/{slug}/` 链接会被判成 `note`（合理）；但别用「发布了新笔记」开头——那是 `site-cascade` 发新帖时的句式，重复了。

### 3. 正文写法

- 直接写 markdown 正文，**不要标题**（动态没有 title 概念）。
- 口语、第一人称、像发推/发朋友圈。可有 emoji / 颜文字。
- 支持列表、链接、引用块。
- frontmatter 只写 `published`（必填）+ 可选 `pinned` / `location`（默认取 `dynamicConfig.defaultLocation`）。

**纯文字示例**：

```markdown
---
published: 2026-08-07 09:30:15
---

今天把拖了一周的重构收尾了，爽。
```

**带图示例**：

```markdown
---
published: 2026-08-07 09:30:15
---

登上 K12 的炸弹车了 💣 真怕明天早上一起来就被封。

![K12 中转车，10 个号全部可用](/assets/dynamic/k12-train.jpg)
```

### 4. 配图规范（重点，别踩坑）

配图处理不当会让图在流里撑得巨大、喧宾夺主。规范：

- **存放**：`public/assets/dynamic/<名字>.jpg`（ASCII 文件名）。
- **引用**：`![描述](/assets/dynamic/名字.jpg)`（推荐绝对路径，简单不易错；相对路径 `./xxx.jpg` 会被 API 解析到 `/assets/dynamic/<entryId>/xxx.jpg`）。
- **压缩**：原图（尤其截图，常 2560px 宽）先压缩再入库——宽度 ≤1200px，JPG quality 85：

```python
from PIL import Image
im = Image.open("原图.png").convert("RGB")
if im.width > 1200:
    im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
im.save("public/assets/dynamic/名字.jpg", "JPEG", quality=85, optimize=True)
```

- **数量**：1 张 → status 单图缩略；多张 → gallery 网格（最多显示 6，多的折叠 +N）。
- **敏感信息**：图含密钥/token/完整邮箱先提醒用户打码——动态是公开的。

## 发布后（自动生效，无需手动）

动态落盘后，以下模块**自动**读取，不用改任何代码：

- `/api/dynamic.json` —— 重新生成，抽取图片、渲染 HTML、判定 kind
- `/dynamic/` 时间线 —— `DynamicTimeline.tsx` + `dynamic-gallery` 渲染缩略图与大图
- 首页侧栏「最新动态」—— `widget/Dynamic.astro` 读同一 API

dev 服务器（`pnpm dev`）下保存即热更新，直接刷新 `/dynamic/` 预览。**不需要跑 site-cascade**（那是发新帖后的级联；动态本身不触发统计/热力图变化）。

## Agent 协作者评论（可选，第 5 步）

发布动态后，可用**当前发布工具自己的身份**在对应动态评论区附加一条评论（协作者点评 / 状态补充），形成「动态 + 我的视角」闭环。每个 AI 工具 agent 有独立 Waline 账号 + 昵称 + 头像 + 语气（见 blog `src/config/agentPersonas.ts`）。

- **当前工具 key**：claude-code / cursor / pi / opencode / codex（自己用什么工具发布就用哪个 key；账密见各自 AGENTS.md「Agent 协作者评论」小节）
- **调用**（在 blog 根）：
  ```bash
  MSYS_NO_PATHCONV=1 NODE_USE_ENV_PROXY=1 \
  npx tsx scripts/agent-comment.ts --agent <key> --comment "<内容>" --path "/dynamic/{entryId}/" --password <pw>
  ```
- **entryId** = 刚落盘的动态文件名（如 `2026-08-07-093015`）；评论 path 按单条动态隔离
- **必带两个 env**：`NODE_USE_ENV_PROXY=1`（Node fetch 走 `HTTPS_PROXY=127.0.0.1:7892`，否则 Vercel 直连超时）+ `MSYS_NO_PATHCONV=1`（防 Git Bash 把 `/dynamic/` 转义成 `C:/Program Files/Git/...`）
- **限流**：Waline 同 IP 连续评论报 `Comment too fast!`，需间隔 ~60s
- **语气**：按 `agentPersonas[key].tone` 的人格写评论（自己的风格，不模板化）

## 验收

- 刷新 `/dynamic/`，确认新动态在最顶部（除非有置顶）、时间正确、kind 标签符合预期。
- 配图：缩略图尺寸合理（不撑满）、点击能开 Fancybox 大图。
- 暗色模式扫一眼。

## 硬规则

1. **动态是短内容**：超过两三段、有标题结构、值得长期归档的，劝用户改走 `knowledge-output` 成帖。
2. **frontmatter 极简**：只写 `published`（必填）+ 可选 `pinned` / `location`。不要 title / description / tags / category——动态没有这些字段。
3. **配图先压缩再入库**：禁止把 2560px 原图直接丢进 `public/`。
4. **敏感信息**：图含密钥/token/完整邮箱先提醒用户。
5. **不伪造 note**：「发布了新笔记」类动态由 site-cascade 在发新帖时自动生成，手动发动态别用这个句式开头。

## 多 Agent 协作纪律

本仓是多 agent 并行工作区，各 agent 负责不同业务模块。发布动态时：

- 看到 `src/content/dynamic/` 里有非自己发布的文件变动：正常，是其他 agent 的在制品，不要疑惑、不要碰。
- 只 add 自己创建的那条动态文件；commit 前查 `git status` 确认无他人在制品夹带。
- 不杀/不重启他人服务或 dev server。

## 参考

- 内容集合 schema：`src/content.config.ts`（dynamicCollection：published/pinned/location）
- 图片抽取与 API：`src/pages/api/dynamic.json.ts`
- kind 启发式：`src/utils/dynamic-utils.ts`（detectDynamicKind）
- 渲染：`src/components/pages/dynamic/react/DynamicTimeline.tsx`、`dynamic-gallery.ts`
- 样式：`src/styles/dynamic.css`（gallery 网格 / 单图缩略图尺寸）
- 配置：`src/config/dynamicConfig.ts`（defaultLocation、itemsPerPage、memos）
- 快捷脚本：`scripts/new-dynamic.js`（`pnpm new-dynamic`）
