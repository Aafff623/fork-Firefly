# 2x.nz 当前文章跳转与架构调研（2026-08-20）

> 目标：解释 2x.nz 的文章卡片为何在部分场景下具有“点下去就到”的体感，并提炼 Firefly 可迁移的设计约束。本文只使用 2x.nz、作者 afoim 的公开仓库和对应框架的官方文档；没有复制 AGPL 源码，也没有修改 Firefly 源码。

## 1. 结论先行

1. **2x.nz 的“毫秒级”主要是热路径现象，不是每次冷点击都能保证。** 本次观测中，同一篇文章的首次路由模块命中需要约 916 ms 才完成页面交换；路由模块进入浏览器缓存后，再次点击约 20 ms 完成。另一次隔离上下文的冷样本因脚本与首页图片竞争，超过 5 s 才完成。单样本不能代表总体分布，但足以否定“现网每次冷点击都毫秒级”的假设。

2. **真正值得迁移的是交换时序，而不是 Vue/Vuetify。** 2x.nz 在等待文章路由时保持旧列表和原滚动位置不动，等目标模块可用后，再把 URL、文章 DOM 和滚动到顶部一起提交。用户不会先看到旧页面被拖回顶部，再等文章出现。这正是 Firefly 当前体感差异最可能的核心。

3. **2x.nz 用前置体积换取了文章数据的热命中。** `/posts` 首次加载已下载包含全量文章 Markdown 的 `blog-DDARB9nc.js`，本次快照约 351 KB 压缩、841 KB 解压；点击文章时主要再取约 11 KB 压缩的文章渲染路由模块。这个策略让后续点击很快，但把成本压到了文章列表首次加载，不适合原样照搬。

4. **当前 2x.nz 并没有观测到“针对文章卡片的路由预取”。** `/posts` 没有相应的 `prefetch`，文章详情路由模块也未随列表 HTML 一起 `modulepreload`。所以 Firefly 完全可以在不改框架的前提下，通过“悬停/触摸意图预取文章 HTML + 原子交换 + 导航期间让非核心组件让路”获得更稳的冷、热路径。

5. **作者近四个月的文章反复指向同一条经验：性能问题首先是生命周期和资源边界问题。** 他先从 Astro/Swup 迁到 SvelteKit，再经历内容服务拆分、React SPA、React Router SSR，最后回到 Vue/Vuetify CSR。技术栈多次变化，但有效做法始终是：静态内容尽量构建期准备、重组件按需加载、旧页面不要在目标未准备好时被破坏、减少全局监听与重复初始化、图片和动效不能抢导航主线程。

## 2. 证据口径与限制

本文使用以下标签，避免把观测、作者自述和推断混在一起：

- **[现网观察]**：2026-08-20 对 `https://2x.nz/`、公开 HTML、网络响应和已发布前端 bundle 的检查。
- **[作者自述]**：作者在 2x.nz 官方文章中报告的架构、数据或效果；没有在作者环境中复现。
- **[公开源码事实]**：作者公开 GitHub 仓库的稳定 commit 快照。
- **[框架事实]**：Vue Router、SvelteKit、Next.js 官方文档描述的能力。
- **[推断]**：由上述证据推导出的可能原因或 Firefly 迁移建议，仍需在 Firefly 上验证。

限制：

- 浏览器轨迹是 Chrome、1× CPU、未开启网络限速的少量样本，不是实验室中位数。
- 浏览器存在 AdGuard 注入，可能影响 DOM 与主线程数据。因此本文只把这些数据用作方向性证据，不把它包装成跨设备的绝对基准。
- 当前发布资源的 hash 会随部署变化，本文引用的 bundle URL 只代表 2026-08-20 快照。
- 没有找到能够与当前 Vue/Vuetify 现网一一对应的公开源码仓库。对当前实现的结论以已发布 bundle 和网络行为为准；历史公开仓库只用于提炼已出现过的设计方法。

## 3. 最近四个月的官方文章：架构变化与仍然有效的经验

| 日期 | 官方文章 | 当时的方案 | 与文章跳转有关的有效信息 | 当前状态 |
| --- | --- | --- | --- | --- |
| 2026-04-19 | [俗话都说项目写久了会变成史山...今天我们来铲史...](https://2x.nz/posts/improve-dev-speed/) | Astro/Fuwari | `[作者自述]` `src/content/assets` 中 1000+ 图片拖慢开发首启；迁到 `public`。移除自托管图标集。50 个流星动效约触发 3000 次布局重绘/秒，移除后减轻主线程压力。开发启动从约 37.5 s 降到 7 s。 | 具体实现已被后续迁移替代；“图片/动效会挤占关键路径”仍有效。 |
| 2026-04-24 | [告别 Astro：一次从“能跑”到“好维护”的博客重构](https://2x.nz/posts/astro-to-svelte/) | Astro + Swup → SvelteKit | `[作者自述]` Swup 带来了平滑 SPA 体验，但多年积累的全局监听、一次性脚本和持久脚本边界不清，导致重复导航后的 DOM 与生命周期错误；移除 Swup 又出现整页白闪、重复全局请求。作者最终把静态文章交给 mdsvex，重图片在构建期转 AVIF 并缓存未变资源。 | 方案本身已被替代；“导航生命周期必须可控”直接适用于 Firefly。 |
| 2026-07-17 | [博客内容服务拆分复盘](https://2x.nz/posts/micro-blog-service/) | 单前端 + 分离的内容后端 | `[作者自述]` 100+ 文章、1000+ 图片、约 300 MB 内容使 CI 变慢，于是拆出 `posts.json` 和远程 Markdown；代价是更多请求、路由/SEO/query 修补以及内部链接重写错误。 | 后续已收回部分拆分；不宜把“拆仓”当成跳转性能的默认答案。 |
| 2026-07-22 | [从 Next.js 到纯 SPA：以及边缘 SEO 的补救](https://2x.nz/posts/svaf-next-seo/) | Vite + React Router 7 SPA + Cloudflare Worker | `[作者自述]` 客户端与 Worker 共用路由元数据；Worker 注入 meta、为文章做边缘预渲染、代理 sitemap/RSS、统一尾斜杠；列表分页元数据按每页 30 篇拆分。 | 是纯 SPA 阶段的 SEO 补救，随后被 SSR 方案替代。 |
| 2026-07-27 | [全栈 SSR 重构复盘](https://2x.nz/posts/fullstack-ssr/) | React Router 7 Framework Mode SSR | `[作者自述]` 页面壳 SSR、路由 loader、交互岛；Mermaid 仅在需要的 6/159 篇中加载，使文章 JS 从约 400 KB/50 请求降至 184 KB/30 请求；服务端使用内容本地副本，避免旧 CSR 多一次约 1 s 的空白/骨架等待。 | 16 天后因运行环境与业务重心变化再次被替代，不能视为当前架构。 |
| 2026-08-12 | [原 SSR 落幕之后：我用不到半天把主站从 React CSR 重构到 Vuetify](https://2x.nz/posts/one-day-deepseek-vuetify-site/) | Vue 3 + Vuetify + Vite CSR | `[作者自述]` Oracle VPS 停机后先退回 React CSR，再在不到半天内改为 Vue/Vuetify。博客内容重新内嵌主仓，构建期用 `import.meta.glob` 读取 Markdown；仓库从约 2 KB 增至 120 MB，但避免运行时远程 HTTP 的 1–2 s 骨架。 | 与 2026-08-20 现网最接近；公开仓库未确认。 |

### 3.1 不能只看“最后一次迁移”的原因

作者四个月内至少经历了 Astro/Swup、SvelteKit、分离内容服务、React SPA、React Router SSR、React CSR、Vue/Vuetify CSR。这个时间线说明：

- `[作者自述]` 每次迁移解决了当时最突出的维护或部署问题，但后续环境改变后又会让位。
- `[推断]` 把 Firefly 整体迁到某个框架，成本大且不保证文章点击更快；文章跳转首先应被定义成独立的性能合同。
- `[推断]` 最稳定、跨框架的资产是导航时序、加载优先级、图片策略、按需模块和可重复的 20 跳回归，而不是某个 UI 库。

## 4. 当前 2x.nz 的文章点击到底发生了什么

### 4.1 列表首屏

`[现网观察]`

1. `https://2x.nz/` 跳转到 `/posts`。
2. 当前可见文章列表由客户端 Vue/Vuetify 渲染；原始 HTML 中的 `#app` 主要是 `noscript` 文章链接兜底，不是完整可见卡片 SSR。
3. 文章卡片本身是完整的同源 `<a>`，同时有 Vuetify 的 overlay/ripple，因此按下后马上有视觉反馈。
4. `/posts` 的 HTML 预加载应用主包、Vuetify、列表路由和全量博客数据包，但没有预加载文章详情路由 `_slug_...js`。
5. 列表 DOM 中观测到 4 张封面图，它们没有 `loading` 或 `fetchpriority` 属性；这并不是值得照搬的图片实现。

### 4.2 点击阶段的关键顺序

`[现网观察]`

```text
用户按下卡片
  ├─ Vuetify 立即给按压反馈
  ├─ 旧文章列表保持原滚动位置，不先回顶部
  ├─ 首次访问时下载文章详情路由模块
  └─ 模块准备好后，一次性提交：URL + 文章 DOM + scrollTop = 0
```

发布主包中的 Vue Router 配置可见：路由组件使用动态导入；`scrollBehavior` 返回保存位置或 `{ top: 0 }`；浏览器原生 `history.scrollRestoration` 被设为 `manual`。这解释了“路由提交后到顶部”，但更重要的是路由尚未准备好时，旧列表没有提前被滚动。

这与用户描述的 Firefly 当前流程存在直接体感差异：

```text
Firefly 当前体感（待源码验证）
点击 → 旧首页先滚到顶部 → 等待下载/构建文章 → 才出现文章

2x.nz 当前体感
点击 → 旧首页保持稳定 → 等待目标准备 → 文章与顶部位置一起出现
```

即使二者总网络等待相同，第二种也更像“直接跳转”，因为中间没有错误的视觉阶段。

### 4.3 冷、热点击样本

| 场景 | 样本结果 | 网络行为 | 能说明什么 | 不能说明什么 |
| --- | ---: | --- | --- | --- |
| 列表已加载，首次取文章路由模块 | 点击到 URL、H1、文章 DOM 与顶部位置一起提交约 916 ms；详情模块约 825 ms 返回 | 下载 `_slug_...js` | 页面交换是原子的；旧列表在等待期间保持约 1097 px 的滚动位置 | 不是统计中位数，不能当全网首访 SLA |
| 返回列表 | 约 35 ms | 没有新增资源 | 客户端路由与已有模块缓存生效 | 不代表冷启动 |
| 再次点击同一篇 | 约 20 ms | 没有新增网络请求 | 用户感受到的“毫秒级”主要来自热缓存 | 不代表首次点击 |
| 新隔离上下文的冷样本 | 5 s 内仍未提交；详情模块约 3.1 s，若干封面图约 2.9–4.0 s | 详情脚本与图片竞争 | 冷路径仍会受网络与资源优先级影响 | 单个差网络样本不能外推总体分布 |

### 4.4 当前资源体积快照

以下为 2026-08-20 单次响应体积，压缩体积以传输响应计；hash 可能在下次部署变化。

| 资源 | 角色 | 压缩体积 | 解压体积 | 当前列表是否提前加载 |
| --- | --- | ---: | ---: | --- |
| [`index-Dho2LUJC.js`](https://2x.nz/assets/index-Dho2LUJC.js) | 应用主包 | 62,874 B | 179,748 B | 是 |
| [`blog-DDARB9nc.js`](https://2x.nz/assets/blog-DDARB9nc.js) | 全量文章 Markdown/元数据 | 351,449 B | 841,161 B | 是 |
| [`blog-DXaDbN71.js`](https://2x.nz/assets/blog-DXaDbN71.js) | 文章列表路由 | 2,696 B | 6,129 B | 是 |
| [`_slug_-XhWD33of.js`](https://2x.nz/assets/_slug_-XhWD33of.js) | 文章详情路由/渲染器 | 11,393 B | 32,967 B | 否，首次点击再取 |

`[推断]` 当前策略的实质是“列表阶段先把所有文章内容送到浏览器，点击时只补文章渲染器”。这能制造非常快的热点击，但会增加列表首次传输、解析和内存成本。Firefly 是静态文章站，更适合按用户意图预取目标文章 HTML，而不是把全站文章打进一个大 bundle。

### 4.5 当前现网也有明显性能债务

`[现网观察]` 一次 `/posts` 列表轨迹得到：

- TTFB：约 279 ms。
- LCP：约 2,309 ms；其中 load delay 约 1,379 ms、load duration 约 309 ms、render delay 约 342 ms。
- CLS：0.39，明显偏高。
- DOM：约 728 个元素。
- 强制回流合计：约 56 ms。
- 关键请求链：约 1,386 ms。
- LCP 图片 `pin-cute.webp` 为低优先级，发现较晚，且没有 `fetchpriority="high"`。

这些数字受扩展和单次网络状态影响，只用于说明：**2x.nz 的文章热跳转值得学习，不代表它的列表首屏、布局稳定性和图片策略都更优。**

另外，当前 hash 资源响应头为 `Cache-Control: public, max-age=0, must-revalidate`，虽有 Cloudflare HIT 与 ETag，但对内容寻址的 hash 资源而言，比长期 `immutable` 浏览器缓存更保守。Firefly 不应照搬这一点。

## 5. 作者公开仓库能证明什么

### 5.1 当前 Vue/Vuetify 现网源码没有被公开仓库确认

`[公开源码事实]` 作者账号下可见 `afoim/2xss_blog`，但其默认分支在检查时仍是 Next.js 15 + Fumadocs，并非当前 Vue/Vuetify 现网。对当前文章标题、现网 bundle 中的关键命名和 Vuetify 布局进行公开代码检索，也没有找到可一一对应的仓库。

因此：

- 当前 Vue 路由、预加载和内容打包结论来自已发布 bundle，是现网事实。
- 下列仓库代表作者在不同时期公开过的实现，不应误称为“当前 2x.nz 源码”。

### 5.2 历史 SvelteKit 主站：生命周期、即时反馈与缓存

仓库：[afoim/svaf](https://github.com/afoim/svaf)，检查 commit `89e816061c55c033b852ac3a7f88571a806f9721`，许可证 AGPL-3.0。

`[公开源码事实]`

- 全局布局通过导航前后钩子控制进度条，让超过瞬时阈值的导航有持续反馈；全局壳与路由内容分开。
- 文章列表使用普通同源链接，封面显式 `loading="lazy"`、`decoding="async"`。
- 阅读量使用 session 缓存，只批量请求未缓存条目；RSS 在组件挂载或回到前台时加载。
- 文章元数据/组件在构建侧整理，文章组件可按目标动态载入。

第一方源码：

- [全局导航生命周期与布局](https://github.com/afoim/svaf/blob/89e816061c55c033b852ac3a7f88571a806f9721/src/routes/%2Blayout.svelte)
- [文章列表链接与图片策略](https://github.com/afoim/svaf/blob/89e816061c55c033b852ac3a7f88571a806f9721/src/routes/posts/%2Bpage.svelte)
- [会话级 API 缓存](https://github.com/afoim/svaf/blob/89e816061c55c033b852ac3a7f88571a806f9721/src/lib/utils/spaCache.ts)

`[框架事实]` [SvelteKit 官方 link options](https://svelte.dev/docs/kit/link-options) 支持在 hover/touch 等意图阶段预加载代码或数据。上述仓库快照没有显式证明作者定制了这一属性，因此不能把框架默认能力写成作者的当前实现。

### 5.3 历史 Next.js 博客：静态生成、Link 预取与首图优先级

仓库：[afoim/2xss_blog](https://github.com/afoim/2xss_blog)，检查 commit `0edd153b2d5d5457414fb3082ead49519b7ba08f`。

`[公开源码事实]`

- 文章卡片使用 `next/link`，封面使用 `next/image`。
- 详情页通过 `generateStaticParams` 枚举文章，静态生成；文章首图标记 `priority`。
- 配置为静态导出，图片不经过 Next 服务端优化。

第一方源码：

- [文章卡片](https://github.com/afoim/2xss_blog/blob/0edd153b2d5d5457414fb3082ead49519b7ba08f/components/blog-card.tsx)
- [文章详情静态生成与首图](https://github.com/afoim/2xss_blog/blob/0edd153b2d5d5457414fb3082ead49519b7ba08f/app/posts/%5Bslug%5D/page.tsx)
- [静态导出配置](https://github.com/afoim/2xss_blog/blob/0edd153b2d5d5457414fb3082ead49519b7ba08f/next.config.ts)

`[框架事实]` [Next.js 官方 linking and navigating 文档](https://nextjs.org/docs/app/getting-started/linking-and-navigating) 说明静态路由的 `Link` 可在进入视口时自动预取，也可以对长列表改为 hover 意图预取。该能力属于历史 Next 实现语境，不等于当前 Vue 现网正在使用。

### 5.4 公开论坛：路由分块与持久壳

仓库：[afoim/2xss_bbs](https://github.com/afoim/2xss_bbs)，检查 commit `14cfa471902e4fb9ab7554a024ef9f531af01f81`。

`[公开源码事实]`

- `createBrowserRouter` 中的页面路由使用 lazy 动态导入，每个路由可独立分块。
- 根布局承载认证、主题和持久导航壳，内容区由路由替换。
- 使用 `ScrollRestoration` 管理前进/后退位置，并提供明确的 `HydrateFallback`，避免水合期间完全空白。
- Vite 对 React 依赖做手工 chunk 划分，构建目标为 `es2021`。

第一方源码：

- [论坛路由分块](https://github.com/afoim/2xss_bbs/blob/14cfa471902e4fb9ab7554a024ef9f531af01f81/src/router.tsx)
- [根布局、滚动恢复与水合兜底](https://github.com/afoim/2xss_bbs/blob/14cfa471902e4fb9ab7554a024ef9f531af01f81/src/root-layout.tsx)
- [Vite 分块配置](https://github.com/afoim/2xss_bbs/blob/14cfa471902e4fb9ab7554a024ef9f531af01f81/vite.config.ts)

## 6. Firefly 可迁移的设计

以下是设计合同，不是要求迁移框架。

### 6.1 P0：把“原子交换”写成不可退让的导航合同

`[推断]`

文章卡片点击后必须满足：

1. 旧首页在目标文章 HTML/DOM 未准备好之前保持原滚动位置。
2. 禁止在 click、before-fetch 或离开动画刚开始时对旧页面调用 `scrollTo(0, 0)`。
3. 新文章 DOM 完成替换后，再在同一提交阶段将新页面置顶。
4. 浏览器前进/后退优先恢复保存位置，不强制回顶部。
5. 若导航失败，旧页面仍可操作，滚动位置不丢失。

这项改动几乎不增加传输体积，却直接消除用户当前最明显的“三段式迟钝”：旧页滚顶、空等、文章出现。

### 6.2 P0：在用户表达意图时只预取目标文章

`[推断]`

对可见/高概率文章卡片，在 `pointerenter`、键盘 `focus`、`touchstart` 或短暂空闲时预取目标文章 HTML；不要预取整个文章库。建议约束：

- 同一 URL 去重，命中后放入短期导航缓存。
- 并发 1–2 个，首页初始关键请求完成后再启动。
- `Save-Data`、2G/慢速连接、后台页签不主动预取。
- 鼠标快速掠过可延迟几十毫秒，避免无意图请求。
- 预取失败不阻塞正常点击。
- 优先最新/首屏卡片；长列表不做无上限视口预取。

Astro 的静态文章天然拥有完整 HTML，Firefly 可直接缓存目标文档并交给 Swup 页面交换；没有必要采用 2x.nz 当前“351 KB 压缩全量文章 bundle”式前置加载。

### 6.3 P0：给文章导航单独设一条资源优先通道

`[推断]`

从 `pointerdown` 到新文章首屏稳定期间，以下工作应暂停、延后或降优先级：

- 首页背景/粒子/球体/连续动画。
- 非目标卡片的封面解码与懒加载补图。
- 阅读量、在线状态、公告、音乐、Live Chat 等非首屏接口。
- 评论 SDK、统计增强、代码高亮扩展和 Mermaid。
- 大量 IntersectionObserver/ResizeObserver 回调和非必要视图过渡。

这些 UI 可以保留，但应在文章导航完成后再继续工作。作者 4 月的动效重排案例和 7 月的 Mermaid 按需加载都支持这种“关键路径让路”的方向。

### 6.4 P1：图片策略从“统一懒加载”改为“按角色分级”

`[推断]`

- 首页首个 LCP 候选：固定尺寸，现代格式，必要时 `fetchpriority="high"`，只能有一个高优先级候选。
- 首屏其余卡片：固定宽高/比例，正常优先级，避免 CLS。
- 折叠线以下封面：`loading="lazy"`、`decoding="async"`，导航期间不得与目标文章文档争抢连接。
- 文章首图：如果在首屏且是 LCP 候选，随目标 HTML 尽早发现；非首屏大图继续懒加载。
- 模糊占位只承担稳定尺寸和降低感知空白，不能以额外大脚本为代价。

### 6.5 P1：分离持久壳、页面内容和重增强模块

`[推断]`

- 导航栏、主题、必要的页面进度反馈可以持久化。
- 文章内容作为可一次替换的边界，避免全局脚本把旧 DOM 引用带到下一页。
- Mermaid、评论、目录滚动增强、代码复制、图片灯箱按文章实际需要加载。
- 每个增强模块必须有销毁或幂等初始化边界，20 次文章往返后不应出现重复监听、重复 iframe、重复请求或事件倍增。

这比整体换成 SvelteKit/Vue 更直接地回应作者在 Astro/Swup 阶段遇到的根因。

### 6.6 P1：反馈只弥补真实等待，不制造额外流程

`[推断]`

- `pointerdown` 后 50 ms 内给卡片 pressed 状态。
- 若导航 100–150 ms 内完成，不必闪现全局进度条。
- 超过阈值再显示细进度反馈；文章完成后立即收束。
- 不要先播放长离场动画再开始请求；请求和必要的过渡可并行。

## 7. 不可迁移或不宜照搬的点

1. **不要为文章跳转整体改成 Vue/Vuetify。** 当前速度来自缓存和交换时序，不是组件库自动提供；重写会扩大回归面。
2. **不要把全量文章正文打进列表 bundle。** 2x.nz 当前以约 351 KB 压缩/841 KB 解压换热点击，对 Firefly 的静态文档模型不是最优解。
3. **不要照搬当前 CSR + `noscript` 兜底。** 当前列表仍出现 LCP 延迟和 0.39 CLS；Firefly 的静态 HTML 是首访优势，应保留。
4. **不要照搬当前图片加载。** 本次现网可见封面缺少 `loading`/`fetchpriority`，冷样本中图片与详情模块发生明显竞争。
5. **不要照搬 hash 静态资源的 `max-age=0, must-revalidate`。** 内容寻址资源更适合长期 immutable 缓存，并用新 hash 完成更新。
6. **不要把 7 月的多仓/远程 Markdown 架构当作性能方案。** 作者自己记录了额外请求、SEO 和内部链接复杂度，并在 8 月把博客内容重新纳回构建。
7. **不要照搬特定的 VPS、SSR、用户系统和论坛认证架构。** 它们解决的是 2x.nz 当时的业务/部署条件，不是 Firefly 文章卡片迟钝的必要条件。
8. **不要把历史公开仓库当当前现网源码。** `svaf`、`2xss_blog` 和 `2xss_bbs` 只能证明作者用过哪些方法。

## 8. 对 Firefly 的待验证假设

本节没有读取或改动 Firefly 实现，只把用户现象转成下一轮源码 review 的检查项。

| 假设 | 用户现象对应 | 应检查的证据 | 若成立的最小修复 |
| --- | --- | --- | --- |
| 回顶部发生在目标内容准备前 | 点击后旧首页先被拖到顶部 | Swup/导航 click、before、content:replace、page:view 等 hook 的实际时间线；所有 `scrollTo` 调用 | 将回顶部移动到新 DOM 交换后的单一 hook，返回导航恢复旧位置 |
| 目标文章 HTML 没有在意图阶段预取 | 点击后才开始“下载文章” | 卡片 hover/focus/touch 到文档请求的 Network initiator 与时间 | 对目标 URL 做有预算的 HTML 预取和去重缓存 |
| 首页动效/组件在导航期间占主线程 | 等待时页面置顶、动画或 UI 仍在忙 | Long Task、forced reflow、observer 回调、动画帧、事件监听 | pointerdown 后暂停非核心更新，文章稳定后恢复 |
| 首页图片与文章文档/脚本抢连接和解码 | 点击时仍下载大量卡片图 | 点击前后 Network priority、图片解码和 LCP 候选 | 首图分级，其余懒加载；导航期间降低非目标图片优先级 |
| 增强模块在多次跳转后重复初始化 | “后来明显快但不稳定”或越跳越慢 | 20 次往返后的监听器、iframe、请求、DOM 节点与 console | 每模块增加幂等门闩与销毁，做 20 跳预算 |
| 离场过渡串行挡住了网络或 DOM 交换 | 点击后存在固定等待 | 动画开始/结束、fetch start、content replace 时间戳 | 请求与短过渡并行，超时直接完成交换 |

## 9. 建议的实施与验收实验

### 9.1 分步实验

| 版本 | 唯一变量 | 目的 |
| --- | --- | --- |
| Baseline | 当前 Firefly | 记录真实冷/热点击与旧页滚动时序 |
| A | 只改原子交换/滚动 hook | 判断“先滚旧页”占了多少体感问题 |
| B | A + 目标文章意图预取 | 判断冷点击网络等待能否前移 |
| C | B + 导航优先通道 | 判断首页 UI、图片和第三方资源的竞争影响 |
| D | C + 图片分级和按需增强 | 收口首访、文章首屏与 20 跳稳定性 |

每一步只改变一类变量；不要一开始同时替换路由、图片体系和 UI 框架，否则无法知道速度来自哪里。

### 9.2 采样方法

1. 冷路径：新浏览器上下文，选择 10 篇不同文章，各点击一次。
2. 热路径：同一上下文对已访问文章重复点击，并做至少 20 次列表/文章往返。
3. 桌面和移动视口各一组；本地无节流与模拟慢速网络各一组。
4. 每次记录：`pointerdown`、pressed 反馈、目标 fetch start/end、旧页 scrollTop、DOM replace、URL commit、文章 H1 可见、文章 LCP、long task、错误与重复请求。
5. 报告 p50/p75/p95，不用“最好的一次”代表整体。

### 9.3 建议性能合同

以下是 Firefly 的建议验收目标，不是 2x.nz 的实测承诺：

- 点击到可见 pressed 反馈：p95 ≤ 50 ms。
- 热缓存文章的点击到文章 H1/DOM 提交：p75 ≤ 200 ms。
- 有效预取命中的点击：不得重新下载文章文档。
- 目标文章未准备好前：旧页 scrollTop 变化 ≤ 1 px。
- 新文章 DOM 与 `scrollTop = 0`：同一提交阶段完成，不出现旧页顶部停留帧。
- 20 次往返：无重复 iframe、重复 ID、重复全局监听、事件倍增和逐跳内存持续增长。
- 后退：恢复离开列表前的位置，不强制到顶部。
- 慢网失败：保留旧页面可操作，并给出可重试反馈。

## 10. 最终判断

2x.nz 给 Firefly 最重要的启发是：**文章导航是一条独立的关键路径，旧页面必须稳定地等到新页面准备好，然后一次性完成内容、URL 和滚动位置切换。**

当前 2x.nz 的热点击确实可达到约 20 ms 的观测样本，但它通过全量文章数据前置和模块缓存获得，冷路径并不总快。Firefly 更合理的路径是保留 Astro 静态 HTML 优势，只把目标文章的请求前移到用户意图阶段，并在点击后冻结非核心资源竞争。这样既能接近目标站的“直接跳转”体感，也避免承担目标站当前 CSR 首屏、全量内容 bundle、图片竞争和 CLS 的代价。

## 11. 第一方来源索引

### 2x.nz 官方文章

- [2026-04-19：俗话都说项目写久了会变成史山...今天我们来铲史...](https://2x.nz/posts/improve-dev-speed/)
- [2026-04-24：告别 Astro：一次从“能跑”到“好维护”的博客重构](https://2x.nz/posts/astro-to-svelte/)
- [2026-07-17：博客内容服务拆分复盘](https://2x.nz/posts/micro-blog-service/)
- [2026-07-22：从 Next.js 到纯 SPA：以及边缘 SEO 的补救](https://2x.nz/posts/svaf-next-seo/)
- [2026-07-27：全栈 SSR 重构复盘](https://2x.nz/posts/fullstack-ssr/)
- [2026-08-12：原 SSR 落幕之后：我用不到半天把主站从 React CSR 重构到 Vuetify](https://2x.nz/posts/one-day-deepseek-vuetify-site/)

### 作者公开仓库

- [afoim/svaf](https://github.com/afoim/svaf)
- [afoim/2xss_blog](https://github.com/afoim/2xss_blog)
- [afoim/2xss_bbs](https://github.com/afoim/2xss_bbs)

### 框架官方文档

- [Vue Router：Lazy Loading Routes](https://router.vuejs.org/guide/advanced/lazy-loading)
- [Vue Router：Scroll Behavior](https://router.vuejs.org/guide/advanced/scroll-behavior.html)
- [SvelteKit：Link options](https://svelte.dev/docs/kit/link-options)
- [Next.js：Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating)

---

验证日期：2026-08-20。现网 bundle、网络头和页面指标均为当天快照，后续部署应重新验证。
