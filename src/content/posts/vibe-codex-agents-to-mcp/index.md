---
title: Codex 想长期好用，得同时拴两根绳子
published: 2026-08-11
description: AGENTS.md 定行为，config.toml 定 MCP 工具面；只读红线双写，换宿主也能复用。
image: ./cover.jpg
tags: [Codex, AGENTS.md, MCP, config.toml, Vibe Coding]
category: 指南
draft: false
lang: ''
slug: vibe-codex-agents-to-mcp
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://artisan.blog.csdn.net/article/details/156578270
---

到 2026，IDE 里接大模型已经不稀奇。真难的是：让它在你仓库里**长期、稳定、可控**，而不是每次从零调教。这篇把路径压成两件事：

- **AGENTS.md**：定「这个 AI 该怎么干活」  
- **MCP（`config.toml`）**：定「它能碰哪些外部工具」

两根绳子一起拴，换项目只改少量上下文；换宿主（Codex ⇄ Claude Code ⇄ Gemini）也能复用同一套行为规范。

## AGENTS.md 写什么才像「长效 System Prompt」

开篇就要钉死角色与目标：技术栈（文中 Java/Spring + Python + Bash）、生产向而非 Demo 向、承认 MCP 存在。后面再叠价值观（KISS/YAGNI、SOLID、防御性编程）、语言习惯、分层职责、测试要求。

真正决定安全上限的，是 **MCP 使用总则**：

1. 先本地推理，再调工具  
2. 调用前用自然语言说明目的  
3. 工具结果必须二次判断，禁止原文转发  
4. 敏感工具默认最小权限 + 只读；dbhub 类严禁写与 DDL  

工具专章可写强顺序，例如 Serena：`Overview → Symbol → Ref → Edit`；System/Files 禁碰核心业务逻辑的物理块编辑。

完整长模板与多语言约束不在这里展开，只留「怎么写、坑在哪」。

## config.toml：怎么配、坑在哪

Codex 常见路径：`~/.codex/config.toml`（IDE 与 CLI 共用）。每个服务一张 `[mcp_servers.<name>]` 表，`command + args` 走 stdio。

文中示例覆盖：

| 服务 | 用途 | 配法要点 |
|---|---|---|
| Context7 | 代码/文档检索 | `npx -y @upstash/context7-mcp`；AGENTS 里规定「先查再答、引用路径摘要」 |
| Serena | 语义级代码导航 | 本地 clone 后用 `uv run … serena start-mcp-server` |
| desktop-commander | 桌面/进程类操作 | 拉长 `startup_timeout_ms`；权限面最大，慎开 |
| dbhub | 多库网关 | DSN 进 args；**务必加只读模式**，并与 AGENTS 双写禁令 |

坑与对策：

- **密钥进仓**：样例文件用 `config.sample.toml`，真 key 留本机  
- **只靠文档约束不够**：dbhub 启动参数与 AGENTS 禁写要双保险  
- **超时**：重 SQL / 大索引把 `startup_timeout_ms` 拉到 10～30s，避免假死  
- **跨工具 JSON**：同套 `mcpServers` 可映射给 Claude Code / gemini-cli；宿主字段名略有差异，以各工具文档为准  

## 绑成可复用工作流

推荐节奏：

1. 对话里写清任务与验收  
2. 先规划，再决定要不要调 MCP  
3. Context7 / dbhub 取证  
4. 改代码或出文档，附差异说明  

团队侧：AGENTS.md + sample 配置进仓；文档加一节「如何用 Codex + MCP」；Code Review 顺带查生成代码是否踩规范（注入方式、异常、日志风格）。

新人上手只需：装好 MCP → 链上项目内 AGENTS / 样例配置 → 按工作流开干。

## 相关阅读

- [Windows 上 MCP：先记住 cmd /c](/posts/windows-mcp-json-practice/)
- [CLAUDE.md 和 AGENTS.md：写给人的 README，不够](/posts/claude-md-agents-md-guide/)

> 素材来源：[CSDN 原文](https://artisan.blog.csdn.net/article/details/156578270)
