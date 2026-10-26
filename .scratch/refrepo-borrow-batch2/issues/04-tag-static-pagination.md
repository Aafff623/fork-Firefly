# 04: 每标签静态可分页 URL

**What to build:** 新增每标签静态路由 `/tags/[tag]/[...page]`（构建期生成，分页参数化），与现有交互式标签页并存：交互页保留（现有 AdvancedSearch/标签球体验不动），静态路由补 SEO 与可分享链接；sitemap 收录静态标签页。

**Blocked by:** None

**Status:** open

- [ ] `/tags/[tag]/[...page]` 静态路由生成全部标签分页
- [ ] 与现有交互式标签页不冲突（路由不重叠、导航可分别进入）
- [ ] sitemap 含静态标签页；分页 canonical 指向自身
- [ ] 本地构建抽 2 个标签验证分页与内容
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch2/astro-paper-features.md`（每标签静态分页 `/tags/[tag]/[...page]` 是我们缺的；我们交互式标签更强但无可分享 URL）。上游 `temp/repos/astro-paper/src/pages/tags/[tag]/[...page].astro`。
