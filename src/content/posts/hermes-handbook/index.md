---
title: Hermes Agent 完全手册：七层装修到无限记忆
published: 2026-08-11
updated: 2026-08-12
description: Hermes 别只装个壳：从七层装修走到无限记忆的实装笔记。
image: ./cover.jpg
tags: [Hermes, Agent, 记忆, AI Coding]
category: Agentic Coding
collections: [agentic-coding-core]
draft: false
lang: ''
slug: hermes-handbook
pinned: false
comment: true
---

这篇是 **Hermes Agent 专题**。

---

## 七层装修到无限记忆

> 合并自原帖 `hermes-handbook`

很多人装完 Hermes，还是在对话框里当聊天机器人用。David André 那套讲法更狠：Agent 是一台要 7×24 跑的独立电脑，要从 VPS、入口、打扫、备份、看板、记忆一路装到暴露成 MCP。他自己靠 Agent 把 Vectl 做到约 **$155k ARR**，月 API 账单约 **$6k-10k**；钱砸得出去，是因为 harness 配全了，不是因为会多问两句 prompt。

![7 Levels of Hermes Agent](./images/hermes-agent-seven-levels/fig-01-seven-levels.jpg)

### 梯子先看全貌

| Level | 在补什么 | 没做到时的症状 |
|---|---|---|
| L1 基础设施 | 独立 VPS、常开 | 本机关机 Agent 就死 |
| L2 聊天工具 | Discord 等 Gateway 派活 | 只能守在终端前 |
| L3 Curator | 废 skill 过期清理 | 上下文塞爆、越用越蠢、烧钱 |
| L4 cron | `.hermes` 定时私有备份 | 磁盘一炸，记忆归零 |
| L5 Kanban | 多角色并行看板 | 人肉串任务，扩不动 |
| L6 Holographic Memory | 本地结构化长期记忆 | 硬塞上下文 / 朴素 RAG 不够用 |
| L7 MCP 服务器 | 给 CC / Codex / Pi 当后端 | Hermes 困在自己壳里 |

本篇是 **Hermes 运维层级总览**。文末附录是斜杠命令速查，别拿附录当主菜。

### L1-L2：先有常开电脑，再有派活入口

**L1**：别钉在自己笔记本上。上 VPS（文中例：Hostinger KVM2，可同机 Hermes + OpenClaw + n8n + Web），SSH + 官方一行安装，目标是 7×24。

**L2**：Gateway 接到 Discord / Slack / Telegram / WhatsApp / iMessage / Teams / 邮件。Discord 里典型反馈链：`@` Bot → 👀 → ✅。随时丢活，隔天回来收报告。这才叫「入口」，不是「再开一个聊天窗」。

### L3：Curator 不开，skill 会反噬

Hermes 会自我进化、生 skill。短期爽，长期把上下文撑爆，模型变蠢，API 账单给废 skill 买单。

| 动作 | 口径 |
|---|---|
| 标 stale | 约 30 天 |
| 删除 | 约 90 天 |
| 例行命令 | `hermes update` · `hermes curator status` |

Curator 是运维岗，不是装饰开关。消息端也能 `/curator status|run|pin|archive`，和附录里那条对得上。

### L4：凌晨备份，PAT 收紧

每日 **3am** 把 `.hermes` 推到**私有** GitHub；令牌用 fine-grained PAT，别甩一把全能 token。

落地姿势：用人话让 Agent 写脚本 → 注册 cron → 自己跑一轮验证。备份没验过，等于没备份。终端里 `/cron` 就是摸定时任务的入口。

### L5：多 Agent 靠看板，不靠吼

角色例：Researcher / Writer / Reviewer / Analyst；任务在 To Do → Done 上并行。文中 4-task pipeline：围着「无审查 AI」选题，吐出 3 个视频概念。

David 的判断很直：未来要管几百个 Agent；**谁先解决管理问题，谁才碰得到规模**。单 Agent 聊天窗扩不出团队。双端都能敲 `/kanban <action>`。

### L6：记忆四档，Holographic 偏本地

| 档位 | 做法 | 痛点 |
|---|---|---|
| 新手 | 几乎不存 | 每轮从零 |
| 硬塞上下文 | 全扔进 prompt | 贵、慢、易糊 |
| 朴素 RAG | 向量召回 | 结构化与矛盾检测弱 |
| Holographic | 本地全息式记忆 | 要单独 setup，但隐私友好 |

插件名你会听到：Honcho / Mem0 / OpenViking / Super Memory。文中更推 **Holographic**：本地、无 API key、少外泄。入口：`hermes memory setup`。

实战向场景：视频元数据、赞助跟踪、VPS 自检、矛盾检测、跨主题洞察。通用「八策略怎么选」另有笔记（待发布）；这里只定 Hermes 这一层该上哪一档。

### L7：把自己暴露成 MCP

Hermes 当 MCP 服务器，给 Claude Code / Codex / Pi 调用：壳在外面，记忆与文件在 Hermes 侧。

| 场景 | 干什么 |
|---|---|
| 远程审批闸门 | 敏感动作先过你确认 |
| 走开模式推送 | 人不盯终端也能收进展 |
| 跨工具按需查 | 记忆 / 对话 / 文件按需拉，不整库灌 |

「MCP ≠ Skills」那篇讲层位（同批草稿 [`mcp-handbook`](/posts/mcp-handbook/)）；本层讲的是 **Hermes 如何成为被调用的那一端**。改完 MCP 配置记得 `/reload-mcp`。

### 旗舰模型才配得上这套 harness

便宜小模型扛不住复杂 agentic harness：指令长、工具多、状态机深，省下来的模型费会从翻车和重跑里吐回去。文中口径：上 **Opus 4.7 / GPT-5** 这一档旗舰。

真正拉开差距的，往往不是多会写一句 prompt，而是有没有一支 **7×24 在线的 AI 团队**（机器常开 + 入口 + 打扫 + 备份 + 看板 + 记忆 + 可被别的工具调用）。

### 附录：斜杠命令双端一张表

Hermes 同时吃 CLI 和消息端，斜杠却不全一样。需要时翻表，别凭记忆猜「这条消息端有没有」。

![Hermes Agent 斜杠命令速查](./images/hermes-agent-seven-levels/fig-02-slash-commands.jpg)

| 标签 | 含义 |
|---|---|
| **双端** | CLI + 消息都能用 |
| **终端** | 仅终端 |
| **消息** | 仅消息端 |

#### 会话流程（最高频）

| 范围 | 命令 | 用途 |
|---|---|---|
| 双端 | `/new` 或 `/reset` | 新建会话 |
| 终端 | `/clear` | 清屏 + 新会话 |
| 双端 | `/status` | 会话摘要 |
| 双端 | `/retry` | 重试上一轮 |
| 双端 | `/undo` | 移除上次交流 |
| 双端 | `/compress` | 压缩上下文 |
| 双端 | `/rollback [N]` | 恢复检查点 |
| 双端 | `/background <prompt>` | 独立会话运行 |
| 双端 | `/steer <prompt>` | 运行中引导 |
| 双端 | `/stop` | 停止运行中工作 |
| 终端 | `/sessions` · `/branch` · `/handoff` | 切换 / 分支 / 转平台 |

#### 配置、工具、信息（挑着用）

| 范围 | 命令 | 用途 |
|---|---|---|
| 双端 | `/model` · `/personality` · `/fast` · `/reasoning` · `/voice` | 改行为 |
| 双端 | `/yolo` | 跳过危险审批（慎用） |
| 终端 | `/tools` · `/skills` · `/cron` · `/browser` | 装完之后最常摸 |
| 双端 | `/curator` · `/kanban` · `/reload-mcp` · `/reload-skills` | 和七层运维对得上 |
| 双端 | `/usage` · `/insights` · `/help` | 查用量与帮助 |
| 消息 | `/start` · `/approve` · `/deny` · `/update` · `/restart` | 消息端专属 |

翻表时记住三件：前缀匹配（`/mod` → `/model`）；装上的 skill 会变成 `/<skill-name>`；Quick commands 写在 `config.yaml`。

---

## 官方坐标与补强备注

记忆层不要一上来就上「无限」：先定保留策略与检索入口，再谈扩容。
