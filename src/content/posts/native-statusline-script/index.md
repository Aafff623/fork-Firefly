---
title: 不装插件也能有 statusLine：一段 Python 顶一行 HUD
published: 2026-08-11
description: 原生 statusLine.command + 自写脚本：模型、分支、上下文条与 Token；适合只要油表、不要 transcript 的场景。
image: ./cover.jpg
tags: [Claude Code, statusLine, Python, Token, 美化]
category: 指南
draft: false
lang: ''
slug: native-statusline-script
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/qq_35167821/article/details/161290328
---

会话拖久了模型开始忘事，你需要一眼知道该不该 `/compact`。不想装 Claude HUD / ccstatusline 时，原生 `statusLine.type: "command"` + 自己的脚本就够用。

效果长这样：

```text
deepseek-v4-pro[1m] | enterprise_entry_ana (master) | █░░░░░░░░░ 19% | ↑1155.2k ↓76.6k tokens
```

模型名 · 目录 · Git 分支 · 上下文条 · 输入/输出 Token。

## 核心就一段 settings

路径：`~/.claude/settings.json`。`statusLine.command` 里塞一段 `python3 -c "..."`，从 stdin 读 JSON，stdout 打一行。

字段常用这些：

| JSON 路径 | 用途 |
|---|---|
| `model.display_name` | 当前模型 |
| `cwd` | 工作目录（取 basename） |
| `context_window.used_percentage` | 进度条 |
| `context_window.total_input_tokens` / `total_output_tokens` | Token 计数 |
| git（自己 `subprocess`） | 当前分支 |

## 怎么配好看一点

- 进度条宽度 10 格就够，别整 40 格挤爆窄终端
- Token 用 `1.2k` 这种缩写，别裸奔六位数
- 分支查不到就空着，别让脚本抛异常把整条 statusLine 搞没
- `git -C cwd` 加 `timeout=2`，大仓库别卡刷新（官方大约 300ms 一轮）

也可用官方 `/statusline` 自然语言生成脚本，再按上面字段改。

## 坑

| 坑 | 说明 |
|---|---|
| Windows 上 `python3` 找不到 | 改成 `py -3` 或绝对路径 |
| JSON 字段为 null | 首次发消息前用量常是 0 / 空，先发一轮再看 |
| 内联 `-c` 转义地狱 | 维护时用外部 `.py`，`command` 只写 `python path/to/statusline.py` |
| env 里写真 Key | 入库前打码；分享配置前换成占位符 |
| 和 HUD / ccstatusline 冲突 | `statusLine` 只能挂一个 command |

手写脚本的上限很清楚：拿不到 transcript 里的工具 / Agent 活动。要那些，换 HUD；要 Powerline 组件库，换 ccstatusline。这段 Python 适合「只要油表和模型名」。

## 相关阅读

- [Claude HUD 装上以后，才知道自己以前多瞎](/posts/claude-hud-statusbar/)
- [ccstatusline：不想解析 JSON 时，用 TUI 拼状态栏](/posts/ccstatusline-custom/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/qq_35167821/article/details/161290328)
