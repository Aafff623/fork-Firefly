---
title: Agent 记忆手册：Auto Memory、claude-mem、八策略与跨工具共享
published: 2026-08-12
updated: 2026-08-12
description: 记忆不是无限上下文。对照 Claude Code 内置 Auto Memory 与 claude-mem，八种策略怎么按预算选型，以及 OpenCode / Pi 怎么共享或扩展记忆——含 CC Switch 与 Windows 路径坑。
image: ./cover.jpg
tags: [Claude Code, Agent, OpenCode, Pi, 上下文]
themeTags: [Auto Memory, claude-mem, 记忆策略, junction, policy-only, FTS5]
category: Agentic Coding
collections: [agentic-coding-core, tool-claude-code, tool-pi]
draft: false
lang: ''
slug: agent-memory-playbook
pinned: false
comment: true
---


本文合并自：[`claude-code-memory-auto-vs-claude-mem`](/posts/claude-code-memory-auto-vs-claude-mem/)、[`agent-memory-eight-strategies`](/posts/agent-memory-eight-strategies/)、[`opencode-claude-memory-sharing`](/posts/opencode-claude-memory-sharing/)、[`pi-agent-memory-mechanism`](/posts/pi-agent-memory-mechanism/)。Pi 侧 hermes 扩展已迁移，源帖含历史说明，以现用方案为准。

## 先把问题说清楚

「给 Agent 装记忆」通常在解决三件事里的一件或几件：

1. **跨会话**还记得项目偏好与结论  
2. **长会话**里不把早期约束挤掉  
3. **可检索**地找回旧决策，而不是把全文再喂一遍  

没有免费的无限上下文。换存法、换召回，都会变成账单或工程复杂度。

## Claude Code：便签本还是档案柜？

| | **Auto Memory（内置）** | **claude-mem** |
|---|---|---|
| 形态 | `~/.claude/projects/<project>/memory/`，`MEMORY.md` 索引 | Hooks + SQLite FTS + 向量等，偏「自动档案柜」 |
| 手感 | 透明 Markdown，轻 | 自动沉淀强，链路重 |
| 检索 | 基本靠人 / agent 读文件 | FTS / MCP 深查 |
| 风险 | 不适合海量高频 | 费 token、库膨胀、进程泄漏报道；本地端口曾无鉴权 |
| 中转兼容 | 无强依赖专有压缩后端 | 压缩后端限制严；**任意 OpenAI 兼容 / DeepSeek / CC Switch 常直接不支持** |

索引习惯：`MEMORY.md` 前约 200 行 / 25KB 量级当目录；主题文件按需。装 claude-mem 时注意它可能静默写 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`，让你以为内置「消失了」。

**走 CC Switch / 自建中转：默认留在 Auto Memory，别硬上 claude-mem。** 安全与配额细节见源帖评测。

## 八策略：先看钱袋子

按「会话长度 × 精度 × 预算 × 工程复杂度」选型，可组合：

| 策略 | 一句话 | 主要翻车点 |
|---|---|---|
| 全量 | 全塞上下文 | 账单爆炸 |
| 滑动窗口 | 只留最近 | 早期约束丢 |
| 相关性过滤 | 只留相关段 | 误杀关键句 |
| 摘要压缩 | 中程压缩 | 细节蒸发 |
| 向量库 | 语义召回 | 基建与脏召回 |
| 知识图谱 | 关系域 | 贵、重 |
| 分层记忆 | 热/温/冷 | 工程复杂 |
| 类 OS 换页 | 按需换入 | 实现成本高 |

实用叠法：窗口管当下 + 摘要管中程 + 向量管远距召回；图谱只留给真有关系网络的域。Skill 再漂亮，记忆选型错了也是在噪声里干活。

## OpenCode：把同一套 Auto Memory 接过来

compaction（会话压缩）≠ Auto Memory（跨会话沉淀）。插件 `opencode-claude-memory` 复用 Claude 那套 Markdown 目录，不另起一套库。

工具侧常见：`memory_list` / `search` / `read` / `save` / `delete`。安装后改 `opencode.json` 挂 plugin，**完全重启**再验。

**Windows 坑**：同一仓库解析出两条 project 路径（例如 blog vs Firefly）→ 空目录误判「没记忆」。用 **junction** 指到真源目录。验证三层：配置识别 → 工具可读 → 跨工具写读互通；测完记得整理 `MEMORY.md` 索引。

内容归位建议：

- 规则 → AGENTS / CLAUDE / CONTEXT  
- 偏好与结论 → Auto Memory  
- 素材 → Knowledge  
- 成文 → posts  

## Pi：默认失忆，扩展补长期记忆

原生：会话 jsonl，`/resume` `/fork`，无跨会话检索。长期记忆靠扩展。

历史：hermes 记忆扩展因破坏多行粘贴等问题已卸；现侧重点看 **observational-memory** 一类方案（以你机器当前装的为准）。源帖保留 hermes 三层（工作内存 / 会话 / MEMORY·USER·failures）与 FTS5 搜索作机制参考。

设计上值得抄的两点：

1. **policy-only**：只注入记忆策略说明，不灌全文 → 省 token，召回带概率  
2. **Standing / pin**：少量每会话必带的硬约束（条数与字数要设顶，禁止 agent 自提权）  

和 Claude 同步记忆时：格式、容量、注入策略都不同——要**重组织**，不是文件一拷了之。

## 选用决策树

```text
主要宿主是 Claude Code？
 ├─ 是，且走 CC Switch / 杂牌中转 → Auto Memory，别上 claude-mem
 ├─ 是，官方/兼容压缩后端，且真要自动档案柜 → 再评估 claude-mem（盯磁盘与端口安全）
 └─ 还要 OpenCode 同记 → 共享 Markdown 目录 + 注意 Windows junction

主要宿主是 Pi？
 └─ 原生不够 → 装当前维护中的记忆扩展；学 policy-only，别整库灌进提示词

只是「会话太长」？
 └─ 先滑动窗口 + 摘要，再谈向量；别一上来上图谱
```

## 落地清单

1. 写清宿主与中转链路，再挑产品，而不是先装再后悔。  
2. Auto Memory：养好 `MEMORY.md` 索引，主题文件别堆成垃圾桶。  
3. 跨工具：先对齐 project 路径，再谈「共享成功」。  
4. 任何「无限记忆」宣传，翻译成：换存法 + 你付的 token / 磁盘 / 运维。  

导流旧帖仍保留评测数据、安装命令与警告原文。
