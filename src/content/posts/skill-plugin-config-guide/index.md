---
title: Skill 装不上，多半是目录或多套了一层
published: 2026-08-11
description: Skill 与 Plugin 分工、三条安装路、frontmatter 字段与 marketplace 坑；装完没反应先查路径大小写。
image: ./cover.jpg
tags: [Skills, Plugin, Claude Code, Codex, marketplace]
category: 指南
draft: false
lang: ''
slug: skill-plugin-config-guide
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://island.blog.csdn.net/article/details/161088692
---

Skill 是「结构化提示词 + 可选脚本/参考」；Plugin 是一包能力（可含多个 Skill、commands、`.mcp.json`、hooks）。装单个能力拷目录；装整套工作流再走 `/plugin`。

## 路径

| 级别 | Claude Code | Codex（常见） |
|---|---|---|
| 项目 | `.claude/skills/` | 视客户端文档 |
| 用户 | `~/.claude/skills/` | `~/.codex/skills/` |

坑：`~/.claude/skills/md-polish/md-polish/SKILL.md` 多套一层 → 发现不了。正确是 `.../md-polish/SKILL.md`。

同 Skill 兼 Claude / Codex 时，触发方式要分开写清（`/` vs `$SkillName` 等）。

## 安装三条路

1. **手动拷**完整 Skill 目录（最稳）  
2. **skills.sh / skillsmp**：如 `npx skills add https://github.com/anthropics/skills --skill frontend-design`  
3. **Plugin marketplace**（整包）

```text
/plugin marketplace add anthropic-agent-skills
/plugin install document-skills@anthropic-agent-skills
/plugin search frontend anthropic-agent-skills
/plugin uninstall document-skills
```

## `SKILL.md` 字段（常用）

| 字段 | 作用 |
|---|---|
| name | 技能名（与目录一致） |
| description | 触发条件（最重要） |
| disable-model-invocation | `true` = 禁自动，只手触 |
| user-invocable | 是否允许 `/名` |
| allowed-tools | 工具白名单 |
| argument-hint | 手触参数提示 |
| effort | 工作强度提示 |

## 挑别人 Skill 时看啥

最近是否维护、文档是否写清客户端、触发边界是否清楚。装完没反应：先查路径与文件名大小写，再查 `description` 是否跟你的话对得上。

## 相关阅读

- [Cursor Skills：路径放错等于没装](/posts/cursor-skills-install-paths/)
- [MCP、Skills、Plugin 不是三选一](/posts/mcp-skills-plugin-boundaries/)

> 素材来源：[CSDN 原文](https://island.blog.csdn.net/article/details/161088692)
