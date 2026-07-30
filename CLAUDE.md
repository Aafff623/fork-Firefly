# CLAUDE.md

> **Output Style**: `humanizer-output-style` — `~/.claude/skills/humanizer-output-style/SKILL.md`  
> **Windows / Answer / Commit / Karpathy rules**: `.cursor/rules/*.mdc`（alwaysApply）

本文件是维护协议与加载顺序；硬约束以 `AGENTS.md` 为准，领域以 `CONTEXT.md` 为准。

## 三层加载

1. **Rules**：`.cursor/rules/`（Windows、回答格式、commit-history、Karpathy）
2. **仓级**：`AGENTS.md` → `CONTEXT.md` → `LANGUAGES.md`
3. **主题文档**：工作区 `../Firefly_docs/`（配置怎么改）；上游主题行为以代码为准

## 本仓是什么

CuteLeaf/Firefly 的 fork，作者 **Aafff623 / threetwoa** 的个人博客。线上：https://fork-firefly.vercel.app

## 偏好归档

- 部署首选 **Vercel**；Cloudflare 存储能力非默认依赖。
- 配置优先于改布局；大文件（`Layout.astro` 等）非必要不拆。
- 中文沟通；代码与提交 Conventional Commits。
- project-init 与上游文档冲突时：**覆盖式更新**本仓治理文件，并在对话里声明冲突点。
- **README 本地预览壳**：根目录 `preview-readme.html`，端口 **8090**（`python -m http.server 8090`）。
- **交付闭环**：本地预览 → 校验 → push → 核线上（见 `docs/agents/workflow.md`）。

## Agent skills

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

上游贡献者指南原文备份：`.scratch/project-init-backup/`。
