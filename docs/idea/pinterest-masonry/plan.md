# 博客相册瀑布 · 完整规划（2026-08-05）

> 依据：本站现码 + Pixtale clone 深挖 + Grok L0/L1 + Pinterest 观感。  
> **L0 首页落点已定并实现**：`/gallery` 的 `GalleryExplorer` 正下方挂 CSS columns 照片墙。

## 目标

相册首页与内页更接近 Pinterest 砖墙感，同时守住 Astro 静态博客边界。

## 落点（已实现）

```text
标题 → GalleryExplorer（作品集/无限滚动）→ 照片墙（homeMasonry）→ 搜索/标签 → 相册卡片
```

- 配置：`galleryConfig.homeMasonry.{enabled,maxItems}`
- 组件：复用 `PhotoCard`，Fancybox 组 `gallery-home`
- 数据：`localAlbumPhotos`（不含 demo 画库）

## 不做清单

- 不引入 Next/React/Vue
- 不并入 Pixtale 源码（AGPL）
- 不把首页 Three 无限画布改成瀑布
- 默认不上虚拟列表 / 无限分页

## 三层路线

```text
L0  CSS columns     ← 首页墙 + 内页统一 gap（本阶段已做）
L1  Masonry.js 开关 ← 要最短列时再开
L2  相册信息架构    ← Pixtale 侧栏心智降配，独立 PRD
```

## 参考资产

| 资产 | 位置 | 寿命 |
|---|---|---|
| Pixtale clone | `blog/temp/pixtale/` | 临时，收工删 |
| 深挖笔记 | `docs/idea/pixtale-gallery/deep-dive.md` | 留 |
| 本站现码 | `src/pages/gallery/` · `PhotoCard.astro` | 产品 |

## 下一步

1. L1/L2 暂挂 idea
2. 会话收尾时删除 `blog/temp/pixtale/`
