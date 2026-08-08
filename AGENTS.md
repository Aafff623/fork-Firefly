# AGENTS.md

> **Output Style**: `humanizer-tta` skill — 统一语气与去 AI 味。路径：`~/.claude/skills/humanizer-tta/SKILL.md`  
> **Session Init**: `windows-agent-discipline` skill — **会话启动先读**（Agent 画像警示 / Windows 编码纪律 / 工具调用与交付自检）。路径：`~/.claude/skills/windows-agent-discipline/SKILL.md`  
> **Cursor 宪法（全局 SSOT）**: `%USERPROFILE%\.cursor\rules\AGENTS.mdc` + companions（`answer-format` / `windows-*` / `commit-history` / `karpathy-guidelines`）  
> **仓内 `.cursor/rules/`**: 仅站点专有规则（`seasonal-gift-box` · `site-cascade-after-content`）；禁止再复制全局宪法文件

跨工具 Agent 硬约束与任务流摘要。人读运行说明见 `README.md`；领域事实见 `CONTEXT.md`；用词见 `LANGUAGES.md`。

## 单一事实源

| 类型 | 入口 |
|---|---|
| 领域 / 硬约束 | `CONTEXT.md` |
| 共享用词 | `LANGUAGES.md` |
| 任务流细节 | `docs/agents/workflow.md` |

禁止再维护 `docs/agents/language.md` / `docs/agents/context.md`。

## 路径表

| 用途 | 路径 |
|---|---|
| 产品代码 | `src/` |
| 站点配置 | `src/config/` |
| 文章 | `src/content/posts/` |
| 官方配置文档（本地，gitignore） | `docs/official/` |
| 官方文档路由模型 | `docs/knowledge/official-docs.tree.json` |
| Issue（本地） | `.scratch/<feature>/` |
| 灵感库 | `docs/idea/{theme}/`（有构想再建；只存构想不写代码） |
| PRD / handoff / commit-history | `docs/outputs/{prd,handoff,commit-history}/`（有产物再建） |
| 上游 AGENTS 备份 | 若需要再本地建 `.scratch/project-init-backup/`（目录当前不存在且多在 gitignore） |

## 硬约束

1. **KISS / YAGNI / 外科手术式修改**：只改任务所需行；不顺手重构。
2. **PRD 门禁**：未批准的业务 theme 不写大规模功能代码。
3. **交付闭环**：本地 `pnpm dev` 预览 → 本地校验 → 你确认后 `push` → 等 Vercel → **再核线上**。未本地验收不得 push；未看线上不得宣称部署完成。细则见 `docs/agents/workflow.md`。
4. **密钥**：不入库。
5. **覆盖冲突**：本仓治理文件与上游主题说明冲突时，以本仓 `AGENTS.md` / `CONTEXT.md` 为准；上游原文已备份。
6. **资产禁止空壳**：`CONTEXT` / `LANGUAGES` / `docs/agents/*` / `docs/glossary/*` / `docs/knowledge/*` 必须有可消费正文；缺内容时先调研再写盘，禁止只建空目录或一句话占位。

## 多 Agent 协作纪律

本仓是多 agent 并行工作区，各 agent 负责**不同业务模块**（壁纸 / 音乐 / 配图 / 发文 / 其他）。任务由用户明确布置，通常互不干扰。

- 看到工作区里有**非自己改动的文件变动**：正常，是其他 agent 的在制品，不要疑惑、不要大惊小怪，专注自己的任务。
- 只改自己任务直接相关的文件；改动前查 `git status` 确认无他人在制品夹带。
- 不杀 / 不重启他人的服务或 dev server；共享资源（astron daemon 等）谨慎处置。

## 日常命令

```bash
pnpm install   # 若 npmmirror 404：加 --registry https://registry.npmjs.org
pnpm dev
pnpm check && pnpm type-check
pnpm build
pnpm new-post <slug>
pnpm new-d <content>
```

## Agent skills

项目级 Skill **正文**在 `Firefly/.cursor/skills/`（仓内真源）。若 Cursor 工作区根是上一级 `blog/`，须在 `blog/.cursor/skills/<name>` 建 **目录联接（junction）** 指向 Firefly 内同名 skill；`Firefly/.agents/skills/` 与全局 `~/.agents` / `~/.claude` 下同名目录亦应是 junction，**不要物理复制正文**（防漂移）。

| Skill | 路径 | 何时用 |
|---|---|---|
| `ob2blog` | `.cursor/skills/ob2blog/` | Obsidian→本仓帖 + 双边一致性（`prep_convert` / `sync_check` / manifest）；旧名 `firefly-md-to-post` |
| `knowledge-extract` | `.cursor/skills/knowledge-extract/` | 会话/调研→Knowledge 素材笔记（`D:\OneDrive\Desktop\Knowledge\todo\`）；不直接发帖 |
| `knowledge-output` | `.cursor/skills/knowledge-output/` | Knowledge\todo 素材→`src/content/posts/<slug>`；无参数=全部，带主题=仅指定；发布后移入 Archive；收尾接 `site-cascade` |
| `site-cascade` | `.cursor/skills/site-cascade/` | 发文后级联：最新动态（含新笔记）、站点统计、分类/标签、热力图；配套 rule `site-cascade-after-content.mdc` |
| `firefly-minimax-media` | `.cursor/skills/firefly-minimax-media/` | MiniMax 封面/语音/音乐/短视频；先 `check_quota.py`，URL 用 `fetch_media.py`，视频走 `acquire_video_slot.py` |
| `release-post` | `.cursor/skills/release-post/` | GitHub Release notes / SemVer；先起草，用户明确说「发布」才 `gh release create`；产品版从 `1.0.0` 起；本地中英预览见 `preview-release.html` |
| `wiki-post` | `.cursor/skills/wiki-post/` | GitHub Wiki 手册（Home/FAQ/功能页）；先模块盘点+起草，用户明确说「发布/推送 Wiki」才 push `.wiki.git`；与 `docs/` 不双写 |
| `gsap-*`（官方 8 件） | `.cursor/skills/gsap-{core,timeline,scrolltrigger,plugins,utils,react,performance,frameworks}/` | 写/审 GSAP 动画；源：[greensock/gsap-skills](https://github.com/greensock/gsap-skills)；`skills-lock.json` 可 `npx skills update` |

分工：按源类型选路径（见下）→ 收尾必跑 `site-cascade`；媒体生成走 `firefly-minimax-media`；发版走 `release-post`；建/改 GitHub Wiki 走 `wiki-post`。动画实现优先读对应 `gsap-*`。全局 CLI 另见本机 `~/.cursor/skills/mmx-cli`（非本仓）。工作区根若为上一级 `blog/`，须为上述 skill 建 **junction**（与 `ob2blog` 同做法），否则斜杠命令发现不到。

列表卡标题情绪点缀（emoji / 颜文字）：仅 `PostCard` + `src/utils/title-mood.ts` 展示层；甲乙成帖都**勿**写入 frontmatter `title`（见 `ob2blog` / `knowledge-output` 的 `references/title-mood.md`）。

### 发文双路径（默认 workflow）

按**素材来源**分支；两条路收尾都是 `site-cascade`。

**甲 · Obsidian vault → 帖**

固定 vault（见 `CONTEXT.md`）：`D:\OneDrive\Desktop\Notes\threetwoa_ob`。

```text
用户：/ob2blog + 粘贴本地笔记绝对路径
  → 读文/图（attachmentFolderPath）→ prep/落盘 posts/<slug>
  → sync_check / validate
  → 收尾调用 site-cascade（最新动态含「新笔记」、统计、分类标签、热力图）
  → 本地预览刷新（pnpm dev）
```

Agent 不得假定其它 vault 根路径；用户显式给出新路径时再更新 `CONTEXT.md` + `.ob2blog/manifest.json`。

**乙 · 会话/调研 → Knowledge → 帖**

```text
用户：整理会话 / 写篇博客（非 Obsidian）
  → knowledge-extract（落盘 Knowledge/todo/{日期_主题}/）
  → knowledge-output（转正文 + frontmatter → posts/<slug>；发布后移入 Archive）
  → 收尾调用 site-cascade
  → 本地预览刷新（pnpm dev）
```

仅当素材**已入** Obsidian vault、需要双边同步时，才改走甲路 `ob2blog`；默认会话产出不经 `ob2blog`。

### 草稿箱（draftbox · 本地可预览，不进远端）

本仓对「草稿」的定义：**留在本地供 `pnpm dev` 调试预览，不 `git add` / 不 push**。不是「进仓库但 `draft: true` 藏首页」——那种主题 demo（如 `posts/draft.md`）与草稿箱无关。

| 项 | 约定 |
|---|---|
| 路径 | `src/content/posts/_draftbox/<slug>/` |
| Git | `.gitignore` 忽略箱内正文（仅 `_draftbox/README.md` 入库） |
| FM | 箱内帖必须 `draft: true` |
| 本地 | DEV 可打开 `/posts/<slug>/`（路由剥 `_draftbox/` 前缀）；进列表，且可参与默认置顶大卡 |
| 线上 | 箱内文件不在远端 → Vercel 构建无此文 |
| 进箱 | 用户说「草稿 / 草稿箱 / 先本地调试」→ 落盘 `_draftbox/`，禁止 commit 正文 |
| 出箱 | 用户说「从草稿箱出来 / 可以发了」→ 迁到 `posts/<slug>/`，按需 `draft: false`，再 cascade → 确认后 push |

细则：`docs/agents/workflow.md`「草稿箱」；箱内说明：`src/content/posts/_draftbox/README.md`。

### Issue tracker

本地 Markdown：`.scratch/<feature>/`。见 `docs/agents/issue-tracker.md`。

### Triage labels

五种 canonical 标签（同名映射）。见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文：`CONTEXT.md` + `docs/adr/`。见 `docs/agents/domain.md`。

## 任务流摘要

```text
Issue → (可选 report) → PRD(draft) → 你批准 → handoff → 实施 → Review → commit-history → archive
```

细则：`docs/agents/workflow.md` · 交付：`deliver.md` · 归档：`archive.md`
