# master · 2026-08-02

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-02 | master | 663df452 | feat | 相册双模式 | 作品集手风琴 + Three.js 无限画布、demo 资源、暗色/聚焦/默认作品集 |
| 2026-08-02 | master | 997e106d | feat | 幕布聚焦 | `/gallery` 与 `/dynamic` 侧栏飞出、中栏放大 |

## 做了什么
相册页增加作品集 / 无限滚动双模式：前者为水平手风琴，后者为可拖拽缩放的 WebGL 无限画布（含悬浮高亮、选中抬层、循环重生）。每次进入固定默认作品集。动态与相册页接入幕布聚焦，进入时侧栏让出视野。

## 关联
- 组件：`src/components/pages/gallery/`
- 样式：`src/styles/gallery.css`、`src/styles/curtain-focus.css`
- 资源：`public/gallery/_demo/`
- 依赖：`three`、`@types/three`

## 回滚
- `git revert 997e106d 663df452`（逆序）
- 或仅撤幕布：`git revert 997e106d`
