# 02: 反向链接面板

**What to build:** 文章页「链接到此的文章」面板：吃 01 的 inlinks 数据，按篇渲染来源列表（标题+锚点）；空态隐藏；样式贴合现有文章页组件；可按篇/按配置关闭。

**Blocked by:** 01

**Status:** open

- [ ] 文章页反链面板（空态隐藏）
- [ ] 软导航后正常（Swup 生命周期）
- [ ] 与现有「相关文章」分工明确（相关=tag Jaccard，反链=显式链接）
- [ ] 本地造 3 篇互链文章验收
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/quartz-borrow.md` 第 1 条（定位成色提升最大）+ `quartz-features.md`（名不副实专列：只有出链没有反链）。上游 `temp/repos/quartz/`（Backlinks 组件思想，重实现）。
