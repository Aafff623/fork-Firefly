---
title: Harness 心智手册：三层架构、治理与 Spec 工程
published: 2026-08-12
updated: 2026-08-12
description: Agent = Model + Harness。把执行/上下文/治理三层、AGENTS.md 共享真相、grilling→Spec→tickets，以及 Kiro/Hermes 套缰体感收成一篇对照，极客时间课笔记不并入。
image: ./cover.jpg
tags: [Harness, Agent, Claude Code, SDD, Agentic Coding]
themeTags: [三层架构, AGENTS.md, grilling, Kiro, Hermes, Spec]
category: Agentic Coding
collections: [agentic-coding-core, agentic-workflow]
draft: false
lang: ''
slug: harness-mental-model-guide
pinned: false
comment: true
---

本文合并自：[`engineering-type`](/posts/engineering-type/)、[`harness-three-layer-architecture`](/posts/harness-three-layer-architecture/)、[`agent-governance-harness-mental-model`](/posts/agent-governance-harness-mental-model/)、[`plan-spec-sdd-roles`](/posts/plan-spec-sdd-roles/)、[`matt-pocock-engineering-method`](/posts/matt-pocock-engineering-method/)、[`matt-pocock-four-books`](/posts/matt-pocock-four-books/)、[`kiro-claude-harness-feel`](/posts/kiro-claude-harness-feel/)、[`hermes-agent-seven-levels`](/posts/hermes-agent-seven-levels/)。极客时间课笔记仍挂 `course-geektime*`，不并入本文。

## 一张地图

| 概念 | 管什么 |
|---|---|
| Prompt | 这一步怎么说 |
| Context | 能记住什么（压缩 / 外化） |
| **Harness** | 模型以外的外壳：工具、权限、记忆、流程 |
| Loop | 单智能体持续行动 |
| Graph | 多 loop / 多节点协作 |

同模型换 harness，体感可以差一截。Vibe 像自己握方向盘；Agentic 像雇司机；Harness 工程像建交通系统。

## 三层：执行 / 上下文 / 治理

1. **执行层**：工具、权限、原生 agent loop（给工具 + 权限通常优于卡死 Prompt Flow）  
2. **上下文层**：记忆、摘要、caching；别乱裁历史破坏 prompt cache；记忆甜点常是「半规则 Markdown + Stop Hook」  
3. **治理层**：审查只读、写测权限分离、人在环决策点  

Spec 定边界，PLAN 定路线，SDD/SubAgent/Teams 各管一块。Spec 六块里**验收标准**不能省，否则只会「感觉写完」。

## 共享真相：AGENTS.md 与薄适配

- 共享源：`AGENTS.md`、Agent Skills、`.agents/` Protocol  
- IDE/CLI 各建专属目录 = **适配层**，用 junction 指回共享正文，勿复制漂移  
- Claude：`CLAUDE.md` 顶部 `@AGENTS.md`；AGENTS 要短，细节进 skills 渐进加载  
- 本仓 `LANGUAGES.md` ≠ 别人家的 `LANGUAGE.md`，别混  

与 Superpowers / ECC 共存时：共享核心流程，不换掉你的门禁。

## grilling → Spec → tickets → review

Matt 系方法可压缩成：

1. **Grill**：决策树 frontier；事实派子代理，决策抛人  
2. **CONTEXT / ADR**：术语纯净；ADR 满足三条件才写  
3. **Deep module**：删测测复杂度；一个适配器缝假设  
4. **Tickets**：tracer-bullet 垂直切片 + blocking edges  
5. **Review**：Standards vs Spec 双轴  

四本旧书挂同一失败模式：烂结构会被 AI 放大；贵的是错形状的速度。改 Spec 不看码 vs 日投系统设计——两范式选清楚。

## 套缰体感：Kiro 与 Hermes

**Kiro**：注入 system + harness，模型只是引擎；custom agent 是 CONTEXT ENTRY，冲突时系统赢。Spec/Steering/Hooks 稳，自由 vibe 常不如 Claude Code——这是再分配，不是单纯「削弱」。

**Hermes 七层**（VPS→入口→Curator→备份→看板→记忆→MCP）：Curator 不开 skill 会反噬；备份要自验；记忆推本地方案；改完 MCP 要 `/reload-mcp`。深 harness 配旗舰模型才划算。

## 落地清单

1. 先画三层：执行 / 上下文 / 治理各写一句负责人。  
2. 共享真相进 AGENTS；宿主差异只留薄适配。  
3. 新功能先 Spec 验收，再 tickets，再并行。  
4. Graph / 全栈 SDD 实战见姊妹篇 [`harness-sdd-graph-playbook`](/posts/harness-sdd-graph-playbook/)。  
