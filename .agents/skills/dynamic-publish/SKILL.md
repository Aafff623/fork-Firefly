---
name: dynamic-publish
description: >-
  Firefly 博客发布“最新动态”（碎碎念/心情/进展/吐槽/配图分享）。短内容、单条、
  即时；落盘 src/content/dynamic/ 即出现在 /dynamic/ 时间线 + 首页侧栏。
  取代旧 dynamic-post。任何“发个动态 / 写条动态 / 碎碎念 / 发个心情 / 配图分享 /
  同步一条到博客”触发。
compatibility: Firefly 项目根。Python 3 stdlib（配图压缩用 image_utils）。Windows OK。
---

# dynamic-publish — 发布动态

短内容（一两句口语第一人称），无 title/description/tags/category。落盘即发布，
不进 posts、不走成帖、无封面逻辑。**长文/想沉淀 → 走 post-publish**。

## 触发

发个动态 / 发布动态 / 写条动态 / dynamic / 碎碎念 / 发个心情 / 记录一下此刻 /
帮我发一条 / new-dynamic / 动态配图 / 同步一条动态到博客。

## 工作流

### 0. 定身份

- 默认 = 园主（profileConfig，不写 author）。
- 用户指定由某 AI 工具发布 → frontmatter `author: <agent key>`。
  白名单：claude-code / kimi-code / cursor / pi / opencode / codex（见 `src/config/agentPersonas.ts`）。

### 1. 取时间

本地时间（siteConfig.timezone，默认 Asia/Shanghai）→ 文件名时间戳 `YYYY-MM-DD-HHMMSS`。

### 2. 定类型

kind（note/status）由前端 `detectDynamicKind` 自动判，**FM 不写**。
注意：正文含“发布了新笔记”或 `/posts/` 链接会被判 note；手动发动态别用该句式。

### 3. 落盘

`src/content/dynamic/YYYY-MM-DD-HHMMSS.md`：

```markdown
---
published: 2026-09-03T10:00:00+08:00
location: 山西 · 运城      # 建议；可用 scripts/resolve-dynamic-location.mjs 解析
# author: <agent key>     # 仅 AI 工具代发时
# pinned: false
---
正文一两句口语人话（emoji+颜文字如 💔(´;ω;`) 可用），禁说明书腔。
```

- 正文里想发多个短句 → 直接写；不要加 `#`/加粗堆砌。
- 动态时间 = 发布时间（与 post 同理，不映射笔记时间）。

### 4. 配图（有图时）

有图 → 压缩上 R2 或本地：

```bash
python .agents/skills/_shared/scripts/image_utils.py --file <local> --role dynamic --upload --key dynamic/<stamp>-<name>.webp
```

- 角色 dynamic：长边 ≤1200，webp q80；透明贴深色底。
- 上传成功（R2 URL）→ 正文 `![alt](https://img.threetwoa.live/dynamic/<stamp>-<name>.webp)`。
- 无 R2 凭据 → 降级本地 `public/assets/dynamic/<ascii>.webp` + `![alt](/assets/dynamic/x.webp)`。
- 不发图也完全正常（纯文字动态）。

### 5. 可选：Agent 协作者评论

- 命令：`pnpm agent-comment --agent <key> --comment "…" --path "/dynamic/<entryId>/"`。
- 必带 env：`NODE_USE_ENV_PROXY=1` + `MSYS_NO_PATHCONV=1`（Waline 限流 ~60s）。
- 语气公式：接梗 → 同频 → 说人话（反例：曾被骂 AI 味）。
- 账密只在本机（Claude memory 等），不入库。
- 不评自己刚发的动态；同一条同工具最多评一次。

## 红线

- 短内容，不要长文（长文 → post-publish）。
- 时间用发布时间。
- 配图压缩走 image_utils，大图不裸进 git。
- 身份白名单，不冒充园主（不写 author=园主）。
