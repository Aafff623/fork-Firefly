---
title: 谁在偷偷给我的会话起名？
published: 2026-08-07
description: 会话名没被我改过却一直在变——Claude Code 的 ai-title 自动命名、Stop hook 中文定制、CC Switch 悄悄吃掉 hooks 的坑，以及 claude-hud 标题显示，一次理清。
image: ./cover.jpg
tags: [Claude Code, Hooks, CC Switch, claude-hud]
category: Agentic Coding
draft: false
lang: zh-CN
slug: claude-code-session-auto-title
pinned: false
comment: true
updated: 2026-08-07T07:50:00
---

状态栏里的会话名从「排查 K12 503」变成「agent 评论」，又变成「工作 → 继续」——全程没人 `/rename` 过。翻会话记录才知道，Claude Code 一直在后台偷偷给会话起名，而且这个机制可以接管、可以定制，还能被一堆隐藏配置悄悄毁掉。

## 会话标题是客户端自动改的

Claude Code 会在会话的 jsonl 记录里写一个 `ai-title` 事件，值是后台模型根据对话内容总结出来的 kebab-case 标题。它显示在输入框右侧的 chip 上，也会出现在 `/resume` 列表里。

- 官方文档说「只按首条消息生成一次」，但实测（2.1.223）标题会随工作重心多次更新——这个会话就从「排查 K12 503」自己长成了「agent-collaborator-comments」
- 手动 `/rename` 会写一条 `custom-title`，优先级比自动标题高

核心收获：会话标题 = `custom-title`（手动）优先，`ai-title`（自动）兜底，都在 jsonl 里能直接读写。想自动改名，往 jsonl 写一条 `custom-title` 就行。

## 做成自动中文命名 hook

既然标题是写 jsonl 就能改的，就顺手做了个 Stop hook：每轮对话结束，读你最新一句话，提炼成「给谁 → 干什么」的中文标题。

格式是 A→B：A 是对象（项目/工具），B 是这轮在干什么。实测效果：

| 你说 | 标题 |
|---|---|
| 给 Pi 换个主题 | `Pi → 换个主题` |
| 沉淀记忆做成 hook | `记忆 → 做成hook` |
| 给 Codex 装配新号池 | `Codex → 装配新号池` |
| 把知识笔记发到博客 | `知识 → 发到博客动态` |

关键在「动词核心提炼」——抓动作+宾语，而不是整句截断。踩过的坑：

- 图片引用污染：用户消息里的 `[Image: source:...]` 会混进任务，标题变 `[Image:source:C` 这种鬼东西
- cwd 兜底误取：在插件目录执行命令后，cwd 会取到 `claude-hud/0.6.0` 这种，对象变版本号
- 动词误匹配：「触发」里的「发」会被当成任务动词

Stop hook 还有几个规范坑：无 matcher（每次模型 stop 都触发），工具循环会高频触发所以要按 prompt_id 去重；hook 必须 exit 0 且别往 stdout 打印非 JSON，否则污染状态栏。

## CC Switch 会吃掉你的 hooks

这是最阴的一个坑。CC Switch 切模型时，会用它数据库里的 provider 配置**重写整个 `~/.claude/settings.json`**。自定义 hooks / statusLine 只写在 settings.json 里，切一次模型就没了。

机制分两层：

| 类型 | 行为 | 处理 |
|---|---|---|
| 纯 env 的 provider（gpt k12 等） | 生成 settings.json 走 settings 表的 `common_config_claude` | 把 hooks 注入这个通用配置 |
| 完整配置的 provider（DeepSeek 等） | 用自己的完整 config 覆盖 | 逐个补 hooks |

解法是直接改 `cc-switch.db`：`common_config_claude` + 所有含完整配置的 claude provider 都注入 hooks，切任何模型都带。改 DB 前先备份。

## claude-hud 会话标题看不清

会话标题在状态栏里是最暗的一截——因为 claude-hud 用 `label()` 渲染它，默认色是 DIM 暗色。配置层没有 sessionName 独立色，`colors.label` 全局改又会让 Context、计数、时长全变亮，太花。

只能动源码：给 `sessionName()` 一个恒亮品红，两个渲染文件（compact 的 session-line 和 expanded 的 project-line）都换掉。插件更新会覆盖，得重打。

设计问题值得说：claude-hud 把「装饰性 slogan」做成最醒目的橙色，把「当前在哪个会话」做成最暗的灰色——视觉优先级整个反了。

## 沉淀成闭环

这个主题的完整链路：会话名被自动改（发现）→ 做成 Stop hook（定制）→ CC Switch 防丢（保护）→ claude-hud 高亮（显示）→ 记忆 + blog 动态记录（留存）。每一步的坑都沉淀进了记忆，下次同类问题能直接想到。

经验：Claude Code 的自定义机制（hooks、statusline、自动命名）都绕不开「配置文件会被谁重写」这个问题。配完一套，记得想清楚它活在哪个配置层——settings.json 会变，cc-switch.db 的 common_config 才是 claude 的稳定底座。
