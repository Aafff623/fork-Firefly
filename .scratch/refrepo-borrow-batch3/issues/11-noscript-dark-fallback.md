# 11: noscript 暗色兜底

**What to build:** 无 JS 时主题不闪错：首屏内联脚本已在 JS 关闭前按系统偏好（prefers-color-scheme）落亮/暗 class，避免默认亮色再被脚本改暗的闪烁；noscript 标签内补最小样式兜底（按需）。

**Blocked by:** None

**Status:** resolved（2026-10-26；无 JS 真机未验）

- [x] 首屏 class 在无 JS 时正确（构建 HTML 含 noscript 深色 token 兜底）
- [ ] 亮/暗两态无闪烁（目视）（未做禁用 JS 真机目视）
- [x] 与现有 FOUC 防护脚本不冲突（noscript 仅在脚本禁用时生效）
- [x] `npx tsc` + `npx astro check` 绿

## Result

- 新增 `<noscript>` 深色 token 兜底，按 `prefers-color-scheme` 覆盖壳层与常用文字色。
- 构建首页 HTML 已包含 noscript 样式；未在禁用 JS 的真机浏览器里逐项目视。

**参考**：`temp/reports/batch3/papermod-borrow.md` 第 7 条。上游 `temp/repos/hugo-PaperMod/`（思想迁移）。
