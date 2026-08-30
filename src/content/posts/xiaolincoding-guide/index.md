---
title: 小林coding：图解与面经怎么排着读
published: 2026-08-11
updated: 2026-08-11T11:30:00
description: 小林coding 主站栏目导览与个人学习入口；链回原文，不做全文搬运。
tags: [小林coding, 图解, 面经, 学习笔记]
category: 指南
collections: [xiaolincoding]
draft: false
lang: ""
slug: xiaolincoding-guide
image: ./cover.jpg
pinned: false
comment: true
author: threetwoa
sourceLink: https://www.xiaolincoding.com/
---

小林coding 主站把「图解基础」和「后端面试」拆得很清楚，适合当个人学习地图，不适合整站搬进博客。这篇只做**导览**：告诉你各栏目干什么、建议怎么排着读，细节一律回原文。

[主站首页](https://www.xiaolincoding.com/)

> 版权归小林coding。本文是自写学习导读 + 外链索引，不是原文转载。付费营、小程序、以及挂在 xiaolinnote.com 上的 Agent / Claude Code 专题，本次不覆盖。

## 先认清地图

| 你想补什么 | 先看哪一块 | 原文入口 |
|---|---|---|
| 网络半桶水 | 图解网络 | [network](https://www.xiaolincoding.com/network/) |
| 进程 / 内存 / 文件 | 图解系统 | [os](https://www.xiaolincoding.com/os/) |
| 索引 / 事务 / 锁 | 图解 MySQL | [mysql](https://www.xiaolincoding.com/mysql/) |
| 缓存与一致性 | 图解 Redis | [redis](https://www.xiaolincoding.com/redis/) |
| Java / Go / C++ 八股 | 面试题系列 | [interview](https://www.xiaolincoding.com/interview/) |
| 大厂 / 银行面经 | 后端面经汇总 | [backend_interview](https://www.xiaolincoding.com/backend_interview/) |
| 怎么学、怎么写简历 | 小林的那些事儿 | [cs_learn](https://www.xiaolincoding.com/cs_learn/) |

主站体量很大（图解网络约 20 万字 + 500 图量级）。别按「从头到尾刷完」规划；按岗位缺口挑一条线深挖更合适。

## 我怎么排优先级

**后端校招 / 社招八股**：网络 → 系统 → MySQL → Redis，再补本语言面试题。面经放最后，用来对答案，不拿来当第一本教材。

**已经在岗、只缺短板**：直接进对应图解（例如天天排查慢 SQL 就先 MySQL），面经当「别人怎么问」的样本。

**想顺带看 Agent / RAG / Claude Code**：那些专题多在 [xiaolinnote.com](https://xiaolinnote.com/) 外链站，和主站 sitemap 不是同一棵树；需要另开学习任务，别和本合集混成「已经全抓了」。

## 图解四件套（主站核心）

四条线共用一个气质：手绘多、口语讲解、冲着面试高频点。读的时候建议带着自己的错题本——能画出「请求怎么走 / 进程怎么调度 / 一条 SQL 怎么查」才算过关，而不是收藏链接。

- [图解网络](https://www.xiaolincoding.com/network/)：HTTP/HTTPS、TCP/UDP、IP 等程序员日常会碰的协议链路
- [图解系统](https://www.xiaolincoding.com/os/)：进程、内存、文件、网络子系统
- [图解 MySQL](https://www.xiaolincoding.com/mysql/)：索引、引擎、事务、MVCC、锁、日志
- [图解 Redis](https://www.xiaolincoding.com/redis/)：结构、持久化、淘汰、高可用、缓存一致性

## 面试与面经怎么用

- [Java / Go / C++ / 测试开发面试题](https://www.xiaolincoding.com/interview/)：按语言桶刷，配合图解回填原理
- [大厂后端面经](https://www.xiaolincoding.com/backend_interview/)：互联网大厂、中厂、银行等真实题库向内容——适合模拟，不适合当唯一知识源

面经里同一题在不同公司变形很大。记下「他在考哪一层」（网络？锁？存储引擎？），再回图解对应章，比狂背答案稳。

## 本合集以后会挂什么

Firefly 合集 slug：`xiaolincoding`。  
站上只有这篇导读和以后点名写的**薄学习笔记**（判断、错题、对照表），一律外链回 xiaolincoding.com。本机另有私人 Archive（仓外、不进 git），用来离线翻原文——**不会**把那 200+ 篇批量上成公开帖。

想指定某几篇主题做薄笔记，直接点名即可。
