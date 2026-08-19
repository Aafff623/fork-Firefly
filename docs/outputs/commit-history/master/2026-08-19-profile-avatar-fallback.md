# master · 2026-08-19（侧栏头像生产兜底）

## Status
shipped-local（等含此 commit 的 Vercel Ready 后再核 live；未打新 tag / 未推 Wiki）

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-19 | master | 2df3c17f | fix | 首屏锁头像 | HTML 默认 `is-avatar`；无引擎不切 Bot |
| 2026-08-19 | master | （本文件同批） | docs | ADR-0003 / CONTEXT | 写明首屏必须头像，防再默认空 Bot 盘 |

## 做了什么
`v1.3.0` 侧栏 1:4 轮播把 SSR 默认成 Bot 面。生产无 `geometry-data.js`（gitignore），首屏是米色空圆；悬停也会切回空盘。现改为 HTML 先出站点头像，HEAD 探测失败则不注入 vendor、不切面。几何仍不入库。

## 关联
- ADR-0003
- `src/components/widget/Profile.astro`
- `src/scripts/profile-grok-carousel.ts`

## 未纳入
- 新 GitHub Release（patch 适合 `v1.3.1`，等园主说「发布」）
- Wiki
- `public/notes/v4-pro-first-round-catalog/`（其他 session）

## 回滚
- `git revert` 本文件同批 docs 后再 `2df3c17f`
