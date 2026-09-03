# AGENTS.md

> **Output Style**: `humanizer-tone` skill（全局）— 统一语气、去 AI 味与收尾格式。路径：`~/.agents/skills/humanizer-tone/SKILL.md`<br>
> **全局 Cursor rules**: `%USERPROFILE%\.cursor\rules\`（宪法与 companions 以该目录实际内容为准）<br>
> **仓内 `.cursor/rules/`**: 仅站点专有规则（`seasonal-gift-box` · `site-cascade-after-content`）；禁止再复制全局宪法文件

跨工具 Agent 硬约束与任务流摘要。人读运行说明见 `README.md`；领域事实见 `CONTEXT.md`；用词见 `LANGUAGES.md`。

本仓采用**单 Project 治理模式**（无外部工作区层）：项目内自带统一临时区 `temp/`，承接原工作区的调研 / 交接 / 临时脚本职能。

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
| 成帖红线 / 图片 / 脚本共享 | `.agents/skills/_shared/`（被 post-publish / 早报 / 热榜引用，不是独立 skill） |
| 官方配置文档（本地，gitignore） | `docs/official/` |
| 官方文档路由模型 | `docs/knowledge/official-docs.tree.json` |
| 临时产物（唯一临时区） | `temp/`（分类见 `temp/README.md`；密钥备份 `temp/secrets/`） |
| Issue / 任务调研（本地） | `temp/research/<task-slug>/` |
| 灵感库 | `temp/research/idea/{theme}/`（有构想再建；只存构想不写代码） |
| PRD / commit-history | `docs/outputs/{prd,commit-history}/`（有产物再建） |
| 调研报告 / handoff | `temp/{reports,handoff}/` |

## 硬约束

1. **KISS / YAGNI / 外科手术式修改**：只改任务所需行；不顺手重构。
2. **PRD 门禁**：未批准的业务 theme 不写大规模功能代码。
3. **交付闭环**：本地 `pnpm dev` 预览 → 本地校验 → 你确认后 `push` → 等 Vercel → **再核线上**。未本地验收不得 push；未看线上不得宣称部署完成。细则见 `docs/agents/workflow.md`。
4. **密钥**：不入库。
5. **覆盖冲突**：本仓治理文件与上游主题说明冲突时，以本仓 `AGENTS.md` / `CONTEXT.md` 为准；上游原文已备份。
6. **资产禁止空壳**：`CONTEXT` / `LANGUAGES` / `docs/agents/*` / `docs/glossary/*` / `docs/knowledge/official-docs.tree.json` 必须有可消费正文；缺内容时先调研再写盘，禁止只建空目录或一句话占位。弱关联产物（灵感 / 调研报告 / handoff / 知识文 / 临时脚本）归 `temp/` 对应分类，不在正式目录补建。

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

项目级 Skill **正文（真源）**在 `.agents/skills/`（仓内提交）。`.cursor/skills` 是指向它的 **junction 桥接**（Cursor 工具入口）。全局与各 AI 工具只建 **目录联接（junction）**，禁止复制 SKILL.md。旧入口 `ob2blog` / `firefly-md-to-post` / `knowledge-extract` / `knowledge-output` / `dynamic-post` / `site-cascade` 已并入 `post-publish` / `dynamic-publish` 一条链，仓内不再保留旧 skill 目录。

| Skill | 路径 | 何时用 |
|---|---|---|
| `post-publish` | `.agents/skills/post-publish/` | **发文唯一入口**（用户不必点名渠道）：识别输入（Obsidian 笔记 / 对话提炼 / 外部文章 / 粘贴 / 调研）→ 沉淀 vault → 成帖发布（图片压缩上 R2、封面视觉选图、validate 门禁、cascade 收尾）。落盘进 `threetwoa_ob`。见 `SKILL.md` |
| `dynamic-publish` | `.agents/skills/dynamic-publish/` | 发布短动态（碎碎念/心情/配图分享），落盘 `src/content/dynamic/`，即时上时间线+侧栏。取代旧 `dynamic-post` |
| `ai-morning-brief` | `.agents/skills/ai-morning-brief/` | 橘鸦 RSS → 早报合集一期；默认 `_draftbox/` |
| `github-weekly-hot` | `.agents/skills/github-weekly-hot/` | IT咖啡馆周刊 → 热榜合集一期；默认 `_draftbox/` |
| `release-post` | `.agents/skills/release-post/` | GitHub Release notes / SemVer；先起草，用户明确说「发布」才 `gh release create` |
| `wiki-post` | `.agents/skills/wiki-post/` | GitHub Wiki 手册；用户说「发布/推送 Wiki」才 push `.wiki.git` |
| `gsap-*`（官方 8 件） | `.agents/skills/gsap-{core,timeline,scrolltrigger,plugins,utils,react,performance,frameworks}/` | 写/审 GSAP 动画 |

vault / 图片 / 校验机械脚本在 `_shared/scripts/`（`vault_lib.py` / `image_utils.py` / `upload_r2.py` / `validate_post.py` / `cascade_check.py` 等）；post-publish 的脚本在 `post-publish/scripts/`。映射表仍是 `.ob2blog/manifest.json`。

分工：发文一律 `post-publish`（内置「沉淀 → 成帖 → 发布 → 收尾」一条链），短动态走 `dynamic-publish`。配图只使用已有的本地、官方或合规素材；缺图时标记待补，不在发布链路中调用模型生图（封面生图需园主点头）。

列表卡标题情绪点缀（emoji / 颜文字）：仅 `PostCard` + `src/utils/title-mood.ts` 展示层；成帖**勿**写入 frontmatter `title`（见 `_shared/title-mood.md`）。

### Skill 联接（项目 / 全局 / 各工具）

真源只在 `.agents/skills/`。其他入口一律建 **junction** 指向真源，不要拷文件：

| 范围 | 目录 |
|------|------|
| 仓内真源 | `.agents/skills/<name>`（正常提交；cloudflare 系 13 件为本地安装，gitignore） |
| Cursor 桥接 | `.cursor/skills`（junction → `.agents/skills`，本仓已建） |
| Claude Code / Cursor / Agents（全局） | `~/.claude/skills` · `~/.cursor/skills` · `~/.agents/skills` |
| Codex / OpenCode | `~/.codex/skills` · `~/.config/opencode/skills` · `~/.opencode/skills` |
| Pi / dsh / Kimi | `~/.pi/agent/skills` · `~/.dsh/skills` · `~/.kimi-code/skills` |

Windows：`cmd /c mklink /J <dest> <Firefly/.agents/skills/<name>>`（桥接整个目录时 dest 为 `.cursor/skills`）。已有过期**副本**先删再联。`dir /AL` 才能看出 junction（`pathlib.is_symlink()` 对 junction 为假）。仓库搬家后 junction 会断裂，需按新路径重建。

### 发文（唯一入口 = post-publish）

用户说「写篇博客 / 整理 / 调研 / 发笔记 / 把这段发出去」→ **先 `post-publish`**，按输入分流（自动识别，不让用户点名渠道）。固定 vault：`D:\OneDrive\Desktop\Notes\threetwoa_ob`（变更先改 `CONTEXT.md` + manifest `vaultRoot`）。

```text
用户给材料或题目
  → post-publish（一条链）
       1 识别输入：Obsidian 笔记路径 / 对话提炼 / 外部文章 URL / 粘贴 / 只有题目 / RSS 口令
       2 沉淀：整理成 vault 笔记（author + create_time + update_time，缺则问用户）
       3 成帖：vault 理想稿 → posts/<slug>/（图片压缩上 R2、封面视觉选图、validate 门禁）
       4 收尾：cascade_check 验收 + 可选协作者评论 → 园主确认 → push → 核线上
  → 短动态（碎碎念/心情）→ dynamic-publish
  → 早报 / 热榜 → ai-morning-brief / github-weekly-hot（合集，不经 vault）
```

旧称甲/乙/丙 = 渠道 1 / 渠道 2–3 / 渠道 4，仅作别名。  
成帖红线：`.agents/skills/_shared/post-redlines.md`，由 `validate_post.py` 执行。  
时间口径：站点 `published/updated` 一律按发布动作时间（方案 A），不映射 vault 笔记时间。

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

## 临时工作区（temp/ · 单一临时区）

临时脚本、任务调研、原始素材、交接快照、验证预览、日志、缓存、密钥备份**一律进 `temp/` 对应分类**，按 `<task-slug>/` 分目录；禁止散落到项目正式目录或项目外路径（C 盘、D 盘根等）。规则与分类见 `temp/README.md` / `temp/AGENTS.md`（均入库）；temp 其余内容 gitignore、永不提交。旧 `.scratch/`、`tmp/` 已并入 temp，不再使用。`handoff/` 覆盖式更新，不堆历史。

## 任务流摘要

```text
Issue → (可选 report) → PRD(draft) → 你批准 → handoff → 实施 → Review → commit-history → archive
```

细则：`docs/agents/workflow.md` · 交付：`deliver.md` · 归档：`archive.md`
