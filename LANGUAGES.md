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
| handoff | `docs/outputs/handoff/{theme}/` 交接快照（覆盖式） |
| PRD | `docs/outputs/prd/{theme}/prd.md` |

## 领域用词（博客）

| 用 | 避免 |
|---|---|
| 文章 / post | 随便叫「页面」指博文 |
| 动态 | 「朋友圈」除非用户这么说 |
| 侧边栏小组件 / widget | 无差别「插件」 |
| 配置文件 `*Config.ts` | 「后台设置」（本站无 CMS 后台） |
| 合集 / collections | 人工策展的主题聚合页（区别于 AI 标的分类 category） |
| 草稿箱 / draftbox | `posts/_draftbox/`：本地可预览、gitignore 不 push；出箱后再入库 |
| 草稿（园主口径） | 进草稿箱，不是「commit 后靠 draft:true 藏首页」 |
| Knowledge Theme | 素材库一级桶（如 `claude-code`）；路径 `todo/{Theme}/{facet}/…` |
| facet | Theme 下切面（如 `skill` / `mcp` / `architecture`）；≠ 博客 tags |
| source（extract） | 素材来源模块 ID：`session` / `paste-md` / `bibigpt` / `wechat` / `mixed` |
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
