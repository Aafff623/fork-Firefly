# 06: Transclusion 嵌入（![[page]]）

**What to build:** `![[page]]` 构建期展开目标文章内容（或指定区域）；循环嵌入检测；深度限制；与现有 wiki-link 的关系明确（出链 vs 嵌入两种语法）；可配置默认深度。

**Blocked by:** None（建议 01 数据底座落地后做，便于解析复用）

**Status:** open

- [ ] `![[page]]` 构建期展开（含区域/锚点语法可选）
- [ ] 循环检测 + 深度限制
- [ ] remark-wiki-link 插件现显式跳过 `!` 前缀——改造点明确（证据：插件 491-493 行）
- [ ] 本地造互嵌文章验收（含循环用例）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/quartz-borrow.md` 第 5 条 + `quartz-features.md`（我们 wiki-link 无嵌入）。上游 `temp/repos/quartz/`（transclusion 思想，重实现）。
