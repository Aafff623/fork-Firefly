# 01: canonicalURL 全站补齐

**What to build:** 全站输出 canonical：`src/layouts/Layout.astro` head 段按当前页规范 URL 输出 `<link rel="canonical">`（尊重 trailingSlash 规则与 base）；转载文（有 sourceLink 的）指向原文；分页/标签页各自 canonical 到自身。

**Blocked by:** None

**Status:** resolved（2026-10-26）

- [x] Layout head 输出 canonical（绝对 URL，含协议与域名）
- [x] 转载文 canonical 指向 sourceLink（若有；仅接受 http(s)）
- [x] 首页/列表/分页/标签/文章页各自 canonical 正确
- [x] 构建 HTML 抽查：首页、3 篇文章、列表页 canonical 正确
- [x] `npx tsc` + `npx astro check` 绿

## Result

- 以 `Astro.url.pathname` + 站点域名生成自身 canonical；文章有合法 `sourceLink` 时指向原文。
- 构建产物抽查 `dist/client/index.html`、`posts/xiuxing-worldly`、`java-course9`、`ai-video-making` 均正确。

**参考**：`temp/reports/batch2/astro-paper-borrow.md` 第 1 条；已亲自核实全站 0 处 canonical。上游 `temp/repos/astro-paper/src/layouts/Layout.astro`（公网 github.com/satnaing/astro-paper 同路径）。
