# master · 2026-08-06（标签墙 / 导航 / 追番 / 头像框）

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | fa890585 | feat | 标签球背景与灵敏度 | 深邃星空纹理叠层；DRAG_DIV 提高跟手度 |
| 2026-08-06 | master | d6b7a627 | fix | 导航下拉悬停 | 修复 data-force-closed 首次悬停被盖掉 |
| 2026-08-06 | master | 50bc587b | feat | 追番本地兜底 | 12 部经典番 WebP + anime-list.json |
| 2026-08-06 | master | 79de5808 | feat | 按时段主题 | time 模式亮暗 + 头像框早期初始化接线 |
| 2026-08-06 | master | 6906ddcb | feat | 头像边框选择 | 显示设置外观区 6 框 + 无边框，默认金属细环 |

## 做了什么
标签墙球体不再空底，拖拽更跟手。导航下拉间歇失灵修好。追番在 B 站隐私时用本地精选封面。侧栏头像框可在显示设置切换，默认金属细环。

## 关联
- 挑选临时页 `tmp/avatar-frame-gallery` 已删（选定后落地 public）
- 未纳入：ambient-fx / effects / RepelText 等其他 session WIP

## 回滚
- `git revert 6906ddcb..fa890585`（倒序逐个）或关 `avatarFrameSwitchable` / `avatarFrame.enabled`
