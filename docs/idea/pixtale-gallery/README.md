# theme · `pixtale-gallery`

[Pixtale](https://github.com/aslost/pixtale)（aslost）：基于 **Next.js** 的瀑布流 Web 相册 → 博客 Gallery 可借鉴的 **产品壳 / 信息架构 / 瀑布紧密度**。

| 文件 | 说明 |
|---|---|
| [`extract.md`](./extract.md) | 与 Firefly 相册对照、可移植点、反模式 |
| [`deep-dive.md`](./deep-dive.md) | 临时 clone 深挖：masonic / 宽高 / AGPL 黄线 |
| [`assets/pixtale-shot.png`](./assets/pixtale-shot.png) | 本地跑通截图（侧栏 + 多列瀑布） |

**状态**：step-1 + clone 深挖（2026-08-05）；**灵感 ≠ 实现**，落地须走调研 → PRD。  
**本地源**：`blog/temp/pixtale/`（临时；收工删除）。许可 AGPL，禁并入产品仓。

---

## 一句话

它是「带侧栏的照片工作台」：Photos / Favorites / Albums / Recycle + 高密度 Masonry；栈是 Next/React，**不能整仓搬进 Astro 博客**，只抄体验与信息架构。

## 灵感来源

- 仓库：https://github.com/aslost/pixtale
- 栈线索：Next.js · 侧栏工作台 UI（截图可见 localhost:3000/photos）
- 园主截图：B 站博主演示 / 本地预览观感

## 想要的感觉

- **相册像产品，不只是静态页**：侧栏分区、收藏/回收等心智（博客可降配成「标签 / 相册列表」）
- **高密度瀑布**：多列、圆角卡、间隙紧，接近 Pinterest / 小红书
- **与现站关系**：对齐 `gallery` 页；技术映射到 **Astro SSG + 既有 CSS column / 可选 JS 最短列**，禁止引入 Next 运行时

气质关键词：`masonry · album-shell · dense · photo-workbench`

## 可能落点

- `src/pages/gallery/` · `galleryConfig` · `src/styles/gallery.css`
- 相册内页 `gallery/[album].astro` 已有 `.gallery-masonry`
- 首页 GalleryExplorer（手风琴 / Three 无限画布）与「相册内瀑布」是两套面，勿混改

## 开放问题

- 要不要侧栏式相册壳，还是维持现有「相册卡片 → 内页瀑布」两级
- 密度与双侧栏主站节奏是否冲突（主内容区偏窄）
- 克隆对照深度：是否需要 `temp/pixtale` 再拆路由/组件

## 黄线

- 灵感阶段 **禁止** 改 `src/` 大规模实现；先文档后 PRD
- 不整仓移植 Next/React；不把 Vue 瀑布插件当候选
