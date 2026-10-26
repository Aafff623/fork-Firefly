# 04: 每标签静态可分页 URL

**What to build:** 新增每标签静态路由 `/tags/[tag]/[...page]`（构建期生成，分页参数化），与现有交互式标签页并存：交互页保留（现有 AdvancedSearch/标签球体验不动），静态路由补 SEO 与可分享链接；sitemap 收录静态标签页。

**Blocked by:** None

**Status:** resolved（2026-10-26；291 个标签静态页 + sitemap/canonical 已验证；分页用临时 pageSize=5 验证后还原）

- [x] `/tags/[tag]/[...page]` 静态路由生成全部标签分页 — 构建期按 `getTagList()` + `getSortedPosts()` 生成，当前 291 个已发布标签
- [x] 与现有交互式标签页不冲突（路由不重叠、导航可分别进入）— `/tags/` 交互页保留，新增可折叠「静态标签页」目录；静态页回链 `/tags/`
- [x] sitemap 含静态标签页；分页 canonical 指向自身 — sitemap 292 条 `/tags/` URL；第 1 页与第 N 页 canonical 均指向当前页
- [x] 本地构建抽 2 个标签验证分页与内容 — AI Coding / Agent / 面试 三组内容与 RSS 条目数核对；分页在 dev 临时 `postsPerPage=5` 下验证 5/5/1、5/3 后还原 24
- [x] `pnpm check && pnpm type-check` 绿 — 按本轮指示不用 pnpm，等价执行 `npx astro check`（0 errors / 0 warnings / 10 hints）与 `npx tsc --noEmit --isolatedDeclarations`（0 errors）

**参考**：`temp/reports/batch2/astro-paper-features.md`（每标签静态分页 `/tags/[tag]/[...page]` 是我们缺的；我们交互式标签更强但无可分享 URL）。上游 `temp/repos/astro-paper/src/pages/tags/[tag]/[...page].astro`。

## 实现记录（2026-10-26）

- `src/pages/tags/[tag]/[...page].astro`：`getStaticPaths` 用 `collectTagGroups(getTagList(), getSortedPosts())` 生成每标签分页，`pageSize` 取 `siteConfig.pagination.postsPerPage`；沿用 `PostPage` 列表卡与站点置顶语义。
- `src/pages/tags/index.astro`：交互页不动，只在下方加可折叠「静态标签页」目录，给每个静态页一个入口；静态页头部回链「全部标签」。
- 分页 UI 自建（现有 `Pagination` 的页码链接固定指首页 `/${n}/`，不能直接复用于标签路由）；上一页/下一页用 `page.url.prev/next`，中文路径统一 `encodeURI`。
- canonical 由 `Layout` 按 `Astro.url.pathname` 自动生成，未改 Layout；`/tags/<tag>/2/` 也指向自身。

## 验证

- `npx tsc --noEmit --isolatedDeclarations`：0 errors。
- `npx astro check`：0 errors / 0 warnings / 10 条既有 hints。
- `npx astro build`：成功；`dist/client/tags/` 291 个标签目录、291 个 `rss.xml`。
- 构建抽查：`/tags/ai-coding/` 16 篇、`/tags/agent/` 11 篇、`/tags/%E9%9D%A2%E8%AF%95/` 13 篇；canonical 分别为自身。
- 分页抽查（dev 临时 `postsPerPage=5`，验后已还原 24）：`/tags/ai-coding/` 5 篇、`/tags/ai-coding/2/` 5 篇、`/tags/ai-coding/4/` 1 篇；`/tags/%E9%9D%A2%E8%AF%95/3/` 3 篇；页码/上一页/下一页与 canonical 正确。
- sitemap：`sitemap-0.xml` 含 291 个标签静态页（加 `/tags/` 共 292 条），不含 RSS 端点。
- `npm run check:behavior`：15 个行为测试全绿（含新增 `test-tag-slug`）。

未验证 / 边界：

- 当前最大标签只有 16 篇，生产 `postsPerPage=24` 下所有标签都只有第 1 页；多页行为靠 dev 临时改小 pageSize 验证，未在 24 的正式构建产物里出现第 2 页。
- 未跑完整 `npm run build` 的后处理（minify-inline-scripts / subset-fonts / pagefind 等），只跑了 `npx astro build`。
