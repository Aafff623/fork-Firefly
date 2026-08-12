---
title: Codex 实践手册：50 条心法与 AGENTS + MCP 双绳
published: 2026-08-12
updated: 2026-08-12
description: 把 Codex 高强度实践要点与「AGENTS.md 管行为、config.toml 管 MCP」双绳收成一篇。Chat/Work/Codex 模式分工见姊妹篇。
image: ./cover.jpg
tags: [Codex, Agent, MCP, AGENTS.md]
themeTags: [Plan, 验收标准, dbhub, startup_timeout]
category: Agentic Coding
collections: [agentic-coding-core, csdn-tech-tutorials]
draft: false
lang: ''
slug: codex-practice-playbook
pinned: false
comment: true
---

本文合并自：[`codex-practice-50-tips`](/posts/codex-practice-50-tips/)、[`vibe-codex-agents-to-mcp`](/posts/vibe-codex-agents-to-mcp/)。模式选型见 [`chatgpt-work-codex-modes`](/posts/chatgpt-work-codex-modes/)。OSS 羊毛申请另文，不并入。

## 实践心法（压缩）

- 目标写**结果**，不写过程散文  
- 先 Plan，再改码；验收标准写进任务  
- AGENTS.md 管行为边界；额度按任务池分配  
- 模型分级：简单/复杂分开打，别全程旗舰  

完整 50 条场景表回源帖。

## 双绳：行为 + 连接

1. **AGENTS.md**：团队规矩、禁止项、输出格式  
2. **`config.toml` MCP**：外联工具；dbhub 等只读优先，防双写事故  
3. 密钥用 sample / env，勿进库  
4. `startup_timeout_ms` 调到 10–30s，慢 MCP 别秒杀  

## 落地清单

1. 新仓先 AGENTS，再挂 MCP。  
2. 每条任务带验收。  
3. 想清 / 出片 / 改代码——先看模式姊妹篇。  
