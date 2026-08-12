---
title: Harness × SDD × Graph：全栈参照与多 Agent 路由
published: 2026-08-12
updated: 2026-08-12
description: 全栈先拴参照实现再并行；Graph 是可路由的多节点组织，不是 Loop 的升级皮肤。合并 SDD 并行联调与 Codez 十四步要点。
image: ./cover.jpg
tags: [Harness, SDD, Agent, Graph, Claude Code]
themeTags: [全栈并行, OpenSpec, Shared State, Failure Routing]
category: Agentic Coding
collections: [agentic-coding-core, agentic-workflow, csdn-tech-tutorials]
draft: false
lang: ''
slug: harness-sdd-graph-playbook
pinned: false
comment: true
---

本文合并自：[`harness-sdd-fullstack-parallel`](/posts/harness-sdd-fullstack-parallel/)、[`graph-engineering-14-steps`](/posts/graph-engineering-14-steps/)。心智与治理见 [`harness-mental-model-guide`](/posts/harness-mental-model-guide/)。

## 全栈：先拴参照，再并行

Harness 在这里首先是**参照实现**：禁止凭空外星码。前/后端各一份 SDD 对齐契约，同 workspace 索引，再用 OpenSpec 压成 propose → apply → archive。

联调顺序：Mock → 编译 → E2E。问隐性行为（错误码、幂等、超时）比问「写完了吗」有用。

## Graph：何时才值得上

Graph 烧 token、协调更贵。上之前问：

1. 单体 loop 是否已经稳？  
2. 是否真有可并行扇出？  
3. 失败是否要独立路由？  
4. 共享状态契约是否写得清？  

构件：Nodes / Edges / Shared State / Failure Routing。边必须传数据；「然后」不是边。线性脚本 = 退化单链；剪掉无数据边才能并行。节点要输入输出契约，禁止蹭共享窗口乱读。

Subagents vs Agent Teams：差在有没有 Shared Task List。无失败边只是流程图，不是系统。

Codez 十四步里常用积木：`parallel()` 扇出、屏障汇入、菱形拆合——细节步骤回源帖。

## 落地清单

1. 新项目先放参照实现与契约，再开并行工位。  
2. Graph 默认不做；loop 稳了再说。  
3. 每条边问：传了什么？失败去哪？  
