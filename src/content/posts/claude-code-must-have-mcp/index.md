---
title: Claude Code 必装 MCP：先三件，再慢慢加
published: 2026-08-11
description: 先全局挂 filesystem / Context7 / GitHub，跑稳再按栈加；一次装太多只会噪音和卡死。
image: ./cover.jpg
tags: [MCP, Claude Code, Context7, 推荐, 测评]
category: skill 测评
draft: false
lang: ''
slug: claude-code-must-have-mcp
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://channing.blog.csdn.net/article/details/151584549
---

别一口气装二十个 MCP。先全局挂三件基础，跑稳了再按技术栈加第二、三批。命令侧统一 `-s user` + `npx -y`，装完 `claude mcp list` 验一遍。

## 管理命令

```bash
claude mcp list
claude mcp add <名> -s user -- <启动命令>
claude mcp remove <名>
```

## 第一批（建议先装）

| 服务器 | 命令要点 | 干什么 |
|---|---|---|
| filesystem | `@modelcontextprotocol/server-filesystem` + 目录白名单 | 本地读写，别给整盘 |
| Context7 | `@upstash/context7-mcp@latest` | 库/框架最新文档 |
| Git/GitHub | 官方/社区 GitHub MCP | Issue/PR/协作 |

## 第二批 / 第三批

- **增强**：Sequential Thinking、mcp-run-python、数据库 MCP  
- **按需**：Playwright、Figma、Repomix/DeepWiki、Task Master  

Playwright 用 `@executeautomation/playwright-mcp-server`；Sequential Thinking 用 `@modelcontextprotocol/server-sequential-thinking`。

## 为啥这几件值得先装

| MCP | 值得装的理由 | 原文评分 |
|---|---|---|
| Filesystem | 全栈/数据几乎绕不开 | 5/5 |
| Context7 | 少翻墙查文档，像实时 API 字典 | 5/5 |
| Git/GitHub | 协作与托管项目 | 5/5 |
| Playwright | 前端测/截图/爬取 | 4/5 |
| Sequential Thinking | 复杂规划拆步 | 4/5 |
| 数据库 MCP | 查结构、出 SQL（注意只读/非生产） | 4/5 |
| Figma / Task Master | UI 对齐、脑暴规划 | 3/5 |

## 坑

- 一次装太多 → 资源占满、工具列表噪音大。  
- Windows 上裸 `npx` 可能截断 stdio；要 `cmd /c` 包一层（见 [Windows 上 MCP：先记住 cmd /c](/posts/windows-mcp-json-practice/)）。  
- 密钥走 `env`，别写进仓库；token 打码后再分享配置。

## 相关阅读

- [Windows 上 MCP：先记住 cmd /c](/posts/windows-mcp-json-practice/)
- [MCP、Skills、Plugin 不是三选一](/posts/mcp-skills-plugin-boundaries/)

> 素材来源：[CSDN 原文](https://channing.blog.csdn.net/article/details/151584549)
