---
title: MCP、Skills、Plugin、CLI：叠层边界与加载排障
published: 2026-08-12
updated: 2026-08-12
description: 不是三选一。MCP 管连接、Skills 管方法、CLI 管执行、Plugin 管打包。这篇合并边界定义、选型图、Skill 省 Token、SOP 入罐，以及 Claude Code 插件 skill 不显示的目录坑。
image: ./cover.jpg
tags: [MCP, Skills, Plugin, CLI, Claude Code, Agent]
themeTags: [边界, Token, SOP, marketplace, junction, 渐进披露]
category: Agentic Coding
collections: [agentic-coding-core, review-skill-mcp, tool-claude-code, csdn-tech-tutorials]
draft: false
lang: ''
slug: mcp-skills-boundaries-guide
pinned: false
comment: true
---


本文合并自：[`mcp-skills-plugin-boundaries`](/posts/mcp-skills-plugin-boundaries/)、[`mcp-vs-skills-layers`](/posts/mcp-vs-skills-layers/)、[`mcp-skills-cli-relationship`](/posts/mcp-skills-cli-relationship/)、[`claude-plugin-skill-loading`](/posts/claude-plugin-skill-loading/)、[`skill-design-cut-tokens`](/posts/skill-design-cut-tokens/)、[`sop-to-skill`](/posts/sop-to-skill/)。测评长案例与企业口述细节仍回源帖。

## 一层一句话

| 层 | 管什么 | 类比 | 缺它时的症状 |
|---|---|---|---|
| **MCP** | 怎么接到外部工具 / 数据 | USB-C / 插头 | 够不着库、API、浏览器 |
| **Skills** | 怎么把事做稳、可复用 | 说明书 / 菜谱 | 每次重讲 SOP，质量漂移 |
| **CLI** | 本机安装、命令、调试手脚 | 手和脚 | 环境装不上、脚本跑不动 |
| **Plugin** | 怎么打包分发（可含 skills / mcp / hooks / agents） | 应用商店包 | 别人装不全、版本对不齐 |

它们是**叠层**，不是互替。问句只有一句：**缺的是插头，还是菜谱，还是手脚，还是整包快递？**

## 协同怎么叠

典型流水线：

1. **CLI** 把环境、依赖、本地命令跑通  
2. **MCP** 接上知识库 / 浏览器 / 云 API  
3. **Skills** 规定查什么表、风险口径、输出模板  
4. 需要给别人一键装 → 打成 **Plugin**（可内嵌 `.mcp.json`、skills、commands、hooks）

周报类任务：MCP 负责「连上库和搜索」；Skills 负责「表结构、风险段、语气」；CLI 负责「本地脚本与排障」。别问「MCP 和 Skills 谁更强」。

### 选型速查

| 场景 | 优先 |
|---|---|
| 外联数据 / 工具 | MCP |
| 稳定复用 SOP、希望自动唤起 | Skills |
| 本地命令 / 文件 / 环境 | CLI |
| 整包交付、marketplace | Plugin |
| 要独立上下文深挖 | 子代理（≠ Skill） |

Skill 路径常见：`~/.claude/skills/`、项目 `.claude/skills/`、插件内 `skills/`。`description` 决定自动唤起；可用 `disable-model-invocation: true` 改成仅手触。渐进披露：元数据常驻，正文与脚本按需加载。

MCP 侧：stdio + Streamable HTTP；**独立 SSE 已废**；scope 分 local / project / user。

## 写 Skill：省 Token 比「写全」更重要

每次调用都会把 Skill 正文灌进上下文——越全越好往往等于越胖越贵。

四原则：**精简、精准、结构化、复用共享**。

五改法（方向，别迷信百分比）：

1. 砍重复背景  
2. 结构化骨架（标题 / 清单 / 输入输出契约）  
3. 短指令代替散文  
4. 公共 schema 上提到父规则（AGENTS / CLAUDE / CONTEXT）  
5. 示例留 2 个短代表，删掉观光向长文  

写前三问：这段每次都要注入吗？能上提吗？删示例还懂吗？拆多 Skill 时边界和共享契约要写清，否则只是把账单拆成多张。

## SOP → Skill：罐的是隐性经验

企业护城河很少是「又换了个更强模型」，而是老师傅脑子里那套可重复判断。模型像电，公司偏好像变压器，Skill 才是电器。

两类资产：

- **能力提升型**：模型一升级就贬值，少囤  
- **编码偏好 / 组织口令 / 现场判别**：持久，优先入罐  

入罐骨架要可执行：观察 → 预警 → 动作 → 升级条件（例如同类三次升级）。撬隐性知识：别逼人写论文；找顺风口的人；口径是 augment 不是 replace；先要 80% 可重复；每个 Skill 留 1–3 组真实 I/O。

完整口述案例与「本周三件事」清单见 [`sop-to-skill`](/posts/sop-to-skill/)。

## Claude Code：插件 Skill 不显示？多半是目录

高频坑（不是「没装上」）：

1. **`/reload-skills` 只扫本地**，不管插件 → 用 **`/reload-plugins`**  
2. reload 摘要里「0 skills」常只统计 `commands/`，**不计** `skills/`  
3. 插件发现：**只认** `skills/<名>/SKILL.md` **一层**；分类二级目录会 miss  
4. `plugin.json` 显式 skills 数组 + marketplace `source` 指根：文档盲区，部分版本加载失败  
5. 铁证：软链 / junction 进 `~/.claude/skills/<名>` 能显示，同插件未链的不行  

Windows 实用解法：junction 链到用户 skills 目录（升级后重建）。长期应让作者压平一层或去掉踩坑的显式数组。

排查顺序：本地 skills → 插件 cache → `plugin.json` 路径 → 对照一层结构的正常插件 → `/reload-plugins`。

## 落地清单

1. 画清四层：外联 / 方法 / 手脚 / 打包，各写一句「本项目谁负责」。  
2. 新 Skill 先过 Token 三问，再挂 marketplace。  
3. 插件不显示时，先查目录层级与 reload 命令，别重装十遍。  
4. 测评与企业案例继续看合集 [`review-skill-mcp`](/collections/review-skill-mcp/)。  

源帖已改为导流页，图示与长命令仍挂在原 slug。
