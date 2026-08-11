---
title: 全栈别让 AI 凭空造：先拴住，再并行
published: 2026-08-11
description: 用参照实现当 Harness，前后端各一份 SDD 对齐契约，再双 Agent 并行；联调分 Mock / 编译 / 端到端。
image: ./cover.jpg
tags: [Harness, SDD, 全栈, 多 Agent, 联调]
category: Agentic Coding
draft: false
lang: ''
slug: harness-sdd-fullstack-parallel
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/weixin_39787242/article/details/160990076
---

最大坑不是 AI「不会写」，是它从零发挥出一堆风格不合、字段对不上的「外星代码」。Harness 在这里的意思很土：给一个已有实现当参照，让它复刻，别自由发挥。

坏提示：「实现结束语 CRUD」。  
好提示：「参照场景欢迎语（后端 `/api/v1/feature/list`，前端 `FeatureTable/index.tsx` 第 53～58 行），数据结构、分层、命名保持一致；新 scene code = `SCENARIO_CLOSING`」。

## 先把前后端放进同一工作区

仓拆开开时，生成后端看不到前端调用，生成前端猜不到返回结构。同一 Cursor Workspace 有三件事值钱：

1. Codebase Indexing 覆盖两侧，语义检索能串整条链路  
2. 字段名、命名风格自然对齐  
3. 前后端 SDD 文档放一起，接口契约好对表  

索引没跑完就别急着让它写大块代码。

## SDD：两份文档，契约对齐

全栈不是一份 SDD 打天下。前端一份、后端一份；前端调用 vs 后端定义、VO 字段 vs JSON 字段必须一一对应。

常见产出：

| 侧 | 文件 | 干什么 |
|---|---|---|
| 前端 | proposal / spec / tasks | 做什么、组件与接口、可执行任务 |
| 后端 | proposal / spec / design / tasks | 接口与库表、类图字段映射、任务拆分 |

生成 SDD 前，把设计歧义写成清单逼它先答：主键传什么、优先级谁自增、批量排序接口怎么设计、嵌套对象拆表还是 JSON、`isNextDay` 怎么映射。前端给足 UI 细节，后端先把模糊点钉死。

OpenSpec 类流程再长，日常可压成三步：**propose → apply → archive**。

## 多 Agent：文档齐了再并行

前后端 SDD 落地后，两侧实现天然可并行：

- Cursor：两个 Tab，前/后端各一个 Agent  
- Claude Code：Subagent 分读各侧 `tasks.md`；Mock 可用更轻模型  

Subagent 配置里把 tools / model / skills / permissionMode 绑死角色，别让审查员拿删除权限。

## 联调别一上来就端到端

三阶段更省命：

1. 前端 + Mock：字段类型对齐后端 SDD，覆盖空列表/极值  
2. 后端独立：`mvn clean compile`（或等价）过编译再部署  
3. 再连测试环境做端到端  

Mock 要抄真实返回模板，别随手编字段。

## SDD 不是测试终点

AI 会从参照实现「偷」隐性行为：关弹窗清表单、永久有效清日期、优先级自增……文档没写，代码里已经有。测试侧要把 SDD 当起点，专门问一句：参照功能有哪些隐性行为，新功能要不要？

```mermaid
flowchart LR
  A[参照实现 Harness] --> B[双份 SDD 对齐契约]
  B --> C[双 Agent 并行写码]
  C --> D[Mock / 编译分阶段验]
  D --> E[联调 + 挖隐性行为]
```

## 相关阅读

- [Spec 定边界，PLAN 定路线，别混成一锅](/posts/plan-spec-sdd-roles/)
- [「模型以外都是 Harness」：拆开才好装](/posts/harness-three-layer-architecture/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/weixin_39787242/article/details/160990076)
