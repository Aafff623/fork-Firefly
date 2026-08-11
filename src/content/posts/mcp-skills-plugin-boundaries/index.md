---
title: MCP、Skills、Plugin 不是三选一
published: 2026-08-11
description: MCP 管触及、Skill 管用得像样、Plugin 管打包分发；选型按需叠层，别硬二选一。
image: ./cover.jpg
tags: [MCP, Skills, Plugin, Claude Code, 边界]
category: 指南
draft: false
lang: ''
slug: mcp-skills-plugin-boundaries
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/qq_44202160/article/details/161696233
---

很多人把 MCP、Skills、Plugin 当成并列扩展手段，选型时硬选一个。其实它们叠了三层：MCP 管「能否触及」，Skill 管「用得是否像样」，Plugin 只管「怎么打包给人装」。

## 谁解决什么

| 层 | 解决啥 | 类比 |
|---|---|---|
| MCP | 连外部工具/数据 | USB-C |
| Skills | 流程手册，按需加载 | 操作说明书 |
| Plugin | 打包分发 | 应用商店安装包 |

Plugin 是容器，里面可以塞 Skills、`.mcp.json`、commands、hooks；Skill 读手册；MCP 开通道。缺一层事就做不全，但单干一个 Skill 时没必要硬套插件壳。

## MCP：连接层

- 传输：**stdio**（本地）+ **Streamable HTTP**（远程）。独立 SSE 已废弃，新接入别再写 `sse`。
- 配置：`claude mcp add` 或手写 `.mcp.json`。
- 作用域：`local` / `project` / `user`。

MCP 只负责接通；怎么用好那条连接，是 Skill 的事。

## Skills：能力层

- 一个文件夹 + `SKILL.md`（YAML + 正文）。
- **`description` 决定会不会被自动唤起**：写糊了等于白装。
- slash command 已并入 Skills：`.claude/commands/deploy.md` 与 `.claude/skills/deploy/SKILL.md` 都会注册 `/deploy`。
- 可手动 `/skill-name`；只想手触、别自动：`disable-model-invocation: true`。
- 路径：`~/.claude/skills/` · `.claude/skills/` · 插件内 `skills/`。
- 渐进披露：元数据常驻，正文与脚本用到才加载。

Skill ≠ 子代理：子代理另起上下文；Skill 是塞给当前 agent 的说明书。

## Plugin：分发层

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json    # 只有清单在这里
├── commands/
├── skills/
├── agents/
├── hooks/
└── .mcp.json
```

何时上 Plugin：已经攒了一组 Skill + MCP，要给团队一键装。单个 Skill 或一条 MCP，直接放就行。

## 选型怎么判

1. 要摸外部系统 → MCP  
2. 要固定流程、恰当时机自己上 → Skill  
3. 只要手动快捷 → Skill（命令式轻量写法）  
4. 要整包交付 → Plugin  
5. 要独立上下文/工具集 → 子代理，别拿 Skill 硬顶  

常见误会：Skills 与 MCP 二选一（其实常并用）；Skill 只能自动触发；slash 与 Skill 两套机制；还在用已废弃 SSE；插件目录放错。

## 相关阅读

- [Skill 装不上，多半是目录或多套了一层](/posts/skill-plugin-config-guide/)
- [Claude Code 必装 MCP：先三件，再慢慢加](/posts/claude-code-must-have-mcp/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/qq_44202160/article/details/161696233)
