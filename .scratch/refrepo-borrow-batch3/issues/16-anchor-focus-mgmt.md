# 16: 锚点跳转焦点管理 + reduced-motion

**What to build:** 标题锚点跳转后焦点落到目标标题（键盘/读屏用户不迷路）；平滑滚动尊重 prefers-reduced-motion；与现有 TOC/锚点体系集成。

**Blocked by:** None

**Status:** open

- [ ] 锚点跳转 focus 目标标题（tabindex 处理不破坏布局）
- [ ] smooth scroll 在 reduced-motion 下降级
- [ ] 软导航后锚点行为仍正确（Swup 生命周期）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/papermod-borrow.md` 第 8 条（a11y 细节）。上游 `temp/repos/hugo-PaperMod/`（思想迁移）。
