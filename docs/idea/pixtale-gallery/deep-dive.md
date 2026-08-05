# Pixtale 深挖（临时 clone · 2026-08-05）

> 本地：`blog/temp/pixtale/`（**收工可删**）  
> 许可：**AGPL-3.0-only** → 禁止把其源码并进 Firefly（MIT 个人站）；只学思路与观感。  
> 演示：https://022335.xyz

## 它是什么

全栈 **照片管理系统**，不是静态博客相册主题。

| 层 | 选型 |
|---|---|
| 前端 | Next.js 16 · React 19 · Tailwind 4 · shadcn |
| 瀑布 | **`masonic`**（`MasonryScroller` + 虚拟滚动） |
| 灯箱 | yet-another-react-lightbox（另依赖里有 `react-photo-album`） |
| 后端 | Hono · Drizzle · SQLite · S3/本地存储 · EXIF · 多用户 |

## 瀑布实现要点（可学不可抄码）

入口：`src/components/photo/photo-masonry.tsx` · `photo-card.tsx`

| 机制 | 做法 | 对本站启示 |
|---|---|---|
| 最短列 + 虚拟列表 | `masonic` + `usePositioner` | 图很多才需要；博客静态墙用不上这套 React 库 |
| 预知宽高 | `PhotoVo.width/height` → `getPhotoHeight(colW)` | L0 CLS：给图带尺寸/ratio |
| 列宽 | 桌面固定约 **240px**；移动 `(width-4)/2` | 与本站 `galleryConfig.columnWidth=240` 巧合同量级 |
| gutter | `columnGutter/rowGutter: 4`（很密） | L0 可略收紧 gap，但主栏窄勿抄六七列 |
| 无限滚 | 触底 `onReachBottom` + 游标分页 | 本站相册是静态扫盘，默认不做 |
| 侧栏占宽 | 按 sidebar open 算 `wrapWidth` | 本站双侧栏已由 MainGridLayout 约束 |
| 占位 | thumbhash / skeleton | 本站已有 LQIP |

## 明确不搬

- Next / React / Hono / SQLite / 多用户 / 回收站 / S3 管线  
- `masonic` 本身（React-only；Svelte 侧 L1 仍用 Masonry.js 更合适）  
- 任何 AGPL 源文件进产品仓  

## 和本站规划的对齐

见同主题 [`../pinterest-masonry/grok-l0-l1.md`](../pinterest-masonry/grok-l0-l1.md) 与下文「完整规划」。
