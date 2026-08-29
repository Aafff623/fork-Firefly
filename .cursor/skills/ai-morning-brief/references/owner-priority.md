# 园主早报筛选词表（可改）

依据：`CONTEXT.md` 分类/合集、`siteConfig`（Agent Engineering · Spec-driven / Harness）、近期 posts 的 category/tags（Agentic Coding、羊毛揭秘、Cursor / Claude / Kimi / GLM / DeepSeek / 通义 / 豆包、Coding Plan、Harness、MCP / Skill、OpenCode、Pi、Codex、中转）。

以后焦点变了，改本表，不必改 SKILL 主文流程。

## 怎么用

1. 先对橘鸦当日**概览标题**打 P0 / P1 / P2 / 丢弃。
2. 只采用 P0；P0 少于 3 条再从 P1 补到不超过 7 条。
3. P2 默认一笔带过或不写。宁缺毋滥。
4. 标题命中下表关键词即可入围；不要因为「也是 AI 新闻」就收。

## P0（必看，优先写）

写代码的人这周会不会改工具、改模型、改账单。

| 焦点 | 标题/出处里出现这些就抬 | 站内锚点（判断时链，勿当转载源） |
|---|---|---|
| 编程 Agent / Harness | Claude Code、Claude Cowork、Cursor、Codex、OpenCode、Kimi Code、Pi、ZCode、Kiro、WorkBuddy、Harness、subagent、Agent 导入/迁移 | `ai-coding-tools` 各手册、`cursor-claude-harness-migration` |
| 园主常用模型更新 | DeepSeek、Qwen / 通义 / 千问、Kimi / Moonshot、GLM / 智谱、豆包 / Seed / 方舟、Grok（进 Cursor 池时） | `aug-coding-model-discounts-2026-08` |
| 官方定价与限免 | Coding Plan、Token Plan、API 涨价/降价、额度重置、限免、首发折扣、包月积分 | `wool-freebies`、`ai-coding-save-money` |
| 工具链能力 | MCP、Skill / SKILL.md、Hooks、Rules、CLAUDE.md、合规 API 接到 CLI | `mcp-handbook`、`agent-skills-handbook`、`review-skill-mcp` |
| 中转 / 号池 | 中转、号池、403、额度线路（仅当影响 Codex/Claude 实际能打） | `transit-relay`、`codex-k12-pool-403` |

**P0 判断句要回答**：这事改不改我明天的模型和账单？别复述橘鸦摘要。

## P1（有空再写，每期最多 2 条）

| 焦点 | 抬的条件 | 不抬的情况 |
|---|---|---|
| 开源权重 | 可本地/魔搭/HF 下载，且跟写代码或 Agent 执行层有关（如 Nemotron 上 OpenCode） | 纯图像/视频/语音权重，跟编码工具链无关 |
| 评测榜 | 点名园主在用的模型，且能对账到官方或 Artificial Analysis 一类可点开的表 | 「又一个综合第一」无出处 |
| Harness / 路由库 | 开源 Agent 框架、模型路由，能接到 Cursor / Claude Code / OpenCode | pre-alpha 且与现用栈无关 |
| 本仓已有手册的产品小更新 | 如 WorkBuddy 多端、OpenCode 免费模型 | 纯营销「突破 N 万用户」无额度/功能 |

## P2（默认不写）

行业融资、估值、人事任免、部门重组、具身/机器人、医疗咨询、世界模型/视频生成、C 端 MAU 数字、未证实的「消息称」、纯八卦。

例外：同一条里夹了 P0（例如「融资」标题但正文是 API 涨价）→ 只写 P0 那截，不写融资故事。

## 丢弃（直接划掉）

- 橘鸦视频口播 / 逐字稿 / 截图长文
- 只有 B 站链、没有可核对的原始出处（官网、论文、官方博文）
- 与写代码、Agent、定价都无关的应用新闻（聊天 App 皮肤、广告排序论文等）
- 重复：站内**已发早报**或比价帖已经写过的同一事实，除非有新变量（价格改了、窗口关了）

## 每期结构建议

1. 文首：选题来自橘鸦哪一天、不搬全文、视频只当片单。
2. 一句说明筛了几条、剩下的为什么不写（P2 点名即可，不要展开）。
3. 每条一个 `##`：像人起的路牌，不要「要点 1」。
4. 条内顺序：短判断句 → 发生了什么（时间 / 产品 / 谁说的，转述原站）→ 对写代码或账单的影响 → 原题原链 +「来自橘鸦早报」→ **至少一张相关图**（R2 URL，图下斜体注明来源 / 版权）。需要时链站内比价 / 手册。
5. 每条 150–400 字；P0 写够。禁止整篇转载橘鸦。不要「总结」「收束」节。写完最后一条就停。

## 改表时

焦点变了（新常用模型、新订阅、不再盯某家）→ 改本文件的关键词行，并在 git 说明里写「为何升/降」。不要在 SKILL.md 里另写一套优先级。
