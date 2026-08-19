# master · 2026-08-19（侧栏头像生产兜底）

## Status
shipped-live（www + Vercel origin 已核；未打新 tag / 未推 Wiki）

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-19 | master | 2df3c17f | fix | 首屏锁头像 | HTML 默认 `is-avatar`；无引擎不切 Bot |
| 2026-08-19 | master | b3153b77 | docs | ADR-0003 / CONTEXT | 写明首屏必须头像，防再默认空 Bot 盘 |
| 2026-08-19 | master | 79b929dd | fix | Vercel 构建 | 清 `node_modules` 再装，避开 sharp musl 断链 |

## 做了什么
`v1.3.0` 侧栏 1:4 轮播把 SSR 默认成 Bot 面。生产无 `geometry-data.js`（gitignore），首屏是米色空圆；悬停也会切回空盘。现改为 HTML 先出站点头像，HEAD 探测失败则不注入 vendor、不切面。几何仍不入库。

## 线上核（2026-08-19）
`79b929dd` Vercel Ready。www 与 `fork-firefly.vercel.app` 首页 HTML：`data-grok-face="avatar"`、`is-avatar`、头像面 `is-on`，Saber webp 200。源站 `/vendor/grok-bot/geometry-data.js` 仍 404；EdgeOne 可能把该 404 页以 `200 text/html` 吐出，探测按 content-type 拒绝，不注入。

## 关联
- ADR-0003
- `src/components/widget/Profile.astro`
- `src/scripts/profile-grok-carousel.ts`

## 未纳入
- 新 GitHub Release（patch 适合 `v1.3.1`，等园主说「发布」）
- Wiki
- `public/notes/v4-pro-first-round-catalog/`（其他 session）
- 把 `installCommand` 收成只拆 sharp 断链（现在每次构建都会 `rm -rf node_modules`，约 9 分钟）

## 回滚
- `git revert` 本文件同批 docs 后再 `2df3c17f`
