# Issue · 参考仓库借鉴第一批（CuteLeaf/Firefly + saicaca/fuwari）

Status: ready-for-agent

## 来源

2026-10-26 参考仓库调研第一批。10 个热门博客架构仓库已浅克隆到 `temp/repos/`（本地专属），第一批分析 CuteLeaf/Firefly（直系上游）与 saicaca/fuwari（祖上游），每仓 3 个 agent 分维度（架构性能 / 功能模型 / 借鉴评估）深挖，6 份报告在 `temp/reports/batch1/`，汇总版 `temp/reports/batch1-summary.md`。园主确认「都做对应的梳理」，本 effort 承接全部 16 项。

## 问题

相对两个同源上游，我们有一批小块缺口与一个已核实缺陷：

1. **OG 分享卡缺失**：`src/config/siteConfig.ts` `generateOgImages: false`，全站无 og:image meta；且现有 satori 实现构建期 fetch Google Fonts，失败静默出豆腐块。
2. **死代码**：`src/components/misc/License.astro`（比上游多 author/sourceLink props）与 `licenseConfig.enable: true` 都在，但无任何页面渲染。
3. **工程化缺口**：首页约 54KB `is:inline` 脚本未压缩；无 site-root 产物根解析，构建链写死 `dist/client`。
4. **已核实缺陷（字体子集化路径）**：产物根是 `dist/client/`，但 `scripts/subset-fonts.ts` 硬编码 `DIST_DIR = "dist"`、`OUTPUT_DIR = "dist/_astro/fonts"`，替换时 `path.relative("dist", …)` 算出的 URL 带 `client/` 前缀与 CSS 实际引用对不上。当前 `--font-greatvibes` 不在 `collectUsedFontCssVars` 集合（只被 GlyphTitleEffects.astro 手写 @font-face 消费）故脚本跳过、无害空转；一旦有字体进入子集路径，将写出不被部署的文件、替换失效、并删掉原字体致线上 404。上游用 `scripts/site-root.ts` 修同类问题。
5. **功能增量**：Series 连载、llms.txt、`?q=` 搜索参数、RSS contentMode、frontmatter.json、banner.credit、沉浸阅读、Projects 页、GitHub 卡构建期静态数据，共 9 项对方有我们没有。

## 证据（摘要）

- 报告：`temp/reports/batch1/cuteleaf-firefly-borrow.md`、`fuwari-borrow.md`（借鉴点全集）；`cuteleaf-firefly-arch-perf.md`（含内联脚本 54KB、图标裁剪等实测）；`cuteleaf-firefly-features.md`、`fuwari-features.md`（40+30 条职责重复清单）。
- subset-fonts 缺陷为 2026-10-26 亲自核实：`dist/` 下实际为 `client/` + `server/`；`pagefind --site dist/client`；`scripts/strip-legacy-fonts.ts` 用 `dist/client/_astro`；`subset-fonts.ts:15-16` 写死 `dist`。
- 上游证据路径（浅克隆在 `temp/repos/Firefly/`，本地专属；公网路径见各票）：
  - OG：`src/pages/og/[...slug].ts`（takumi-js + @fontsource-variable/noto-sans-sc 分片）
  - Series：`src/content.config.ts:24-25,82-83`、`src/utils/content-utils.ts:86-152`、`src/pages/series/index.astro`、`src/components/misc/SeriesNav.astro`
  - llms.txt：`src/pages/llms.txt.ts`
  - 内联压缩：`scripts/minify-inline-scripts.ts`（minifyIdentifiers 必须 false）；site-root：`scripts/site-root.ts`
  - GitHub 卡：`scripts/generate-github-card-data.ts`、`src/components/features/GithubCardManager.astro`
  - 搜索参数：`src/components/pages/AdvancedSearch.svelte`；RSS：`src/config/siteConfig.ts:353-358` + `src/pages/rss.xml.ts`
  - 沉浸阅读：`src/config/siteConfig.ts:250-259` + `src/components/controls/ImmersiveReading.astro` / `ImmersiveTOC.astro`
  - Projects：`src/content.config.ts:108-142` + `src/pages/projects/` + `src/utils/projects-utils.ts`
- fuwari 证据：`src/pages/posts/[...slug].astro:109`（License 挂载）、`frontmatter.json`、`src/config.ts:22-26`（banner.credit）。

## 本轮决策（2026-10-26 园主确认）

- 范围：16 项全量立项，分三组——直接痛点（01–04）、工程化与缺陷（05–08）、新功能与治理（09–16）。
- 顺序建议：先低成本痛点组（01/03/04/05/06/07），再新功能组；中成本项（02/08/14/15）各自独立评估后再开。
- 01 与 02 是同一痛点的两档解法（静态兜底 vs takumi 全量）；若 02 实施则 01 可关闭，反之 01 先行不阻塞 02。
- 07 blocked by 06（site-root 先行）。
- `takumi-js` 第三方许可先确认再入 `package.json`（02 的前置）。
- Series 的 `seriesOrder` 手动维护，需在 Agent 发文流水线（post-publish）加字段提示（09 的验收项）。
- 治理标准 16 只立规矩不做大重构（不合并现有 config 文件）。

## 边界

- 不 push、不打 tag、不建远端 release；远端 GitHub issue 是否创建见当轮汇报（仓内 `docs/agents/issue-tracker.md` 2026-10-19 约定「不使用 GitHub Issues」，与园主本轮指示冲突，待园主定夺）。
- 不碰其他 Agent 未提交的 WIP 文件（当前 `git status` 可见 auth / comment sticker-suggest / displaySettings / i18n / spec 内容等在制品）；本 effort 票若目标文件在 WIP 中，保持 blocked 并记录。
- 不动架构、不做视觉改版、不删既有功能；配置治理只立标准不重构。
- 每票完成标准：`pnpm check && pnpm type-check` 相关部分 + `pnpm check:gates` 绿（改构建链的票必须跑构建验证）；未本地验收不宣称完成。
- 票的最终状态与实现记录进本目录；不放 `TODO.md`。
