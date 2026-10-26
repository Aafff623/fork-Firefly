# 07: 定时发布 scheduledPostMargin

**What to build:** 定时发布机制：文章索引层加「未到点文章在生产不可见」过滤（DEV 放行预览），阈值可配（scheduledPostMargin，默认 0 即到点即上）；顺带处理每篇 timezone 覆盖（frontmatter timezone 字段，缺省用站点时区）。**前置：先扫存量未来日期文章数量，带数据再定默认行为。**

**Blocked by:** None

**Status:** open

- [ ] 存量扫描：统计 published/updated 在未来的文章数（记录数值，写入本票 Comments）
- [ ] 索引层按站点时区判定「未到点」；DEV 可见、生产隐藏（或按扫描结果定默认）
- [ ] scheduledPostMargin 阈值配置化
- [ ] frontmatter timezone 每篇覆盖（可选字段，缺省站点时区）
- [ ] 行为测试：未来文章在 DEV/生产两种模式可见性正确
- [ ] `pnpm check && pnpm type-check && pnpm check:gates` 绿

**参考**：`temp/reports/batch2/astro-paper-borrow.md` 第 4 条；已亲自核实 `src/lib/article-index.ts` 的 `isArticleVisible` 只判 draft、无未来日期过滤。上游 `temp/repos/astro-paper/src/utils/`（scheduledPostMargin 相关）。本票是产品决策+实现，默认行为以存量扫描结果为准。
