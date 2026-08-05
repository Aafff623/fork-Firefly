---
title: 40 个技能围着一个 grilling 转：Matt Pocock 工程方法论拆解
published: 2026-08-05
updated: 2026-08-05T20:06:20
description: 40 个 agent 技能拆开看是同一套工程方法论：grilling 逼你把每个假设问一遍，主流程从想法一路推进到可验证的切片。
image: ./cover.jpg
tags: [Matt Pocock, AI Agent, 方法论, 工作流, TypeScript]
category: Agentic Coding
draft: false
lang: ''
slug: matt-pocock-engineering-method
pinned: false
comment: true
---

TypeScript 圈博主 Matt Pocock 开源了自己的 agent 技能库，star 涨得飞快。表面是 40 个 SKILL.md，拆开看其实是同一套工程方法论。这篇基于技能原文，把它的骨架和关键设计讲透。

## 一张地图看全局

整个库不是平铺的技能堆，而是三层结构加一堆独立件。ask-matt（官方路由器）把它画得很清楚：

```mermaid
flowchart LR
  subgraph 词汇层[词汇层·运行在所有技能之下]
    D[domain-modeling<br>领域术语 / ADR]
    C[codebase-design<br>深模块词汇]
  end
  subgraph 主流程[主流程·想法到交付]
    G[grill-with-docs<br>逼问 + 落文档] --> S[to-spec<br>合成规范]
    S --> T[to-tickets<br>拆成票]
    T --> I[implement<br>内部驱动 tdd]
    I --> R[code-review<br>双轴审查]
  end
  subgraph 入口[三条入口·汇入主流程]
    T1[triage<br>外部 issue/PR]
    T2[diagnosing-bugs<br>硬 bug]
    T3[wayfinder<br>超大工程]
  end
  T1 -.-> I
  T2 -.-> G
  T3 -.-> S
  D -.-> G
  C -.-> I
```

![方法论结构：齿轮、终端与图纸](./images/fig-structure.jpg)

主流程是「想法→交付」，三条 on-ramp（入口）从不同起点汇入，两个词汇技能在所有流程下面提供公共语言，剩下的是独立件。

## 心脏：grilling，一台逼你想清楚的机器

整库最强的引擎不是写代码的，而是「问问题」的。

grilling 把任何计划当一棵**决策树**：每个决定下面挂着依赖它的下一批决定。按「轮」问，每轮只问当前能答的那批（frontier，即前置已定的决策），每个问题编号并附上 agent 自己的推荐答案。

分工很明确：能从代码库或文件查到的**事实**，agent 派子代理查，不麻烦你；真正要拍的**决策**才抛给你，等你回答进下一轮。frontier 空了（树走完、没有默默假设）才算完，且在确认共识前不动手。

## 词汇层：让所有技能说同一种话

两个技能不直接干活，但所有技能都踩在它们上面。

**domain-modeling**（领域建模）管「词」。三条硬纪律：

- `CONTEXT.md` 是**纯术语表**，零实现细节，不兼当 spec 或草稿
- 用户用词和术语表冲突时当场指出（「你的术语表说 cancellation 是 X，但你好像指 Y」）
- ADR 只在三条件同时满足才写：难逆转、无上下文会惊讶、是真实权衡的结果。少一个就不写

**codebase-design**（深模块）管「形状」。核心是 deep module：小接口后面藏大量行为。几个一眼能带走的原则：

- **删除测试**：想象删掉这个模块，复杂度没了？它就是个透传。复杂度分散到 N 个调用方？它值
- **接口即测试面**：调用方和测试跨同一条缝；想越过接口测，多半是模块形状错了
- **一个适配器是假设的缝，两个才是真的缝**：没有真实变化别引入抽象

## 主流程：grill → spec → tickets → implement → review

**grill-with-docs**（有代码库）/ **grill-me**（无代码库）：同一个 grilling 引擎，前者把结论写进 CONTEXT.md 和 ADR，后者不落任何东西。选哪个看有没有代码库，不看心情。

**to-spec**：把聊定的事合成规范，明确「不访谈，纯合成」。模板有两处反直觉的设计：

- **User Stories 要超长**：编号列表尽可能穷尽功能所有面向，不是两三句
- **Implementation Decisions 不放文件路径和代码**：因为会迅速过时；唯一例外是原型产出的状态机/类型形状这类「比散文更精确」的东西

**to-tickets**：把规范拆成 **tracer-bullet 垂直切片**。每张票切一条贯穿 schema→API→UI→测试的完整窄路，自己可演示可验证，尺寸塞得进一个全新上下文窗口。每张票声明 **blocking edges**（依赖谁、被谁阻塞），无阻塞的立即可开工。

特殊场景：大范围重构（改一个符号炸全库）不硬塞垂直切片，改用 **expand-contract**：先加新形态不破坏旧的 → 按爆炸半径分批迁移（每批一张票，CI 保持绿）→ 无调用者后删旧形态。

**implement**：按票实现，内部驱动 tdd（红→绿，一次一切片）。每张票自包含，上一张的上下文可丢，新票开新窗口。

**code-review**：双轴，两个并行子代理互不污染上下文。一个查「符不符合仓库规范」（Standards），一个查「实现对不对得上原需求」（Spec）。

## 三条入口：从不同起点汇入主流程

**triage**（issue 管理）：只处理「你没创造的 issue」，也就是外部 bug 报告、feature 请求。走状态机分类、验证、写成 agent 能直接领走的任务。注意 to-tickets 产生的票已是 agent-ready，不要再过 triage。

**diagnosing-bugs**（硬 bug）：只接「一眼看不出来」的，比如间歇性 flake、两个已知良好状态之间爬进来的回归。铁律：先建紧反馈环（一条已经对这个 bug 红的命令），再谈理论；修完带回归测试。事后若发现真问题是「没有好 seam 锁住这个 bug」，就转给 improve-codebase-architecture。

**wayfinder**（超大工程）：主流程里认知负荷最高的一环。当「从这到目的地」的路还看不见时，它把工作做成 issue tracker 上的一张**决策地图**：一个 map issue 挂一批决策 ticket。两处设计很妙：

- **战争迷雾（fog of war）**：能精确成句的问题才变成 ticket；看不清的写进 Not yet specified，等 frontier 推进自然毕业成票，不硬切迷雾
- **HITL vs AFK**：票分「人在环内」（和用户一起拍板）和「人不在环」（agent 独自解决）。HITL 票 agent 绝不能代答，官方原话是「一个自己回答自己问题的 grilling agent 已经坏了」
- 一次会话只解一张票（research 票除外），解完记录答案、关票、在地图上加指针

wayfinder 默认「只规划不执行」：地图清空时交棒到主流程的 to-spec，而不是直接 implement。

## 会话纪律：阶段边界

ask-matt 里最实用的一段是 phase boundaries。两个阶段之间怎么处理上下文，五选一，官方给了决策顺序：Continue（不花钱）→ clear（什么都不留）→ handoff（跨 harness/目录/同事才用）→ subagent（紧任务单独窗口）→ compact（压缩，树底部的默认）。

核心主张：**grilling→spec→tickets 保持一个未断的上下文窗口**（约 150k token 的「清醒区」内），别中途 compact；每张 implement 才开新窗口。跨阶段或跨目录用 handoff 搭桥，prototype 进出主流程就靠它。

## 我的判断

这套东西最有价值的地方，不是某个技能，而是它把**「有经验的工程师怎么把事做成」**拆成了可组合的流程，并且对 skill 本身用了同一套纪律：薄壳委派（grill-me 正文只剩一句）、旧能力吸收合并、核心小可组合。

三点要认清：

- **有学习曲线**：skill 之间互相引用（grill-with-docs 驱动 domain-modeling，implement 驱动 tdd），单独抽一个会失效；首次要跑 setup 初始化 issue tracker 和文档布局
- **它选了一条更重的路**：wayfinder、to-tickets 这种「先想清楚再动手」的流程，对小型一次性任务反而拖沓。ask-matt 自己都警告 wayfinder 别用在范围清晰的 feature 上
- **强绑定维护文档的习惯**：CONTEXT.md + ADR 这套领域建模假设你愿意写文档；如果你本来就不写，这些技能的价值打对折

最核心的一点：**Matt Pocock 的整个技能库，本质是在教 agent 一件事，动手之前先把每个假设都问一遍。** 其他全是这条主线的配套。
