# ADR-0003 · Grok Bot 几何仅本机，不入库再分发

- Status: superseded by [ADR-0004](0004-firefly-bot-self-geometry.md)（xAI 资产不入库的约束仍然有效，replica 本机拷贝已由自研外壳取代）
- Date: 2026-08-19

## Context

侧栏 `Profile` 圆槽用学习仓 [blessonism/grok-icon-study](https://github.com/blessonism/grok-icon-study) 的 replica 引擎做头像 ↔ Bot 宏切。该仓写明：抽出几何与素材归 **xAI**，仅供学习，勿商用、勿再分发、勿当本站商标。把 `geometry-data.js` 与 replica `src/*.js` 推进 GitHub / Vercel 等于再分发。

## Decision

1. **编舞与时间表入库**：`src/scripts/profile-grok-carousel.ts`、`profile-grok-timing.ts`、`Profile.astro` 圆槽接线。
2. **几何不出仓**：`public/vendor/grok-bot/**` gitignore，仅 `README.md` 入库（本地从 `.scratch/refs/grok-icon-study/replica` 拷贝的步骤写在 README）。
3. **线上缺 vendor**：侧栏锁静态头像，不跑 Bot，不 404 整页。**HTML 首屏必须 `is-avatar`**（头像面 `is-on`）；引擎未就绪时禁止切 Bot 面（含悬停）。禁止为了 1:4 把 SSR 默认成空 Bot 盘。
4. **Ask / LiveChat**：分析结论是缩小常驻、关 overlay 与跟手，且 `/ask` 应关侧栏轮播以免双实例；**尚未实现**，未点头不写。

## Consequences

### 正面

- 仓库与生产构建不夹带 xAI 抽出多边形。
- 本机 `pnpm dev` 在拷过 vendor 后可看完整动效。

### 负面 / 风险

- 克隆仓的人若未拷 replica，侧栏只有头像。
- 生产默认看不到 Bot，直到另有合法自绘或书面授权。
- replica 与编舞脚本可能漂移，需对照 `.scratch/preview-grok-avatar/`。
- 若 HTML 默认 `is-bot` 而生产无几何，首屏是米色空圆；已改为首屏头像。
