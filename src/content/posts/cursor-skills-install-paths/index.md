---
title: Cursor Skills：路径放错等于没装
published: 2026-08-11
description: Skills 不是 Rules。项目 / 全局 / openskills 路径与命名硬规则；别塞进内置 skills-cursor 区。
image: ./cover.jpg
tags: [Cursor, Skills, 安装路径, openskills]
category: 指南
draft: false
lang: ''
slug: cursor-skills-install-paths
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/qq_20236937/article/details/158284199
---

Skills 不是 Rules。Rules 管「项目约定」；Skills 管「某类任务怎么做」，由模型按上下文选用。核心仍是文件夹 + 全大写 `SKILL.md`。

## 该放哪

| 路径 | 作用域 |
|---|---|
| `.cursor/skills/` | 项目（Cursor 标准） |
| `.claude/skills/` | 项目（Claude / openskills 默认） |
| `.agent/skills/` | 多代理（`openskills --universal`） |
| `~/.cursor/skills/` | 全局 Cursor |
| `~/.claude/skills/` | 全局 Claude |

别塞进 `~/.cursor/skills-cursor/`（内置区）。`.cursor` 必须和 `package.json` / `src` 同级，别埋进 `src`。

## 命名硬规则

1. 文件夹 kebab-case，且与 YAML `name` 一致  
2. 文件名必须是 `SKILL.md`（全大写）  
3. `description` 写「做什么 + 何时用」，带对话里会提到的关键词  

## 三种装法

1. **openskills（推荐批量）**  
   `npm i -g openskills` → `openskills install anthropics/skills` → `openskills sync`  
   `--global` → `~/.claude/skills/`；`--universal` → `.agent/skills/`；`-y` 跳过确认。  
   国内拉 GitHub 常要代理，或手动下载后 `openskills install ./本地路径`。
2. **GitHub 直接拷目录**到上述 skills 路径。  

`openskills` 可能生成根目录 `AGENTS.md` 索引——方便模型扫可用能力，不是必须手写。

## 和 Claude 路径怎么共用

同一份 `SKILL.md` 标准写法可跨 Cursor / Claude；装到哪取决于你用哪个 host。团队仓库优先项目级 `.cursor/skills/`（或 junction 到 `.claude/skills/`，看本仓治理约定）。

## 相关阅读

- [Skill 装不上，多半是目录或多套了一层](/posts/skill-plugin-config-guide/)
- [Cursor 规则别瞎塞：三层各管各的](/posts/cursor-rules-three-layers/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/qq_20236937/article/details/158284199)
