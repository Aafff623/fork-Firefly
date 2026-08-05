# Pixtale → Firefly Gallery 提取对照

> 源：https://github.com/aslost/pixtale · 截图 `assets/pixtale-shot.png`  
> 本站栈：Astro 7 · Svelte 5 岛 · Tailwind 4 · 静态优先

## 本站相册现状（事实）

| 面 | 实现 | 路径 |
|---|---|---|
| 相册列表 / 探索 | 作品集手风琴 + Three 无限画布（Svelte 岛） | `GalleryExplorer.svelte` |
| 相册内照片墙 | **CSS Multi-column**（`column-count` / `column-width`） | `gallery/[album].astro` · `gallery.css` |
| 配置 | `columnWidth` 默认 240 | `galleryConfig.ts` |

文章列表另有独立 `waterfall` 模式（同样偏 CSS columns）与可选 `grid.masonry` JS 最短列（当前 `masonry: false`）。

## 可移植 vs 勿搬

| 点 | 可抄？ | 说明 |
|---|---|---|
| 侧栏分区心智（照片/收藏/相册） | 可选降配 | 博客可做成顶栏 Tab 或侧栏 widget，勿照搬管理后台 |
| 高密度多列瀑布观感 | 是 | 调 `columnWidth`、圆角、间距；必要时再上 JS 最短列 |
| Next App Router / RSC / shadcn 壳 | 否 | 栈不匹配 |
| 回收站 / admin 工作台 | 否 | 个人博客无此产品面 |

## 轮子选型结论（相对 Grok 建议表）

| 候选 | 对本站 | 结论 |
|---|---|---|
| CSS `column-count` | **已在用** | 静态相册默认继续；先抛光观感 |
| Masonry.js + imagesLoaded | 可进 Svelte 岛 | 若要「最短列优先」再引入；成熟、文档全 |
| Bricklayer / waterfall.js | 备选 | 更轻；要文档/生态不如 Masonry |
| vue-waterfall-plugin-next 等 Vue 件 | **不适用** | 本站非 Vue |
| 整仓 Pixtale (Next) | **不适用** | 只作产品参考 |

## 反模式

- 为抄 Pixtale 引入 React/Next 运行时
- 把首页 Infinite Canvas 改成瀑布（职责不同）
- 未确认图片量级就上虚拟列表
