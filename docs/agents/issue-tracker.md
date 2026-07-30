# Issue tracker: Local Markdown

本仓 Issue / PRD 落在 `.scratch/`（不进 Git；已在 `.gitignore`）。

## Conventions

- 一功能一目录：`.scratch/<feature-slug>/`
- PRD：`.scratch/<feature-slug>/PRD.md`
- 实现 Issue：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 编号
- 顶部用 `Status:` 行记录 triage（见 `triage-labels.md`）
- 讨论追加在文件末尾 `## Comments`

## 本仓示例

```text
.scratch/site-branding/
  PRD.md
  issues/
    01-update-site-url.md
    02-profile-links.md
```

`Status: ready-for-agent` 的 Issue 可直接交给 Agent 按 handoff 实施。

## When a skill says "publish to the issue tracker"

在 `.scratch/<feature-slug>/` 下新建文件（目录可自动创建）。

## When a skill says "fetch the relevant ticket"

读取给定路径；你通常会直接给出路径或编号。
