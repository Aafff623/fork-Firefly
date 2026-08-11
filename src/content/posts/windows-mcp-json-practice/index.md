---
title: Windows 上 MCP：先记住 cmd /c
published: 2026-08-11
description: Windows 用 npx 起 MCP 必须 cmd /c 包一层；scope、八件实用服务与手写 .mcp.json 怎么拼。
image: ./cover.jpg
tags: [MCP, Windows, mcp.json, Claude Code, 配置]
category: 指南
draft: false
lang: ''
slug: windows-mcp-json-practice
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/weixin_63132747/article/details/160740050
---

官方明确说过：Windows 用 `npx` 起 MCP 时，要用 `cmd /c` 包一层，否则 stdio 管道会被命令解释器截断。这是本机最常见的「装了但连不上」。

## 传输与 scope

| 传输 | 场景 |
|---|---|
| stdio | 本地进程（默认，本文重点） |
| SSE | 远程长连接（旧路径，新接入慎用） |
| HTTP / streamable-http | 远程无状态 / 规范推荐名 |

| scope | 落盘 | 是否进 Git |
|---|---|---|
| local | 项目 `.mcp.json` | 通常不提交 |
| project | 项目 `.mcp.json` | 可提交共享 |
| user | `~/.claude/settings.json` → `mcpServers` | 仅本机 |

user：`claude mcp add / list / remove`；`-e` 传环境变量，`-H` 传 HTTP 头。

## 八件实用 MCP（Windows 命令形态）

| 名 | 要点 |
|---|---|
| filesystem | 白名单根目录，别给 `C:\` |
| memory | 跨会话知识图谱；和 `CLAUDE.md` 分工：规则 vs 事实 |
| git | `uvx mcp-server-git` 或 `python -m mcp_server_git` |
| github | Token 进 `env`，权限收紧到 repo/read:org |
| postgres | 连接串；只读 SELECT，别接生产写库 |
| puppeteer | 首次拉 Chromium，国内可能慢 |
| fetch | HTML→Markdown |
| brave-search | API Key；旧包可能归档，可换 `@anthropic-ai/brave-search-mcp-server` |

## 手写 `.mcp.json` 何时划算

批量改多台机器、或 CLI 一行写烦时，直接编 JSON 与 `claude mcp add` 等价。注意逗号/引号；密码与 token **只放本机**，入库前打码。

路径速查：

- 项目：`项目根\.mcp.json`
- 用户：`C:\Users\<用户>\.claude\settings.json` 的 `mcpServers`

## 和「必装推荐」怎么拼

清单选型看 [Claude Code 必装 MCP：先三件，再慢慢加](/posts/claude-code-must-have-mcp/)；Windows 可跑命令形态以本篇表格为准。

## 相关阅读

- [Claude Code 必装 MCP：先三件，再慢慢加](/posts/claude-code-must-have-mcp/)
- [Codex 想长期好用，得同时拴两根绳子](/posts/vibe-codex-agents-to-mcp/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/weixin_63132747/article/details/160740050)
