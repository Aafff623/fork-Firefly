---
title: Best Codex 中转：三把钥匙、一个 Luna，测完还剩 $39
published: 2026-08-05
updated: 2026-08-05T11:12:00
description: Best Codex 三组 Key 实测：Luna 写代码又香又便宜，Sonnet 5 稳走 Claude Code，画图好看但会把额度咬出缺口。
image: ./cover.jpg
tags: [BestCodex, 中转, Codex, Claude, Luna, AI Coding]
category: 中转
collections: [transit-relay]
draft: false
lang: ''
slug: bestcodex-relay-luna
pinned: false
comment: true
---

早上邮箱里蹦出「好久不见，送你 50 额度」。人一懒就容易把这种中转站忘在角落，但这次正好想搞清楚：Best Codex 到底能不能扛 Codex / Claude Code / 生图，以及**一美元在 Luna 上能熬多久**。

测完余额变成 **$39.47**。掉的那十来块，教训比数字更值钱。

相关阅读：[双 Pro 拼池的 GPT 中转](/posts/gpt-relay-dual-pro-pool-benchmark/)——那边偏并发脾气；这篇偏分组能力与额度账本。接到 OpenCode 之后怎么分活，见 [把高成本判断留给 Luna](/posts/opencode-luna-deepseek-minimax/)。

## 先把站点想明白

Best Codex 是个 AI API 网关（自家叫 sub2api 一类）。你拿 Key，工具打到 `https://api.bestcodex.xyz/v1`，它再往上游转。

配工具时别手写一堆 toml / json 来回改——**CC Switch** 才是正经入口：官网一键「导入到 CCS」，Codex / Claude Code 共用配置。

还有个坑得先说：**分组决定能力**。同一域名下，不同 Key 能打的模型和协议完全不是一回事。列表里看见的名字，不等于这组账号真接得上。

## 三把钥匙，各干各的

| 钥匙 | 分组体感 | 真能用的 | 评价 |
|------|----------|----------|------|
| GPT 活动（约 0.6x） | 文本 / Codex | `gpt-5.6-luna` / `terra` / `sol` 等；Chat、Responses、流式、Tools 都通 | **日常写代码主力** |
| 画图专用（标 0.15/张·异步） | 只生图 | 实质只有 **`gpt-image-2`** | 质量可以，**额度杀手** |
| Claude 超值 / Kiro（约 0.6x） | Anthropic 协议 | **`claude-sonnet-5`** 稳；`sonnet-4-6` 也能通；大量旧 Sonnet 上游 502 | **Claude Code 专用** |

别混着用：Claude Key 去打 GPT 会吃闭门羹；画图 Key 塞进 OpenCode 聊天配置，纯属对牛弹琴。

## 模型怎么选才不后悔

我这边的取舍很直白：

- **Codex / OpenCode 主用**：`gpt-5.6-luna`，推理档日常用 **high**，别动不动 **max + 超长输出**（实测会拖到超时）。
- **均衡备选**：`gpt-5.6-terra` + high，体感稍快，够用。
- **Claude Code**：死磕 **`claude-sonnet-5`**。列表里一堆 Opus / 老 Sonnet / Fable，好看但不能当真。
- **生图**：只在需要时开 `gpt-image-2`。产品图、图标、复杂夜景都像样，但今天 OpenAI 侧 **~$10.53** 基本是它贡献的。

性价比排序（结合 0.6x 和仪表盘实际扣费）：**Sonnet 5 ≈ Luna/Terra 文本 ≫ 画图**。文本便宜到几乎可以「随便试」；画图不行。

## $1 在 Luna 上大概能干多久

按仪表盘当时一行粗算：`gpt-5.6-luna` 约 **18K tokens / $0.0022（实际）**。

折下来：

| 口径 | 约合 / $1 |
|------|-----------|
| Token | **~820 万** |
| 短问答（~320 tok/次，含网关注入） | ~2.5 万次 |
| 中等编码（~800 tok/次） | ~1 万轮 |
| 偏重一轮（~2K tok） | ~4 千轮 |

说人话：**一美元的 Luna，正经写代码能熬很久**。你现在剩 ~$39，如果几乎只跑 Luna 文本，压力主要不在余额，而在自己舍不舍得刷。

两个记账细节别忽略：

1. 短 prompt 也会冒出 ~300 prompt tokens——网关爱塞系统上下文。
2. 仪表盘单价会变；上面是量级，不是合同价。

Luna 短中请求一般 2–4 秒内回来；`max` 拉长输出时，我这边出现过 **180 秒读超时**。舒服的用法是 high，不是拉满。

## 生图那笔账，值得单独骂一句

画图分组对外标「0.15/张、异步」，接口却是同步等结果：`POST /v1/images/generations`，大约 **50–70 秒**吐 CDN URL，模型名白纸黑字 `gpt-image-2`。

质量没话说。可今天总消耗里，OpenAI **$10.53 / 58 次**，Claude 几乎是 **$0**。聊天探测那点 token 根本填不满十刀——**大头就是图**。

以后规则简单：Agent 默认别绑画图 Key；要图就单独开，并去「使用记录」核对真实单价，别只信分组文案。

## Claude 这条线的真实水位

- 协议：`/v1/messages` 正统 Anthropic；顺带 `/v1/chat/completions` 也能转。
- `claude-sonnet-5`：对话、流式、Tool use、写码都过了；轻并发 8 路无 429。
- 列表里很多 Sonnet 显示有、一打就「Upstream access forbidden」。**列表 ≠ 可用**，固定 Sonnet 5 最省心。

OpenCode 侧 Anthropic provider 指到 `https://api.bestcodex.xyz/v1` 即可；Claude Code 用环境变量或 CC Switch 导入同理。

## 我会怎么挂日常

```
Codex / OpenCode  →  GPT 活动 Key  →  gpt-5.6-luna (high)
Claude Code       →  Claude/Kiro Key →  claude-sonnet-5
偶尔生图          →  画图 Key        →  gpt-image-2（按次想清楚）
```

密钥别再往聊天、截图、公开文档里扔。测完轮换，尤其是还要长期挂的那两把文本 Key。

## 带走的几句

中转站好不好用，不看宣传页模型墙，看**分组真实接通了什么**。  
Best Codex 上：Luna 写代码香且便宜；Sonnet 5 走 Claude 也香；画图好看但会把「50 额度」咬出可见缺口。  

剩 $39 的玩法很明确——**把 Luna 当主粮，把生图当零食。**
