# 20: SpritePet props 收口

**What to build:** 把布局旋钮（position / offset / size / zIndex / mobile 断点等）从 SpritePet 的 props 移回配置或默认值，只保留 5 个真正随调用点变化的核心 props。所有调用方同步更新。

**Blocked by:** 15（SpritePet 接入 animator）

**Status:** ready-for-agent

- [ ] 列出当前每个 prop 的真实调用点，区分「随页面变化」与「站点固定」
- [ ] 固定项回到 `petConfig`，SpritePet 只保留 5 个核心 props
- [ ] 所有调用方更新，无行为变化
- [ ] 浏览器：首页与文章页的桌宠位置/大小/隐藏规则不变
- [ ] 类型检查通过
