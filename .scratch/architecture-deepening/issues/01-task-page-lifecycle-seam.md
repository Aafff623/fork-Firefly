# 页面生命周期 seam（第一刀）

Type: task
Status: claimed

## Scope

把页面级监听 / 定时器 / observer 收进一个生命周期 seam；第一刀只做基础层和一个低风险消费者，不迁移全部 28 个 `swup:page:view` 监听。

## Done（2026-10-21）

- `src/lib/page-lifecycle.ts`：
  - boot 时建立首屏 epoch；首屏 `page:view` 只认领 epoch，不销毁 boot 阶段已登记的清理。
  - `before-swap` 统一 dispose 并把 `viewed` 复位；后续 `page:view` 建立新 epoch。
  - 删除未使用且语义错误的 `mountOnPageView`（会在注册时立即 mount，而不是在 page:view 时 mount）。
- `src/layouts/MainGridLayout.astro`：全局 boot（避开正在被其他 Agent 修改的 `Layout.astro`）。
- `src/components/features/TypewriterText.astro`：用 `armPageCleanup` 每页重新武装；`before-swap` 时销毁旧实例并清延迟计时器。
- `src/components/comment/Waline.astro`：懒启动监听只绑一次；`pendingIO` 走 `registerPageCleanup`，贴纸/头像的 page:view 监听加全局守卫。
- `src/components/comment/agent-avatar.ts`：保留嵌入页的幂等 boot 兜底，更新注释。
- `scripts/test-page-lifecycle.mts` + `package.json` 的 `test:lifecycle`：覆盖首屏保留、before-swap 清理、`onPage` abort、observer disconnect、重复 boot 幂等。
- `package.json` 新增 `check:behavior`，把三个行为测试接入 `check:gates` 与 deploy-cf。

## Verification

- `tsx scripts/test-page-lifecycle.mts`：PASS
- `tsc --noEmit --isolatedDeclarations`：0 错
- `biome ci ./src`：0 错（25 条存量 warning）
- `astro check`：0 errors / 0 warnings / 10 hints
- 浏览器（本地 dev 4322，已验证后停止）：
  - 首页 `booted:true`、`cleanups:1`、无 console 错误。
  - 点击文章软导航后 `epoch:1`、`viewed:true`、`cleanups:1`、无 console 错误。

## Residual

- 迁移 Layout / Profile / PostPage；PostPage 与 Profile 当前在他人未提交改动里，等落地。
- `Layout.astro` WIP 落地后把 boot 挪到页面壳，覆盖 login/embed 页。
- 当前 `article-navigation` 门禁本地 2 条失败来自工作树里 PostPage 的 WIP（preload/eager 改动），不是本轮代码；deploy 因此先只跑 `check:behavior`，v41 dist 与 budget 在 build 后跑。
- 观察 `TypewriterText` / Waline 的 `armPageCleanup` 模式，决定是否抽成公共 helper。
- 未跑移动端与 reduced-motion 回归；完整 build 已跑（2m20s）。
