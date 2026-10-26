# 12: outline 层级可配置

**What to build:** 文章目录显示层级可配：`computeTocItems` 已有 maxLevel 参数但调用点写死 3——接线到 siteConfig 全局默认 + frontmatter 篇级覆盖（与批 4 票 15 的每页开关字段协同）。

**Blocked by:** None

**Status:** open

- [ ] maxLevel 接线（全局配置 + 篇级覆盖）
- [ ] Floating/Sidebar TOC 同步生效
- [ ] 深层级文章（h4/h5）本地验收
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/vitepress-borrow.md` 第 2 条（computeTocItems 已有 maxLevel 参数但调用点写死 3，接线即可）。上游 `temp/repos/vitepress/`（outline 配置思想）。
