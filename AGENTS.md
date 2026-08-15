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
| 成帖红线 / 合集共通 | `.cursor/skills/_shared/`（被 output / 早报 / 热榜引用，不是独立 skill） |
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

项目级 Skill **正文**在 `Firefly/.cursor/skills/`（仓内真源）。全局与各 AI 工具只建 **目录联接（junction）**，禁止复制 SKILL.md。旧入口 `ob2blog` / `firefly-md-to-post` 已并入 `knowledge-extract` 渠道 1，仓内不再保留该 skill 目录。

| Skill | 路径 | 何时用 |
|---|---|---|
| `knowledge-extract` | `.cursor/skills/knowledge-extract/` | **写稿唯一进料口**（用户不必点名渠道）：① vault 路径 ② 粘贴图文 ③ 无材料调研（并发广搜+配图）④ 早报/热榜交接合集 skill。求全写入后停；不发布、不抽用语。见 `source-modules.md` |
| `knowledge-output` | `.cursor/skills/knowledge-output/` | 园主在 Obsidian 调完理想稿之后：缺口补提 + 自检 + 落盘 + 用语进库（默认自动，也可点名只抽某节/词）；无主题则分批扫 todo；正式发才 Archive + `site-cascade` |
| `ai-morning-brief` | `.cursor/skills/ai-morning-brief/` | 由 extract 渠道 4 交接；橘鸦 RSS → 早报合集一期；默认 `_draftbox/` |
| `github-weekly-hot` | `.cursor/skills/github-weekly-hot/` | 由 extract 渠道 4 交接；IT咖啡馆周刊 → 热榜合集一期；默认 `_draftbox/` |
| `site-cascade` | `.cursor/skills/site-cascade/` | 发文后级联：最新动态（含新笔记）、站点统计、分类/标签、热力图；配套 rule `site-cascade-after-content.mdc` |
| `firefly-minimax-media` | `.cursor/skills/firefly-minimax-media/` | MiniMax 封面/语音/音乐/短视频；extract 配图检索落空才兜底。先 `check_quota.py` |
| `release-post` | `.cursor/skills/release-post/` | GitHub Release notes / SemVer；先起草，用户明确说「发布」才 `gh release create` |
| `wiki-post` | `.cursor/skills/wiki-post/` | GitHub Wiki 手册；用户说「发布/推送 Wiki」才 push `.wiki.git` |
| `gsap-*`（官方 8 件） | `.cursor/skills/gsap-{core,timeline,scrolltrigger,plugins,utils,react,performance,frameworks}/` | 写/审 GSAP 动画 |

vault 机械脚本在 `_shared/scripts/`（`vault_lib.py` / `prep_convert.py` / `sync_check.py` / `validate_post.py` / `upload_r2.py`）；渠道 1 入口是 `knowledge-extract/scripts/extract_vault.py`。映射表仍是 `.ob2blog/manifest.json`。

分工：进料一律 `knowledge-extract` → 园主在 Obsidian 调到理想 → `knowledge-output`（发布 + 用语进库）→ 收尾 `site-cascade`。媒体兜底 `firefly-minimax-media`。全局 CLI 另见 `~/.cursor/skills/mmx-cli`（非本仓）。

列表卡标题情绪点缀（emoji / 颜文字）：仅 `PostCard` + `src/utils/title-mood.ts` 展示层；成帖**勿**写入 frontmatter `title`（见 `_shared/title-mood.md`）。

### Skill 联接（项目 / 全局 / 各工具）

真源只在 `Firefly/.cursor/skills/`。下列目录对 `knowledge-extract`、`knowledge-output`、`_shared`（以及渠道 4 用的 `ai-morning-brief` / `github-weekly-hot` / `site-cascade`）建 **junction**，不要拷文件：

| 范围 | 目录 |
|------|------|
| 项目（Cursor 工作区是 `Firefly/`） | 真源本身 |
| 项目（工作区是上一级 `blog/`） | `blog/.cursor/skills/<name>` |
| 仓内其它 agent 根 | `Firefly/.agents/skills/<name>` |
| Claude Code / Cursor / Agents | `~/.claude/skills` · `~/.cursor/skills` · `~/.agents/skills` |
| Codex / OpenCode | `~/.codex/skills` · `~/.config/opencode/skills` · `~/.opencode/skills` |
| Pi / dsh / Kimi | `~/.pi/agent/skills` · `~/.dsh/skills` · `~/.kimi-code/skills` |

Windows：`cmd /c mklink /J <dest> <Firefly/.cursor/skills/<name>>`。已有过期**副本**先删再联。`dir /AL` 才能看出 junction（`pathlib.is_symlink()` 对 junction 为假）。

### 发文（唯一入口 = extract）

用户说「写篇博客 / 整理 / 调研 / 早报 / 丢路径」→ **先 `knowledge-extract`**，按输入分流。不要让用户点名渠道。固定 vault：`D:\OneDrive\Desktop\Notes\threetwoa_ob`（变更先改 `CONTEXT.md` + manifest `vaultRoot`）。

```text
用户给材料或题目
  → knowledge-extract
       1 路径在 vault     → extract_vault.py → 求全写入（渠道 1 以 vault 为准）
       2 粘贴图文         → 清洗分类 → Knowledge（换根未做；公众号工序见 wechat-mp）
       3 无材料只要调研   → 并发广搜 + 检索配图 → Knowledge
       4 早报 / 热榜      → 交接 ai-morning-brief / github-weekly-hot（不经 Knowledge，不抽用语）
  → 园主在 Obsidian 调到理想
  → 渠道 1–3：knowledge-output（发布 + 用语进库；无主题则分批扫 todo；公众号/BibiGPT 默认草稿箱）
  → 正式发：site-cascade（--blurb）；草稿箱禁止 emit
```

旧称甲/乙/丙 = 渠道 1 / 渠道 2–3 / 渠道 4，仅作别名。  
Knowledge 词表：仓外 `D:\OneDrive\Desktop\Knowledge\README.md` + `theme-taxonomy.md`。  
成帖红线：`.cursor/skills/_shared/post-redlines.md`，由 `validate_post.py` 执行。

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
