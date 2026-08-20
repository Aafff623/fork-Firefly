# Firefly 运维备忘（fork-Firefly / threetwoa's blog）

> 主题配置语义以 docs/official/ 为准（路由：docs/knowledge/official-docs.tree.json）；领域事实以 CONTEXT.md 为准。  
> **官方默认 ≠ 本站**：`docs/official` 里评论默认 `type: "none"` 等是主题出厂值；本站现行以 `src/config/commentConfig.ts` + ADR-0006（文章 Giscus、Dynamic Waline）为准。
> 线上：https://fork-firefly.vercel.app · 仓库：https://github.com/Aafff623/fork-Firefly

## 1. Day-2 日常

### 改站点标题 / 资料
编辑 src/config/siteConfig.ts（title / subtitle / navbar.title / site_url / description / keywords）。  
个人资料：src/config/profileConfig.ts。  
文档：docs/official/02-基础配置/站点配置.md · 个人资料.md

### 写文章
日常入口按**素材来源**分支（勿当成只有 `pnpm new-post`）：

| 路径 | 何时 | 技能链 |
|---|---|---|
| 1–4 | 写稿进料（vault / 粘贴 / 调研 / 早报热榜） | `knowledge-extract` →（1–3）`knowledge-output`（无主题分批扫 todo；合集按一二级缓存路由）→ `site-cascade` |

空壳脚手架仍可用：

```bash
pnpm new-post <slug>
pnpm dev
```

Frontmatter 必填 title、published。详解：docs/official/01-入门/编写文章.md；双路径细则：`AGENTS.md` · `docs/agents/workflow.md`。

### 关闭页面
siteConfig.pages.* = false → 路由 404 + 导航自动隐藏。不必先改 navBarConfig。

### 部署
| 项 | 事实 |
|---|---|
| 平台 | Vercel 项目 fork-firefly |
| 构建 | pnpm build → dist（LQIP → Astro → 字体子集 → Pagefind） |
| 模式 | 默认 static；仅 CF_WORKERS 启用 CF adapter |
| Node | ≥ 22（建议部署 22.x） |

**交付闭环**：本地 pnpm dev → 校验 → 你确认 → push → 等 Vercel → **再核线上**。未本地验收不得 push。

## 2. docs/official 索引

| 区块 | 路径 |
|---|---|
| 入门 | docs/official/01-入门/（快速开始·编写文章·部署·更新主题） |
| 基础配置 | docs/official/02-基础配置/ |
| 功能配置 | docs/official/03-功能配置/ |
| 页面配置 | docs/official/04-页面配置/ |
| 扩展 | docs/official/05-扩展功能/ |

总览：docs/official/README.md · 路由模型：docs/knowledge/official-docs.tree.json

## 3. 已知坑

1. **npmmirror 404**：pnpm install --registry https://registry.npmjs.org
2. **site_url**：换域必须同步；影响 Astro site、OG、sitemap
3. **Node < 22**：构建易失败
4. **勿乱开 CF_WORKERS**：本仓是静态站
5. **demo 残留**：Bangumi/追番示例 ID、demo 文；可关页面或改 ID
6. **留言板 / 评论**：`siteConfig.pages.guestbook` 开启；文章与留言板走 **Giscus**（`commentConfig.type: "giscus"`），Dynamic 内联回复才走 Waline（见 ADR-0006）。Giscus 依赖 GitHub Discussions 配置；Waline `serverURL` 只影响 Dynamic 回复
7. **仅 pnpm**：npm/yarn 会被 preinstall 拦截

## 4. 不要随便改

| 对象 | 原因 |
|---|---|
| Layout.astro / MainGridLayout.astro | 上帝文件，非必要不拆 |
| astro.config.mjs / src/plugins/* | 构建与 Markdown 管线 |
| package.json 的 preinstall / packageManager | 强制 pnpm |
| 密钥进 *Config.ts | 硬约束 |

优先改：src/config/ · src/content/ · public/

## 5. 命令

```bash
pnpm install
pnpm dev
pnpm check && pnpm type-check
pnpm build && pnpm preview
pnpm new-post <slug>
pnpm new-d <content>
```

## 6. 远程

| 名 | URL |
|---|---|
| origin | https://github.com/Aafff623/fork-Firefly.git |
| upstream | https://github.com/CuteLeaf/Firefly.git |
| 生产域 | https://fork-firefly.vercel.app |
| 数字花园 | https://threetwoa-digital-garden.vercel.app |
