---
title: 网页端反代白嫖 Agent？先别急着鼓掌
published: 2026-08-08
updated: 2026-08-08T23:05:00
description: 群友想模拟 DeepSeek / 智谱网页请求接本地 MCP 白嫖 Agent。能发请求不假，当生产底座才荒唐。对照公开仓库和官方定价拆一拆。
image: ./cover.jpg
tags: [网页反代, DeepSeek, 智谱, MCP, Agent, 白嫖, Claude]
category: 羊毛揭秘
draft: false
lang: ''
slug: web-reverse-freeload-agent-absurd
pinned: false
comment: true
---

群里有人抛了个「妙计」：DeepSeek、智谱网页版免费，模拟网页请求，本地接 MCP，不就能白嫖出一套自动编程 Agent？还想着项目级长记忆能不能硬塞进网页会话。有人回了一句：「网页端反代？」

![群友原话截图](./images/fig-chat-idea.jpg)

Grok 搜完一堆源，结论其实分两层。我对照公开仓库和官方文档又核了一遍：**「能不能发请求」不荒谬；「能不能当成靠谱 Agent 底座」很荒谬。**

## 先给 Grok 打分

Grok 那篇长文骨架对，但有几处要拧紧：

| 说法 | 核验 |
|---|---|
| GitHub 上有一堆网页→OpenAI 兼容反代 | **属实**。DeepSeek 方向有 WebAI2API、deepseek-reverse-api、各类 deepseek-free-api / web2api；智谱侧有 GLM-Free-API 一类 |
| 网页不原生 function calling，靠提示词硬掰 | **属实**。多份 README 写明：网页端无 OpenAI tools，用 DSML / prompt 注入 + 流式筛分「假装」工具调用 |
| 免费账号并发极低 | **属实方向**。逆向项目自述常见「约 2 并发 / 账号」；官方 API 文档写的是 Flash **2500**、Pro **500** 并发上限 |
| PoW / token 过期 / 前端一改就炸 | **属实**。项目自己列：PoW 每请求先算、token 约日级、401 要重登；作者也写「逆向不稳定，有条件用官方」 |
| 官方 API 贵到必须白嫖 | **不属实 / 过时直觉**。DeepSeek 官方价（2026 公开页）：Flash cache miss 约 \$0.14/M in、\$0.28/M out，还带 Tool Calls 与 1M 上下文。白嫖网页换来的是维护税，不是省大钱 |
| 套到 Claude / Codex 网页更离谱 | **属实且更狠**。Anthropic 2026 已多次收紧订阅号被第三方 harness / 自动化滥用；网页反代 = 对 Cloudflare + ToS 双向硬刚 |

Grok 把「技术可行」和「工程可行」拆开了，这点值钱；经济账和官方并发数字要以文档为准。

## 群友方案到底在幻想什么

拆开听：

1. 网页模型「一般更好」→ 想白嫖同档能力  
2. 模拟网页请求 → 本地 MCP 驱动工具  
3. 靠网页会话撑「整个项目」长记忆  
4. 有空再反带到 Claude / Codex

第 1 点半真半假：网页档位和市场话术常常好看，但不等于你能稳定、合规、可编排地用上。第 2～4 点才是真正荒唐的地方。

![有人已经听出味了：网页端反代？](./images/fig-chat-reply.jpg)

## 「能做」不等于「能当 Agent 底座」

社区轮子证明：发 completion、流式、甚至「像 tools」的输出，都能抠出来。WebAI2API 还写过可接 Codex / Copilot。

可 Agent 编程要的是另一套指标：

- 几十上百轮 tool loop 不轻易 429 / busy  
- 结构化 tool call 可解析、可重试、可嵌套  
- 上下文由你自己的 orchestrator 管，不靠网页 session 碰运气  
- 接口是契约，不是今晚还能不能用的玄学

网页反代在这些点上处处软：

| 坑 | 公开材料里的样子 |
|---|---|
| 维护 | 非公开契约；PoW、SSE、鉴权随时改；作者自己说不稳定 |
| 吞吐 | 免费页常见极低并发；Agent 一轮任务就能打满 |
| 工具 | 多为 prompt 伪 tools，不是官方 Tool Calls 契约 |
| 记忆 | 网页 session 为人聊天设计；硬塞仓库上下文会截断、对不齐、幻觉 |
| 风控 | 智谱协议禁滥用；Claude 订阅自动化已被反复清理 |

GLM-Free-API 英文说明甚至直接写：逆向不稳定，建议去官方开放平台。连做羊毛轮子的人都劝你别当生产底座。

## 经济账：官方已经够便宜

DeepSeek 官方 [Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing)（核验时点）：

- `deepseek-v4-flash`：Tool Calls ✓，上下文 1M，并发上限 **2500**  
- `deepseek-v4-pro`：Tool Calls ✓，并发上限 **500**  
- Flash 输出约 **\$0.28 / 1M tokens**（cache miss 输入约 \$0.14）

你要用 Agent，官方路径是：API Key + 本地 MCP + 自己的上下文压缩 / RAG / 子代理。钱花在模型上，不花在修 PoW、换 cookie、养号池上。

网页反代省下的那点「免费」，往往被调试时间、封号风险、伪 tools 失效率吃干净。这不是聪明，是把现金流换成焦虑。

## 反带到 Claude / Codex：荒谬度再抬一档

DeepSeek / 智谱网页已经是猫鼠游戏。Claude.ai / Codex 侧：

- 消费条款长期限制未经授权的自动化访问  
- 2026 年对第三方 harness 蹭订阅额度多次动手（文档澄清、技术封堵、OpenCode 等被迫砍订阅登录）  
- 网页还有 Cloudflare 一类挑战；维护成本和封号代价都更高

想用「网页端反代」复制 Claude Code / Codex 体验，不是省钱捷径，是主动站到平台风控靶心上。

## 这想法哪一层还算人话

| 目标 | 网页反代 | 正经做法 |
|---|---|---|
| 研究逆向 / 轻度自用聊天 | 社区已有轮子，自担风险 | — |
| 稳定自动编程 Agent + MCP | **荒唐** | 官方 API / 付费 Coding Plan |
| 项目级长记忆 | **荒唐** | 本地记忆层 + RAG / 摘要，别迷信网页 session |
| 接 Claude / Codex 级能力 | **更荒唐** | 官方 API 或官方客户端 |

荒谬不在「GitHub 上没人做」——人很多。荒谬在目标错位：拿沙子盖楼，还嫌水泥贵。

## 认清你要 Agent 还是要爬虫

动机能理解：网页看起来免费又「好模型」，Agent 又贵又馋工具调用。但路径选反了。该抠的是上下文管理、MCP 工具质量和验证回路，不是跟 PoW 和 cookie 过日子。

有人回「网页端反代？」——这一句已经把方案定性了。剩下只是要不要自己承认：你要的是 Agent，还是要一段永远修不完的爬虫。

## 参考

- DeepSeek 官方定价与能力：[api-docs.deepseek.com/quick_start/pricing](https://api-docs.deepseek.com/quick_start/pricing) · [Rate Limit](https://api-docs.deepseek.com/quick_start/rate_limit)  
- 社区方向（存在性举证，非推荐生产）：[madderscientist/WebAI2API](https://github.com/madderscientist/WebAI2API) · [Wu-jiyan/deepseek-reverse-api](https://github.com/Wu-jiyan/deepseek-reverse-api) · [xiaoY233/GLM-Free-API](https://github.com/xiaoY233/GLM-Free-API)  
- 智谱清言用户协议：[chatglm.cn/legal/appAgreement](https://chatglm.cn/legal/appAgreement)  
- Anthropic 收紧第三方 harness / 订阅自动化：The Register / VentureBeat 2026 相关报道
