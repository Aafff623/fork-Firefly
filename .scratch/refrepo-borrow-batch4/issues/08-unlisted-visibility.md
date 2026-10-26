# 08: unlisted 第三可见态

**What to build:** frontmatter 第三可见态：draft（生产不可见）/ unlisted（可直接访问，不进列表/RSS/llms.txt/搜索）/ public；现有 isArticleVisible 二元逻辑扩展为三态；各消费方（列表/归档/RSS/llms.txt/Pagefind/sitemap）过滤规则逐条明确并测试。

**Blocked by:** None

**Status:** open

- [ ] 可见态三态模型 + schema 字段
- [ ] 全部消费方过滤规则表（写进 spec 并逐项实现）
- [ ] 行为测试覆盖三态 × 消费方矩阵
- [ ] `pnpm check && pnpm type-check && pnpm check:gates` 绿

**参考**：`temp/reports/batch4/quartz-borrow.md` 第 7 条（Quartz 有 unlisted/stealth 分级；我们只有 draft 二元+草稿箱）。上游 `temp/repos/quartz/`（可见性分级思想，重实现）。与票 11（加密页 shadow index）共享可见态词汇，协同设计。
