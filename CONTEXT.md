# CONTEXT.md

> 本仓领域事实单一来源。术语与硬约束以本文为准。主题使用文档见 `docs/official/`（gitignore，不提交）；路由索引见 `docs/knowledge/official-docs.tree.json`。

## 项目定位

- **产品名（对外）**：threetwoa's blog
- **仓库**：[Aafff623/fork-Firefly](https://github.com/Aafff623/fork-Firefly)（源自 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)，已脱离 fork 网络，standalone）
- **定位**：基于 Firefly（Astro 静态博客主题）的个人博客二次开发
- **线上**：https://fork-firefly.vercel.app
- **作者**：Aafff623 / threetwoa（中北大学软件工程；关注 Agent Engineering、Java/Python 业务系统）

## 一句话

少写一点代码，多留一点架构的余白；把 AI 锻成可复用工作流，把记录放进博客与数字花园。

## 技术栈（事实）

| 层 | 选型 |
|---|---|
| 框架 | Astro 7（静态输出） |
| 交互岛 | Svelte 5 |
| 样式 | Tailwind CSS 4 |
| 包管理 | pnpm 9（`preinstall` 强制） |
| Node | ≥ 22（本地曾用 24；文档建议部署 22.x） |
| 搜索 | Pagefind |
| 过渡 | Swup |
| 质量 | Biome（format/lint）、`astro check`、`tsc` |
| 部署 | Vercel（`vercel.json`）；可选 Cloudflare Pages/Workers |

## 仓库边界

| 路径 | 职责 |
|---|---|
| `src/` | 产品层（pages / layouts / components / config / content / plugins / utils） |
| `public/` | 原样静态资源 |
| `scripts/` | LQIP、字体子集、new-post / new-dynamic |
| `docs/` | 上游主题多语言 README 图 + **本仓 Agent 流程资产**（`docs/agents` · `docs/idea` 灵感库等） |
| `assets/` | project-init 媒体约定（README 配图等）；**不等于** `src/assets` |
| `docs/official/` | 官方中文配置文档（本地知识源，gitignore） |
| `docs/knowledge/official-docs.tree.json` | 官方文档 file-tree 路由模型（入库） |

**官方默认 ≠ 本站**：`docs/official` 记载的是主题出厂默认（例如评论 `type: "none"`）。本站现行以 `src/config/*` 与 ADR 为准（评论为 Waline，见 ADR-0001）；勿把官方默认抄回本站配置或知识文。

## 配置驱动模型

几乎所有开关在 `src/config/*.ts`，经 `@/config` barrel 导出；类型在 `src/types/`。改站优先改配置，不改布局内核。

核心文件：`siteConfig` · `profileConfig` · `navBarConfig` · `sidebarConfig` · `backgroundWallpaper`（含独立 `atmosphere`，与 mode 四选一无关） · `commentConfig` · `collectionsConfig`（人工合集登记）…

亮暗色：`themeColor.defaultMode` 现行为 **`time`**（访客本地时区；`timeSchedule` 默认 07:00–18:00 亮、18:00–07:00 暗）。另支持 `light` / `dark` / `system`；点导航日月钮会写入亮或暗并退出自动模式。

## 内容模型

Content Collections（`src/content.config.ts`）：

- `posts` — 博客文章（md/mdx；frontmatter 可含 `collections` 人工收录进合集）
- `dynamic` — 动态/碎碎念（可接 Memos）
- `spec` — 特殊页面 Markdown

## Obsidian 写作源（固定）

| 项 | 值 |
|---|---|
| Vault 根 | `D:\OneDrive\Desktop\Notes\threetwoa_ob` |
| 附件目录 | `Assets/picture`（见 vault `.obsidian/app.json` → `attachmentFolderPath`） |
| 映射表 | `Firefly/.ob2blog/manifest.json`（笔记路径 ↔ 博客 slug） |

一般不变更；变更时先改 `CONTEXT.md` 与 manifest 的 `vaultRoot`，再改 skill 文档。

发文流水线（双路径，按源分支）：

| 路径 | 源 | 技能链 |
|---|---|---|
| 甲 | Obsidian vault | `ob2blog` → **`site-cascade`** |
| 乙 | 会话/调研素材 | `knowledge-extract` → `knowledge-output` → **`site-cascade`** |

勿再写成单一 `/ob2blog`。细则见 `AGENTS.md` 与 `docs/agents/workflow.md`。

## 部署事实

- 默认页面仍 **prerender/static**；`CF_WORKERS` → Cloudflare adapter，否则 → `@astrojs/vercel`（供 `prerender=false` API）
- Vercel 项目：`fork-firefly`，已连 GitHub origin
- 构建：`pnpm build`（LQIP → Astro → font subset → Pagefind）

## 硬约束

1. 不提交密钥、评论服务 token、私有 API Key 进配置明文仓库。
2. 业务功能：PRD 未批准不写大规模功能代码（见 `AGENTS.md`）。
3. 二次开发保留 Firefly / Fuwari 版权声明与 MIT 义务。
4. Windows 路径与 Shell：遵循 `.cursor/rules/windows-*-discipline.mdc`。
5. Agent 行为：遵循 `.cursor/rules/karpathy-guidelines.mdc`（先想清楚、外科手术式改动、可验证目标）。

## 术语（摘录）

| 术语 | 含义 |
|---|---|
| 视觉体系 | **壳层中性灰** + **彩仅点缀**（紫系邻近：indigo / violet / cool / rose / berry） |
| 默认主题色锚点 | Kraken 主紫（hue 290）作链接主色；粉玫等作模块创意点缀 |
| 标题荧光笔 | 卡片轮换高亮，并穿插 `--hl-rose` |
| Firefly | 上游主题名；本仓为其独立二次开发站（非 fork） |
| 配置驱动 | 功能开关与文案落在 `src/config`，非硬编码散落 |
| 岛屿（island） | Svelte 客户端组件（搜索、设置、分页等） |
| 站内桌宠 | 双 DeepSeek spritesheet（浏览 Maid / 文章 OpenPet；`petConfig` / `SpritePet`）；与 Spine/Live2D 互斥 |
| 站点音乐 | 默认 `musicConfig.mode=local`（ADR-0002）；导航栏音符=音频面板，三角播放=横幅背景视频，二者互斥 |
| 动态 | `content/dynamic` 或 Memos 时间线，非「动态 SSR」 |
| LQIP | 低质量图片占位，构建脚本生成 |
| Digital Garden | 作者另一站点：https://threetwoa-digital-garden.vercel.app |
| Banner 氛围层 | `backgroundWallpaper.atmosphere`：banner 模式下正文区 fixed 垫底图；可与横幅 `firefly:banner-slide` 同色同频（`syncWithBanner`）；软过渡靠 mask，不靠近白水波纹 |

## 已知缺口（非阻塞）

- demo 文章 / 原作者 Bangumi·追番 ID 仍在配置中，后续可关页面或改 ID
- 评论系统现行 `type: "waline"`（ADR-0001）；勿再按 `none` 理解
- 音乐默认 `local`（ADR-0002）；勿再默认假定公共 Meting 在线
- 本地 pnpm 若走 npmmirror，部分包可能 404；安装可用官方 registry
- 主题氛围：页面/卡片/按钮底为中性灰；紫与邻近色只出现在链接、高亮、图标、竖条等点缀位

## 交付闭环（与 workflow 一致）

本地预览 → 本地校验 → push → Vercel Ready → **再核线上**。详见 `docs/agents/workflow.md`。

## 参考

- 配置详解：`docs/official/`（路由：`docs/knowledge/official-docs.tree.json`）
- 上游主题：https://github.com/CuteLeaf/Firefly
- 作者主页：https://github.com/Aafff623
