---
title: 五家 AI 搜索 API 怎么选：能力矩阵 + 真机实测 + 三处反直觉的价格真相
published: 2026-08-07
updated: 2026-08-08T10:35:00
description: 给 Agent 配联网搜索，Bocha/Brave/Tavily/Exa/阿里云 IQS 五家官方资料核实 + 2026-08-08 真机实测（统一查询对比质量/时效/结构），能力矩阵、价格真相、分层选型一次讲透。
image: ./cover.jpg
tags: [AI Agent, 搜索 API, 选型, Tavily, Exa, Bocha, 实测]
category: Agentic Coding

collections: [review-skill-mcp]
draft: false
lang: ''
slug: ai-search-api-comparison
pinned: false
comment: true
---

给本地 Agent 配联网搜索，绕不开这五家：**Bocha（博查）、Brave、Tavily、Exa、阿里云 IQS**。市面上的对比表方向没错，但价格和档位普遍过时，照着抄容易踩坑。这篇按官方资料重新核实了一遍，又拿真实 key 对能接的四家跑了同一查询的实测，结论放最前面。

![五家搜索工具 logo（Bocha / Brave / Tavily / Exa / 阿里云IQS）](images/logos-strip.png)

## 五家定位

| 服务 | 一句话定位 | 谁在用 |
|---|---|---|
| **Bocha（博查）** | 国内 Agent 的免费中文搜索，摘要+垂直模态卡齐全 | 中文 Agent、DeepSeek 系官方联网 |
| **Brave Search** | 自建独立索引，隐私友好，专给 LLM 出 context | RAG、低延迟 grounding |
| **Tavily** | 专为 Agent 打造，Search/Extract/Crawl/Map/Research 全家桶 | Agent 工作流、深度研究 |
| **Exa** | 语义/神经搜索，会「找类似的」，还带 code 垂直搜索 | 概念发现、论文/代码检索 |
| **阿里云 IQS** | 中文网页覆盖最广，通义大模型 rerank，有 MCP/SDK/Skill | 国内场景、阿里生态 |

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

插一句：Brave/Tavily/Exa 官方文档都没有中文覆盖数据，星级是我实际用的体感，别当成官方指标。

## 真机实测（2026-08-08，统一查询对比）

拿真实 key 分别调了四家（Brave 没配 key 没测），同一个查询横评质量、时效、返回结构：

### 场景一：中文时效搜索「北京今天天气」

| 服务 | 实测结果 | 返回结构 | 耗时 |
|---|---|---|---|
| **Bocha** | ✅ 当天真实新闻（腾讯网/网易，2026-08-08 发布，含「午后雷阵雨/最高31°C」细节） | JSON（name/url/snippet/siteName/发布日期） | ~2.2s |
| **IQS** | ✅ 墨迹天气实时数据（07：24 更新，温度/湿度/风向齐全） | markdown 结构化（标题/URL/站点/发布时间/摘要） | ~2.7s |
| **Tavily** | ⚠️ 通用预报站（30 天预报/7 天预报等聚合页，非当日新闻） | JSON（title/content/url） | ~3.8s |
| **Exa** | ⚠️ 返回 CMA 气象局官方页 + 中央气象台（语义命中官方源，但内容被 WAF 人机识别截断） | 纯文本（Title/URL/Highlights） | ~4.6s |

**这轮谁赢**：中文时效 Bocha 最像"今天的新闻"，IQS 差一点但结构最规整；Tavily 到中文就剩聚合页；Exa 能命中官方源，可内容老被 WAF 拦，中看不中用。

### 场景二：英文搜索「best AI code assistant 2026」

| 服务 | 实测结果 |
|---|---|
| **Bocha** | ✅ 返回中文生态的英文主题评测（新浪/Csdn 的 2026 AI 编程助手横评），立场偏国内视角 |
| **Tavily** | ✅ 高质量英文榜单（Top 10 AI Coding Assistants / Best AI Coding Agents 2026），视角最「原生态」 |
| **IQS** | ❌ 几乎无有效结果（中文引擎处理英文 query 明显吃力） |

**这轮谁赢**：英文还是 Tavily 的地盘，Bocha 能搜出东西但全是中文生态视角；IQS 干脆别用它搜英文。

### 几个只有实测才看得出的坑

1. **Exa 的 HTTP API 要 key（裸连直接 402），但 MCP 托管端点裸连就能用。** 想试 Exa 直接走 MCP，别先充值。
2. **三家返回结构不是一个物种**：IQS 给 markdown（标题/URL/站点/时间/摘要五件套），Bocha 是干净 JSON，Exa 是纯文本。这个直接决定下游解析成本。
3. **中文时效排序是 Bocha > IQS > Tavily > Exa**，和二手表里"Tavily 中文也强"的印象完全反着来。

## 价格真相：对比表里最过时的一环

五家单价其实都在一个区间（约 30–60 元/千次），真正拉开差距的是**免费额度**和**限流**。

| 服务 | 免费额度 | 单价（官方） | 限流 |
|---|---|---|---|
| Bocha | **个人/小团队完全免费**（新号领 1000 次试用包 0 元 + 体验包 1000 次 3.6 元，均 3 个月） | 目录价 Web 0.036 元/次、AI 0.06 元/次 | **0 充值仅 1QPS / 30QPM / 1000QPD**，很卡 |
| IQS | 开通即赠（试用 1000 次/15 天） | Generic 30 元/千次、LiteAdvanced 12 元/千次、Deep 50 元/千次 | 默认 QPS 30/10/5 |
| Brave | 每档月含 $5 额度（要绑卡） | Search $5/千次、Answers $4/千次 + token 费 | 50 QPS / 2 QPS |
| Tavily | **1000 credit/月** | PayGo $0.008/credit（basic search=1 credit） | 文档有 429/432/433 |
| Exa | **新账户 $20 + 每月 $10**（约 2800 次搜索） | Search $7/千次、deep $12/千次 | 10 QPS |

三个反直觉的地方：

1. **Bocha 才是全场最会「送」的。** 新号白拿 1000 次试用（0 元），再花 3.6 元买 1000 次体验包，2000 次总共 3 块 6，折合 ¥0.0018/次，比谁都便宜。
2. **Exa 不是「贵」，是最会送额度的。** $20 开号 + 每月 $10，深度搜索按次 $0.012，放市场里属于低价位。
3. **单价基本拉不开差距。** 30–60 元/千次谁也没便宜到哪去，真正要看的是免费额度、限流，还有你要不要深度/语义这种「贵档」。

## 档位和命名，三处最容易记错

- **IQS 的引擎不是「Lite/Generic/Deep」三档**，官方是 Generic / GenericAdvanced / LiteAdvanced / Deep（另外还有多模态搜图）。LiteAdvanced 最便宜。
- **Tavily Research 没有「advanced/deep」叫法**，现在是 model=mini/pro/auto，价格浮动（pro 15–250 credit/次）。
- **Exa 的 similar 端点已弃用**，「找类似内容」直接走 Search 的 neural/auto 模式。

## 给本地 Agent 的分层方案

别把五家摆在同一排，按「主力 + 专项 + 兜底」三层组织：

- **默认主力**：中文为主 → Bocha（免费 + 时效最好）；英文/全球 → Tavily（英文质量实测最优）
- **专项增强**：语义/找相似/代码/论文 → Exa；深度多步报告 → Tavily Research 或 Exa deep
- **中文备选**：IQS（markdown 结构最规范，适合要干净结构化输出的场景）
- **兜底交叉验证**：主工具结果不够，自动 fallback 另一家

路由规则：先按语言（中文走 Bocha/IQS，英文走 Tavily），再按意图（时效 → Bocha/Tavily；语义 → Exa；深度 → Research/deep），结果不够再 fallback。日常默认走免费档，明确要深度/语义才调贵档。

## 我的判断

二手对比表方向是对的，但**价格和档位是硬伤**：三家定价体系都改过版，Bocha 的性价比和「中文时效」优势被严重低估。做选型别信二手对比，直接对官方定价页，有条件就跑一遍真机实测，5 分钟能顶二手表 5 个版本。

只配两个的话：**中文 Bocha + 英文 Tavily**，够覆盖八成场景；要语义检索再加 Exa，要干净结构化输出再加 IQS。
