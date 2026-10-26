# 12: h2 后首段斜自动副标题排版约定

**What to build:** 一条 CSS 排版约定：`h2 + p > em:first-child` 自动样式化为副标题（字号/颜色/字距）；同时写进成帖规范（post-publish 红线或写作约定文档），让「h2 后第一段整体斜」成为站点排版语言。

**Blocked by:** None

**Status:** resolved（2026-10-26）

- [x] CSS 规则上线（一条）
- [x] 成帖规范文档补此约定（`_shared/post-redlines.md`）
- [x] 存量文章视觉影响抽查（只命中 `.custom-md h2 + p > em:first-child`）
- [x] `npx tsc` + `npx astro check` 绿

## Result

- `main.css` 增加 `.custom-md h2 + p > em:first-child` 副标题样式。
- `_shared/post-redlines.md` 已记录「H2 后首段整体斜体」约定；侧栏/组件 h2 不受影响。

**参考**：`temp/reports/batch5/antfu-me-borrow.md` 第 3 条（main.css:77-82，一条 CSS）。上游 `temp/repos/antfu.me/`（排版约定借鉴）。
