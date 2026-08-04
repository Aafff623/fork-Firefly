---
title: 对话与回路：Harness / Loop 笔记
published: 2026-08-04
updated: 2026-08-04T22:00:00
description: Vibe「30 经验技巧」方法论索引：心法、上下文、Harness、Loop、成本与迁移，与 OpenClaw 落地互补。
tags: [Vibe Coding, 教程索引, Harness, Loop Engineering]
themeTags: [索引摘要, 鱼皮, ai-guide]
category: Agentic Coding
draft: false
lang: ""
slug: vibe-coding-tips-index
pinned: false
comment: true
author: threetwoa
sourceLink: https://ai.codefather.cn/vibe
image: ./cover.jpg
---

鱼皮 Vibe Coding 教程里，「30 经验技巧」是最该当工具书翻的一栏：心法、对话、上下文、Harness、Loop、成本控制都在这儿。全搬进博客没意义；这篇按原目录立标题、每章给能带走的摘要，原文链回 AI 导航 / 开源仓。和本站 [OpenClaw 索引](/posts/openclaw-tutorial-index/) 互补——那边偏养虾落地，这边偏怎么驾驭 AI 做项目。

[原文 · Vibe Coding 系列（鱼皮 AI 导航）](https://ai.codefather.cn/vibe) · [GitHub · liyupi/ai-guide · 30 经验技巧](https://github.com/liyupi/ai-guide/tree/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7)

## 怎么读这篇

| 你想 | 建议 |
|---|---|
| 刚做完第一个 Demo，老被 AI 带偏 | 00 总览 → 01 心法 → 02 对话 → 03 上下文 |
| 项目越做越乱、修 Bug 越修越多 | 04 幻觉 → 06 质量 → 07 重构 → **Harness** |
| 账单吓人、长对话烧 token | **10 成本控制** + 05 效率 |
| 想少盯着 AI、让它自己跑完 | **Loop Engineering**（Harness 搭好再上） |
| 大规模重构 / 技术栈迁移 | **AI 大规模代码迁移** |

摘要基于公开正文提炼，不是逐字搬运。

## 00 经验技巧总览

板块定位：从「能做」到「做好」。主线分思维基础、核心技能、质量保障、实战进阶；支线收录 Harness / Loop 等前沿方法论。

[原文 · 00 经验技巧总览 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/00%20Vibe%20Coding%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7%E6%80%BB%E8%A7%88.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 01 五大核心心法

Planning is Everything、MVP、迭代优于完美、上下文是王道、产品经理思维。规划五分钟常能省返工半小时；Plan Mode 值得养成习惯。

[![心法](./images/cite-mindset.jpg)](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/01%20Vibe%20Coding%20%E4%BA%94%E5%A4%A7%E6%A0%B8%E5%BF%83%E5%BF%83%E6%B3%95.md)

[原文 · 01 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/01%20Vibe%20Coding%20%E4%BA%94%E5%A4%A7%E6%A0%B8%E5%BF%83%E5%BF%83%E6%B3%95.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 02 对话工程技巧

从「一次性完美提示词」转向迭代式对话：逐步澄清、让 AI 提问补洞，双向探索比单向咒语靠谱。

[![对话工程](./images/cite-dialog.jpg)](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/02%20Vibe%20Coding%20%E5%AF%B9%E8%AF%9D%E5%B7%A5%E7%A8%8B%E6%8A%80%E5%B7%A7.md)

[原文 · 02 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/02%20Vibe%20Coding%20%E5%AF%B9%E8%AF%9D%E5%B7%A5%E7%A8%8B%E6%8A%80%E5%B7%A7.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 03 上下文管理技巧

项目 / 功能 / 对话三层上下文；README、TODO、Rules 文件当长期记忆；一对话一任务，失忆就 summarize 或开新窗。

[![上下文](./images/cite-context.jpg)](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/03%20Vibe%20Coding%20%E4%B8%8A%E4%B8%8B%E6%96%87%E7%AE%A1%E7%90%86%E6%8A%80%E5%B7%A7.md)

[原文 · 03 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/03%20Vibe%20Coding%20%E4%B8%8A%E4%B8%8B%E6%96%87%E7%AE%A1%E7%90%86%E6%8A%80%E5%B7%A7.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 04 幻觉和死循环处理

识别编造 API、同错三遍；完整贴报错；果断切断上下文；TypeScript / 测试 / 让 AI 自验可防坑。

[原文 · 04 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/04%20Vibe%20Coding%20%E5%B9%BB%E8%A7%89%E5%92%8C%E6%AD%BB%E5%BE%AA%E7%8E%AF%E5%A4%84%E7%90%86.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 05 效率提升技巧

模型分级、禁废话输出、并行 Agent / Worktree、多开实例、快捷键、MCP / Skills 封装重复活。与 10 成本控制大量重叠，可按需跳读。

[原文 · 05 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/05%20Vibe%20Coding%20%E6%95%88%E7%8E%87%E6%8F%90%E5%8D%87%E6%8A%80%E5%B7%A7.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 06 代码质量保障

Lint / 测试 / Review 体系；和 Harness 的反馈机制、架构护栏是一套东西的不同讲法。

[原文 · 06 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/06%20Vibe%20Coding%20%E4%BB%A3%E7%A0%81%E8%B4%A8%E9%87%8F%E4%BF%9D%E9%9A%9C.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 07 代码重构技巧

识别 AI 堆出来的意大利面与技术债；小步重构、提取组件，别等完全不能动再收拾。

[原文 · 07 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/07%20Vibe%20Coding%20%E4%BB%A3%E7%A0%81%E9%87%8D%E6%9E%84%E6%8A%80%E5%B7%A7.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 08 性能优化技巧

从用户体感找瓶颈；让 AI 做 profiling 导向优化，而不是盲目堆缓存。

[原文 · 08 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/08%20Vibe%20Coding%20%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%E6%8A%80%E5%B7%A7.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 09 安全防护技巧

API Key 别进仓库和前端；环境变量；SQL / XSS / CSRF；发布前安全检查清单。

[原文 · 09 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/09%20Vibe%20Coding%20%E5%AE%89%E5%85%A8%E9%98%B2%E6%8A%A4%E6%8A%80%E5%B7%A7.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 10 成本控制技巧

Token 四类计费、输出比输入贵、长对话隐性翻倍；模型分级；Plan 先审再写；`@` 精确引用、`/summarize`、分阶段新对话；团队预算上限。和 OpenClaw 13 记忆成本可对照读。

[![成本控制](./images/cite-cost.jpg)](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/10%20Vibe%20Coding%20%E6%88%90%E6%9C%AC%E6%8E%A7%E5%88%B6%E6%8A%80%E5%B7%A7.md)

[原文 · 10 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/10%20Vibe%20Coding%20%E6%88%90%E6%9C%AC%E6%8E%A7%E5%88%B6%E6%8A%80%E5%B7%A7.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 11 团队协作技巧

统一 Rules / Git 流程 / 共享 Skills；避免多人各 vibe 各的风格。

[原文 · 11 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/11%20Vibe%20Coding%20%E5%9B%A2%E9%98%9F%E5%8D%8F%E4%BD%9C%E6%8A%80%E5%B7%A7.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 12 网站美化技巧

七招去 AI 味儿：配色、排版、动效、真实素材；别默认蓝紫渐变。

[原文 · 12 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/12%20Vibe%20Coding%20%E7%BD%91%E7%AB%99%E7%BE%8E%E5%8C%96%E6%8A%80%E5%B7%A7.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## Harness Engineering 保姆级教程

**Agent = 模型 + Harness。** 五模块：上下文架构、执行能力、任务编排、反馈机制、架构护栏。瓶颈常在环境不在模型；OpenAI 小团队靠 Harness 上百万行代码的案例在这篇里讲透了。

[![Harness](./images/cite-harness.jpg)](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/Harness%20Engineering%20%E4%BF%9D%E5%A7%86%E7%BA%A7%E6%95%99%E7%A8%8B.md)

[原文 · Harness · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/Harness%20Engineering%20%E4%BF%9D%E5%A7%86%E7%BA%A7%E6%95%99%E7%A8%8B.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## Loop Engineering 保姆级教程

Prompt → Context → Harness → **Loop**：设计可验证停止条件 + 反馈闭环 + 状态文件，让系统代替你逐步提示 Agent。Boris / Peter 都在推这个范式；Harness 没搭好就上 Loop 容易空转烧钱。

[![Loop](./images/cite-loop.jpg)](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/Loop%20Engineering%20%E4%BF%9D%E5%A7%86%E7%BA%A7%E6%95%99%E7%A8%8B.md)

[原文 · Loop · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/Loop%20Engineering%20%E4%BF%9D%E5%A7%86%E7%BA%A7%E6%95%99%E7%A8%8B.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## AI 大规模代码迁移方法

Anthropic 六步迁移法：验证 → 规则手册 → 试跑 → 全量翻译（翻译 / 找茬 / 修复 Agent）→ 编译 / 行为对齐循环。核心：**改流程不改单点代码**；审查与实现必须隔离对话。

[原文 · 代码迁移 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/AI%20%E5%A4%A7%E8%A7%84%E6%A8%A1%E4%BB%A3%E7%A0%81%E8%BF%81%E7%A7%BB%E6%96%B9%E6%B3%95.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 鱼皮的 AI 工作流分享

热点监控、图文创作、编程、客服法务、NL2SQL、视频元信息——重复劳动沉淀为 Skills；monthly 十亿 token 量级的真实工作流样本。

[原文 · 工作流 · GitHub](https://github.com/liyupi/ai-guide/blob/main/Vibe%20Coding%20%E9%9B%B6%E5%9F%BA%E7%A1%80%E6%95%99%E7%A8%8B/30%20%E7%BB%8F%E9%AA%8C%E6%8A%80%E5%B7%A7/%E9%B1%BC%E7%9A%AE%E7%9A%84%20AI%20%E5%B7%A5%E4%BD%9C%E6%B5%81%E5%88%86%E4%BA%AB.md) · [Vibe 系列入口](https://ai.codefather.cn/vibe)

## 方法论怎么串

| 层次 | 本栏对应 | OpenClaw 索引侧重 |
|---|---|---|
| 对话 / 上下文 | 01–04 | 07 初始化、08 模型、13 记忆 |
| Harness | Harness 文 + 06–07 | 10 Skills、09 工具、14 安全 |
| Loop | Loop 文 | 11 定时、12 多 Agent |
| 成本 | 10 + 05 | 13 记忆与成本控制 |
| 远程执行 | — | 安装、IM 接入、部署 |

## 出处与边界

| 项 | 说明 |
|---|---|
| 原作 | 程序员鱼皮 · [ai-guide](https://github.com/liyupi/ai-guide) · [Vibe Coding](https://ai.codefather.cn/vibe) |
| 本篇 | 索引 + 精炼摘要；步骤以原文为准 |
| 呈现 | 章节小长条配图 + 表格 + 原文链接 |
| 相关阅读 | [入门坐标](/posts/vibe-basics-index/) · [工具栈三岔](/posts/vibe-coding-tools-index/) · [MCP 薄笔记](/posts/vibe-mcp-index/) · [OpenClaw 索引](/posts/openclaw-tutorial-index/) |
| 未做 | 不镜像全文、不搬运图床 |

部分章节 AI 导航暂无独立 `library` ID，深链以 GitHub 为准，并挂 [Vibe 系列总入口](https://ai.codefather.cn/vibe)。
