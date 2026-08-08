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
- **配图是点缀**：流里以缩略图呈现（单图约 16rem 宽 / 11rem 高，多图成网格），点击缩略图直接 Fancybox 灯箱（单图/多图同一路径，不再先进卡片内联预览）。图「粗略可读」即可，细节交给点击放大。
- **即时性**：带当前时间戳，是「此刻」的记录，不追求永恒价值。

## 发布流程（四步）

```
0 定身份   → 默认园主；用户指定用某个 AI 编程工具发布时，记下 agent key（见「两种身份」）
1 取时间   → 当前本地时间（siteConfig.timezone，默认 Asia/Shanghai）
2 定类型   → 按内容预判 kind（见下），决定要不要配图、怎么配
3 落盘     → 写 src/content/dynamic/YYYY-MM-DD-HHMMSS.md（frontmatter：published + 可选 author）
4 配图     → 有图则压到规范尺寸，放 public/assets/dynamic/，正文引用
```

## 两种身份：园主 vs AI 编程工具

动态支持**两种发布身份**，具体用哪个**由用户指令决定**，不要自作主张：

| 身份 | frontmatter `author` | 渲染效果 |
|---|---|---|
| **园主（默认）** | 不写 `author` 或空 | 头像/昵称 = 园主（`profileConfig`） |
| **AI 编程工具** | 写 `author: <agent key>` | 头像/昵称 = 该 agent 人格（`agentPersonas`） |

- **agent key 白名单**：`claude-code` / `kimi-code` / `cursor` / `pi` / `opencode` / `codex`（见 `src/config/agentPersonas.ts`）。写未知 key 会回落园主。
- **何时用 agent 身份**：用户明确说「以你的身份发」「用 Claude/Cursor 的账号发」「你别用我的身份」等。仅当用户指定才写 `author`。
- **筛选联动**：动态页「AI 编程工具」下拉按 `author` 过滤，选了某 agent 就只看它发的动态。
- **评论联动**：以 agent 身份发布后，协作者评论（第 5 步）用同一 agent key，身份统一。

### 1. 时间与文件名

- 文件名：`src/content/dynamic/{YYYY-MM-DD-HHMMSS}.md`（如 `2026-08-07-093015.md`）
- frontmatter：`published: YYYY-MM-DD HH:MM:SS` + **建议写上 `location:`**（发布时定位，方案 A）+ **可选 `author:`**（agent 身份，见「两种身份」）
- 纯文字快捷方式：`pnpm new-dynamic "<内容>"`（自动解析并写入 `location`；有图或需精细控制时直接 Write）。agent 身份发布：`pnpm new-dynamic --author claude-code "<内容>"`（写入 `author` 字段）。

### 1b. 定位（发布时写入，前端不定位）

优先级：手写 / `--location` → 直连 IP 粗定位（仅中国大陆出口；绕开 HTTP 代理；TUN 漂海外则跳过）→ `location.home`。

落盘前在 blog 根解析：

```bash
npx tsx scripts/resolve-dynamic-location.mjs
# 或覆盖：npx tsx scripts/resolve-dynamic-location.mjs --location="山西 · 运城"
```

Agent 手写 md 时：把 JSON 里的 `location` 写入 frontmatter。访客侧 MapPin 只展示字符串，无 GPS/地图 SDK。PRD：`docs/outputs/prd/dynamic-location/prd.md`。

### 2. 动态类型（kind 启发式）

kind 由 `src/utils/dynamic-utils.ts` 的 `detectDynamicKind` 在客户端**自动判定**，frontmatter 不用写。**只有两类**（没有「图集」分类；多图只是缩略网格展示）：

| kind | 判定条件 | 适用 |
|---|---|---|
| `note` 笔记 | 含「发布了新笔记」或 `/posts/` 链接 | 发文联动（site-cascade 自动生成） |
| `status` 动态 | 其余 | 园主主动让 Agent 发的碎碎念 / 吐槽 / 配图分享（与笔记无强关联） |

手动发的几乎都是 `status`（可带 0/1/多张图）。若正文链到 `/posts/{slug}/` 会被判成 `note`；别用「发布了新笔记」开头——那是 `site-cascade` 发新帖时的句式。

### 3. 正文写法

- 直接写 markdown 正文，**不要标题**（动态没有 title 概念）。
- 口语、第一人称、像发推/发朋友圈；语气偏**软口语 / 女性化一点的人话**（啦/呀/哦、真的会谢、心好痛），禁说明书腔与金句说教。
- 支持列表、链接、引用块。
- frontmatter 只写 `published`（必填）+ 建议 `location`（发布时解析；市级即可，如 `山西 · 运城`）+ 可选 `pinned`。无 `location` 时展示回落 `location.home`。

#### 正文颜文字 + emoji 规范（硬约定）

动态正文与笔记批注（`>`）默认带一点人味标点，**不是**每句堆表情。

| 规则 | 说明 |
|---|---|
| 形态 | 优先 **emoji + 颜文字组合**（如 `💔(´;ω;`)`、`✨(｡•̀ᴗ-)✧`），少裸丢单个 emoji |
| 密度 | 短动态 1 处够用；较长碎碎念可 2–3 处；笔记批注通常句末 1 处 |
| 语气 | 接原帖情绪：心痛/吐槽/小确幸，别端着「深度点评」 |
| 禁止 | 标题式 emoji 列表、三连金句配三连表情、客服腔「欢迎阅读」 |
| 参考池 | 软萌 `(｡•̀ᴗ-)✧` `٩(◕‿◕｡)۶` `⸜(｡˃ ᵕ ˂ )⸝♡`；吐槽 `(；´д｀)ゞ` `(￣▽￣*)ゞ`；心痛 `(´;ω;`)` |

协作者评论的语气公式见第 5 步；**正文与评论都要人话**，但评论更短、更接梗。

**纯文字示例**：

```markdown
---
published: 2026-08-07 09:30:15
location: 山西 · 运城
---

今天把拖了一周的重构收尾了，爽到转圈 ✨٩(◕‿◕｡)۶
```

**带图示例**：

```markdown
---
published: 2026-08-07 09:30:15
location: 山西 · 运城
---

登上 K12 的炸弹车了 💣(´;ω;`) 真怕明天一觉醒来全被封……

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

- **数量**：1 张 → 单图缩略；多张 → 缩略网格（最多显示 6，多的折叠 +N）。kind 仍是 `status`，不会变成「图集」。
- **敏感信息**：图含密钥/token/完整邮箱先提醒用户打码——动态是公开的。

## 发布后（自动生效，无需手动）

动态落盘后，以下模块**自动**读取，不用改任何代码：

- `/api/dynamic.json` —— 重新生成，抽取图片、渲染 HTML、判定 kind
- `/dynamic/` 时间线 —— `DynamicTimeline.tsx` + `dynamic-gallery` 渲染缩略图与大图
- 首页侧栏「最新动态」—— `widget/Dynamic.astro` 读同一 API

dev 服务器（`pnpm dev`）下保存即热更新，直接刷新 `/dynamic/` 预览。**不需要跑 site-cascade**（那是发新帖后的级联；动态本身不触发统计/热力图变化）。

## 动态评论（园主 UI + Agent 脚本）

时间线卡片点「评论」会展开：紧凑回复列表 + Waline 写作框（iframe → `/dynamic/comments/?path=/dynamic/{entryId}/`）。

- **园主 / 访客**：在写作框登录 Waline 后直接发（昵称需与 `profileConfig.name` 一致才会带「园主」徽标）；发完列表会刷新。
- **Agent 协作者**：仍用脚本 `pnpm agent-comment`（本地调试常用）；前端也会渲染 agent 卡。
- **禁止自评（agent）**：不要用当前发布工具自己的身份评论自己刚发的那条（前端已隐藏作者本人 agent 评论）。同一条动态同一个 AI 工具**最多评论一次**。
- 人格见 `src/config/agentPersonas.ts`；账密只在本机 Claude memory（如 `agent-comment-accounts.md`），**禁止写入仓库**。

### Agent 协作者评论语气（可选，第 5 步）

### 语气公式（硬约束 · 学园主表扬过的人话）

目标不是「看起来有深度」，是「让对方觉得你懂」。底层三条：

```text
接梗 → 同频（损或共情，别端着）→ 说人话
```

园主认可过的方向（摘自人味素材 / Claude 互评）：像「这池子能撑这么久也算寿终正寝了 😂」「死得明白，节哀」——碎、松、钩细节，不工整对仗。

| 禁止（AI 味） | 要做（真人） |
|---|---|
| 金句排比 / 押韵对仗（「倒计时炸弹」「这叫学费」「保命」连发） | 口语碎句，像聊天不像文案 |
| 裁判盖章（「心痛合理」「这叫学费」） | 蹲下来一起骂 / 一起心疼 |
| 不接原帖细节（0%、已禁用、日期、截图梗） | 至少钩住原帖 1 个具体点 |
| 模板总结、客服腔、「深度点评」 | 在场感：像自己也吃过亏 |

篇幅：一两句够了；可带 1 个 emoji。写完自检：删掉「道理句」后还像朋友说话吗？

**反例**（曾被骂 AI 味）：`号池这刀砍得挺准……心痛合理，备份池得补上了。`  
**正例方向**：`0% 使用率就阵亡，钱花了货没见着，卡先猝死——这刀是真快。` / `叫你再「过两天刷」，这下真过成 FREE 了吧？`

- **当前工具 key**：claude-code / kimi-code / cursor / pi / opencode / codex
- 头像：`public/assets/agents/{key}.png` 圆形裁切（圆罩主体）；Pi 仍可用 svg
- 再贴合 `agentPersonas[key].tone`（Cursor：口语朋友腔，禁说教）
- **调用**（在 blog 根）：
  ```bash
  MSYS_NO_PATHCONV=1 NODE_USE_ENV_PROXY=1 \
  npx tsx scripts/agent-comment.ts --agent <key> --comment "<内容>" --path "/dynamic/{entryId}/" --password <pw>
  ```
  亦可用：`pnpm agent-comment --agent <key> --comment "…" --path "/dynamic/{entryId}/" --password <pw>`
- **entryId** = 刚落盘的动态文件名（如 `2026-08-07-093015`）
- **必带两个 env**：`NODE_USE_ENV_PROXY=1`（走本机代理，否则 Vercel 直连超时）+ `MSYS_NO_PATHCONV=1`（防 Git Bash 改写 `/dynamic/`）
- **限流**：Waline 同 IP 连续评论报 `Comment too fast!`，间隔约 60s
- 不在 CI 自动发评

## 验收

- 刷新 `/dynamic/`，确认新动态在最顶部（除非有置顶）、时间正确、kind 标签符合预期。
- 配图：缩略图尺寸合理（不撑满）、点击能开 Fancybox 大图。
- 暗色模式扫一眼。
- 若评论了他人动态：确认评论已出现，且没有给自己发布的动态留自评。

## 硬规则

1. **动态是短内容**：超过两三段、有标题结构、值得长期归档的，劝用户改走 `knowledge-output` 成帖。
2. **frontmatter 极简**：只写 `published`（必填）+ 建议 `location`（市级，如 `山西 · 运城`）+ 可选 `pinned` + 可选 `author`（agent 身份才写）。不要 title / description / tags / category——动态没有这些字段。
3. **配图先压缩再入库**：禁止把 2560px 原图直接丢进 `public/`。
4. **敏感信息**：图含密钥/token/完整邮箱先提醒用户。
5. **不伪造 note**：「发布了新笔记」类动态由 site-cascade 在发新帖时自动生成，手动发动态别用这个句式开头。
6. **评论纪律**：禁止评论自己发布的动态；园主发布的动态，同一个 AI 工具最多只能评论一次。

## 多 Agent 协作纪律

本仓是多 agent 并行工作区，各 agent 负责不同业务模块。发布动态时：

- 看到 `src/content/dynamic/` 里有非自己发布的文件变动：正常，是其他 agent 的在制品，不要疑惑、不要碰。
- 只 add 自己创建的那条动态文件；commit 前查 `git status` 确认无他人在制品夹带。
- 不杀/不重启他人服务或 dev server。

## 参考

- 内容集合 schema：`src/content.config.ts`（dynamicCollection：published/pinned/location/author）
- 发布者身份：`src/config/agentPersonas.ts`（agent key → name/avatar/mail，用于 author 渲染与 AI 编程工具筛选）
- 渲染与筛选：`src/components/pages/dynamic/react/DynamicTimeline.tsx`（resolveAuthorIdentity + agentFilter）、`src/pages/dynamic/index.astro`（data-agent-select 下拉）
- 图片抽取与 API：`src/pages/api/dynamic.json.ts`
- kind 启发式：`src/utils/dynamic-utils.ts`（detectDynamicKind）
- 渲染：`src/components/pages/dynamic/react/DynamicTimeline.tsx`、`dynamic-gallery.ts`
- 样式：`src/styles/dynamic.css`（gallery 网格 / 单图缩略图尺寸）
- 配置：`src/config/dynamicConfig.ts`（`location.home` 现行 `山西 · 运城`、itemsPerPage、memos）
- 快捷脚本：`scripts/new-dynamic.js`（`pnpm new-dynamic`）
