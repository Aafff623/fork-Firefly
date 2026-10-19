# Map · Firefly 交付性能改造

## Destination

一份**定稿的决策集**，把「Firefly 首屏交付过重」这件事收敛到一组已经决定好的改造项，使后续会话无需再决策即可进入 spec / 实现。

判定标准：每个改造项都有明确取舍、明确不做什么、以及可验收的指标口径。

## Notes

- 领域：Astro 7 SSG + Svelte/React islands + Tailwind 4，Cloudflare Workers 单平台（ADR-0009）。
- 参考站：https://2x.nz/（`二叉树树 / AcoFork`，B站 UID 325903362）。侦察结论见 `.scratch/delivery-perf/ref-2xnz-recon.md` 摘要段与 `temp/reports/project-analysis/2026-10-18-项目深度分析.md`。
- **反直觉事实（决定整张地图走向）**：参考站当前是 **Rolldown + Preact 的 SPA 壳**（每路由预渲染可读回退），不是文章里写的 SvelteKit；而它的作者本人在 B 站有一期视频标题就叫《博客就得 prerender，整那 CSR 干鸡毛》。Firefly 已经是预渲染 SSG。**差距不在框架，在资产与 CSS/JS 纪律。**
- 每次会话先看：`CONTEXT.md`「已知缺口」段（已把首页 CSS 列为「拍板项」）、`docs/adr/0009-cloudflare-only-hosting.md`。
- 测量口径：字节数与请求数可靠；TTFB / FCP 绝对值受本机代理链路影响，**不可跨站对比**。

## 基线（2026-10-18 实测，Chrome DevTools + Performance API）

同一台机器、同一次会话、冷加载：

| 指标 | threetwoa.live 首页 | 2x.nz 首页 |
|---|---|---|
| 请求数 | **149** | 106 |
| 传输字节 | **5,137 KB** | 896 KB |
| 解压字节 | **10,313 KB** | 3,444 KB |
| CSS（解压） | **~582 KB / 8 文件** | 84 KB / 3 文件 |
| JS（解压） | 876 KB / **74 文件** | 813 KB / 5 入口 + 78 fetch |
| 首屏图片（解压） | ~2,831 KB / 49 个 | 首屏 top12 中无图片 |

首页单文件体积 > 200KB 的资产（解压）：

- `pets/maid-deepseek-whale/spritesheet.webp` — **2,538 KB**（单文件最大项）
- `assets/garden-note/gn-03.mp4` — 1,278 KB
- 10 张 `banner-0*.avif` — 合计 **~2,479 KB**
- 11 张 `assets/atmosphere/ba-*.jpg` — 合计 **~1,602 KB**
- `assets/garden-note/gn-03.jpg` — 530 KB
- 两个被预取的整页 HTML：`posts/xiuxing-worldly/` 816 KB、`posts/ai-video-making/` 448 KB
- CSS：`_astro/Layout.DjD_Pc1C.css` 412 KB、`_astro/MainGridLayout.DtLIR5Pd.css` 120 KB

## Decisions so far

<!-- 空：本会话只做 charting，不解决任何 ticket -->

## Research so far

- **02（CSS 构成）已解**（2026-10-19）：首页 585KB = Tailwind 层 128.5KB + 层外自研 287.5KB（Layout.css 416KB 全站单点）；口径修正：gzip 传输 102KB vs 参考站 84KB 只差 1.2×；可立即裁剪三项（ask.css / fancybox / 页面专用 css 挪页面级）≈58KB raw。答案见 `issues/02-research-css-composition.md`。
- **03（JS chunk 归属）已解**（2026-10-19）：产物实际 117 chunk；首页冷加载静态闭包 = 39 个 / 237.5KB（Chrome 74 属交互后口径）；三个可延后项（SpritePet / DisplaySettingsIntegrated 等）合计 ~65KB。答案见 `issues/03-research-js-chunk-topology.md`。
- **门禁 4 条历史失败已修**（commit `70b72aa0`）：ui-motion 三条为门禁快照过时（clock 0.92 / footer 暗色 / tag sphere 帧归一化均有验收证据），v41 AskChat 孤儿加 DEV-only 豁免；干净 HEAD 门禁链全绿。

## Not yet specified

- **正文图片管线**：全站 2400+ 张正文图（`public/` 共 144MB）在构建期经 LQIP + Astro 图片优化；参考站走「内容分仓 + 构建期 avif + CDN 侧格式协商」。要不要改、改到哪一层，等「内容与代码分仓」这条决策落地后才能问得够具体。
- **首屏渲染策略是否要显式锁死**：Firefly 已是 Astro SSG 预渲染；「保持 SSG、不引入 SPA 壳」大概率应作为一条**显式**决策记录，避免后续被「向参考站靠齐」误读为要改渲染模式。等「参考站方向取舍」决议后成形。
- **可读回退与 boot 看门狗**：参考站有 `<noscript>` 可读回退 + 12s 看门狗（App 挂了退回可读文档）。Firefly 刚加了 `BootLoader.astro`（未提交）。要不要对齐这套，取决于渲染策略决策。
- **第三方脚本同意门控**：参考站把 AdSense / 分析脚本放在 `type="text/plain" data-src=...`，同意后才激活，CSP 用 sha256 白名单。Firefly 的 GA / Clarity / Umami / 51la 配置目前全空，等园主给 ID 才谈得上。等「参考站方向取舍」之后。
- **宠物引擎的体量与必要性**：`SpritePet.svelte` 2588 行 + 2.5MB spritesheet 是全站最重的单点。是「降规格」「按需加载」还是「保留」，等「装饰资产预算」决议后才有边界。

## Out of scope

- **把 Firefly 改成 SPA / 换框架**（SvelteKit、Preact、React Router SSR 等）。理由：内容站已走预渲染，参考站作者本人也主张博客 prerender；框架替换不解决 5.1MB 传输的主因（装饰资产 + CSS），却会摧毁现有 island / Swup / 发文流水线。若园主仍要换，应作为**新的 effort** 重新开图，不是本图的延续。
- **托管平台再迁移**（离开 Cloudflare）。ADR-0009 已收敛单平台，本图不动。
- **内容搬迁**：把现有 129 篇文章重写或改格式。本图只谈交付性能，不谈内容。
