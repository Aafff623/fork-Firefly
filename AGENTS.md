# AGENTS.md

> **Output Style**: `humanizer-output-style` skill — 统一语气与去 AI 味。路径：`~/.claude/skills/humanizer-output-style/SKILL.md`  
> **Windows Rules**: `.cursor/rules/windows-path-discipline.mdc` · `windows-shell-discipline.mdc`  
> **Commit History**: `.cursor/rules/commit-history.mdc`  
> **Karpathy**: `.cursor/rules/karpathy-guidelines.mdc`

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
| PRD / handoff / commit-history | `docs/outputs/{prd,handoff,commit-history}/`（有产物再建） |
| 上游 AGENTS 备份 | `.scratch/project-init-backup/` |

## 硬约束

1. **KISS / YAGNI / 外科手术式修改**：只改任务所需行；不顺手重构。
2. **PRD 门禁**：未批准的业务 theme 不写大规模功能代码。
3. **交付闭环**：本地 `pnpm dev` 预览 → 本地校验 → 你确认后 `push` → 等 Vercel → **再核线上**。未本地验收不得 push；未看线上不得宣称部署完成。细则见 `docs/agents/workflow.md`。
4. **密钥**：不入库。
5. **覆盖冲突**：本仓治理文件与上游主题说明冲突时，以本仓 `AGENTS.md` / `CONTEXT.md` 为准；上游原文已备份。
6. **资产禁止空壳**：`CONTEXT` / `LANGUAGES` / `docs/agents/*` / `docs/glossary/*` / `docs/knowledge/*` 必须有可消费正文；缺内容时先调研再写盘，禁止只建空目录或一句话占位。

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

项目级 Skill 在 `.cursor/skills/`（勿装到工作区根 `blog/.cursor/skills/`）。

| Skill | 路径 | 何时用 |
|---|---|---|
| `firefly-md-to-post` | `.cursor/skills/firefly-md-to-post/` | 导入/撰写 MD→本仓帖；frontmatter、媒体路径、校验 |
| `firefly-minimax-media` | `.cursor/skills/firefly-minimax-media/` | MiniMax 封面/语音/音乐/短视频；先 `check_quota.py`，URL 用 `fetch_media.py`，视频走 `acquire_video_slot.py` |

二者分工：写文结构走 `firefly-md-to-post`；生成与额度门禁走 `firefly-minimax-media`。全局 CLI 另见本机 `~/.cursor/skills/mmx-cli`（非本仓）。

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
