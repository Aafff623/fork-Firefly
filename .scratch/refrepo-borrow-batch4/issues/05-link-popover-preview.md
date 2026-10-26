# 05: 链接悬浮预览（popover）

**What to build:** `[[链接]]` 悬停预览目标文章摘要卡片：floating-ui 定位 + 构建期摘要数据（标题+首段，吃 01 的数据或扩展）；触屏设备降级为点击跳转（无预览）；延迟显隐防误触。

**Blocked by:** 01

**Status:** open

- [ ] 悬浮卡片（标题+摘要+首图可选）
- [ ] floating-ui 或轻替；触屏降级
- [ ] 软导航后重新绑定（Swup 生命周期）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/quartz-borrow.md` 第 3 条（证据 popover.inline.ts）。上游 `temp/repos/quartz/`（popover 机制思想，重实现）。
