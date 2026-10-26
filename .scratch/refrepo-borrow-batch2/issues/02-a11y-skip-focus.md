# 02: Skip to content + 全局 focus-visible 基础层

**What to build:** ① Layout 主体结构前加 skip-to-content 链接（视觉隐藏、聚焦显现，Tab 第一站命中，跳到 #main-content 之类的主内容锚点）；② 全局 focus-visible 基础层（统一焦点圈样式：颜色/粗细/圆角/offset，暗色下对比度达标），放基础样式文件，组件级散规则保留不冲突。

**Blocked by:** None

**Status:** resolved（2026-10-26；焦点对比度未做数值测量）

- [x] skip 链接存在且键盘第一站可触发、跳转正确
- [x] 全局 focus-visible 层上线；组件级规则不被破坏
- [ ] 亮/暗两主题下焦点圈对比度达标（目视 + 抽样计算）（未做数值测量）
- [x] Swup 软导航后 skip 链接仍有效（page:view 补挂）
- [x] `npx tsc` + `npx astro check` 绿

## Result

- `#swup-container` 为主目标并补 `tabindex=-1`；无 swup 容器时退回首个 `<main>`。
- 全局 `:focus-visible` 基础层与 `.skip-to-content` 样式进 `main.css`；构建 HTML 已含 skip 链接。
- 对比度只做了视觉检查，未跑 axe/数值工具，留验收确认。

**参考**：`temp/reports/batch2/astro-paper-borrow.md` 第 3 条 + `astro-paper-arch-perf.md`（a11y 一节）；已亲自核实：Layout 无 skip link、focus-visible 仅 achievements.css/dynamic.css 等组件级散规则。WCAG 2.4.1 基础项。
