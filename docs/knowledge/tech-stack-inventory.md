# 技术栈清单（tech-stack inventory）

> 细清单真源。README [Tech stack](../../README.md#tech-stack) 只放总表；版本以根目录 `package.json` / `CONTEXT.md` 为准。  
> 状态列：`现行` = 本站默认启用；`备选` = 配置可切；`开发期` = Agent / 本地工具，非站点运行时硬依赖。

## Runtime core

| 项 | 包 / 版本锚点 | 角色 | 状态 | 入口 |
|---|---|---|---|---|
| 框架 | `astro` 7.1.x | SSG 页面与路由 | 现行 | `astro.config.mjs` |
| 岛屿 | `svelte` 5.x · `@astrojs/svelte` | 搜索、设置、分页等客户端岛 | 现行 | `src/components/` |
| React 岛 | `react` 19 · `@astrojs/react` | 动态时间线等少量组件 | 现行 | `src/components/pages/dynamic/react/` |
| 类型 | `typescript` 6.x | 类型检查 | 现行 | `pnpm type-check` |
| 样式 | `tailwindcss` 4.x · `@tailwindcss/vite` · `@tailwindcss/typography` | 工具类与排版 | 现行 | `src/styles/` · Vite 插件 |
| 包管理 | `pnpm@9.14.4` · `only-allow` | 强制 pnpm | 现行 | `package.json` `preinstall` |
| 运行时 | Node.js ≥ 22 | 本地与构建 | 现行 | — |

## Content pipeline

| 项 | 包 / 模块 | 角色 | 状态 | 入口 |
|---|---|---|---|---|
| Content Collections | Astro built-in | `posts` / `dynamic` / `spec` schema | 现行 | `src/content.config.ts` |
| MD / MDX | `@astrojs/mdx` · `@astrojs/markdown-remark` | 正文与 MDX | 现行 | `astro.config.mjs` |
| 数学 | `remark-math` · `rehype-katex` · `katex` | 公式 | 现行 | `astro.config.mjs` |
| Mermaid | `remark-mermaid` · `rehype-mermaid` · `@mermanjs/web` | 构建期静态 SVG | 现行 | `src/plugins/` · `mermaidConfig.ts` |
| PlantUML | `remark-plantuml` · `rehype-plantuml` | 时序/类图 | 现行 | `plantumlConfig.ts` |
| Wiki Link | `remark-wiki-link` | `[[链接]]` | 现行 | `src/plugins/remark-wiki-link.js` |
| Directive / 卡片 | `remark-directive` · `rehype-components` · GitHub/Note card | 自定义指令块 | 现行 | `src/plugins/rehype-component-*.mjs` |
| Callouts | `rehype-callouts` · `remark-admonition-to-blockquote-callout` | 提示块 | 现行 | `siteConfig.post.rehypeCallouts` |
| 代码组 | `rehype-code-group` | Tab 代码块 | 现行 | `astro.config.mjs` |
| 其它 rehype | slug / figure / external-links / email-protection / diagram panzoom / image referrer | 标题锚点、外链、图示交互 | 现行 | `src/plugins/` |
| 阅读时间 / 摘要 | `remark-reading-time` · `remark-excerpt` · `reading-time` | 元数据 | 现行 | `src/plugins/` |
| 代码高亮 | `astro-expressive-code` + collapsible / line-numbers / language-badge | 代码块 UI | 现行 | `expressiveCodeConfig.ts` |
| 图示增强 | `rehype-diagram-panzoom` | Mermaid/PlantUML 缩放拖拽 | 现行 | `src/plugins/rehype-diagram-panzoom.mjs` |

## UI / interaction / motion

| 项 | 包 | 角色 | 状态 | 入口 |
|---|---|---|---|---|
| 页面过渡 | `@swup/astro` | 无刷新切页 | 现行 | `astro.config.mjs` |
| 图标 | `astro-icon` · `@iconify-json/*` · `@iconify/svelte` | 按需图标 | 现行 | `astro.config.mjs` `icon.include` |
| 灯箱 | `@fancyapps/ui` | 图片灯箱 | 现行 | 组件 + `fancybox-custom.css` |
| 无限画布 | `three` | Gallery 画布模式 | 现行 | `src/pages/gallery/` |
| 动态时间线动效 | `framer-motion` | React 时间线条目 | 现行 | `timeline.tsx` |
| 类名工具 | `clsx` · `tailwind-merge` · `class-variance-authority` | 样式组合 | 现行 | 组件通例 |
| GSAP skills | `.agents/skills/gsap-*` | **开发期**动画实现指引 | 开发期 | 非 `package.json` 运行时依赖 |

## Build enrichment

| 项 | 包 / 脚本 | 角色 | 状态 | 入口 |
|---|---|---|---|---|
| 构建编排 | `pnpm build` | LQIP → Astro → 字体子集 → Pagefind | 现行 | `package.json` |
| LQIP | `scripts/generate-lqips.ts` · `sharp` | 低质量图占位 | 现行 | `pnpm lqips` |
| 字体子集 | `scripts/subset-fonts.ts` · `subset-font` | 本地字体瘦身 | 现行 | `fontConfig.subsetFonts` |
| 全站搜索 | `pagefind` | 静态索引 | 现行 | `pagefind --site dist` |
| OG 图 | `satori` | 社交分享图 | 现行 | `src/pages/og/` |
| 图片处理 | `sharp` | 构建期图像 | 现行 | Astro / LQIP |
| 新内容脚手架 | `scripts/new-post.js` · `scripts/new-dynamic.js` | `pnpm new-post` / `pnpm new-d` | 现行 | `package.json` |
| Showcase 截图 | `scripts/capture-readme-showcase.py` | README 真机图 | 开发期 | 需先 `pnpm dev` |

## Quality

| 项 | 工具 | 角色 | 状态 |
|---|---|---|---|
| Format / Lint | `@biomejs/biome` 2.5.x | `pnpm format` / `pnpm lint` | 现行 |
| Astro 诊断 | `@astrojs/check` | `pnpm check` | 现行 |
| 类型 | `tsc --noEmit` | `pnpm type-check` | 现行 |

## Deploy / adapters

| 项 | 包 / 文件 | 角色 | 状态 | 入口 |
|---|---|---|---|---|
| 默认部署 | `@astrojs/vercel` · `vercel.json` | 静态 + 少量 API | 现行 | 无 `CF_WORKERS` 时 |
| Cloudflare | `@astrojs/cloudflare` · `wrangler` · `wrangler.jsonc` | 可选 adapter | 备选 | `CF_WORKERS=1` |
| RSS / Sitemap | `@astrojs/rss` · `@astrojs/sitemap` | 订阅与索引 | 现行 | `src/pages/rss*` · config |

## Site integrations（运行时 / 配置门控）

| 项 | 实现 | 角色 | 状态 | 入口 |
|---|---|---|---|---|
| 评论 | Waline（自建 serverURL） | 文章评论 | 现行 | `commentConfig.ts` · ADR-0001 |
| 评论备选 | Twikoo / Giscus / Artalk / Disqus | 槽位保留 | 备选 | `commentConfig.type` |
| 评论大图 | `/api/comment-image` + 腾讯云 COS | 超 Base64 限制的图 | 现行（需密钥） | `.env.example` |
| 梗图建议 | `/api/comment-sticker-suggest` | 词表 / 可选 DeepSeek | 接线、默认关 | `commentConfig.waline.stickerSuggest` |
| 桌宠 | SpritePet spritesheet | 浏览/文章双皮 | 现行 | `petConfig.ts` · `public/pets/` |
| Live2D / Spine | `l2d-widget` · `public/pio/` | 与 SpritePet 互斥 | 备选 | `pioConfig.ts` |
| 音乐 | local 曲库 | 导航栏播放器 | 现行 | `musicConfig.ts` · ADR-0002 |
| 音乐备选 | Meting API | 在线歌单 | 备选 | `musicConfig.mode=meting` |
| 动态源 | 本地 `content/dynamic` | 碎碎念 | 现行 | `dynamicConfig.ts` |
| 动态备选 | Memos API | 外接时间线 | 备选 | `dynamicConfig` |
| 分析 | GA / Clarity / Umami / 51la | 访客统计 | 槽位空 | `analyticsConfig.ts` |
| 管理 API | `/api/admin/pin` 等 | 置顶等（需鉴权） | 现行 | `src/pages/api/` |

## Agent / 内容流水线（开发期）

| Skill | 路径 | 角色 |
|---|---|---|
| `ob2blog` | `.cursor/skills/ob2blog/` | Obsidian vault → `posts/<slug>` |
| `knowledge-extract` | `.cursor/skills/knowledge-extract/` | 会话/调研 → Knowledge 素材 |
| `knowledge-output` | `.cursor/skills/knowledge-output/` | Knowledge → 成帖 |
| `site-cascade` | `.cursor/skills/site-cascade/` | 发文后级联（动态/统计/分类标签/热力图） |
| `firefly-minimax-media` | `.cursor/skills/firefly-minimax-media/` | MiniMax 封面/语音/音乐/短视频 |

细则：`AGENTS.md` · `docs/agents/workflow.md`。

## 相关

- README 总表：[Tech stack](../../README.md#tech-stack)
- 样式与素材：[style-and-assets-inventory.md](./style-and-assets-inventory.md)
- 领域事实：[`CONTEXT.md`](../../CONTEXT.md)
- 决策：[`docs/adr/`](../adr/)
