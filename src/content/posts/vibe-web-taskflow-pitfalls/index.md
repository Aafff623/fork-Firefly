---
title: 三天搭完 TaskFlow，真正卡人的不是 Prompt
published: 2026-08-11
description: Claude Code + Cursor 三天从零做任务管理 Web 的诚实坑账：规范先行、旧 API 幻觉、安全路径必须人审。
image: ./cover.jpg
tags: [Vibe Coding, 踩坑, Claude Code, Cursor, 全栈]
category: 指南
draft: false
lang: ''
slug: vibe-web-taskflow-pitfalls
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/qq_23625847/article/details/161089163
---

CSDN 这篇不是「Vibe 有多香」的鸡血文。作者用 Claude Code + Cursor，三天从零做出任务管理 Web（React / FastAPI / Postgres / JWT / Docker，约 4800 行），价值在诚实记账：哪些地方 AI 真省事，哪些地方它给你挖坑。

和「十步上线手册」对照看：手册告诉你流程长什么样；这篇告诉你流程里哪几脚会崴。

## 动手前先写「给 AI 看的」规范，不是 README

作者花约 2 小时写项目规范文档，再开聊。文档里必须钉死：

| 块 | 写什么 | 为什么 |
|---|---|---|
| 技术栈 | 版本写死，并写「不要建议替换」 | 否则它爱换框架 |
| 数据模型 | 表字段 + 关系 | 业务上下文它猜不准 |
| 编码硬约束 | async 禁同步 ORM、Repository 分层、统一异常 | 减少「合理但不合你们规矩」的假设 |
| 当前阶段 | Day1 只做 auth + 项目 CRUD；明确「不做」清单 | 压住过度设计 |

每次对话把这份文档当开场白，比单靠一句「帮我做个类似 Jira 的东西」稳得多。

## Prompt 里那句「先列文件，我确认再执行」

搭骨架时关键句：

> 请先列出你打算创建的所有文件，我确认后再执行。

大文件批量改动前先审计划，再放行。骨架阶段 AI 甚至主动加了 `repositories/`，说明规范文档里的 Repository Pattern 真被吃进去了。

## 坑比鸡汤值钱：六类高频翻车

| 坑 | 表现 | 根因（作者判断） | 防法 |
|---|---|---|---|
| 库旧 API | 类型错 / 运行时报错 | 训练数据有截止 | 用到第三方库就对照当前文档 |
| async/sync 混用 | `MissingGreenlet`、死锁 | SQLAlchemy 1.x/2.x 写法混装 | 数据库会话代码人工过一遍；用 `async_sessionmaker` + `async with` |
| 过度设计 | 多出用不了的抽象 | AI 爱给「完整方案」 | Prompt 写清「当前阶段不需要 X」 |
| 安全疏漏 | 缺权限 / 枚举攻击 / 硬编码密钥 | 不懂你们业务安全边界 | 安全要求写进 Prompt；数据访问路径人工审 |
| 前端状态乱 | 重复请求、状态分散 | 无全局视图 | 开干前规定状态方案（文中：Context + React Query，禁 Redux） |
| 配置硬编码 | API 地址、密钥进代码 | 演示惯性 | 见字符串就问：该不该进配置 |

Day2 的 JWT / CRUD 这类标准化活，AI 表现最好；Day3 前端拖拽（`@dnd-kit` 旧 API）和部署最脏。作者的修法值得记：**别让 AI「自己再修一轮」旧 API 幻觉**，直接对照官方文档人手改。

## JWT Prompt 为什么好用

安全要求写进需求，而不是事后补：

- bcrypt，明确禁 md5/sha1
- 登录失败统一话术（防用户枚举）
- refresh token 落库，支持主动注销
- 实现顺序：先 `security.py`，再 endpoint

标准化 + 边界写死时，Vibe 最省时间。

## 别把 Vibe 当成魔法

作者讲得很平：Vibe 像雇了一个写得快、但需要你严格把关的初级工程师。需求你说清，输出你审，它翻车时你得知道怎么修。

我现在会这么干：

1. 先写规范再写代码  
2. 先列计划再动文件  
3. 第三方库 API 不信训练记忆  
4. 安全路径必须人审  
5. 分阶段迭代，别一口吃成胖子

## 相关阅读

- [AI 听不懂你，多半是饲料喂错了](/posts/vibe-dual-instruction-design-intent/)
- [还在「会聊天」阶段，就别指望 Vibe 封神](/posts/vibe-chat-to-workflow-system/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/qq_23625847/article/details/161089163)
