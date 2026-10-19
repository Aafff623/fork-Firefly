# CLAUDE.md

> **Output Style**: `humanizer-tone`（全局 skill，`~/.agents/skills/humanizer-tone/SKILL.md`）<br>
> **Cursor rules**: 全局 `%USERPROFILE%\.cursor\rules\`；仓内 `.cursor/rules/` 仅站点专有 mdc

本文件是薄指针入口，不承载规则正文。请阅读并遵循 `AGENTS.md`——它是本仓共享规则的唯一权威源；不要在此建立第二套竞争规则。

加载顺序：

1. **Rules**：全局 `%USERPROFILE%\.cursor\rules\`（宪法 + Windows/Answer/Commit/Karpathy）+ 仓内专有 mdc（礼盒 / cascade 收尾）
2. **仓级**：`AGENTS.md`（硬约束 / 任务流 / Skill 触发）→ `CONTEXT.md`（领域事实 / 术语）→ `LANGUAGES.md`（共享用词）
3. **细则**：`docs/agents/workflow.md`（内容流水线）；主题配置文档 `docs/official/`（gitignore）；路由模型 `docs/knowledge/official-docs.tree.json`

## Agent skills

### Issue tracker

Issues, specs and decision tickets live as markdown files under `.scratch/<effort>/`（本地 markdown，不用 GitHub Issues）。See `docs/agents/issue-tracker.md`.

### Triage labels

五个规范角色映射到 issue 文件顶部的 `Status:` 行，字符串同名（`needs-triage` / `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`）。See `docs/agents/triage-labels.md`.

### Domain docs

single-context：`GLOSSARY.md`（由 `/domain-modeling` 惰性创建）+ `docs/adr/`（已有 10 份）。See `docs/agents/domain.md`.
