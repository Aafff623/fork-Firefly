# 参考站 2x.nz 侦察摘要（2026-10-18）

> 完整侦察过程见 `temp/reports/project-analysis/2026-10-18-项目深度分析.md` 同目录之外的会话记录；此处只留可被后续会话直接消费的结论。

## 站点身份
- 站主：**二叉树树 / AcoFork**，主域 `2x.nz`，另有精简站 `www.acofork.com`
- B站：**UID 325903362**（677 投稿 / 1.37 万粉）；GitHub：`afoim`
- 内容规模：博客 **173 篇**（sitemap 口径）+ 32 个应用页

## 当前技术形态（线上实测，非文章自述）
- **Rolldown（打包器）+ Preact（UI 运行时）** 的 SPA 壳
- 渲染模式：**每路由预渲染 HTML**（`<head>` 完整 SEO + `#app` 内放可读回退），再由客户端接管
  - 博客文章页回退 = **完整正文**（`/blog/astro-aio-migration/` 原始 HTML 39,219 字节）
  - 应用页回退 = `h1` + 描述 + 全站导航清单（约 8–9.5 KB）
- **与文章自述冲突**：`20th-rebuild-seven-days-sveltekit-shadcn` 说第 20 次重构是 SvelteKit + shadcn-svelte（232 个 HTML），但线上无任何 Svelte 运行时痕迹。**找不到记录这次替换的文章。**

## 性能相关实测
| 项 | 值 |
|---|---|
| 首页请求数 | 106 |
| 首页传输 / 解压 | 896 KB / 3,444 KB |
| JS | 入口 825 KB + 60 个懒加载 chunk 731 KB（未压缩） |
| CSS | 主文件 165 KB + 3 个懒加载（未压缩）≈ 166 KB |
| 入口 `<head>` `modulepreload` | 15 个关键 chunk |
| 字体 | 2 个 `@font-face`，全 `.woff2`，`font-display: swap`，自托管 |
| 缓存 | HTML **与带哈希的 JS/CSS 全部** `Cache-Control: no-cache` + `ETag`（明确取舍：换即时更新） |

## 值得移植的做法（按可移植性排序）
1. **第三方脚本同意门控**：`<script data-optional-script type="text/plain" data-src="...">`，用户同意后才激活；CSP 用 **sha256 哈希白名单**，无 `'unsafe-inline'`。
2. **加载态零请求**：loading UI 做成 CSS `::before/::after` + 内联 SVG data URI（`theme-boot.css`），并尊重 `prefers-reduced-motion`。
3. **可读回退 + 看门狗**：`<noscript>` 说明 + `app-boot.js` 12 秒看门狗（App 未 ready 就退回可读文档，而不是永远藏起来）。
4. **按业务域切 chunk + `modulepreload` 关键图**，配合 `preconnect`/`dns-prefetch` 指向「全站每页都会请求」的后端域名。
5. **内容与代码分仓**：博客正文 + 图片独立仓库，主仓只做代理/本地副本。理由原文：「100 多篇博文、1000 多张图片，资源加起来 300 MB，每次部署 CI/CD 都沉在来回 300 MB 的流量里」。
6. **构建期把 Markdown / 高亮 / TOC 全部前移**；列表页只带摘要，全文索引按需加载。

## 明确不能照抄的部分
- **框架**：它是应用平台（AI 生图 8 入口 / 5 工具 / 3 游戏 / LLM 中转），博客只是其中一区；Firefly 是纯内容站。作者本人主张「博客就得 prerender」，Firefly 已是 SSG。
- **VPS + 自管 SQLite 的数据层**：它为此付出了失去 D1 秒级回滚、自配 ufw 的代价（见 `fullstack-ssr`、`d1-no-production-testing`）。Firefly 无此需求。
- **全站 `no-cache`**：那是它「即时更新」的取舍；Firefly 是纯静态，带哈希资产应当长缓存。

## 它的历史踩坑（对 Firefly 是警告）
- 从 Fuwari/Astro 走掉的直接原因：「经过长达 2 年的魔改，Astro 引以为傲的 island 我们根本没用」+ Swup 接管后布局崩坏，要清干净「需要分析并重构 200+ 文件，近 w 行代码」。
- **Firefly 同源 Fuwari**，同样重度使用 Swup + island。这条警告直接适用。
