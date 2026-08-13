# 园主热榜筛选词表（可改）

依据：`CONTEXT.md` 分类/合集、`siteConfig`（Agent Engineering · Spec-driven / Harness）、近期 posts 的 category/tags（Cursor / Claude / Kimi / GLM / DeepSeek / 通义、Harness、MCP / Skill、OpenCode、Pi、Codex、MiniMax、本地模型）。

以后焦点变了，改本表，不必改 SKILL 主文流程。

## 怎么用

1. 先对周刊目录里的**仓库名 / 一句话定位**打 P0 / P1 / P2 / 丢弃。
2. 只采用 P0；P0 少于 3 个再从 P1 补到不超过 7 个。
3. P2 默认一笔带过或不写。宁缺毋滥。
4. 标题命中下表关键词即可入围；不要因为「也在 GitHub 热门」就收。

## P0（必看，优先写）

写代码的人这周会不会换工具、换模型入口、换技能包。

| 焦点 | 仓库/简介里出现这些就抬 | 站内锚点（判断时链，勿当转载源） |
|---|---|---|
| 编程 Agent / Harness | Claude Code、Cowork、Cursor、Codex、OpenCode、Kimi Code、Pi、Reasonix、DeepSeek 编程 agent、Harness | `ai-coding-tools` 各手册 |
| 园主常用模型与本地推理 | DeepSeek、Qwen / 千问、Kimi / K3、GLM、豆包、MiniMax、AirLLM、llama.cpp、vLLM | `aug-coding-model-discounts-2026-08` |
| 技能与记忆 | SKILL.md、Agent Skills、book-to-skill、路由表、Agent Memory、MCP | `agent-skills-handbook`、`mcp-handbook` |
| 定价与自托管入口 | Coding Plan、免费网关、自托管部署、OpenAI 兼容代理（影响明天能不能打） | `wool-freebies`、`transit-relay` |

**P0 判断句要回答**：这仓改不改我下周的工具链？别复述周刊口播。

## P1（有空再写，每期最多 2 个）

| 焦点 | 抬的条件 | 不抬的情况 |
|---|---|---|
| 开源权重 / 推理框架 | 能接到现用 CLI，或消费级显存就能验证 | 纯图像/视频/语音玩具，跟编码工具链无关 |
| 设计 / 前端 Skill | 能进 Claude Code / Cursor 减 AI 味或提结构 | 又一份配色提示词，无安装路径 |
| 团队工作区 / 票务 | 官方 MCP，能给 agent 管任务 | 大而全 Jira 克隆、无 MCP |
| 常青学习仓 | 许可开放、能当 book-to-skill 输入，且本周确有增量 | 只是星标收藏、最近半年没 push |

## P2（默认不写）

世界模型/视频生成（ComfyUI 这类存量巨兽除非用户点名）、IPTV、健身数据集、纯 C 端 App、融资故事、又一个「综合第一」评测、资料分享 PDF（one more thing）。

例外：同一条里夹了 P0（例如「视频模型」标题但仓库是可复用的 Agent 工作流引擎）→ 只写 P0 那截。

## 丢弃（直接划掉）

- 周刊正文段落、金句、封面、B 站口播 / 逐字稿
- 没有可打开的 GitHub URL
- 未授权安全研究场景写成攻击教程
- 站内**已发热榜**写过的同一仓库，除非有新变量（许可证变了、权重落地了、产品改定位了）

## 每期结构建议

1. 文首：目录来自 IT咖啡馆周刊第 N 期、不搬全文、判断来自 GitHub；视频只当片单。
2. 一句说明筛了几个、剩下的为什么不写（P2 点名即可，不要展开）。
3. 每个仓一个 `## owner/repo`：像人起的路牌。可用站点已有的 `::github{repo="owner/repo"}` 卡片，不要另做图卡流水线。
4. 条内顺序：仓库链 → 一两句判断 → 需要时链站内手册。
5. 文末「本期参考」后停。不要「总结」节。

## 改表时

焦点变了（新常用模型、新 agent）→ 改本文件的关键词行，并在 git 说明里写「为何升/降」。不要在 SKILL.md 里另写一套优先级。
