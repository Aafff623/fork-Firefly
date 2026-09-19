# ADR-0009 · 托管收敛 Cloudflare 单平台（Vercel / EdgeOne 退役）

- Status: accepted
- Date: 2026-09-19

## Context

站点托管经历三个阶段：Vercel 源站（前期）→ EdgeOne CDN 前置 + Vercel 源站（09-12 EdgeOne 个人版到期退场，DNS 直连 Vercel）→ Cloudflare Workers 全量承接（09-19 Phase 4/5 完成）。

迁移完成后的事实：`deploy-cf.yml` CI 构建全绿；真域（根域 + www）全站回归通过（含 /archive 308）；Workers 自定义域自动签发 SSL；R2 图床与 Worker secrets 均已在 Cloudflare 侧稳定运行。Vercel 项目与 EdgeOne 均不再承接任何流量。

## Decision

- 生产托管**收敛为 Cloudflare 一家**：Workers（SSR/API/静态）+ Cloudflare DNS/SSL + R2 图床。
- `astro.config.mjs` 适配器**固定 `@astrojs/cloudflare`**，删除 `@astrojs/vercel` / `@edgeone/astro` 依赖与 `CF_WORKERS` / `EDGEONE` 环境变量分支；本地 `pnpm build` 与 CI 同走 Cloudflare。
- 删除 `vercel.json`、`edgeone.json`、未入库的 Vercel 工作流文件；Vercel 项目 `fork-firefly` 已从账号删除（09-19，`vercel project rm`）。
- README / CONTEXT / AGENTS 的部署事实同步改写为单平台口径（ADR-0008 同期）。

## Consequences

### 正面

- 平台账目一家清：DNS、SSL、托管、图床、CI 部署全在 Cloudflare，运维面收敛。
- 本地构建与 CI 完全同构（此前本地 vercel 适配器在 Windows 上有 symlink EPERM 尾巴问题，随适配器退役消失）。
- 图标集收窄与正文图 constrained 响应式（同批提交）压低构建内存与产物体积。

### 代价与边界

- Vercel 备用入口与回滚能力随之消失；`fork-firefly.vercel.app` 直链失效（404）。
- EdgeOne 回滚窗口至 2026-11-13（期内续费可恢复），其后彻底关闭。
- 国内访问走 Cloudflare 边缘（未备案），不宣称大陆节点加速。
- Workers 免费档请求额度为站点上限（当前流量远未触顶）；`client:idle`→`load` 等面板级优化见后续提交。
