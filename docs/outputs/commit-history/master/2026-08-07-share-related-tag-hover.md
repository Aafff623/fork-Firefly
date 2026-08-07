# master · 2026-08-07

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-07 | master | 59b71fb2 | fix | 标签墙首次悬停时序 | 空隙抖动不再误烧 0.5s；换签/聚焦后走 1s |
| 2026-08-07 | master | 4eb16e96 | feat | 分享海报纸质礼品卡 | 右上角关闭、纸感暖白、正文简洁字体、画布略放大 |
| 2026-08-07 | master | bfe14395 | feat | 分享区强推相关文 | RelatedHighlight 替换 CC 当前文卡；上下篇小字双行 |

## 做了什么
修标签墙密排布下首次悬停被空隙误判成 1s 的问题。分享海报改成纸质礼品卡气质并补显式关闭。文章页分享区下方改为强推相关文封面卡，上一篇/下一篇标题更易读。

## 关联
- `src/components/widget/TagChalkSphere.astro`
- `src/components/misc/SharePoster.svelte`
- `src/components/misc/RelatedHighlight.astro`
- `src/pages/posts/[...slug].astro`

## 回滚
- `git revert bfe14395 4eb16e96 59b71fb2`
