# master · 2026-08-07

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-07 | master | b244865f | feat | 布局收敛为列表与卡片 | 模式 list\|card；旧 grid/waterfall/brick 迁移；设置两钮；Swup 切页重套 |
| 2026-08-07 | master | cdba98ff | refactor | card-mode 样式落地 | 原瀑布视觉入 post-card-mode；Letter 跨栏；移除旧 grid/waterfall CSS |

## 做了什么
文章列表只保留「列表 / 卡片」。卡片沿用原瀑布视觉（文字主体、小图在下、置顶跨栏）。修好 Swup 翻页掉样式。下线等分 grid 与独立瀑布模式名。

## 关联
- `src/components/layout/PostPage.astro`
- `src/components/controls/DisplaySettingsIntegrated.svelte`
- `src/styles/post-card-mode.css`
- `src/styles/post-card-letter.css`

## 回滚
- `git revert cdba98ff b244865f`
