# Issue · 参考仓库借鉴第三批（hugo-PaperMod + hexo-theme-butterfly）

Status: ready-for-agent

## 来源

2026-10-26 参考仓库调研第三批。前两批已立项 32 项（`.scratch/refrepo-borrow-batch1`、`batch2`）；本批分析两个**跨栈**之王：**hugo-PaperMod**（Hugo 生态最热主题 14k★，MIT）与 **hexo-theme-butterfly**（Hexo 中文圈最热 8.4k★，Apache-2.0），每仓 3 个 agent 分维度深挖，6 份报告在 `temp/reports/batch3/`，汇总版 `temp/reports/batch3-summary.md`。园主确认全量立项，本 effort 承接 18 项。远端汇总 issue：#5。

## 问题

跨栈对照后定位出一批「思想迁移」级增量（代码不可直抄）：

1. **工程卫生缺口**（已亲证）：`src/` 0 处 noindex——Workers 预览 URL 有重复收录风险；无统一搜索排除机制（searchHidden）；无自定义代码注入点；36 个 config 文件只有手工 README（违背 AGENTS.md「不自建可重建文档」条款）；无工具链版本硬门禁；无第三方 CDN 资产总闸。
2. **SEO/统计缺口**：无站长验证 meta；无站点 PV/UV 展示（我们在 CF Workers 上，CF Web Analytics beacon 免 cookie 是天然适配）；无主动推送（IndexNow/百度）；无每标签 RSS（依赖批 2 票 04）。
3. **交互/功能补缺**：inject 注入点、最新评论侧栏卡、首页三模式、锚点焦点管理、noscript 暗色兜底、复制追加版权、PWA（高风险）、一批小件（按月归档/列表 RSS 按钮/accesskey/全局 toast/滚动记忆/Mermaid 缩放/阅读模式开关）。

## 证据（摘要）

- 报告：`temp/reports/batch3/{papermod,butterfly}-{arch-perf,features,borrow}.md`；汇总 `temp/reports/batch3-summary.md`。
- 亲自核实（2026-10-26）：`grep -rn "noindex" src/` 0 命中；无 searchHidden 统一机制；`src/config/` 无 customCode/injectHtml。
- 上游浅克隆（本地专属）：`temp/repos/hugo-PaperMod/`、`temp/repos/hexo-theme-butterfly/`；公网路径见各票。
- 防误判：prev/next 导航我们已有（`src/utils/content-utils.ts:72-84` + `src/pages/posts/[...slug].astro:546-566`），PaperMod agent 曾误判，已纠正；这是三批来第三次同类误判，各批汇总均已更正。

## 本轮决策（2026-10-26 园主确认）

- 范围：18 项全量立项（G 组工程治理 6 + H 组 SEO/统计 6 + I 组交互/功能 6）。
- 跨栈性质：全部为「思想迁移」，零代码复制；PaperMod MIT、Butterfly Apache-2.0（注意与 MIT 的署名差异），思想无许可问题。
- 顺序建议：先 G1（noindex 门控，最高优先）、G2、I1（注入点）；G3/G4/G6 治理件与 H 组可并行；I5 PWA 默认关、单独评估。
- G1 须防「误伤生产」：环境判定必须显式变量 + 本地/CI 双验证。
- H3 IndexNow 构建期外网风险参照批 2 票 13 纪律（快照 + 降级）。

## 边界

- 不 push、不打 tag；远端 issue #5 已建（2026-10-26 Issues 功能已开启）。
- **WIP 冲突**：实施前查 git status；改 `Layout.astro`/`package.json`/`src/config/` 的票若目标文件在他人在制品中，保持 blocked 并记录，不并行改同一文件。
- 不动架构；不为「文件数」合并 config（批 1 票 16 已定不重构）；PWA 默认关闭。
- 每票完成标准：`pnpm check && pnpm type-check`；CI 票跑 `pnpm check:gates`；未本地验收不宣称完成。
- 票的最终状态与实现记录进本目录；不放 `TODO.md`。
