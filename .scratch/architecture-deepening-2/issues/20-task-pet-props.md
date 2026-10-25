# 20: SpritePet props 收口

**What to build:** 把布局旋钮（position / offset / size / zIndex / mobile 断点等）从 SpritePet 的 props 移回配置或默认值，只保留 5 个真正随调用点变化的核心 props。所有调用方同步更新。

**Blocked by:** 15（SpritePet 接入 animator）

**Status:** resolved（2026-10-25）

- [x] 列出当前每个 prop 的真实调用点，区分「随页面变化」与「站点固定」
- [x] 固定项回到 `petConfig`，SpritePet 只保留 5 个核心 props
- [x] 所有调用方更新，无行为变化
- [x] 浏览器：首页与文章页的桌宠位置/大小/隐藏规则不变
- [x] 类型检查通过

## Result

- props 从 18 个收到 5 个：`defaultPetId` / `postPetId` / `position` / `size` / `roam`；偏移、动效、拖拽、点击、视线、响应式、zIndex 直接读 `spritePetConfig`。
- `MainGridLayout` 调用点同步只传 5 个；dev 冒烟首页与文章页桌宠都存在，无布局变化。
