# 01: 修复死事件，恢复软导航后的组件初始化

**What to build:** 软导航后，Dynamic 的关闭按钮、SiteStats 的运行天数、Advertisement、ShareBar 的复制、FlipComicBook 与 RotatingPopCard 都重新初始化；这些组件不再监听 Swup 4.8.2 从不派发的 `swup:contentReplaced`。

**Blocked by:** None (can start immediately)

**Status:** resolved（2026-10-25，`41d32211`）

- [x] 6 个只监听死事件的组件改用统一页面就绪事件（`swup:page:view`）
- [x] 干净文件中其余的 `swup:contentReplaced` 监听一并移除；WIP 文件不动
- [ ] 首屏行为不变，软导航后目标组件恢复响应（待浏览器复验）
- [ ] 浏览器：连续两次软导航后逐项点击/观察（待复验）
- [x] 5 个行为测试通过；Biome 检查改动文件无错

## Result

- 改了 17 个干净文件：6 个只监听死事件的组件换成 `swup:page:view`；其余文件删掉永不触发的 `contentReplaced` 监听，保留已有的 `astro:page-load` / `content:replace` / `page:view`。
- `CoverImage`、`RepelText`、`TypewriterText`、`PostPage`、`Profile`、`Layout` 仍有死事件，均在他人 WIP 中，未动。
- 浏览器复验待 dev server 稳定后进行；本票先以静态替换 + 行为测试收口。
