# CLAUDE.md

> **Output Style**: `humanizer-tta` — `~/.claude/skills/humanizer-tta/SKILL.md`  
> **Session Init**: `windows-agent-discipline` — 会话启动先读（见 AGENTS.md）。路径：`~/.claude/skills/windows-agent-discipline/SKILL.md`  
> **Cursor 宪法**: `%USERPROFILE%\.cursor\rules\`（全局 alwaysApply）；仓内 `.cursor/rules/` 仅站点专有 mdc

本文件是维护协议与加载顺序；硬约束以 `AGENTS.md` 为准，领域以 `CONTEXT.md` 为准。

## 三层加载

1. **Rules**：全局 `%USERPROFILE%\.cursor\rules\`（宪法 + Windows/Answer/Commit/Karpathy）+ 仓内专有 mdc（礼盒 / site-cascade）
2. **仓级**：`AGENTS.md` → `CONTEXT.md` → `LANGUAGES.md`
3. **主题文档**：`docs/official/`（配置怎么改；gitignore）；路由见 `docs/knowledge/official-docs.tree.json`；上游主题行为以代码为准

## 本仓是什么

基于 CuteLeaf/Firefly 主题的 **standalone** 个人博客二次开发（已脱离 fork 网络；仓库名仍可能带 `fork-` 历史前缀）。作者 **Aafff623 / threetwoa**。线上主入口：https://www.threetwoa.live（Vercel 备用：https://fork-firefly.vercel.app）

## 多 Agent 协作区（认死理防疑）

- 本仓是**多 agent 并行工作区**：各 agent 负责不同业务模块（壁纸、音乐、配图、发文、其他），任务通常由用户明确布置、彼此不互相影响。
- 看到工作区里有**不是自己改动的文件变动**，不要大惊小怪、不要疑惑——那多半是其他 agent 的在制品，归各自负责。
- 各自守好自己的任务：只改自己任务直接相关的文件，改动前查 `git status` 确认无他人在制品夹带；不杀/不重启他人服务或 dev server；不碰他 agent 在制品。

## 偏好归档

- 部署首选 **Vercel**；Cloudflare 存储能力非默认依赖。
- 配置优先于改布局；大文件（`Layout.astro` 等）非必要不拆。
- 中文沟通；代码与提交 Conventional Commits。
- project-init 与上游文档冲突时：**覆盖式更新**本仓治理文件，并在对话里声明冲突点。
- **本地预览壳（8090）**：`preview-readme.{html,css,js}` → README；`preview-release.{html,css,js}` + `release-notes/*.md` → Release 中英双栏。仓库根 `python -m http.server 8090`（勿用 `file://`）。
- **交付闭环**：本地预览 → 校验 → push → 核线上（见 `docs/agents/workflow.md`）。

## Agent skills

项目级 Skill（`.cursor/skills/`，硬约束与触发见 `AGENTS.md`）：

| Skill | 用途 |
|---|---|
| `knowledge-extract` | **写稿唯一进料口**（vault / 粘贴 / 调研 / 早报热榜分流）；落 Knowledge（合集除外） |
| `knowledge-output` | Knowledge 素材 → `posts/<slug>`（发布岗；无主题分批扫 todo；草稿进 `_draftbox/`，不 push）；正式发收尾接 `site-cascade` |
| `ai-morning-brief` | 橘鸦 RSS → 按园主焦点筛成「早报」合集一期（不转载全文；默认草稿箱） |
| `github-weekly-hot` | IT咖啡馆周刊 RSS 当目录 → 对 GitHub 自写「热榜」合集一期（不搬原文；默认草稿箱） |
| `site-cascade` | 发文后级联索引（动态 / 统计 / 分类标签 / 热力图） |
| `firefly-minimax-media` | MiniMax 出图·配音·音乐·短视频（额度门禁 + 落盘脚本） |
| `release-post` | GitHub Release notes / SemVer；本地中英预览 `preview-release.html` |
| `wiki-post` | GitHub Wiki 手册（Home/FAQ/功能页）；先起草，用户说「发布/推送 Wiki」才 push `.wiki.git` |

出封面/语音/BGM/短片前读 `firefly-minimax-media/SKILL.md`；先跑 `scripts/check_quota.py`。  
发版前读 `release-post/SKILL.md`；先起草，用户说「发布」才 `gh release create`。  
建/改 Wiki 前读 `wiki-post/SKILL.md`；先起草，用户说「发布/推送 Wiki」才 push `.wiki.git`。  
工作区根若为上一级 `blog/`，须在 `blog/.cursor/skills/` 建 junction 指向本表 skill（见 `AGENTS.md`）。

### Issue tracker

本地 Markdown：`.scratch/<feature>/`。见 `docs/agents/issue-tracker.md`。

### Triage labels

五种 canonical 标签。见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文。见 `docs/agents/domain.md`。

## 常用命令

| Command | Purpose |
|---|---|
| `pnpm dev` | 本地开发 |
| `pnpm build` | 生产构建 |
| `pnpm check` / `pnpm type-check` | 诊断 |
| `pnpm new-post` / `pnpm new-d` | 新文章 / 动态 |

## 架构速记

- Astro 静态 + Svelte islands + Swup
- 配置：`src/config`；内容：`posts` / `dynamic` / `spec`
- 布局：`Layout.astro` 壳 + `MainGridLayout.astro` 网格

上游贡献者指南原文备份：目录 `.scratch/project-init-backup/` **当前不存在**（且 `.scratch/` 多在 gitignore）；若需要再本地建，勿在文档里当成已有路径。
