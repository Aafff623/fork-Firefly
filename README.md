# threetwoa's blog

> *code less, architect more*

基于 [Firefly](https://github.com/CuteLeaf/Firefly)（Astro 静态博客主题）的个人二次开发。少写一点代码，多留一点架构的余白——把 AI 锻成可复用工作流，把记录写进博客与数字花园。

<!-- banner: 落盘后取消注释
![banner](assets/images/readme/banner.png)
-->

[![Astro](https://img.shields.io/badge/Astro-7.1-orange?style=for-the-badge&logo=astro)](https://astro.build)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=for-the-badge&logo=vercel)](https://fork-firefly.vercel.app)
[![Node](https://img.shields.io/badge/Node-%3E%3D22-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

**线上** · https://fork-firefly.vercel.app  
**作者** · [Aafff623](https://github.com/Aafff623) / threetwoa  
**数字花园** · https://threetwoa-digital-garden.vercel.app  
**仓库** · [Aafff623/fork-Firefly](https://github.com/Aafff623/fork-Firefly)

[为什么](#为什么) · [功能](#功能) · [Preview](#preview) · [Showcase](#showcase--演示) · [快速开始](#快速开始) · [架构](#架构) · [主链路](#主链路) · [目录](#目录结构) · [路线图](#路线图) · [文档](#文档)

---

## 为什么

| 痛点 | 本仓做法 |
|------|----------|
| 主题配置散、文档在脑外 | 配置集中在 `src/config/`，旁路 `Firefly_docs/` 可查 |
| Agent 改站易漂 | `CONTEXT` / `AGENTS` / Karpathy MDC + 交付闭环 |
| 部署与本地脱节 | **本地预览 → 校验 → push → 核线上**（强制） |

---

## 功能

<!-- ![features](assets/images/readme/features.png) -->

| 能力 | 说明 | 边界 |
|------|------|------|
| 配置驱动 | 站点 / 侧栏 / 壁纸 / 评论等 TypeScript 配置 | 不改布局内核也能换皮 |
| Astro SSG | 静态 `dist`，SEO 友好 | 默认非 SSR（勿乱开 `CF_WORKERS`） |
| Svelte 岛屿 | 搜索、设置、分页等交互 | 仅必要客户端 |
| Pagefind | 全文搜索 | 构建期索引 |
| 布局系统 | 单/双侧栏 · 列表/网格 · 多壁纸模式 | 见主题指南文 |
| Markdown 扩展 | 提醒框、Mermaid、PlantUML、Wiki Link… | 插件在 `src/plugins` |
| 动态 / 相册等 | 主题内置页面 | 可用 `siteConfig.pages` 关闭 |

---

## Preview

**本仓无独立资产 Preview 站**（单产品博客，不以 Gallery 浏览组件包）。产品面用下方 Showcase。

### README 本地预览壳

边写 README 边看排版（须 HTTP，勿 `file://`）：

```bash
cd Firefly
python -m http.server 8090
# 打开 http://127.0.0.1:8090/preview-readme.html
```

---

## Showcase · 演示

推荐路径：

1. 打开 [线上首页](https://fork-firefly.vercel.app/)  
2. 点进一篇文章（demo 文或你的新文）  
3. （可选）动态 / 归档  

| 槽位 | 文件 | 状态 |
|------|------|------|
| 首页 | `assets/images/readme/showcase-home.png` | 待截图 |
| 文章页 | `assets/images/readme/showcase-post.png` | 待截图 |

> 真机截图规范：`docs/outputs/prd/readme-diagrams/readme-image-prompts.md`（`method: screenshot`）。

---

## 快速开始

```bash
git clone https://github.com/Aafff623/fork-Firefly.git
cd fork-Firefly
pnpm install   # 若镜像 404：加 --registry https://registry.npmjs.org
pnpm dev       # http://localhost:4321
```

| 要求 | 版本 |
|------|------|
| Node | ≥ 22 |
| pnpm | ≥ 9（`packageManager` 锁 9.14.4） |

常用：`pnpm build` · `pnpm check` · `pnpm new-post <slug>` · `pnpm new-d <内容>`

配置入口：`src/config/siteConfig.ts` · `profileConfig.ts`。  
部署：push `master` → Vercel 项目 `fork-firefly` 自动构建。

---

## 架构

<!-- ![architecture](assets/images/readme/architecture.png) -->

| 层 | 内容 |
|----|------|
| Authoring | `src/config` · `src/content` · 旁路 `Firefly_docs` |
| Build | Astro 7 SSG · plugins · LQIP · font subset · Pagefind |
| Runtime | `dist` 静态资源 · Vercel CDN · Browser（Swup / Svelte islands） |

<!-- ![tech-stack](assets/images/readme/tech-stack.png) -->

**栈**：Astro 7 · Svelte 5 · Tailwind 4 · TypeScript · pnpm · Biome · Pagefind · Swup · Vercel  

出图 Prompt：`docs/outputs/prd/readme-diagrams/readme-image-prompts.md`

---

## 主链路

<!-- ![workflow](assets/images/readme/workflow.png) -->

```text
改 config / content
  → pnpm dev 本地预览
  → 本地校验（目视 + pnpm check）
  → git push
  → Vercel Ready
  → 打开 https://fork-firefly.vercel.app 再核
```

细则：`docs/agents/workflow.md` · `AGENTS.md`

---

## 目录结构

<details>
<summary>展开仓库树（摘要）</summary>

```text
Firefly/
├── src/
│   ├── config/          # 站点开关与文案
│   ├── content/         # posts · dynamic · spec
│   ├── components/      # UI
│   ├── layouts/         # Layout · MainGridLayout
│   ├── pages/           # 路由
│   ├── plugins/         # remark/rehype
│   └── utils/
├── public/
├── scripts/
├── docs/                # agents · adr · glossary · knowledge · outputs
├── assets/images/readme # README 配图（契约名）
├── AGENTS.md · CONTEXT.md · LANGUAGES.md · CLAUDE.md
├── preview-readme.html  # README 本地预览壳
└── vercel.json
```

</details>

---

## 路线图

| 项 | 状态 |
|----|------|
| Phase A 治理 + 品牌 + Vercel | 完成 |
| Phase B README 结构 / Prompt / 预览壳 | 进行中 |
| README 契约配图落盘 | 待你出图 |
| Showcase 真机截图 | 待补 |
| 替换 demo 文 / 头像 / 关无用页面 | 待办 |

---

## 文档

| 文档 | 说明 |
|------|------|
| [`CONTEXT.md`](./CONTEXT.md) | 领域事实 |
| [`AGENTS.md`](./AGENTS.md) | Agent 硬约束 |
| [`LANGUAGES.md`](./LANGUAGES.md) | 共享用词 |
| [`docs/knowledge/firefly-ops.md`](./docs/knowledge/firefly-ops.md) | Day-2 运维 |
| [`docs/glossary/frontend-ui.md`](./docs/glossary/frontend-ui.md) | UI 术语 |
| [`docs/outputs/prd/readme-diagrams/`](./docs/outputs/prd/readme-diagrams/) | README 配图 brief / prompts |
| 旁路 `../Firefly_docs/` | 官方配置指南（工作区） |
| [`README.en.md`](./README.en.md) | 上游英文说明（保留） |

---

## 致谢与许可

- 主题：[CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly) · 源自 [fuwari](https://github.com/saicaca/fuwari)  
- 行为准则灵感：[andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)  
- License：MIT（见 `LICENSE`）。二次开发请保留上游版权声明。
