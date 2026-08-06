# master · 2026-08-06 · dynamic timeline session

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | 0a5bd844 | feat | React 中轴错落时间线 | `@astrojs/react` island + vendored Timeline；退役 Svelte Feed；头像 getImage；间距收紧 |
| 2026-08-06 | master | a814037d | feat | 右栏动态目录 | ChatGPT 风分组目录 + scroll spy；仅 `/dynamic/` |
| 2026-08-06 | master | 82701b8f | feat | 底部栏景层加厚 | ba-06 景层 / 雾罩 / 花瓣；亮暗分调 |
| 2026-08-06 | master | ea8755a1 | perf | RepelText 丝滑 + 首页标题 | rAF 合并写 DOM；Welcome to My Digital Garden |
| 2026-08-06 | master | 1d3af0ad | fix | 日历 GIF 加载 | 压缩体积 + 早绑/按需预取 + 禁未载完淡出 |

## 做了什么
把 `/dynamic/` 从 Svelte 列表换成 React 中轴错落时间线，并补上右栏按时间分组的快捷目录。顺带修了标题斥力卡顿、日历顶 GIF 偶发露红底、底部栏过淡，以及首页欢迎文案。音效比选台仍在本地 `tmp/repel-sfx-compare/`（gitignore），未接入正式站。

## 关联
- `tmp/dynamic-nav-timeline-research.md`（已清理）
- `src/components/pages/dynamic/react/`
- `src/components/widget/DynamicNav*.tsx|astro`

## 回滚
- `git revert 1d3af0ad ea8755a1 82701b8f a814037d 0a5bd844`
