---
title: 五种 RAG 怎么选：先认清会在哪失败
published: 2026-08-11
updated: 2026-08-11T01:39:19
description: Hybrid / GraphRAG / Agentic / CRAG / Multimodal 按失败模式选型；可叠用，别当五选一考卷。
image: ./cover.jpg
tags: [RAG, GraphRAG, CRAG, Agentic, 检索]
category: Agentic Coding
draft: false
lang: ''
slug: rag-five-architectures
pinned: false
comment: true
---

卡在「要不要上 RAG」这一层时，选型往往从品牌对比开始——向量库谁家热、embedding 哪家分高。更稳的问法是：**系统会在哪失败？** 失败模式定了，检索架构才有得选。

RAG 不是勾选项。Demo 能跑、生产抖三抖，多半是失败模式没对齐，不是「少接了一个向量库」。

---

## 先问五句，再谈架构名

| 你会撞上哪类失败 | 优先看 |
|---|---|
| 关键词对不上、专名漏检 | Hybrid |
| 答案藏在实体关系里 | GraphRAG |
| 一步检索不够，要拆任务调工具 | Agentic |
| 检索脏了还硬答，可信度崩 | Corrective（CRAG） |
| 料在 PDF 图 / 表 / 扫描页里 | Multimodal |

---

## 五种怎么走

| 架构 | 在补什么 | 流程骨架 |
|---|---|---|
| **Hybrid** | 语义 + 精确关键词 | 查询 → 向量 + BM25 → 融合排序 → LLM |
| **GraphRAG** | 实体关系推理 | 查询 → 实体抽取 → 知识图谱 → 子图检索 → LLM |
| **Agentic** | 多步规划与工具 | 查询 → 规划 Agent → 搜索 / SQL 等工具 → 推理 Agent → 答案 |
| **Corrective / CRAG** | 检索质量门禁 | 查询 → 检索 → 质量评估（过→LLM；不足→重搜）→ 答案 |
| **Multimodal** | 文 / 图 / 表统一进索引 | 多模态输入 → 多模态嵌入 → 统一索引 → 多模态 LLM |

Hybrid 解决的是「搜得到字面」；Graph 解决的是「绕得过关系」；Agentic 解决的是「一步不够」；CRAG 解决的是「搜错了还装懂」；Multimodal 解决的是「料根本不在纯文本里」。

---

## 选型时别踩的坑

先买向量库再找场景：品牌对比可以后置；失败模式要前置。

五种当互斥菜单：生产里常见叠用（Hybrid + CRAG 很常见），图是选型地图，不是五选一考卷。

把 Agentic 当默认升级包：多一步 Agent 就多一截延迟与失控面；任务不复杂时别硬上。

CRAG 只加评估不设重搜出口：门禁开了却无处可逃，评估等于白做。

认清自己会撞上哪一种失败，比背全五种名字有用。旁边那篇「Agent 记忆八选一」管的是上下文账单；这篇管的是检索失败模式——两道题别糊成一道。
