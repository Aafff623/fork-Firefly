<h1 align="center">threetwoa's blog</h1>

<p align="center">
  <strong><em>an Astro blog with a system behind it</em></strong> 🚀
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D22-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/pnpm-%3E%3D9-F69220?style=flat-square&logo=pnpm&logoColor=white" alt="pnpm">
  <img src="https://img.shields.io/badge/Astro-7-FF5D01?style=flat-square&logo=astro&logoColor=white" alt="Astro">
  <img src="https://img.shields.io/badge/Svelte-5-FF3E00?style=flat-square&logo=svelte&logoColor=white" alt="Svelte"><br>
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/github/license/Aafff623/fork-Firefly?style=flat-square" alt="License">
</p>

<p align="center">
  基于 <a href="https://github.com/CuteLeaf/Firefly">Firefly</a> 的 Astro 个人博客二次开发<br>
  <sub>Standalone by <a href="https://github.com/Aafff623/fork-Firefly">threetwoa</a> · 独立演进 · 非官方镜像</sub>
</p>

<p align="center">
  <img src="assets/images/readme/banner-pixel-garden.png" alt="threetwoa's blog pixel digital garden banner" width="100%">
</p>

<p align="center">
  <a href="#project">Project</a>
  · <a href="#showcase">Showcase</a>
  · <a href="#quick-start">Quick start</a>
  · <a href="#architecture">Architecture</a>
</p>

<p align="center">
  <a href="https://fork-firefly.vercel.app">Live site</a>
  · <a href="https://github.com/Aafff623/fork-Firefly">Source</a>
  · <a href="#key-docs-and-assets">Docs</a>
</p>

---

> [!TIP]
> 本仓源自 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)，已脱离 fork network，成为独立仓库。它保留上游主题的内容能力，同时叠加本仓自己的品牌配置、页面组件、交互与部署约定。

## Project

An Astro blog built around content, configuration, and visual iteration.

这是一个基于 Firefly 二次开发的 Astro 个人博客：内容写在 Markdown / MDX，站点行为由 `src/config` 控制，页面与交互由 Astro、Svelte islands 和少量客户端脚本共同完成。

项目关注的不只是主题展示，也包括内容发布、页面组合、搜索、评论和部署之间的清晰边界。当前工作重点是继续收敛信息架构、页面节奏和视觉一致性。

当前站点：<https://fork-firefly.vercel.app>

| 项目维度 | 当前状态 |
| --- | --- |
| Product shape | 配置驱动的 Astro 个人博客 |
| Rendering model | Static-first · SSG · CDN-friendly |
| Content model | Markdown / MDX · Content Collections |
| Interaction model | Svelte islands · Swup · progressive enhancement |
| Visual phase | 页面信息架构与视觉一致性持续收敛 |
| Deployment | Vercel 默认 · Cloudflare adapter 可选 |

<details id="key-docs-and-assets">
<summary>Key docs and assets</summary>

| 入口 | 用途 |
| --- | --- |
| [CONTEXT.md](CONTEXT.md) | 产品定位、技术事实、术语和仓库边界 |
| [AGENTS.md](AGENTS.md) | 任务流、修改边界、验证与交付规则 |
| [docs/adr/](docs/adr/) | 需要长期保留的架构决策 |
| [docs/outputs/commit-history/](docs/outputs/commit-history/) | 历史改动、视觉演进和工作摘要 |
| [assets/images/readme/](assets/images/readme/) | Banner、架构图、技术栈图与 Showcase 资产 |
| [capture-readme-showcase.py](scripts/capture-readme-showcase.py) | 使用真实页面重新生成 README Showcase |

推荐阅读顺序：`README.md` → `CONTEXT.md` → `AGENTS.md` → `docs/adr/` → `src/config/` / `src/content/`。
</details>

## Features

核心能力按“内容 → 阅读 → 个性化 → 集成”组织；每一行同时给出能力范围和主要代码入口。

| Area | Capability | Included | Main entry |
| --- | --- | --- | --- |
| Publishing | Content model | `posts`、`dynamic`、`spec` 三类 Content Collections | `src/content/` · `src/content.config.ts` |
| Publishing | Authoring | Markdown / MDX、frontmatter、草稿、置顶、密码文章、文章关联 | `src/content/` · `src/plugins/` |
| Publishing | Build output | RSS、Sitemap、OpenGraph、阅读时间、字数、Pagefind 索引 | `astro.config.mjs` · `scripts/` |
| Publishing | Rich content | KaTeX、Mermaid、PlantUML、Wiki Link、代码组、自定义 directive | `src/plugins/` |
| Reading | List system | list、grid、waterfall；Featured、标签和分类入口 | `src/components/layout/` |
| Reading | Article navigation | Index-First TOC、相关文章、文章导航、标签聚焦 | `src/components/layout/PostPage.astro` |
| Reading | Display controls | 亮暗色、系统主题、色相、壁纸模式、卡片表现 | `src/config/displaySettingsConfig.ts` |
| Reading | Interaction model | Swup 页面过渡与 Svelte islands 按需注水 | `src/components/` · `src/layouts/` |
| Personal surfaces | Dynamic | 碎碎念时间线，可接本地内容或 Memos | `src/pages/dynamic/index.astro` |
| Personal surfaces | Gallery | 作品集手风琴与 Three.js 无限画布双模式 | `src/pages/gallery/` |
| Personal surfaces | Extended pages | About、Friends、Guestbook、Anime 等独立页面 | `src/pages/` · `src/content/spec/` |
| Personal surfaces | Widgets | 热力图、日历、贪吃蛇、热笺、标签墙、统计、桌宠 | `src/components/widget/` |
| Integration | Comments | Waline、表情、Giphy、访客统计 | `src/config/commentConfig.ts` |
| Integration | Media services | 评论图片通过服务端代理上传腾讯云 COS | `.env.example` · `src/pages/api/` |
| Integration | Delivery | Vercel 默认部署，Cloudflare adapter 可选 | `vercel.json` · `wrangler.jsonc` |
| Integration | Localization | `zh_CN`、`zh_TW`、`en`、`ja`、`ru`、`ko` | `src/config/siteConfig.ts` |

## Showcase

推荐浏览路径：首页 → 文章 → Dynamic → Archive / About / Gallery。

UI 大改后可以使用 `scripts/capture-readme-showcase.py` 重新截取展示图。脚本需要先启动本地开发服务器。

<table>
  <tr>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-home.png"><img alt="Home" src="assets/images/readme/showcase-home.png" width="100%"></a>
      <br><strong>Home</strong><br>
      <sub>文章卡片 · 双侧栏 · 壁纸横幅 · 分类入口</sub><br>
      <a href="https://fork-firefly.vercel.app/">Open</a>
    </td>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-post.png"><img alt="Post" src="assets/images/readme/showcase-post.png" width="100%"></a>
      <br><strong>Post</strong><br>
      <sub>Index-First TOC · 封面 · Markdown 扩展</sub><br>
      <a href="https://fork-firefly.vercel.app/posts/claude-code-windows-beautify/">Open</a>
    </td>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-dynamic.png"><img alt="Dynamic" src="assets/images/readme/showcase-dynamic.png" width="100%"></a>
      <br><strong>Dynamic</strong><br>
      <sub>碎碎念时间线 · Memos 适配 · 幕布聚焦</sub><br>
      <a href="https://fork-firefly.vercel.app/dynamic/">Open</a>
    </td>
  </tr>
  <tr>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-archive.png"><img alt="Archive" src="assets/images/readme/showcase-archive.png" width="100%"></a>
      <br><strong>Archive</strong><br>
      <sub>按年折叠 · 克制行列表 · 内容索引</sub><br>
      <a href="https://fork-firefly.vercel.app/archive/">Open</a>
    </td>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-about.png"><img alt="About" src="assets/images/readme/showcase-about.png" width="100%"></a>
      <br><strong>About</strong><br>
      <sub>Quote-Led · Now / Practice / Reach · 视觉组件</sub><br>
      <a href="https://fork-firefly.vercel.app/about/">Open</a>
    </td>
    <td width="33%" valign="top" align="center">
      <a href="assets/images/readme/showcase-gallery.png"><img alt="Gallery" src="assets/images/readme/showcase-gallery.png" width="100%"></a>
      <br><strong>Gallery</strong><br>
      <sub>作品集手风琴 · 无限画布 · 视觉内容</sub><br>
      <a href="https://fork-firefly.vercel.app/gallery/">Open</a>
    </td>
  </tr>
</table>

## Quick start

<details>
<summary>Requirements</summary>

- Node.js ≥ 22
- pnpm ≥ 9，锁文件版本为 `9.14.4`
</details>

<details open>
<summary>Local development</summary>

```bash
git clone https://github.com/Aafff623/fork-Firefly.git
cd fork-Firefly
pnpm install
pnpm dev
```

打开 <http://localhost:4321> 查看站点。

首次配置请阅读 [Configuration](#configuration)，先完成站点身份和内容设置，再开启评论、Memos 或 COS 等可选服务。
</details>

<details>
<summary>Useful commands</summary>

```bash
# dependencies and local server
pnpm install
pnpm dev

# diagnostics and production build
pnpm check
pnpm type-check
pnpm build
pnpm preview

# content helpers
pnpm new-post <slug>
pnpm new-d <一句话>

# README Showcase; run pnpm dev first
python scripts/capture-readme-showcase.py
```
</details>

## Content workflow

文章、动态和特殊页面分别位于：

```text
src/content/
├── posts/      # 博客文章，支持 Markdown / MDX
├── dynamic/    # 动态、碎碎念或 Memos 时间线
└── spec/       # About、Friends、Guestbook 等特殊页面内容
```

文章 frontmatter 会经过 [src/content.config.ts](src/content.config.ts) 校验。生产构建默认隐藏 `draft: true` 的文章，本地开发可以继续预览草稿。

日常写作走内容文件，日常换皮走 `src/config`。不要为了改站点名称、侧栏顺序或壁纸参数去修改布局内核。

## Configuration

从零部署时，建议按下面的顺序推进：先让站点稳定运行，再逐步启用评论、动态和媒体服务。配置优先于修改布局内核。

1. **准备运行环境**

   安装 Node.js ≥ 22 和 pnpm ≥ 9，并确认 pnpm 版本与锁文件一致：

   ```bash
   node --version
   pnpm --version
   ```

2. **获取项目并安装依赖**

   ```bash
   git clone https://github.com/Aafff623/fork-Firefly.git
   cd fork-Firefly
   pnpm install
   ```

3. **配置站点身份**

   先修改站点名称、描述、域名、语言、头像和个人信息：

   - `src/config/siteConfig.ts`：站点名、色相、语言、页面开关和文章列表
   - `src/config/profileConfig.ts`：头像、简介和联系方式
   - `src/config/navBarConfig.ts`：导航与搜索入口

   语言通过 `SITE_LANG` 设置：

   ```ts
   const SITE_LANG = "zh_CN";
   ```

4. **配置页面和显示系统**

   根据需要调整侧栏、壁纸、主题和页面表现：

   - `src/config/sidebarConfig.ts`：双侧栏与 widget 顺序
   - `src/config/backgroundWallpaper.ts`：壁纸、透明度和背景模式
   - `src/config/displaySettingsConfig.ts`：亮暗色、布局和显示面板
   - `src/config/galleryConfig.ts`：相册模式和相册元数据

5. **准备内容**

   将文章、动态和特殊页面分别放入对应目录：

   ```text
   src/content/posts/      # Markdown / MDX 文章
   src/content/dynamic/    # 动态、碎碎念或 Memos 时间线
   src/content/spec/       # About、Friends、Guestbook 等特殊页面
   ```

   文章 frontmatter 会由 [src/content.config.ts](src/content.config.ts) 校验。生产构建默认隐藏 `draft: true` 的文章。

6. **启用可选服务**

   只有需要评论图片上传或外部数据源时才配置环境变量：

   - 复制 [.env.example](.env.example) 为 `.env`
   - 在 `src/config/commentConfig.ts` 中配置 Waline
   - 在对应配置中开启 Memos、COS、音乐、Live2D 或 Spine
   - 不要提交 `.env`、API key 或评论服务 token

7. **本地验证**

   ```bash
   pnpm check
   pnpm type-check
   pnpm build
   pnpm preview
   ```

   构建完成后，确认 `dist/`、搜索索引、RSS、Sitemap 和主要页面均正常。

8. **部署到 Vercel**

   在 Vercel 中导入仓库，使用以下设置：

   | Setting | Value |
   | --- | --- |
   | Framework preset | Astro |
   | Install command | `pnpm install` |
   | Build command | `pnpm build` |
   | Output directory | `dist` |

   如果使用评论、COS 或其他外部服务，在 Vercel Project Settings → Environment Variables 中补齐 `.env` 对应变量，再触发部署。

9. **上线后复核**

   依次检查首页、文章页、搜索、RSS、Sitemap、评论、图片上传和移动端布局。UI 大改后，再运行 `scripts/capture-readme-showcase.py` 更新 README Showcase。

<details>
<summary>Configuration file map</summary>

| 你想改什么 | 文件 |
| --- | --- |
| 站点名、色相、页面开关、文章列表 | `src/config/siteConfig.ts` |
| 头像、简介、联系方式 | `src/config/profileConfig.ts` |
| 导航和搜索 | `src/config/navBarConfig.ts` |
| 双侧栏与 widget 顺序 | `src/config/sidebarConfig.ts` |
| 壁纸、透明度和背景模式 | `src/config/backgroundWallpaper.ts` |
| 亮暗色、布局和显示面板 | `src/config/displaySettingsConfig.ts` |
| 评论系统与 Waline | `src/config/commentConfig.ts` |
| 相册模式与相册元数据 | `src/config/galleryConfig.ts` |
| 公告、礼盒和日历封面 | `src/config/announcementConfig.ts` |
| 音乐、桌宠、Live2D / Spine | `src/config/musicConfig.ts` · `petConfig.ts` · `pioConfig.ts` |
| 字体、代码块和 Markdown 扩展 | `src/config/fontConfig.ts` · `expressiveCodeConfig.ts` · `src/plugins/` |

配置通过 [src/config/index.ts](src/config/index.ts) 统一导出，类型定义集中在 `src/types/`。
</details>

## Architecture

项目把“经常修改的内容”与“尽量稳定的内核”分开：运营走配置和 Markdown，构建链路负责增强，浏览器只接收必要的交互。

<p align="center">
  <img src="assets/images/readme/architecture.svg" alt="threetwoa's blog architecture diagram" width="100%">
</p>

| Layer | Responsibility | Primary surfaces |
| --- | --- | --- |
| Authoring | 配置、文案、Markdown / MDX | `src/config` · `src/content` |
| Composition | 页面、布局、组件和 Markdown plugins | `src/pages` · `src/layouts` · `src/components` · `src/plugins` |
| Build | 静态生成、图片占位、字体和搜索索引 | Astro SSG · LQIP · font subset · Pagefind |
| Runtime | CDN 交付和轻量交互 | `dist` · Vercel · Swup · Svelte islands |

### Design principles

1. **Config over layout** — 品牌、开关、壁纸和侧栏参数优先放在 `src/config`。
2. **Static by default** — 默认输出静态站点；只有 API 和明确的运行时需求才使用 adapter。
3. **Islands, not SPA** — 交互按组件注水，不把整个站点变成客户端应用。
4. **Content collections** — 文章、动态和特殊页面都经过 schema 校验。
5. **Motion with intent** — 微交互优先 CSS；复杂编排才使用更重的动画方案，并保留 reduced-motion 路径。
6. **Visual consistency over feature count** — 新页面必须共享 token、导航、响应式边界和可访问状态。

## Tech stack

技术栈按“页面框架、内容处理、构建增强、交付环境”分组，方便定位依赖和评估改动影响。

<p align="center">
  <img src="assets/images/readme/tech-stack.svg" alt="threetwoa's blog technology stack" width="100%">
</p>

## Deploy

本仓默认部署到 Vercel 项目 `fork-firefly`：

| Setting | Value |
| --- | --- |
| Framework | Astro |
| Build command | `pnpm build` |
| Install command | `pnpm install` |
| Output directory | `dist` |
| Project config | [vercel.json](vercel.json) |

标准交付顺序：本地预览 → `pnpm check` / `pnpm type-check` → `pnpm build` → push → 等待 Vercel Ready → 复核线上页面。

Cloudflare 配置保留在 [wrangler.jsonc](wrangler.jsonc)，但启用 Cloudflare 时需要额外验证 API 路由与 Node runtime 依赖。

## Project rules

- [AGENTS.md](AGENTS.md)：任务流、修改边界、提交和交付规则。
- [CONTEXT.md](CONTEXT.md)：产品定位、术语、技术事实和仓库边界。
- `docs/adr/`：需要长期保留的架构决策。
- `docs/outputs/commit-history/`：已完成工作和视觉演进的摘要。
- `docs/idea/`：尚未进入实现阶段的灵感和设计研究。

不要提交 `.env`、评论服务 token 或私有 API key。二次开发请保留 Firefly / Fuwari 的版权声明与 MIT 义务。

## Author

- GitHub: [Aafff623](https://github.com/Aafff623)
- Blog: [threetwoa's blog](https://fork-firefly.vercel.app)

## Acknowledgments

- Theme: [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)
- Original theme lineage: [saicaca/fuwari](https://github.com/saicaca/fuwari)
- Working style: [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)
- License: [MIT](LICENSE)
