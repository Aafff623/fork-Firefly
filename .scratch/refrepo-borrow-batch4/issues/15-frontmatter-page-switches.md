# 15: frontmatter 每页开关字段

**What to build:** posts schema 增可选字段（缺省行为不变）：`titleTemplate`（标题模板）、`outline: false`（关目录）/ outline 层级、`search: false`（退出搜索——与批 3 票 02 searchHidden 协同或合并）、`pageClass`（页级 class）、`head`（页级 extra head）。schema 已核缺这些字段。

**Blocked by:** None

**Status:** open

- [ ] schema 增字段（全部可选，缺省null/false）
- [ ] Layout/文章页消费（逐字段接线）
- [ ] 与批 3 票 02（searchHidden）、票 12（outline 层级）的分工明确，避免双轨
- [ ] 存量文章零影响验证
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/vitepress-borrow.md` 第 6 条 + `vitepress-features.md`（frontmatter 每页开关 titleTemplate/outline:false/search:false/head 是真正缺口之一）。上游 `temp/repos/vitepress/`（frontmatter 体系思想）。
