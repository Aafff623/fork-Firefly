# master · 2026-08-06（合集像素 + style-17）

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | 0a1db338 | feat | 合集像素封面 | 七合集 chibi 静图 + 卡片叠字 UI |
| 2026-08-06 | master | 02e85df5 | feat | 分类条图标 | 按类 Lucide；时间线方形 icon-only |
| 2026-08-06 | master | f62cded5 | fix | 动态定位与批注 | 默认「太原 · 中北大学」；口语 blurb；配图路径 |
| 2026-08-06 | master | TBD | docs | style-taste 17 | 卡通人物风标准与 prompt 专节 |

## 做了什么
合集总览七卡换成日历同族软像素 chibi 静图并调叠字对比；分类条按类挂 Lucide（时间线仅图标）。动态去掉 IP 反查，固定默认定位，重写近期口语批注，并约定 `/assets/dynamic/` 配图路径。把该画风收成 MiniMax style-taste **17**，与 01 像素场景区分。

## 关联
- `prompt-craft.md` →「17 · 卡通人物风」
- `public/assets/collections/*.jpg`
- `docs/idea/calendar-cover/mood.md`

## 回滚
- 按上表 hash 分别 `git revert`
- 合集可只删 `cover` 字段与 `public/assets/collections/`
