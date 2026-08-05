# Pinterest 瀑布 · 对本站的选型消化

## 想要的感觉

- 列宽固定、卡片高度随图、缝隙紧、圆角卡
- 滚动舒适，不像整齐网格那么「办公」
- 博客语境下仍克制：主栏宽度有限，列数通常 2～4，勿硬抄 Pixtale 六七列桌面密度

## Grok 建议 vs 本站事实

| Grok 说法 | 本站事实 | 取舍 |
|---|---|---|
| 先问技术栈再给组件 | **Astro 7 + Svelte 5 岛 + Tailwind 4**，静态 SSG | 回复 Grok 时以此为准 |
| Vue 用 vue-waterfall-plugin-next | 本站 **不是 Vue** | 整行划掉 |
| Astro 可用 Bricklayer / Masonry.js | 合理 | 园主偏好 **Masonry.js**（成熟、文档全）→ 作「升级档」候选 |
| 静态相册优先 CSS `column-count` | **相册内页已经在用**（`gallery-masonry` + `columnWidth`） | **默认档继续**；先调密度/间距/圆角再谈换库 |
| 无限滚动再上 JS 库 | 首页「普通模式」是 Three 无限画布，不是瀑布无限滚 | 别混场景 |
| 预知宽高更稳 | 可做；LQIP/构建链路已有图片处理基础 | PRD 再定是否写 ratio |

## 分层建议（给后续 PRD）

1. **L0 抛光（无新依赖）**：CSS columns 观感贴近 Pinterest（gap、radius、hover、懒加载）
2. **L1 最短列（可选）**：Svelte 小岛挂 Masonry.js + imagesLoaded；仅相册内页或文章 waterfall
3. **L2 产品壳（远）**：Pixtale 式分区导航——独立 PRD，勿与 L0/L1 绑死

Grok 完整落地稿已消化：见 [`grok-l0-l1.md`](./grok-l0-l1.md)。**采纳「默认 CSS / L1 开关」**；现码已具备 lazy、圆角、Fancybox、`break-inside-avoid`，L0 聚焦 gap + CLS（宽高）。

## 黄线

- 不因评论提到 Vue 就引入 Vue
- 不把「经典原版 Masonry.js」当成必须立刻上的依赖；现有 CSS 已覆盖静态相册主路径
- 不整页用 Grok 示例 Tailwind 重写替换 `.gallery-masonry`（在现有组件上抛光）
