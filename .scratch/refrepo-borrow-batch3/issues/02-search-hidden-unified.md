# 02: searchHidden 统一退出 Pagefind + llms.txt

**What to build:** 统一搜索排除机制：frontmatter `searchHidden?: boolean`（或等价命名）；为 true 时该文退出 Pagefind 索引（pagefind 的 data 属性/exclude 机制）与 llms.txt 列表；与加密文区分——加密文是构建期加密（非安全缺口），本票是产品能力缺口（让作者能显式排除某文）。

**Blocked by:** None

**Status:** open

- [ ] frontmatter 字段 + content schema
- [ ] Pagefind 排除路径生效（构建后索引查无该文）
- [ ] llms.txt 同步过滤（批 1 票 04 若已实现则接上，否则本票含最小过滤）
- [ ] 边界：置顶/动态/特殊页是否适用要定
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/papermod-borrow.md` 第 2 条；已亲证无统一搜索排除机制。上游 `temp/repos/hugo-PaperMod/`（思想迁移）。
