# 04: dynamic schema 加 tags

**What to build:** dynamic schema 加 `tags: string[]`（可选，缺省空）；时间线/索引支持按标签检索动态；Pagefind 对动态的覆盖补全（现只覆盖首屏 8 条 HTML）；存量动态可回填。

**Blocked by:** None

**Status:** open

- [ ] schema 加字段（可选）
- [ ] 时间线标签筛选 + Pagefind 覆盖补全
- [ ] 与 posts 标签体系的关系明确（共用还是分开）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch5/memos-features.md` 第 8 条（我们 dynamic 无 tags 导致无法按主题检索动态；Pagefind 只覆盖首屏 8 条 HTML；补齐最小改动=schema 加 tags）。上游 `temp/repos/memos/`（tags 自动提取思想）。
