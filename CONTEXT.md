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

核心文件：`siteConfig` · `profileConfig` · `navBarConfig` · `sidebarConfig` · `backgroundWallpaper`（含独立 `atmosphere`，与 mode 四选一无关） · `commentConfig` · `collectionsConfig`（人工合集登记，支持一级/二级嵌套）…

亮暗色：`themeColor.defaultMode` 现行为 **`time`**（按站点时区 `Asia/Shanghai` 北京时间；`timeSchedule` 默认 07:00–19:00 亮、19:00–07:00 暗）。另支持 `light` / `dark` / `system`；导航日月钮循环为 time → light → dark → time。

## 内容模型

Content Collections（`src/content.config.ts`）：

- `posts` — 博客文章（md/mdx；frontmatter 可含 `collections` 人工收录进合集）
- `posts/_draftbox/` — **草稿箱**（gitignore；本地 DEV 可预览，不 push；出箱后迁到 `posts/<slug>/`）
- `dynamic` — 动态/碎碎念（可接 Memos）
- `spec` — 特殊页面 Markdown

**草稿箱 ≠ `draft: true` demo**：箱内正文永不入库；主题示例帖 `posts/draft.md` 可跟踪且仅靠 FM 藏生产首页。见 `AGENTS.md` / `docs/agents/workflow.md`。

### 现行分类词表（发帖门禁）

文章 frontmatter `category` **必须**显式确认后再写盘（`ob2blog` / `knowledge-output`）。对照下表选桶或经园主同意新建；**禁止**因「AI/工具相关」一律填 `Agentic Coding`。

| 分类 | 适用（启发式） |
|---|---|
| Agentic Coding | Agent 工程、CLI/IDE agent 工作流、编码 agent 实践（确属此类才用） |
| 指南 | 教程、上手、配置说明、避坑指南 |
| 中转 | 中转站 / 池子 / 额度 / 线路测评 |
| 羊毛揭秘 | 活动套利、灰市货架结构、羊毛链拆解（**不是**中转评测；渠道链接默认打码） |
| skill 测评 | Skill / MCP / 插件测评 |
| 前端开发 | 前端工程、主题/站点实现向 |
| 写作 | 写作方法、叙事、成稿方法论（按需新建或选用） |
| 功能 | 站点功能介绍（按需） |

新建分类：先问园主中文名，再写入该帖 `category`（列表由 content 聚合，一般无需改配置）。

### MD 附件引用（`::note`）

正文用 `::note{file="notes/xxx.md"}`（文件在 `public/` 下）生成笔记附件卡；设置面板「附件引用框样式」默认 **关**（普通链接），用户可打开。预览/下载由 `NoteCardPreview` 负责。注意：这与 Docusaurus 提醒框 `:::note` **不是**同一语法。

### 合集（人工策展）

登记在 `src/config/collectionsConfig.ts`；文章 frontmatter `collections: [slug, ...]`（多对多）。

| 层级 | 规则 |
|---|---|
| 一级 | 无 `parent`；出现在 `/collections/` 总览卡 |
| 二级 | 有 `parent`；只在一级详情页展示；总览不单独出场 |

现行嵌套：`ai-coding-tools` ← 各工具夹；`course-geektime` ← 四门课。中转 / Workflow / **鱼皮VibeCoding（`vibe-tutorial-index`）** / Agentic Coding / Skill·MCP / **薅羊毛专区（`wool-freebies`）** 等仍为一级。一级详情聚合子合集文章（去重）；卡片文案顺序为「N 个子合集 · M 篇文章」。

`wool-freebies`：收录各厂商 AI 订阅 / 模型限免 / 申请试用情报类博客；文章 category 优先用词表「羊毛揭秘」，frontmatter 写 `collections: [wool-freebies]`。
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
| 乙 | 会话/调研/BibiGPT/公众号 | `knowledge-extract` → `knowledge-output` → **`site-cascade`** |

### Knowledge 素材库（仓外）

| 项 | 值 |
|---|---|
| 根 | `D:\OneDrive\Desktop\Knowledge` |
| 待发布 | `todo/{Theme}/{facet}/{YYYY-MM-DD}_{短题}/`（新规范） |
| 已发布 | `Archive/{Theme}/{facet}/…` |
| 小林coding 离线 | `Archive/xiaolincoding/source/`（私有检索；禁批量发帖；站上仅导览合集） |
| 兼容 | 历史扁平 `todo/{日期_主题}/` 仍可读；新 extract 勿再写扁平根 |
| 来源索引 | `session` / `paste-md` / `bibigpt` / `wechat` / `mixed` |
| Theme 词表 | Firefly skill：`.cursor/skills/knowledge-extract/references/theme-taxonomy.md` |
| 公众号流 | 同目录 `wechat-mp.md`（Multi-Agent + `source/` 保真 + TTA） |

**Theme ≠ 博客 category**：Theme/facet 管素材检索；成帖 `category` 仍走上文「现行分类词表」并经园主确认。

勿再写成单一 `/ob2blog`。细则见 `AGENTS.md` 与 `docs/agents/workflow.md`。

## 部署事实

- 默认页面仍 **prerender/static**；`CF_WORKERS` → Cloudflare adapter，否则 → `@astrojs/vercel`（供 `prerender=false` API）
- Vercel 项目：`fork-firefly`，已连 GitHub origin
- 构建：`pnpm build`（LQIP → Astro → font subset → Pagefind）

## 本地双端口预览（运维记忆 · 2026-08）

两套服务**彼此独立**；`ERR_CONNECTION_REFUSED`（-102）= 该端口上**没有进程在听**，不是页面/HTML 坏了。

| 端口 | 用途 | 启动（仓库根） | URL |
|---|---|---|---|
| **4321** | 站点本体（Astro） | `pnpm dev` | http://127.0.0.1:4321/ |
| **8090** | README 预览壳 | `python -m http.server 8090` | http://127.0.0.1:8090/preview-readme.html |
| **8090** | Release notes 预览（中英双栏） | 同上 | http://127.0.0.1:8090/preview-release.html |

**常见原因（本仓实录）：**

1. **重开 Cursor / 会话结束** → 后台 `pnpm dev`、`python -m http.server` 不会自动复活；终端元数据仍可能标 `running`，但 PID 已死（僵尸元数据）。
2. **只起了其中一个** → 例如只起了 4321，8090 仍 refused；或反过来。
3. **进程被 aborted** → Agent/终端中止会话后端口立刻空掉（曾见 `pnpm dev` ready 后数分钟即 `aborted`）。

**最快排查：** `Get-NetTCPConnection -LocalPort 4321,8090`（或 `netstat -ano | findstr ":4321 :8090"`）→ 空则在仓库根重起对应命令 → `curl.exe -sS -o nul -w "%{http_code}" http://127.0.0.1:<port>/…` 期望 200。勿用 `file://` 打开 `preview-readme.html`。

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
| 站内桌宠 | 双 DeepSeek spritesheet（浏览 Maid / 文章 OpenPet；`petConfig` / `SpritePet`）；浏览侧栏失衡时分类折叠 + 宠钉日历（`sidebarBalance`）；与 Spine/Live2D 互斥 |
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
