---
title: Claude HUD 装上以后，才知道自己以前多瞎
published: 2026-08-11
description: 把上下文、额度、工具与子 Agent 钉在输入框下；Essential / Full / Minimal 怎么选，Usage 为什么会空白。
image: ./cover.jpg
tags: [Claude Code, statusLine, claude-hud, 美化, 上下文]
category: 指南
draft: false
lang: ''
slug: claude-hud-statusbar
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://javaguide.blog.csdn.net/article/details/161505668
---

聊着聊着回复突然变蠢，回头一看上下文快满了；跑到一半被限流，才发现 5 小时额度早见底；子 Agent 到底在干嘛，只能盯着日志翻。Claude HUD 干的事就一件：把这些数字钉在输入框下面，不用敲 `/context`。

项目：[jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud)

## 它比官方 statusLine 多了啥

官方 `statusLine` 每 ~300ms 把一段 JSON 从 stdin 喂给你指定的脚本，你自己解析再打印。HUD 就是把这个脚本写好了，还多读了 transcript JSONL（工具调用、子 Agent、Todo）。

| 你能看到 | 默认 | 开扩展后 |
|---|---|---|
| 模型 / 路径 / Git | 有 | 路径可到 2～3 层，Git 带脏标记 |
| Context + Usage 进度条 | 有 | 可加 7 天用量、时长、费用 |
| 工具活动 / Agent / Todo | 关 | Full 预设全开 |

上下文绿→黄→红，就是最直白的「该 `/compact` 了」。

## 怎么装才不踩雷

Claude Code ≥ v1.0.80，Node 18+ 或 Bun。

```text
/plugin marketplace add jarrodwatts/claude-hud
/plugin install claude-hud
/reload-plugins          ← 漏了会 Unknown skill
/claude-hud:setup
```

装完**重启** Claude Code（statusLine 启动时加载）。

| 坑 | 现象 | 解法 |
|---|---|---|
| 忘 `/reload-plugins` | setup 报 Unknown skill | 先 reload 再 setup |
| Linux `/tmp` 跨盘 | `EXDEV: cross-device link` | `TMPDIR=~/.cache/tmp claude` 再装 |
| Windows 找不到 runtime | setup 失败 | `winget install OpenJS.NodeJS.LTS`，重开终端 |
| API Key / Bedrock 用户 | Usage 行不出现 | 正常：只有订阅账户才有 `rate_limits` |
| 临时想看原生界面 | HUD 挡视线 | `CLAUDE_HUD_DISABLE=1 claude` |

## 怎么配好看

日常用 **Essential**；长任务 / 多 Agent 用 **Full**；小屏用 **Minimal**。交互配置：`/claude-hud:configure`（可预览）。

- `language: "zh"` 中文标签
- `lineLayout: "expanded"` 多行；窄终端改 `compact`
- `pathLevels: 2` 路径别只剩最后一级
- `display.showTools / showAgents / showTodos` 按场景开
- `customLine` 可挂欢迎语 / 格言（本站 Windows 美化帖里用过）
- 颜色支持色名 / 256 色 / `#rrggbb`，阈值到了用醒目红

## 和本站现有美化帖怎么叠

本站 [Claude Code Windows 美化](/posts/claude-code-windows-beautify/) 已经用 HUD + tweakcc + 终端毛玻璃叠了一套。这边补的是「插件侧怎么选预设、哪些开关值钱、Usage 为什么空白」。Windows 上注意 `statusLine.command` 外层必须是 bash 语法，Node 路径会变（nvm），HUD 静默消失就先查这两处。

## 什么时候别开 Full

信息太多也会吵。单文件小改、窄终端、或者你根本不跑 subagent，Essential / Minimal 更合适。Usage 对中转 API 用户本来就没有，别为了凑齐两行进度条硬开。

## 相关阅读

- [ccstatusline：不想解析 JSON 时，用 TUI 拼状态栏](/posts/ccstatusline-custom/)
- [不装插件也能有 statusLine：一段 Python 顶一行 HUD](/posts/native-statusline-script/)

> 素材来源：[CSDN 原文](https://javaguide.blog.csdn.net/article/details/161505668)
