# master · 2026-08-07

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | eacdb85c | feat | about 去外层卡片 + hero 共享层 + 骑士少女微动图 | hero-bg.css 三页复用，AboutWaves 删除 |
| 2026-08-07 | master | 2e46f3d4 | feat | about 名片配色去AI味 + clip-path 卷出 | 磨砂融入 hero，入场改 clip-path 揭开 |
| 2026-08-07 | master | 3b898c5b | feat | 动态单图缩略图 + K12 动态 | 16rem/11rem 缩略，点击 Fancybox 放大 |
| 2026-08-07 | master | 61ebe666 | feat | 新增 dynamic-post 技能 | 动态发布全链路文档 |

## 做了什么
about 页收尾：外层卡片按 guestbook 结构重构（card-base 包裹），名片（RotatingPopCard）紫色块改成主色×青蓝→暖黄的柔和渐变、加磨砂半透融入 hero 水彩，入场动画从 width 重排改成 clip-path 左侧揭开（顺滑不卡）。动态模块：单图缩略图收紧到 16rem/11rem、点击开大图，发了一条 K12 炸弹车动态。沉淀了 dynamic-post 技能，把动态全链路（schema/API/kind 启发式/配图规范/级联）写成文档。

## 关联
- 技能：`.cursor/skills/dynamic-post/`（junction 到 `blog/.cursor/skills/`）
- 关键：`hero-bg.css`、`RotatingPopCard.astro`、`dynamic.css`、`public/assets/dynamic/k12-train.jpg`

## 回滚
- 单点 revert 上表对应 hash；名片/动态/技能互不耦合
