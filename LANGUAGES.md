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
| 静态部署 | 除非启用 CF_WORKERS，不说「SSR 站」 |

## 部署

| 用 | 说明 |
|---|---|
| Vercel 生产域 | https://fork-firefly.vercel.app |
| origin | https://github.com/Aafff623/fork-Firefly.git |
| upstream | https://github.com/CuteLeaf/Firefly.git |
