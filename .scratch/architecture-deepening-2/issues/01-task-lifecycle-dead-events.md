# 01: 修复死事件，恢复软导航后的组件初始化

**What to build:** 软导航后，Dynamic 的关闭按钮、SiteStats 的运行天数、Advertisement、ShareBar 的复制、FlipComicBook 与 RotatingPopCard 都重新初始化；这些组件不再监听 Swup 4.8.2 从不派发的 `swup:contentReplaced`。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] 6 个只监听死事件的组件改用统一页面就绪事件（`swup:page:view`）
- [ ] 干净文件中其余的 `swup:contentReplaced` 监听一并移除；WIP 文件不动
- [ ] 首屏行为不变，软导航后目标组件恢复响应
- [ ] 浏览器：连续两次软导航后逐项点击/观察
- [ ] `check:behavior`、`type-check` 通过
