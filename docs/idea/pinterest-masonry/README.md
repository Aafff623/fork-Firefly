# theme · `pinterest-masonry`

评论区「Pinterest 式瀑布流」灵感 + 与 Grok 网页端会话的轮子对照 → 博客 **Gallery 相册内页 / 可选文章瀑布** 的选型依据。

| 文件 | 说明 |
|---|---|
| [`mood.md`](./mood.md) | 观感目标、Grok 建议消化、对本站栈的取舍 |
| [`grok-l0-l1.md`](./grok-l0-l1.md) | Grok L0/L1 稿对照现码（已有项 / 纠偏 / 执行序） |
| [`plan.md`](./plan.md) | **完整规划**：L0 首页落点已实现；L1/L2 待命 |
| [`assets/pinterest-ref.png`](./assets/pinterest-ref.png) | Pinterest 移动端瀑布参考 |
| [`assets/comment-ref.png`](./assets/comment-ref.png) | B 站评论（Vue 自研瀑布，无开源仓） |

**状态**：step-1 灵感入库（2026-08-05）；评论者无开源仓，仅作体验参照。  
**关联**：`pixtale-gallery`（有仓库的产品样板）。

---

## 一句话

要的是 **高度不齐、列宽统一、空隙被填满** 的砖墙感；实现上优先尊重本站 **Astro + 已有 CSS columns**，真要最短列再上 **Masonry.js**，不碰 Vue 插件。

## 灵感来源

- B 站评论：三年前 Vue 自研 Pinterest 瀑布（**无仓库**）
- 体验标杆：Pinterest / 小红书式卡片墙
- Grok 会话：轮子表（Masonry.js / Bricklayer / CSS columns / Vue 专用件等）

## 开放问题

- 相册内页是否从「够用的 CSS columns」升级到「最短列 JS」
- 与文章列表 `waterfall` 是否共用一套组件/CSS，还是相册单独抛光
- 懒加载 + 灯箱（PhotoSwipe / Fancybox 站内已有 Fancyapps）是否一并进 PRD
