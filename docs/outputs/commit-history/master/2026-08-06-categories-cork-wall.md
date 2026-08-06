# master · 2026-08-06

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | b778a6f8 | feat | 分类软木墙 | 侧栏分类卡：衬线标题、分色计数/热度条、迷你软木便利贴 |

## 做了什么
侧栏「分类」从上游 `ButtonLink` 纯列表升级为迷你软木便利贴墙，标题气质对齐标签墙/热笺，行内复用 `categoryIconConfig` 与 `accent-from-label`，视觉语言对齐 `/categories/` 软木板。超出阈值走「更多 +N」进分类页。

## 关联
- `src/components/widget/Categories.astro`
- `src/components/common/WidgetLayout.astro`
- 本地验收：`http://127.0.0.1:4321`

## 回滚
- `git revert b778a6f8`
