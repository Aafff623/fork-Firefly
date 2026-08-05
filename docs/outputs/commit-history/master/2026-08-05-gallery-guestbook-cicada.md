# master · 2026-08-05 · gallery + guestbook cicada

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-05 | master | （待填） | feat | 相册照片墙与分类 | CSS columns 照片墙 + category 筛选（标签墙式切换） |
| 2026-08-05 | master | （待填） | feat | 留言卡竹蝉岛 | 自研 Canvas 绳系玩具嵌留言顶卡右半，透明无框 |
| 2026-08-05 | master | （待填） | docs | 灵感与 License 补记 | pixtale/pinterest idea + zhuzhiliao 授权边界 |

## 做了什么
相册首页补了本地照片瀑布墙与一级分类筛选；留言页顶卡右半嵌入自研竹蝉交互（非原作再分发），并去掉框线与多余 HUD。灵感库登记瀑布参考，竹知了笔记更正 License。

## 关联
- `Firefly/docs/idea/zhuzhiliao-toy/mood.md`
- `Firefly/docs/idea/pixtale-gallery/` · `pinterest-masonry/`
- 配置：`galleryConfig` · `siteConfig.guestbookCicada`

## 回滚
- 关 `siteConfig.guestbookCicada.enabled`
- 关 `galleryConfig.homeMasonry.enabled`；相册分类可清空 `category` / `categories`
