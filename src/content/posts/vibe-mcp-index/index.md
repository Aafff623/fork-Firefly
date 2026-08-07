---
title: MCP 薄笔记：协议与业务位
published: 2026-08-04
updated: 2026-08-04T22:00:00
description: 从 Vibe 40* 抽出 MCP 专稿与 04 定位段：STDIO/SSE、Spring AI、ReAct 工具链；面试与扩展清单另见他帖。
tags: [Vibe Coding, MCP, 教程索引]
themeTags: [索引摘要, 鱼皮, ai-guide]
category: Agentic Coding
collections: [review-skill-mcp]
draft: false
lang: ""
slug: vibe-mcp-index
pinned: false
comment: true
author: threetwoa
sourceLink: https://ai.codefather.cn/vibe
image: ./cover.jpg
---

鱼皮 [Vibe Coding 教程](https://ai.codefather.cn/vibe) 的「40 编程学习 / 进阶」目录里文件不少，但 **和 MCP 强相关的正文很薄**：Dedicated 专稿就 **《MCP 服务开发》** 一篇，另 **《04 AI 编程技术》** 里有一段 MCP 在 AI 业务里的定位。这篇只做 MCP 切片索引，不 mirror 全文，也不把 06 面试题、简历模板那些灌水进来。

[40 编程学习 · GitHub 目录](https://github.com/liyupi/ai-guide/tree/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/40%20%E7%BC%96%E7%A8%8B%E5%AD%A6%E4%B9%A0) · [Vibe 在线阅读](https://ai.codefather.cn/vibe) · [ai-guide 仓库](https://github.com/liyupi/ai-guide)

## 怎么读这张薄地图

| 你想 | 建议 |
|---|---|
| 从零写 MCP（Java / Spring AI） | 直接读 **MCP 服务开发** |
| 搞清 MCP 在企业 AI 业务里站哪 | **04 AI 编程技术** 的 MCP + ReAct 段 |
| 在 Cursor / Cherry Studio 接 MCP | MCP 服务开发第四节；现成 MCP 清单看 [编程工具索引](/posts/vibe-coding-tools-index/) 的 10 扩展 |
| 面试被问 MCP 八股 | 原文 **06 面试题**，本篇刻意不收 |

40* 里 **没有** 第二篇 MCP 长文；想装 Context7、GitHub MCP、Chrome DevTools MCP 等，材料在 **10 编程工具** 板块，本站已有 [vibe-coding-tools-index](/posts/vibe-coding-tools-index/)。

## MCP 服务开发

鱼皮这篇是 40* 的 MCP 主菜：讲清 Model Context Protocol（Anthropic 开放标准）、客户端—服务器架构，并以 **面试鸭搜题 MCP** 走通服务端 + 客户端。

**STDIO（本地）**：Spring AI `spring-ai-mcp-server-spring-boot-starter`，禁用 Web、`stdio: true`，`@Tool` 暴露业务能力，`ToolCallbackProvider` 注册；客户端用 `mcp-servers-config.json` 拉起 JAR，ChatClient 挂 `defaultTools`。

**SSE（远程）**：`spring-ai-mcp-server-webflux-spring-boot-starter`，独立端口，适合远程部署。

**用起来**：Cherry Studio / Cursor 等填 MCP JSON 即可；成品可提交 [MCP.so](https://mcp.so) 类市场。开源参考：[mcp-mianshiya-server](https://github.com/yuyuanweb/mcp-mianshiya-server)。

[![MCP 服务端](./images/cite-mcp-server.jpg)](https://ai.codefather.cn/library/2010991320544776194)

[原文 · AI 导航](https://ai.codefather.cn/library/2010991320544776194) · [原文 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/40%20%E7%BC%96%E7%A8%8B%E5%AD%A6%E4%B9%A0/MCP%20%E6%9C%8D%E5%8A%A1%E5%BC%80%E5%8F%91.md)

## 04 AI 编程技术（只摘 MCP 相关）

长文讲 Spring AI / LangChain4j、RAG、多模态、ReAct 等；**和 MCP 直接相关的就三块**：

1. **Spring AI 核心能力**列表里含 MCP 支持（接入与开发）。
2. **「MCP 服务」专节**：MCP = 给 AI 用的标准化外部服务；要学「接别人的」和「写自己的」；提到 mcpify.ai 一句话生成 MCP。
3. **ReAct 智能体**：工具调用可走 Function Call 或 **MCP**（检索、文件、终端等）。

这里是概念地图，**不含 Spring 配置细节**——写代码仍回上一节《MCP 服务开发》。

[![MCP 业务位](./images/cite-mcp-biz.jpg)](https://ai.codefather.cn/library/2010991312495906818)

[原文 · AI 导航](https://ai.codefather.cn/library/2010991312495906818) · [原文 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/40%20%E7%BC%96%E7%A8%8B%E5%AD%A6%E4%B9%A0/04%20AI%20%E7%BC%96%E7%A8%8B%E6%8A%80%E6%9C%AF.md)

## 收录与排除

### 收录（MCP 强相关）

| 源文件 | 本站摘要 |
|---|---|
| `MCP 服务开发.md` | 架构、STDIO/SSE、Spring AI 实战、Cherry Studio、MCP.so |
| `04 AI 编程技术.md`（MCP 段） | 业务定位、Spring AI 能力、ReAct 与 MCP |

### 排除（40* 同夹，非本切片）

| 源文件 | 排除原因 |
|---|---|
| `06 AI 应用开发面试题.md` | 面试刷题；可能含 MCP 考点，不扩进索引 |
| `01 编程学习路线.md` | 编程导航导流，无 MCP 正文 |
| `02 编程知识百科.md` | 百科系列入口，无 MCP 专节 |
| `03 编程资源大全.md` | 产品导航，无 MCP |
| `05 AI 绘图指南.md` | 绘图，无关 |
| `07`～`11`、番外 | 简历 / 成长 / 工具大全等，无关 |
| `AI 编程技术栈速查.md` | 全文无 MCP 关键词 |

### 范围外（易混淆，不在 40*）

| 位置 | 说明 |
|---|---|
| `10 编程工具/10 优质 AI 编程扩展推荐` | MCP 服务器大清单（Context7、GitHub MCP 等）→ [编程工具索引](/posts/vibe-coding-tools-index/) |
| `20 项目实战` 部分项目 | 实战里会用 MCP，属项目帖非 40 概念 |

## 出处与边界

| 项 | 说明 |
|---|---|
| 原作 | 程序员鱼皮 · [ai-guide](https://github.com/liyupi/ai-guide) · [AI 导航 / Vibe](https://ai.codefather.cn/vibe) |
| 本篇 | **薄索引** + 精炼摘要；步骤与代码以原文为准 |
| 呈现 | 封面 + 模块小长条配图；步骤与代码以原文为准 |
| 对照 | 结构对齐 [OpenClaw 索引](/posts/openclaw-tutorial-index/)，章节数远少于 OpenClaw |
| 相关阅读 | [入门坐标](/posts/vibe-basics-index/) · [工具栈三岔](/posts/vibe-coding-tools-index/) · [对话与回路](/posts/vibe-coding-tips-index/) · [OpenClaw 索引](/posts/openclaw-tutorial-index/) |
