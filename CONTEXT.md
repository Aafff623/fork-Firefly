# CONTEXT.md

> 本仓领域事实单一来源。术语与硬约束以本文为准。主题使用文档见 `docs/official/`（gitignore，不提交）；路由索引见 `docs/knowledge/official-docs.tree.json`。

## 项目定位

- **产品名（对外）**：threetwoa's blog
- **仓库**：[Aafff623/fork-Firefly](https://github.com/Aafff623/fork-Firefly)（源自 [CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)，已脱离 fork 网络，standalone）
- **定位**：基于 Firefly（Astro 静态博客主题）的个人博客二次开发
- **线上主入口**：https://www.threetwoa.live  
- **海外备用**：https://fork-firefly.vercel.app
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
| `docs/` | 上游主题多语言 README 图 + **本仓强关联 Agent 资产**（`docs/agents` 流程件 · `docs/adr` · `docs/glossary` · `docs/outputs/{prd,commit-history}`）；弱关联产物（灵感 / 调研 / handoff / 知识文 / 临时脚本）归本仓 `temp/` 对应分类 |
| `assets/` | project-init 媒体约定（README 配图等）；**不等于** `src/assets` |
| `docs/official/` | 官方中文配置文档（本地知识源，gitignore） |
| `docs/knowledge/official-docs.tree.json` | 官方文档 file-tree 路由模型（入库） |

**官方默认 ≠ 本站**：`docs/official` 记载的是主题出厂默认（例如评论 `type: "none"`）。本站现行以 `src/config/*` 与 ADR 为准（文章评论为 Giscus，Dynamic 回复保留 Waline，见 ADR-0006）；勿把官方默认抄回本站配置或知识文。

## 配置驱动模型

几乎所有开关在 `src/config/*.ts`，经 `@/config` barrel 导出；类型在 `src/types/`。改站优先改配置，不改布局内核。

核心文件：`siteConfig` · `profileConfig` · `navBarConfig` · `sidebarConfig` · `backgroundWallpaper`（含独立 `atmosphere`，与 mode 四选一无关） · `commentConfig` · `communityConfig` · `collectionsConfig`（人工合集登记，支持一级/二级嵌套）…

亮暗色：`themeColor.defaultMode` 现行为 **`time`**（按站点时区 `Asia/Shanghai` 北京时间；`timeSchedule` 默认 07:00–19:00 亮、19:00–07:00 暗）。另支持 `light` / `dark` / `system`；导航日月钮循环为 time → light → dark → time。

## 内容模型

Content Collections（`src/content.config.ts`）：

- `posts` — 博客文章（md/mdx；frontmatter 可含 `collections` 人工收录进合集）
- `posts/_draftbox/` — **草稿箱**（gitignore；本地 DEV 可预览，不 push；出箱后迁到 `posts/<slug>/`）
- `dynamic` — 动态/碎碎念（可接 Memos）
- `spec` — 特殊页面 Markdown

**草稿箱 ≠ `draft: true` demo**：箱内正文永不入库；主题示例帖 `posts/draft.md` 可跟踪且仅靠 FM 藏生产首页。见 `AGENTS.md` / `docs/agents/workflow.md`。

**内容收束状态**：原「2026-08 约 24 篇生产文章」是历史快照，已不再代表当前 checkout。当前工作树包含 734 个文章入口（其中 31 个仍是未跟踪导入 WIP）；最终生产公开名单待园主确认，不能仅按当前文件数量发布。

### 现行分类词表（发帖门禁）

文章 frontmatter `category` 由 `post-publish` 按本表自动建议，批次汇报表一次性过目；园主要改当场说。对照下表选桶或经园主同意新建；**禁止**因「AI/工具相关」一律填 `Agentic Coding`。

| 分类 | 适用（启发式） |
|---|---|
| Agentic Coding | Agent 工程、CLI/IDE agent 工作流、编码 agent 实践（确属此类才用） |
| 指南 | 教程、上手、配置说明、避坑指南 |
| 中转 | 中转站 / 池子 / 额度 / 线路测评 |
| 羊毛揭秘 | 活动套利、灰市货架结构、羊毛链拆解（**不是**中转评测；渠道链接默认打码） |
| skill 测评 | Skill / MCP / 插件测评 |
| 前端开发 | 前端工程、主题/站点实现向 |
| 写作 | 写作方法、叙事、成稿方法论（按需新建或选用） |
| 早报 | 按期 AI 资讯摘要（报刊式合集 `ai-morning-brief`；不是教程、不是羊毛拆解） |
| 开源 | 按期 GitHub 项目解读（报刊式合集 `github-weekly-hot`；不是日更图卡，不是教程） |
| 功能 | 站点功能介绍（按需） |
| 修行 | 修仙、修行、玄学世界观、灵性实证与神话考据（一级合集 `xiuxing`，二级按 UP 主：散人小沅 / 修炼者小烨 / 玄成先生 / 林晓丁） |

新建分类：先问园主中文名，再写入该帖 `category`（列表由 content 聚合，一般无需改配置）。

### MD 附件引用（`::note`）

正文用 `::note{file="notes/xxx.md"}`（文件在 `public/` 下）生成笔记附件卡；设置面板「附件引用框样式」默认 **关**（普通链接），用户可打开。预览/下载由 `NoteCardPreview` 负责。注意：这与 Docusaurus 提醒框 `:::note` **不是**同一语法。

### 合集（人工策展）

登记在 `src/config/collectionsConfig.ts`；文章 frontmatter `collections: [slug, ...]`（多对多，允许跨一级复用）。post-publish 成帖时直接对照 `src/config/collectionsConfig.ts` 真源挂一二级（干什么、什么样的文章该进；不记文章名单、不记三级正文），不另维护缓存文件。

| 层级 | 规则 |
|---|---|
| 一级 | 无 `parent`；出现在 `/collections/` 总览卡（**0 篇也出卡**，空频道先立牌子） |
| 二级 | 有 `parent`；只在一级详情页展示；总览不单独出场 |
| 第三层 | 这轮用手册 `##` 章节顶着，不新登记合集夹。极客时间四门课是既有三级，仍挂在 `course-geektime` 下 |

现行一级频道：`ai-coding-tools` · `agentic-workflow` · `visual-media` · `model-eval` · `llm-overview` · `java-fullstack` · `courses` · `career-guide` · `frontend-eng` · `backend` · `database` · `ops` · `product` · `humanities` · `xiuxing` · `site-series`。

挂载口径：

- **前端工程**（`frontend-eng`）：小程序、Lottie、SVG 动效、纯 CSS、3D 等实现向。
- **视觉媒体**（`visual-media`）：海报/版式、提示词资产、视频与手绘素材整理。
- **本站系列**（`site-series`）：本站部署、桌宠、发文流水线等站点自身记录。
- **大模型概述**（`llm-overview`）：RAG / MoE 等应用与底层概念、Python 库地图。跑分实测仍走 `model-eval`。
- **模型评测**（`model-eval`）：厂商新模型实测；中转 / 羊毛里真正测模型的文章挂其二级 `transit-relay` / `wool-freebies`。
- **文史**（`humanities`）：历史、神话、人物与地图。不用「历史」当频道名——神话地图不是编年史，后面人物/史识也能进同一夹。
- **Agentic Workflow**：跨工具的 Vibe / Spec / Harness Engineering；可与工具夹双挂。鱼皮导读墙 `vibe-tutorial-index`、Vibe 踩坑 `csdn-tech-tutorials` 是它的二级。
- **CLAUDE.md** 手册：`tool-claude-code` + `agentic-workflow`。**AGENTS.md** 手册：Workflow，并可挂 Cursor / Kimi / Codex 工具夹。

`wool-freebies`：收录各厂商 AI 订阅 / 模型限免 / 申请试用情报类博客；文章 category 优先用词表「羊毛揭秘」，frontmatter 写 `collections: [wool-freebies]`（随父夹滚进 `model-eval`）。

`ai-morning-brief`：报刊式按期 AI 早报；文章 category 用词表「早报」，frontmatter 写 `collections: [ai-morning-brief]`。主源为橘鸦Juya 早报 RSS（`https://daily.juya.uk/rss.xml`）；Agent 按园主焦点筛选后发判断，不转载橘鸦全文。B 站稿只链原页，禁转载口播。

`github-weekly-hot`：报刊式按期 GitHub 热榜；文章 category 用词表「开源」，frontmatter 写 `collections: [github-weekly-hot]`，可加 `sourceLink` 指向该期 `{n}.html`。主源为 IT咖啡馆官方 Atom（`https://itcoffee66.github.io/githubweekly/feed.xml`，不要订仓库根 `rss.xml`）。周刊只当项目目录；正文只抽仓库名 + GitHub URL，判断来自 README / 许可证 / 最近 push。禁止搬 `_weekly/*.md`、口播、封面。B 站只作片单。日更图卡 `github-trending-11-cards-*` 已下架，勿再写进本合集。

`csdn-tech-tutorials`：从 CSDN 精选提炼的 Vibe 踩坑短篇；frontmatter 写 `collections: [csdn-tech-tutorials]`（随父夹滚进 `agentic-workflow`）。
## Obsidian 写作源（固定）

| 项 | 值 |
|---|---|
| Vault 根 | `D:\OneDrive\Desktop\Notes\threetwoa_ob` |
| 附件目录 | `Assets/picture`（见 vault `.obsidian/app.json` → `attachmentFolderPath`） |
| 映射表 | `Firefly/.ob2blog/manifest.json`（笔记路径 ↔ 博客 slug） |

一般不变更；变更时先改 `CONTEXT.md` 与 manifest 的 `vaultRoot`，再改 skill 文档。

发文流水线（唯一入口 `post-publish`，按输入分流，用户不必点名渠道）：

**extract 落盘 = vault**（本表上栏固定根）。渠道 1 写回该笔记所在目录；渠道 2–3 写入已有主题夹（优先 `Agentic Coding/`）。禁止把「写到 Obsidian」理解成 Knowledge。

| 渠 | 源 | 技能链 |
|---|---|---|
| 1 | Obsidian vault 路径 | post-publish：读笔记 → 沉淀原目录 → 园主微调 → 成帖发布 → cascade 收尾 |
| 2 | 粘贴图文（Grok / 公众号 / 网页 / 会话） | post-publish：清洗 → 沉淀 vault 已有夹 → 园主微调 → 成帖发布 → cascade 收尾 |
| 3 | 无材料、只要调研 | post-publish：并发广搜+配图 → 沉淀 vault 已有夹 → 园主微调 → 成帖发布 → cascade 收尾 |
| 4 | 早报 / GitHub 周榜 | post-publish 交接 `ai-morning-brief` / `github-weekly-hot`（合集，不经 vault）→ 出箱后 cascade 收尾 |

### Knowledge 旧库存（仓外，只读）

| 项 | 值 |
|---|---|
| 根 | `D:\OneDrive\Desktop\Knowledge` |
| 角色 | **只读旧库存**。post-publish 沉淀禁止写入 Knowledge；无主题时仍可分批扫 `todo/` |
| 待发布（旧） | `todo/{Theme}/{facet}/{YYYY-MM-DD}_{短题}/` |
| 已发布（旧） | `Archive/{Theme}/{facet}/…` |
| 小林coding 离线 | `Archive/xiaolincoding/source/`（私有检索；禁批量发帖；站上仅导览合集） |
| 兼容 | 历史扁平 `todo/{日期_主题}/` 仍可读 |
| 来源索引 | `obsidian` / `paste` / `research` / `rss`（见 `post-publish/SKILL.md` §0 分流判定） |
| Theme 词表 | 落盘夹用 vault 已有目录（Theme/facet 管素材检索；词表见 CONTEXT 分类表） |
| 公众号流 | 并入 post-publish 渠道 2 清洗工序（Archive 求全 → Classify 去重 → Extract 求薄 → TTA 去课件腔；落 vault） |

**Theme ≠ 博客 category**：Theme/facet 管素材检索；成帖 `category` 走上文「现行分类词表」，post-publish 自动建议后批次过目。合集挂载直接对照 `src/config/collectionsConfig.ts`（不记文章名单）。不要整库把 Knowledge 搬进 vault。

细则见 `AGENTS.md` 与 `docs/agents/workflow.md`。旧入口 `ob2blog` / `knowledge-extract` / `knowledge-output` / `site-cascade` / `dynamic-post` 已并入 `post-publish` / `dynamic-publish` 一条链。

## 部署事实

- 默认页面仍 **prerender/static**；adapter 三选一：
  - 默认 / Vercel CI → `@astrojs/vercel`（**现行唯一源站构建**）
  - `CF_WORKERS=1` → `@astrojs/cloudflare`（备选，主链路不用）
  - `EDGEONE=1` → `@edgeone/astro`（Pages 托管路径已放弃；`edgeone.json` / `build:edgeone` 仅作历史适配保留）
- **三层入口（2026-08-12）**：
  - **Phase 1 主入口（已通）**：`https://www.threetwoa.live` → EdgeOne CDN（不含大陆）→ 回源 Vercel；HTTPS 已部署
  - **源站**：Vercel Hobby 项目 `fork-firefly`（唯一构建）
  - **EdgeOne**：站点加速 / zones 个人版；**不做 Pages Git 构建**（OOM 路径已放弃）
  - **部署完整 Plan**：`docs/agents/deploy-edge-cf-plan.md`（Phase 1 已通 / Phase CF 主能力已通 / Phase ICP 后续）
  - **当前权益**：EdgeOne **个人版按月续费**（体验价曾 ¥9.9，官价常见 ¥29.9；以控制台为准）含约 50GB/300万次 + 基础安全；主站防护用满 EO，大图走 CF R2 省配额。详见 `docs/agents/architecture-cost-optimized.md` §0
  - **新图纪律**：封面与正文大图优先 `https://img.threetwoa.live`（R2 桶 `firefly-comment`），禁止再把大 jpg 推进 git；存量 pack 另开任务
  - **成本优化架构**：尽量吃 CF 免费档（R2 图床）；主站 EO；现金刚需约 EO 个人版月费 → `docs/agents/architecture-cost-optimized.md`
  - **Phase CF（已通主能力）**：Cloudflare zone `threetwoa.live` Active；`img.` → R2 桶 `firefly-comment`（`https://img.threetwoa.live`）。`threetwoa-blog-assets` 是另一只桶，不要当 img. 图床。主站灰云指 EO。调度仅可选。见 runbook §Phase CF
  - **Phase ICP（后续优化）**：备案后 EdgeOne 含大陆节点 → `docs/agents/edgeone-mainland-icp-plan.md`
  - **备用直链**：`https://fork-firefly.vercel.app`（国内常因 DNS 污染打不开）
  - 旧域 `threetwoa.me` 不续
  - `siteConfig.site_url` 本地已改为 `https://www.threetwoa.live`（待确认后 push）
  - Phase 1：`www` + apex 均已走 EdgeOne（不含大陆）
- Vercel：自定义域 Valid；EdgeOne：`www` / apex 已通（2026-08-12）
- 构建：`pnpm build`（LQIP → Astro → font subset → Pagefind → sync）
- 操作清单：`docs/agents/edgeone-domain-runbook.md`
- 交付验收：同学打开 `https://www.threetwoa.live`；未备案勿宣称大陆节点加速

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
6. 不把 xAI Grok Bot 抽出几何（`geometry-data.js` 等）推进 git / Vercel；本地副本与拷贝步骤见 `public/vendor/grok-bot/README.md`、ADR-0003。线上 Bot 用自研 `firefly-bot/`（ADR-0004/0005，参数化生成 + 黑白圆润风，表达独立）。

## 术语（摘录）

| 术语 | 含义 |
|---|---|
| 视觉体系 | **壳层中性灰** + **彩仅点缀**（紫系邻近：indigo / violet / cool / rose / berry） |
| 默认主题色锚点 | Kraken 主紫（hue 290）作链接主色；粉玫等作模块创意点缀 |
| 标题荧光笔 | 卡片轮换高亮，并穿插 `--hl-rose` |
| Firefly | 上游主题名；本仓为其独立二次开发站（非 fork） |
| 配置驱动 | 功能开关与文案落在 `src/config`，非硬编码散落 |
| 岛屿（island） | Svelte 客户端组件（搜索、设置、分页等） |
| 站内桌宠 | 双 DeepSeek spritesheet（浏览 Maid / 文章 OpenPet；`petConfig` / `SpritePet`）；浏览侧栏失衡时分类折叠 + 宠钉日历（`sidebarBalance`）；与 Spine/Live2D 互斥；**点击触发问答浮窗**（见下） |
| 侧栏 Firefly Bot | `Profile` 圆槽宏切：站点头像 : Bot ≈ 1:4（`profile-firefly-timing.ts`）。Bot 六桶巡演，**开场 rest/idle 黑团白眼、两眼中缝留空**（勿默认 thinking 三点加载，勿让两眼贴死）；歇着时也穿插 bounce/hop/hend（见 timeline.humming/burst）。形状池圆润族（正圆 blob 双权重 / 鹅卵石 / 卵形 / 圆角六边形），纯黑身体 + 白眼（ADR-0005）；引擎自研入库 `public/vendor/firefly-bot/`，xAI replica 仅本机对照（ADR-0003/0004）。**HTML 首屏是站点头像**（进场轻晃 + 招手一次，引擎预热后仍等 macroDue 才切 Bot）；眼神跟全局鼠标，宏切/离开头像槽不清 `pointerRaw`。线上缺文件 / 无 `FireflyCharacter` 则不切 Bot（含悬停）。 |
| 问答助手 | 站点 RAG（StepFun 优先 / MaxKB 兜底）：`/ask` 自写组件（AskChat + Sources + FollowUps + Composer + ask.css）无 HeroUI；同源 `/api/ask`（本站检索 + SSE）；思考链收起态透出「找到 N 篇相关笔记」。**浮窗内嵌同一 AskChat 岛（mode="widget"）**（lite 直发，跳过检索）。桌宠点击唤起浮窗；**桌宠在 /ask 页停靠不游走**（disableOnPathPrefixes: ["/ask"]）。**`siteConfig.pages.ask`** 开启时才挂浮窗。限流：20 次/10 分钟/IP，单次消息 4000 字符 |
| 站点音乐 | 默认 `musicConfig.mode=local`（ADR-0002）；导航栏音符=音频面板，三角播放=横幅背景视频，二者互斥 |
| 动态 | `content/dynamic` 或 Memos 时间线，非「动态 SSR」 |
| LQIP | 低质量图片占位，构建脚本生成 |
| Digital Garden | 作者另一站点：https://threetwoa-digital-garden.vercel.app |
| Banner 氛围层 | `backgroundWallpaper.atmosphere`：banner 模式下正文区 fixed 垫底图；可与横幅 `firefly:banner-slide` 同色同频（`syncWithBanner`）；软过渡靠 mask，不靠近白水波纹 |

## 已知缺口（非阻塞）

- 性能基线（2026-08-16，V7 后）：dist 185MB、内容重复 0、孤儿 chunk 0、每页内联脚本 ~49KB、CLS 0.01；门禁 `scripts/check-v41-gates.mjs` 29 项（含 dist 产物断言，凡改加载策略必跑）。首页 CSS ~510KB 渲染阻塞（生产 brotli 后约 60KB 传输；降到 <300KB 需 Tailwind 层重构，拍板项）。史料链 V2→V7 见 `temp/handoff/perf-optimization-*`
- 主题 demo 帖已 `draft: true`（生产列表隐藏，DEV 仍可开）；Bangumi 页已关，追番 ID 仍可后续改
- 统计 GA / Clarity / Umami / 51la 配置全空，等园主给 ID 再填 `analyticsConfig`（不造假 ID）
- 文章评论现行 `type: "giscus"`，Dynamic 评论页显式覆盖为 Waline（ADR-0006，ADR-0001 已被取代）；勿再按 `none` 或全站 Waline 理解
- 音乐默认 `local`（ADR-0002）；勿再默认假定公共 Meting 在线
- 本地 pnpm 若走 npmmirror，部分包可能 404；安装可用官方 registry
- 主题氛围：页面/卡片/按钮底为中性灰；紫与邻近色只出现在链接、高亮、图标、竖条等点缀位

## 交付闭环（与 workflow 一致）

本地预览 → 本地校验 → push → Vercel Ready → **再核线上**。详见 `docs/agents/workflow.md`。

## 参考

- 配置详解：`docs/official/`（路由：`docs/knowledge/official-docs.tree.json`）
- 上游主题：https://github.com/CuteLeaf/Firefly
- 作者主页：https://github.com/Aafff623
