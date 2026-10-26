# Issue · 参考仓库借鉴第二批（astro-paper + Shirone）

Status: ready-for-agent

## 来源

2026-10-26 参考仓库调研第二批。第一批（CuteLeaf/Firefly + fuwari）已立项 16 项于 `.scratch/refrepo-borrow-batch1/`；本批分析 **satnaing/astro-paper**（5.2k★，MIT，极简标杆）与 **LyraVoid/Shirone**（381★，MIT，Mizuki 停更后的重构后继，2026-08 新建日更），每仓 3 个 agent 分维度深挖，6 份报告在 `temp/reports/batch2/`，汇总版 `temp/reports/batch2-summary.md`。园主确认「都做对应的梳理」，本 effort 承接全部 16 项新增量。

## 问题

相对这两个仓库，我们有一批已亲自核实的缺口：

1. **SEO/a11y 元数据缺口**（均已 grep 证实）：全站 0 处 canonical；Layout 无 skip-to-content；focus-visible 只有组件级散规则无全局层；JSON-LD 缺 dateModified/image。
2. **定时发布缺位**：`src/lib/article-index.ts` 的 `isArticleVisible` 只判 draft，未来日期的文章会立即上榜（无 scheduledPostMargin 机制）。
3. **测试与工程化缺口**：只有 12 个 Node 断言脚本、零浏览器测试（对方 64 个 Playwright spec 覆盖 a11y/CLS/动效降级）；CI 无 svelte-check；字体无字节预算门禁；33 个配置域零 schema。
4. **工程隐患**：LQIP 按路径增量，换图静默过期；动效散落 20+ 文件且 framer-motion 实证在用 2 处 .tsx；首页 CSS 约 510KB；构建期内联 fetch 番剧数据无快照降级。
5. **Shirone 成熟度风险**：v1.0.6 新仓日更，抄方法学不抄代码；且其未继承 Mizuki 的 THIRD_PARTY_NOTICES（LICENSE 仅两行），照抄代码有「MIT 头掩盖 Apache-2.0 血缘」的溯源陷阱——代码级借鉴一律重实现。

## 证据（摘要）

- 报告：`temp/reports/batch2/{astro-paper,shirone}-{arch-perf,features,borrow}.md`；汇总 `temp/reports/batch2-summary.md`（含 2026-10-26 亲自核实记录 4 条）。
- 亲自核实：canonical/skip link grep 0 命中；article-index 无未来日期过滤；framer-motion 在 2 处 .tsx 实证使用。
- 上游浅克隆（本地专属）：`temp/repos/astro-paper/`、`temp/repos/Shirone/`；公网路径见各票。
- 对第一批的验证：Shirone 也有 llms.txt/llms-full.txt（批 1 票 04 方向再获印证）；astro-paper OG 字体走 Astro Fonts API 本地文件（批 1 票 02 的备选路线）。

## 本轮决策（2026-10-26 园主确认）

- 范围：16 项全量立项（E1–E6 SEO/a11y 小件 + F1–F10 工程项）。
- 顺序建议：先 E 组（元数据小件，除 Layout WIP 冲突外都便宜）与 F2/F3（测试与 CI 快赢）；F9（Markdown 按需加载）成本中高单独评估。
- HCT 动态配色与零 island 架构**观望不立项**：前者会推翻现有「中性灰+紫点缀」体系，只借容器色派生思路；后者立「新 island 前过零 island 检查」标准即可（写入 16 票或治理文档，由主对话定落点）。
- 代码级借鉴 Shirone 一律重实现，不整段拷（溯源陷阱）。
- E5 为小件打包票（面包屑/阅读进度条/编辑此页/每平台分享外跳/envField+GSC），可拆可并。

## 边界

- 不 push、不打 tag；远端 GitHub issue 仓库设置仍关闭 Issues（`hasIssuesEnabled: false`），待园主决定是否开启后补建。
- **WIP 冲突**（2026-10-26 查 git status）：`src/layouts/Layout.astro`、`src/layouts/MainGridLayout.astro`、`package.json`、`src/styles/post-card*.css` 正被其他 agent 修改。相关票（01/02/03/05/08/09）实施前必须重新查 git status；目标文件仍在 WIP 中的保持 blocked 并记录，不并行改同一文件。
- 不动架构、不做视觉改版、不删既有功能；F1 定时发布需产品决策（先扫存量再定 dev/prod 行为）。
- 每票完成标准：`pnpm check && pnpm type-check`；测试/CI 票跑相关门禁；未本地验收不宣称完成。
- 票的最终状态与实现记录进本目录；不放 `TODO.md`。
