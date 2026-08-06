---
title: 五家 AI 搜索 API 怎么选：一张表 + 三处反直觉的价格真相
published: 2026-08-07
updated: 2026-08-07T00:09:09
description: 给 Agent 配联网搜索，五家主流搜索 API（Bocha/Brave/Tavily/Exa/阿里云 IQS）按官方资料核实后的对比：能力矩阵、价格真相、分层选型。
tags: [AI Agent, 搜索 API, 选型, Tavily, Exa, Bocha]
category: Agentic Coding

collections: [agentic-coding]
draft: false
lang: ''
slug: ai-search-api-comparison
pinned: false
comment: true
---

给本地 Agent 配联网搜索能力，市面主流就这么五家：Bocha（博查）、Brave、Tavily、Exa、阿里云 IQS。市面上有 AI 整理好的对比表，专精划分和场景优先级大体可用，但价格和档位基本都过时了。这篇把各家官方定价和文档重新核了一遍，结论直接给。

## 五家定位

| 服务 | 一句话定位 | 谁在用 |
|---|---|---|
| Bocha（博查） | 国内 Agent 的免费中文搜索，摘要+垂直模态卡齐全 | 中文 Agent、DeepSeek 系官方联网 |
| Brave Search | 自建独立索引，隐私友好，专给 LLM 出 context | RAG、低延迟 grounding |
| Tavily | 专为 Agent 打造，Search/Extract/Crawl/Map/Research 全家桶 | Agent 工作流、深度研究 |
| Exa | 语义/神经搜索，会「找类似的」，还带 code 垂直搜索 | 概念发现、论文/代码检索 |
| 阿里云 IQS | 中文网页覆盖最广，通义大模型 rerank，有 MCP/SDK/Skill | 国内场景、阿里生态 |

## 能力矩阵（官方核实版）

| 维度 | Bocha | Brave | Tavily | Exa | IQS |
|---|---|---|---|---|---|
| 中文覆盖 | ★★★★★ | 无官方数据 | 无官方数据 | 无官方数据 | ★★★★★ |
| 英文/全球 | ★★（纯国内，数据不出海） | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★ |
| 时效/新闻 | freshness 过滤 | 新闻 ✅ | time_range + topic=news | 一般 | TimeRange ✅ |
| 语义发现 | 一般 | 一般 | 中 | ★★★★★（神经搜索） | 中（rerank） |
| Agent 原生 | AI Search 模态卡 | /llm/context 端点 | 全家桶 + Research | SDK + MCP | MCP + SDK + Skill |
| 深度研究 | 无 | 无 | Research（mini/pro/auto） | deep 三档 + Agent API | Deep 引擎 |
| 代码/学术 | 一般 | 一般 | 一般 | code 垂直（GitHub+SO） | 一般 |

注意：原表给各服务的中文/英文覆盖打了明确星级，但 Brave/Tavily/Exa 官方文档都没有中文覆盖数据，那是观感判断，别当事实。

## 价格真相：对比表里最过时的一环

五家单价其实都在一个区间（约 30–60 元/千次），真正的差别在**免费额度**和**限流**。

| 服务 | 免费额度 | 单价（官方） | 限流 |
|---|---|---|---|
| Bocha | **个人/小团队完全免费** | 目录价 Web 0.036 元/次、AI 0.06 元/次 | **0 充值仅 1QPS / 30QPM / 1000QPD**，很卡 |
| IQS | 开通即赠（额度未公开） | Generic 30 元/千次、LiteAdvanced 12 元/千次、Deep 50 元/千次 | 默认 QPS 30/10/5 |
| Brave | 每档月含 $5 额度（要绑卡） | Search $5/千次、Answers $4/千次 + token 费 | 50 QPS / 2 QPS |
| Tavily | **1000 credit/月** | PayGo $0.008/credit（basic search=1 credit） | 文档有 429/432/433 |
| Exa | **新账户 $20 + 每月 $10**（约 2800 次搜索） | Search $7/千次、deep $12/千次 | 10 QPS |

三个反直觉的点：

1. **Exa 不是「贵」，是最会送额度的。** 原表写它「性价比中偏低」，官方一查是全场唯一大放送：$20 开号 + 每月 $10，深度搜索按次 $0.012，属于市场低价位。
2. **Bocha「极致性价比」的前提是你能忍限流。** 免费是真的，但 0 充值只有 1QPS，商用得充值解锁，充得越多 QPS 越高。
3. **单价基本拉不开差距**，30–60 元/千次谁也没便宜到哪去；选型真正要看的是免费额度、限流、还有你要不要深度/语义这种「贵档」。

## 档位和命名，三处容易记错

- **IQS 的引擎不是「Lite/Generic/Deep」三档**，官方是 Generic / GenericAdvanced / LiteAdvanced / Deep（另外还有多模态搜图）。LiteAdvanced 最便宜。
- **Tavily Research 没有「advanced/deep」叫法**，现在是 model=mini/pro/auto，价格浮动（pro 15–250 credit/次）。
- **Exa 的 similar 端点已弃用**，「找类似内容」直接走 Search 的 neural/auto 模式。

## 给本地 Agent 的分层方案

别把五家当平级，按「主力 + 专项 + 兜底」三层组织：

- **默认主力**：中文为主 → Bocha（免费 + 摘要好）；英文/全球 → Tavily 或 Brave
- **专项增强**：语义/找相似/代码/论文 → Exa；深度多步报告 → Tavily Research 或 Exa deep
- **兜底交叉验证**：主工具结果不够，自动 fallback 另一家

路由规则：先按语言（中文走 Bocha/IQS），再按意图（时效 → Tavily/Bocha；语义 → Exa；深度 → Research/deep），结果不够再 fallback。日常默认走免费档，明确要深度/语义才调贵档。

## 我的判断

AI 整理的对比表方向是对的，专精划分和场景优先级基本可用，但**价格和档位是硬伤**——三家定价体系都改过版、Exa 的性价比判断完全反了。做选型别信二手对比，直接对官方定价页。另外中文覆盖这种维度，除了 Bocha/IQS 这种纯国内服务，其他家官方都没数据，评分只能当参考。

如果只配两个：**中文 Bocha + 英文 Tavily**，够覆盖八成场景；要语义检索再加 Exa。
