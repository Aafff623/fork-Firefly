# Firefly 运维备忘（fork-Firefly / threetwoa's blog）

> 主题配置语义以旁路 ../Firefly_docs/ 为准；领域事实以 CONTEXT.md 为准。  
> 线上：https://fork-firefly.vercel.app · 仓库：https://github.com/Aafff623/fork-Firefly

## 1. Day-2 日常

### 改站点标题 / 资料
编辑 src/config/siteConfig.ts（	itle / subtitle / 
avbar.title / site_url / description / keywords）。  
个人资料：src/config/profileConfig.ts。  
文档：../Firefly_docs/02-基础配置/站点配置.md · 个人资料.md

### 写文章
\\\ash
pnpm new-post <slug>
pnpm dev
\\\
Frontmatter 必填 	itle、published。详解：../Firefly_docs/01-入门/编写文章.md

### 关闭页面
siteConfig.pages.* = false → 路由 404 + 导航自动隐藏。不必先改 
avBarConfig。

### 部署
| 项 | 事实 |
|---|---|
| 平台 | Vercel 项目 ork-firefly |
| 构建 | pnpm build → dist（LQIP → Astro → 字体子集 → Pagefind） |
| 模式 | 默认 static；仅 CF_WORKERS 启用 CF adapter |
| Node | ≥ 22（建议部署 22.x） |

**交付闭环**：本地 pnpm dev → 校验 → 你确认 → push → 等 Vercel → **再核线上**。未本地验收不得 push。

## 2. Firefly_docs 索引

| 区块 | 路径 |
|---|---|
| 入门 | ../Firefly_docs/01-入门/（快速开始·编写文章·部署·更新主题） |
| 基础配置 | ../Firefly_docs/02-基础配置/ |
| 功能配置 | ../Firefly_docs/03-功能配置/ |
| 页面配置 | ../Firefly_docs/04-页面配置/ |
| 扩展 | ../Firefly_docs/05-扩展功能/ |

总览：../Firefly_docs/README.md

## 3. 已知坑

1. **npmmirror 404**：pnpm install --registry https://registry.npmjs.org
2. **site_url**：换域必须同步；影响 Astro site、OG、sitemap
3. **Node < 22**：构建易失败
4. **勿乱开 CF_WORKERS**：本仓是静态站
5. **demo 残留**：Bangumi/追番示例 ID、demo 文；可关页面或改 ID
6. **留言板**：guestbook 开着但评论 	ype: none 时无实际留言能力
7. **仅 pnpm**：npm/yarn 会被 preinstall 拦截

## 4. 不要随便改

| 对象 | 原因 |
|---|---|
| Layout.astro / MainGridLayout.astro | 上帝文件，非必要不拆 |
| stro.config.mjs / src/plugins/* | 构建与 Markdown 管线 |
| package.json 的 preinstall / packageManager | 强制 pnpm |
| 密钥进 *Config.ts | 硬约束 |

优先改：src/config/ · src/content/ · public/

## 5. 命令

\\\ash
pnpm install
pnpm dev
pnpm check && pnpm type-check
pnpm build && pnpm preview
pnpm new-post <slug>
pnpm new-d <content>
\\\

## 6. 远程

| 名 | URL |
|---|---|
| origin | https://github.com/Aafff623/fork-Firefly.git |
| upstream | https://github.com/CuteLeaf/Firefly.git |
| 生产域 | https://fork-firefly.vercel.app |
| 数字花园 | https://threetwoa-digital-garden.vercel.app |
