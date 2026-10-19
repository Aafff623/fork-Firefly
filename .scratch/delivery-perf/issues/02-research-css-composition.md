# 首页 CSS 582KB 的构成与可裁剪空间

Type: research
Status: resolved（2026-10-19，数据源：本地 dist 全量构建产物 + 865 个 html DOM 静态比对；分析脚本 `temp/research/css-js-topology/*.mjs`）

## Question

首页加载 8 个 CSS 文件、解压合计约 582 KB（`_astro/Layout.DjD_Pc1C.css` 412 KB、`_astro/MainGridLayout.DtLIR5Pd.css` 120 KB，其余零散）。`CONTEXT.md` 已把它列为「降到 <300KB 需 Tailwind 层重构，拍板项」。

需要回答：
- 这 412 KB 里，按规则来源分（Tailwind utilities / 自研 `.css` / `@layer` / 第三方组件库）各占多少？
- 哪些规则在**首页 DOM 上从未命中**（可裁剪）？哪些是跨页共用、必须保留？
- Tailwind 4 的 content 扫描范围是否过宽（把 `docs/`、`temp/`、组件字符串里的类名都收进来了）？
- 按页拆 CSS（每路由只带自己的）可行吗？Astro 当前是怎么分文件的？
- 参考站 84 KB 的 CSS 是怎么做到的（shadcn + Tailwind 4，全站约 150 行自研样式）？

产出：一份按「可立即裁剪 / 需重构 / 必须保留」三档分类的清单，附证据与预估节省。

## Answer

### 0. 口径修正（先说，避免误导后续决策）

交接基线表把「Firefly 解压 582KB」与「参考站 84KB」并列，**两者不同口径**。本地实测统一口径：

| 口径 | Firefly 首页 | 参考站 2x.nz | 倍数 |
|---|---|---|---|
| 解压 | 585.1 KB / 8 文件 | ~166 KB（165 主文件 + 3 懒加载） | 3.5× |
| gzip 传输 | 101.9 KB | ~84 KB | **1.2×** |

差距真实存在但量级是 3.5×（解压）/ 1.2×（传输），不是 7×。gzip 后 102KB 对纯静态 + CF CDN 属于可接受区间，**当前优化优先级应让位给资产（宠物 2.5MB / 横幅 2.5MB / 氛围图 1.6MB）**；CSS 是第二梯队。

### 1. 构成：Layout.css 416KB = Tailwind 层 128.5KB + 层外自研 287.5KB

按 `@layer` 配平切分（脚本 `analyze-layout-css2.mjs`）：

| 部分 | 体积 | 说明 |
|---|---|---|
| `@layer utilities` | 97.4 KB | 1056 个唯一 class |
| `@layer components` | 25.3 KB | 主要是 `@tailwindcss/typography`（prose） |
| `@layer base` | 3.5 KB | preflight |
| `@layer properties` + `theme` | 2.3 KB | Tailwind v4 机制 |
| **层外（无层）** | **287.5 KB** | `src/styles/*.css` 22 个文件经 main.css `@import` 原样合并（fancybox 官方 CSS 26KB、gift-surprise 40.6KB、site-footer 36.3KB、layout-styles 31.3KB、navbar 22.1KB、post-card-letter 19.5KB 等） |

首页另外 7 个文件共 169KB：`MainGridLayout` 119.5KB（svelte 组件 CSS 集合，非 Tailwind）、`site-footer` 29.3KB、`PostPage` 9.8KB、`PostMeta` 3.1KB、`SpritePet` 2.9KB、两个小文件 4.5KB。

### 2. 命中分析：静态 DOM 比对（含盲区说明）

对 865 个产物 html 提取全部 `class="…"`（全站唯一 class 1821 个），与 utilities/层外规则比对：

- **utilities 97.4KB**：全站命中 691/1056（65%）；全站均未命中的规则 ≈21.8KB（多为 JS 动态拼接类，见盲区）。
- **层外自研 287.5KB**：首页 DOM 未命中 928 条 / 116.4KB（40%）；全站均未命中 570 条 / 77.5KB。

**盲区（必须人工判读，不可直接当可裁）**：全站未命中 top 项里 `:root.dark`（4.5KB，暗色变量，class 由 JS 加在 `<html>`）与 fancybox 系列（~28.7KB，灯箱 DOM 由 fancybox JS 动态创建）都是**运行时类**，静态 html 抓不到。这两项必须保留。

### 3. Tailwind content 扫描范围：产物污染证据不足，但建议显式限定

`.gitignore` 已排除 `temp/`（Tailwind v4 尊重 gitignore）。未被排除的扫描面：`docs/`（63 文件）、`.agents/`（~500 个 skill 文件）、`scripts/`。抽样 30 个全站未命中 utility class 在 `.agents/`+`docs/`+`public/` 中查证：10 个有出现，但均为通用词误报（`container`/`static`/`table`/`collapse` 在文档里是普通英文单词），**没有找到「文档代码块类名生成伪 utility」的实例**；未命中主因是 src 内 JS 动态类与历史残留。结论：扫描过宽的成本是扫描时间（可忽略），不是产物体积。仍建议在 `main.css` 加 `@source` 显式限定 `../src` 与 `../public`，一劳永逸防回归（改动一行，构建后对比 utilities 体积即可验证）。

### 4. 按页拆 CSS：Astro 已按组件/页面分发，瓶颈在 main.css 单点

产物已有 37 个 `_astro/*.css`（按页面/组件分发，如 `ask` 38.6KB、`friends` 15.7KB 只在各自路由）。**瓶颈是 `src/styles/main.css` 被 `Layout.astro` 顶层 import——它的 416KB 进入全站每一个页面**。main.css 的 22 个自研 import 中，以下为页面专用却全站带载：

| 文件 | 源码体积 | 实际使用页面 |
|---|---|---|
| `ask.css` | 18.4KB（产物中 `.ask-*` 规则 14.2KB） | 仅 `/ask`（且 PROD 是 WIP 占位页） |
| fancybox 官方 + custom | 产物 28.7KB | 仅文章页/dynamic/相册的灯箱 |
| `gallery.css` / `anime-bangumi.css` / `categories.css` / `hero-bg.css` | ~15KB 源码 | 各页面 |

### 5. 参考站怎么做到的

侦察结论（`ref-2xnz-recon.md`）：CSS 主文件 165KB 未压缩 + 3 个懒加载；技术形态是 Rolldown + Preact SPA（每路由预渲染 HTML 回退），CSS 按路由 chunk 化 + 组件库（shadcn）样式精简 + 自研约 150 行。**它的 CSS 纪律来自「按路由拆 + 极简自研」，不是来自框架**。Firefly 自研 287KB 是主题生态（壁纸/横幅/宠物/浇水/卡片双模式）的功能面积累，无法照抄 150 行；可学的是「按路由拆」。

### 6. 三档清单

**可立即裁剪（低风险，改动都在 import 位置，预计节省 ~58KB raw / ~11KB gzip 首页口径）**

1. `main.css` 删除 `@import './ask.css'`（页面级 `ask.astro` 已有 import，删除后 /ask DEV/WIP 均不受影响；全站每页省 14.2KB raw）。
2. fancybox 两个 CSS import 从 `FancyboxManager.astro` 挪到使用方页面级（文章页布局 / dynamic / gallery 各自 import），全站非文章页省 28.7KB raw。需先确认 FancyboxManager 的引用面（组件被谁包含）再动。
3. `gallery/anime-bangumi/categories/hero-bg` 四个页面专用 css 从 main.css 挪到各自页面 import，~15KB raw。

**需重构（中工作量，需园主拍板预算后开工）**

4. main.css 拆「全站核心（layout/navbar/post-card/transition 等 ~15 个文件）+ 页面模块」，页面模块走页面级 import。这是把 416KB 单点变成「核心 ~200KB + 按页追加」的结构改造，触及所有布局组件，属独立 effort。
5. utilities 的 362 个全站未命中 class 逐个判读（JS 动态类保留 / 历史残留删除），预计可再裁 10-20KB，但需人工逐条确认，性价比低。
6. `MainGridLayout` 119.5KB 的 svelte 组件 CSS 混装（含 day-slide 等主题组件）——按 svelte 组件自身拆分空间有限，主要是它装载了哪些 island 的审计。

**必须保留（动它们 = 功能回归）**

7. Tailwind layers 128.5KB：utilities 65% 全站命中、base 是 preflight、components 是 prose 文章排版。
8. `:root.dark` 4.5KB 暗色变量体系；fancybox 样式本身（文章页灯箱功能，只是不该全站带）。
9. site-footer 36.3KB / layout-styles 31.3KB / gift-surprise 40.6KB / navbar 22.1KB：全站功能（浇水彩蛋、导航、页脚），体积大但跨页必需；要减只能重写（不在本 effort 范围）。

### 7. 对「降到 <300KB」目标的回答

现状 585KB：三档裁剪后 ≈527KB raw（-10%）/ ~91KB gzip。**不动重构达不到 300KB**；到 300KB 需要第 4 项（按路由拆）+ 自研大件重写。建议顺序：先做可立即裁剪三项（一次构建验证），把「按路由拆」作为独立 spec 排期。
