# master · 2026-08-05 · Banner 氛围层同色同频

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-05 | master | 1c26255c | feat | Banner 氛围层 | 垫底层 + 软过渡 + 与横幅同色同频；间隔 30s |
| 2026-08-05 | master | 95ecb6fe | docs | CONTEXT / commit-history | 术语与批次记录 |

## 做了什么
Banner 模式增加正文氛围全屏层，解决横幅以下发白。选型后改为与横幅锁步换图（`firefly:banner-slide`），按 banner-01～11 配对 BA-01～11；色调可复用旧 PC 图，缺口 MiniMax 补全景。氛围开时藏近白水波纹，横幅底边 mask 淡出。轮播间隔调至 30 秒。

## 关联
- `src/components/features/AtmosphereLayer.astro`
- `src/config/backgroundWallpaper.ts` · `src/types/backgroundWallpaper.ts`
- `src/layouts/MainGridLayout.astro` · `Layout.astro`
- `src/styles/layout-styles.css`
- `public/assets/atmosphere/`

## 回滚
- 配置：`backgroundWallpaper.atmosphere.enable = false`（恢复原水波纹衔接）
- 或 revert：`git revert 95ecb6fe 1c26255c`
