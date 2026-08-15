# Theme 分类词表（Knowledge 索引）

Knowledge（尤其 `todo/`）按 **Theme → facet → 单篇** 三级组织。  
**Theme** = 长期知识桶（产品 / 领域）；**facet** = 桶内切面（架构 / Skill / MCP…）。  
与博客 frontmatter `category`（`CONTEXT.md` 现行分类词表）**不是同一套**：Theme 管素材库检索；成帖时再映射到站点 category。

## 落盘路径（新规范）

```text
D:\OneDrive\Desktop\Knowledge\todo\{Theme}/{facet}/{YYYY-MM-DD}_{短题}/
├── {短题}.md                 # 主体。园主调完为准；通稿才去壳
├── assets/                   # 笔记引用图（封面/示意图；相对路径）
└── source/                   # 可选；公众号等重原料必留
    ├── article.md            # 原文或接近无损的 MD
    ├── meta.json             # url / 标题 / 作者 / 抓取日（无密钥）
    └── images/               # 原配图完整落盘
```

- `{Theme}` / `{facet}`：用本表 **目录 ID**（kebab-case ASCII），勿用空格。
- `{短题}`：中文简洁达意；目录名 `YYYY-MM-DD_短题`。
- **兼容**：历史扁平 `todo/{YYYY-MM-DD}_{主题}/` 仍可读；**新 extract 禁止再写扁平根**（除非用户明确要求临时路径）。
- **Archive**：发布后整棵 `{YYYY-MM-DD}_{短题}/` 迁到 `Archive/{Theme}/{facet}/…`（保留 Theme 层级）；旧扁平归档可仍落 `Archive/` 根。

## 笔记头索引（必写）

每篇主体 md 文首写 YAML（或等价 `<!-- @knowledge: … -->`），供检索与 output 交接：

```yaml
---
source: paste           # obsidian | paste | research | rss（旧 wechat/bibigpt 视为 paste）
theme: claude-code      # Theme 目录 ID
facet: skill            # facet 目录 ID
origin_title: ""        # 原文标题（若有）
origin_url: ""          # 原文链接（若有）
origin_author: ""       # 公众号名 / UP（若有）
extracted: 2026-08-11   # 提炼日
dedupe: ""              # 若近几天同题已有笔记：写对照路径或 "none"
---
```

## Theme × facet 词表（现行）

新建 Theme / facet 须先问园主中文名与目录 ID，再写入本表（覆盖式更新）。

| Theme ID | 中文名 | 常用 facet（目录 ID = 中文可，优先英文 kebab） | 适用启发式 |
|---|---|---|---|
| `claude-code` | Claude Code | `architecture` 架构 · `agent` Agent · `skill` Skill · `mcp` MCP · `config` 配置美化 · `automation` 自动化 | CC 本体、CLI、规则、插件生态 |
| `cursor` | Cursor | `migration` 规范迁移 · `skill` · `mcp` · `workflow` 工作流 · `ui` | Cursor / 对齐 Claude 规范 |
| `opencode` | OpenCode | `memory` 记忆 · `tools` 工具生态 · `align` 对齐 | OpenCode 宿主与共享记忆 |
| `codex` | Codex | `usage` 高效用法 · `skill` · `ppt` PPT 路线 | Codex / 官方用法 |
| `agent-eng` | Agent 工程 | `architecture` · `concepts` 概念 · `delivery` 落地 · `harness` | 跨产品的 Agent 架构与落地 |
| `vibe` | Vibe Coding | `tools` 选型 · `mcp` · `practice` 经验 | Vibe 工具链与流程 |
| `ppt-visual` | PPT / 视觉 | `handwrite` 手写风 · `research` 科研绘图 · `workflow` 流水线 · `taste` 审美 | PPT、信息图、材质、海报 |
| `frontend` | 前端 | `libs` 工具库 · `design` 设计资产 · `motion` 动效 | 前端工程与设计资源 |
| `linux-ops` | Linux / 运维 | `commands` 命令 · `disk` 磁盘 · `boot` 启动 · `automation` | Linux 与运维自动化 |
| `network` | 网络 | `protocol` 协议 · `security` 安全 · `switch` 交换 | 网络基础与安全 |
| `ai-media` | AI 媒资 | `image` 生图 · `video` 视频流水线 · `prompt` 提示词 | 图片/视频生成与工作流 |
| `biz-ai` | 企业 AI | `org` 阵型 · `layers` 七层结构 · `ops` 脏活落地 | 企业落地与组织 |
| `wool` | 羊毛 / 限免 | `trial` 试用 · `plan` 套餐 | 限免、试用、套餐情报 |
| `firefly-site` | 本站 / Firefly | `perf` 性能 · `content` 内容流 · `theme` 主题 | fork-Firefly 自身 |
| `career` | 求职 / 面经 | `interview` 面经复盘 | 校招/社招面经、准备路径、多厂节奏与打法 |
| `misc` | 未归桶 | `inbox` | **临时**；一周内应迁入实 Theme，禁止长期堆放 |

### facet 命名约定

- 优先表内英文 ID；中文仅作人类对照。
- 同一 Theme 下 facet **宜少不宜碎**（单 Theme 常见 4–8 个）；新切面先复用再新增。
- 公众号长文常跨 facet：选**主切面**落盘，次要点在笔记内用小节标出，勿拆成空壳多目录。

## 与站点 category 的映射（成帖时）

| Theme（素材） | 常映射的博客 category（output 自动建议，批次过目） |
|---|---|
| `claude-code` / `cursor` / `opencode` / `codex` / `agent-eng` / `vibe` | Agentic Coding 或 指南（看是否「上手文」） |
| `wool` | 羊毛揭秘 |
| `frontend` / `firefly-site` | 前端开发 或 功能 |
| `ppt-visual` / `ai-media` | 指南 / 写作 / 功能（按篇确认） |
| `linux-ops` / `network` | 指南 |
| `career` | 指南（求职/面经向；按篇确认） |

禁止：「沾 AI 就填 Agentic Coding」。

## 近几天话题去重（公众号尤甚）

公众号优质但**重**、且**数日内易撞题**。落盘前：

1. 扫 `todo/{Theme}/` 与近 7 日 `Archive/{Theme}/`（及历史扁平目录名）。
2. 同 Theme 下标题/钩子高度重合 → 优先**合并增补**旧笔记，或新笔记 `dedupe` 写明对照路径并只保留差分。
3. 不要为同一热点连开 3 个几乎同构目录。

## 索引怎么用（Agent）

1. extract 开跑：定渠道（`source`）→ 定 `theme` / `facet`（本表）→ 再落盘。  
2. 交付时文件树必须露出 `Theme/facet/日期_短题` 三层。  
3. 词表变更：改本文件 + 同步 `Knowledge/README.md` 结构说明 + `docs/agents/workflow.md` 乙路路径示例。
