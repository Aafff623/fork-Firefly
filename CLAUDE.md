# CLAUDE.md

> **Output Style**: `humanizer-tone`（全局 skill，`~/.agents/skills/humanizer-tone/SKILL.md`）<br>
> **Cursor rules**: 全局 `%USERPROFILE%\.cursor\rules\`；仓内 `.cursor/rules/` 仅站点专有 mdc

本文件是薄指针入口，不承载规则正文。请阅读并遵循 `AGENTS.md`——它是本仓共享规则的唯一权威源；不要在此建立第二套竞争规则。

加载顺序：

1. **Rules**：全局 `%USERPROFILE%\.cursor\rules\`（宪法 + Windows/Answer/Commit/Karpathy）+ 仓内专有 mdc（礼盒 / cascade 收尾）
2. **仓级**：`AGENTS.md`（硬约束 / 任务流 / Skill 触发）→ `CONTEXT.md`（领域事实 / 术语）→ `LANGUAGES.md`（共享用词）
3. **细则**：`docs/agents/workflow.md`；主题配置文档 `docs/official/`（gitignore）；路由模型 `docs/knowledge/official-docs.tree.json`
