# Theme 分类词表（YAML 索引；落盘进 vault）

Theme / facet 仍是笔记头索引（检索、output 对照 category）。  
**落盘根是 vault**，不是 `D:\OneDrive\Desktop\Knowledge`。

沿用 vault 已有夹，不要按本表 Theme ID 新建空目录，除非园主点头。

## 落盘路径

固定根：`D:\OneDrive\Desktop\Notes\threetwoa_ob`

```text
渠道 1：该笔记已有目录（写回/更新，路径为准）
渠道 2–3：{vault根}\{已有主题夹}\  或  {已有主题夹}\{YYYY-MM-DD}_{短题}\
         ├── {短题}.md
         ├── assets/     # 需要附件时
         └── source/     # 公众号等重原料
```

已有主题夹（2026-08-16 实况，沿用勿发明）：

| vault 夹 | 对得上的 Theme ID（YAML，不是新目录名） |
|---|---|
| `Agentic Coding/` | `claude-code` · `cursor` · `opencode` · `codex` · `agent-eng` · `vibe`（**默认优先**） |
| `About Me/` | `career`（面经/实习向） |
| `Explore/` · `Competition/` · `素材处理区域/` | 对得上再用；对不上先问 |
| `Inbox/` | 临时；对不上 Theme 时先问园主，不要默默新建 Theme 夹 |

- `{短题}`：中文简洁达意。需要附件/原文时用篇目录 `YYYY-MM-DD_短题`；轻量笔记可直接 `{短题}.md`。
- **禁止**：把 extract 写到 `Knowledge\todo\{Theme}\{facet}\`；禁止把「写到 Obsidian」理解成 Knowledge。
- **旧库存**：`D:\OneDrive\Desktop\Knowledge\todo` 与 `Archive/` **只读**。output 扫旧稿仍可用；新 extract 不要往那里写，也不要整库搬进 vault。

## 笔记头索引（必写）

每篇主体 md 文首写 YAML（或等价 `<!-- @knowledge: … -->`），供检索与 output 交接：

```yaml
---
source: paste           # obsidian | paste | research | rss（旧 wechat/bibigpt 视为 paste）
theme: claude-code      # Theme 目录 ID（YAML；落盘夹用上表 vault 夹）
facet: skill            # facet 目录 ID
origin_title: ""        # 原文标题（若有）
origin_url: ""          # 原文链接（若有）
origin_author: ""       # 公众号名 / UP（若有）
extracted: 2026-08-16   # 提炼日
dedupe: ""              # 若近几天同题已有笔记：写对照路径或 "none"
---
```

## Theme × facet 词表（现行）

新建 Theme / facet 须先问园主中文名与目录 ID，再写入本表（覆盖式更新）。不要为此在 vault 里新建空夹。

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

1. 扫目标 vault 夹（优先 `Agentic Coding/`）近 7 日同题；旧库存可对照 `Knowledge/todo`（只读）。
2. 同 Theme 下标题/钩子高度重合 → 优先**合并增补**旧笔记，或新笔记 `dedupe` 写明对照路径并只保留差分。
3. 不要为同一热点连开 3 个几乎同构目录。

## 索引怎么用（Agent）

1. extract 开跑：定渠道（`source`）→ 定 `theme` / `facet`（本表 YAML）→ 落入对得上的 **vault 已有夹**。  
2. 交付时文件树必须露出实际 vault 路径。  
3. 词表变更：改本文件 + `docs/agents/workflow.md` 路径示例。不要再把新稿路径写成 Knowledge。
