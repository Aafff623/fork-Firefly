# LANGUAGES.md

> Agent 输出必须使用的共享用词。与 `CONTEXT.md` 冲突时以 CONTEXT 为准，并开 ADR 或更新本文。

## 项目称呼

| 场景 | 用词 |
|---|---|
| 站点标题 | threetwoa's blog |
| 副标题 / 标语 | code less, architect more |
| 作者显示名 | Aafff623 |
| 品牌昵称 | threetwoa |
| 主题上游 | Firefly（勿称本仓为「官方 Firefly」） |
| 本仓 | fork-Firefly / threetwoa 的 Firefly 二次开发 |
| 仓名说明 | 仓库名 `fork-Firefly` 是历史前缀；**已脱离 fork 网络，是 standalone**（≠ 仍在上游 fork 树上） |

## Issue / 任务流

| 词 | 含义 |
|---|---|
| needs-triage | 待维护者评估 |
| needs-info | 缺信息，等汇报人 |
| ready-for-agent | 可 AFK 给 Agent |
| ready-for-human | 需人类实现 |
| wontfix | 不做 |
| theme | 一个业务主题目录名（kebab-case） |
| handoff | `temp/handoff/` 交接快照（覆盖式） |
| PRD | `docs/outputs/prd/{theme}/prd.md` |

## 领域用词（博客）

| 用 | 避免 |
|---|---|
| 文章 / post | 随便叫「页面」指博文 |
| 动态 | 「朋友圈」除非用户这么说 |
| 侧边栏小组件 / widget | 无差别「插件」 |
| 侧栏 Grok Bot | xAI 风格吉祥物编舞（`Profile` 圆槽）；不要写成「GitHub 卡片」。线上无几何时圆槽是站点头像，不是空圆 |
| Ask 输入条 / `.ask-grok-row` | HeroUI 问答坞布局 class，**不是**侧栏 Grok Bot |
| 配置文件 `*Config.ts` | 「后台设置」（本站无 CMS 后台） |
| 合集 / collections | 人工策展的主题聚合页（区别于 AI 标的分类 category） |
| 草稿箱 / draftbox | `posts/_draftbox/`：本地可预览、gitignore 不 push；出箱后再入库 |
| 草稿（园主口径） | 进草稿箱，不是「commit 后靠 draft:true 藏首页」 |
| Knowledge Theme | YAML 一级桶（如 `claude-code`）；落盘用 vault 已有夹，不是 `Knowledge/todo` |
| facet | Theme 下切面（如 `skill` / `mcp` / `architecture`）；≠ 博客 tags |
| source（extract） | 素材来源：`obsidian` / `paste` / `research` / `rss`（旧 wechat/bibigpt 视为 paste） |
| 四渠 | 写稿进料分流：vault / 粘贴 / 调研 / RSS；用户不必点名渠道 |
| 发布岗 | `post-publish`：自检 + 合集一二级路由后成帖，不是拷文件 |
| 合集心智模型 | output 缓存的 L1/L2：干什么、什么样的文章该进；不记文章名单 |
| 公众号归档 `source/` | 单篇目录内原文+原图保真层；主体笔记另文件且须过 TTA |
| 正文插图限高 | 仅竖幅/海报收版面；横/方信息图跟栏宽；单击 Fancybox 看原图 |
| 静态部署 | 除非启用 CF_WORKERS，不说「SSR 站」 |

## 部署

| 用 | 说明 |
|---|---|
| 主入口（EdgeOne） | https://www.threetwoa.live |
| Vercel 备用域 | https://fork-firefly.vercel.app |
| origin | https://github.com/Aafff623/fork-Firefly.git |
| upstream | https://github.com/CuteLeaf/Firefly.git |
