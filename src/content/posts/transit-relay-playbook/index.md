---
title: 中转池实战：双 Pro 拼池、Luna 路由与 403 排错
published: 2026-08-12
updated: 2026-08-12
description: 把双 Pro 拼池压测、BestCodex/Luna 分组，以及 K12 池 403 三层原因收成一篇。经营四段位另文，不并入中转。
image: ./cover.jpg
tags: [中转, Codex, Claude Code, Agent]
themeTags: [Luna, CC Switch, service_tier, 拼池]
category: 中转
collections: [agentic-coding-core, transit-relay]
draft: false
lang: ''
slug: transit-relay-playbook
pinned: false
comment: true
---

本文合并自：[`gpt-relay-dual-pro-pool-benchmark`](/posts/gpt-relay-dual-pro-pool-benchmark/)、[`bestcodex-relay-luna`](/posts/bestcodex-relay-luna/)、[`codex-k12-pool-403`](/posts/codex-k12-pool-403/)。[`cost-efficiency-four-tiers`](/posts/cost-efficiency-four-tiers/) 是经营指南，不并入。

## 拼池体感

双 Pro 拼池：≤3 路还香；>10 容易排队 / 502。短任务 TPS 虚高，别拿它当容量证明。额度常无查询入口——当黑盒配额用。

## Luna / 分组

三 Key 分组 + CC Switch 常见。Luna high 适合主力推理；画图是额度杀手。列表里「有模型」≠ 当前可用。

## 403 三层

1. 坏代理 / 错误 base URL  
2. `service_tier=priority` 一类字段不被中转接受  
3. 「10 号」其实是 1 账号 10 令牌的池语义误解  

Codex 侧还砍过 `wire_api=chat` 等兼容路径——升级后旧配置会突然 403。

## 落地清单

1. 先小并发压测，再加路。  
2. 画图与长推理分 Key。  
3. 403 按 URL → tier → 池语义三层拆。  
