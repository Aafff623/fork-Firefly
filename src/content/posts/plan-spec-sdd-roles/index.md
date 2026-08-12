---
title: Spec 定边界，PLAN 定路线，别混成一锅
published: 2026-08-11
description: Spec / PLAN / SDD / SubAgent / agentTeams 各管一块；三大范式先对齐语感，再谈工具名。
image: ./cover.jpg
tags: [SDD, PLAN, Spec, SubAgent, Harness]
category: Agentic Coding
draft: false
lang: ''
slug: plan-spec-sdd-roles
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://gisjing.blog.csdn.net/article/details/159695252
---

工具名会变，但这几个词别搅在一起：

| 词 | 定什么 | 不定什么 |
|---|---|---|
| Spec | 做什么、不能做什么、做到什么算过 | 不讲步骤、不动手 |
| PLAN | 怎么干、几步、谁干、依赖与并行 | 不重新发明需求 |
| SDD | 把需求压成结构化输入，降歧义 | 不是测试用例全集 |
| SubAgent | 临时、隔离上下文的专项工 | 不是长期固定编制 |
| agentTeams | 固定角色团队、可共享进度 | 比 SubAgent 更重 |

三大范式也可以先对齐语感：Vibe 是你握方向盘、AI 踩油门；Agentic 是你雇司机；Harness 是你建交通系统，让司机们在里面协作。

## Spec 六块别漏

原文给的模板够用：

1. 需求背景（为什么要做）  
2. 核心能力（必须实现）  
3. 输入输出约束  
4. 业务规则与边界  
5. 异常与报错  
6. 可量化验收标准  

没有第 6 条，Agent 就会「感觉写完了」。PLAN 则要对齐 Spec：总目标、原子任务、依赖、代理指派、分步验证点。复杂任务先 PLAN 再动手，比直接开写省返工。

## 协作怎么加码

- SubAgent：`.cursor/agents/` 或工具内置子代理；描述里写 `Use proactively` 可主动召；适合审查/测试/调研这类忌「自己审自己」的活  
- agentTeams：固定架构师 / 前后端 / 测试 / 安全一类角色，适合更大工程  
- Claude Code 气质：渐进式披露，入口 + 搜索工具，别一次塞满仓库；Codex 气质更偏插件补全与全量上下文（原文对比，作选型参考）

## 日常避坑

| 坑 | 对策 |
|---|---|
| 信息过载 | 渐进披露，只给入口 |
| 跳过 PLAN | 复杂任务先拆再写 |
| 上下文发臭 | `/clear` 一类清理，别无限续聊 |
| 权限过大 | 沙箱 + 按角色收工具 |
| Skills 当系统提示词堆 | 用 Skills 扩能力，别把系统提示词越写越长 |

## 相关阅读

- [全栈别让 AI 凭空造：先拴住，再并行](/posts/harness-sdd-fullstack-parallel/)
- [「模型以外都是 Harness」：拆开才好装](/posts/harness-three-layer-architecture/)

> 素材来源：[CSDN 原文](https://gisjing.blog.csdn.net/article/details/159695252)
