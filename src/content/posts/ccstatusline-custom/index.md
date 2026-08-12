---
title: ccstatusline：不想解析 JSON 时，用 TUI 拼状态栏
published: 2026-08-11
description: 和 HUD 同管道、定位不同：50+ 组件 + Powerline + 交互 TUI；statusLine 同时只能挂一个 command。
image: ./cover.jpg
tags: [Claude Code, ccstatusline, statusLine, Powerline, 美化]
category: 指南
draft: false
lang: ''
slug: ccstatusline-custom
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://aidev.blog.csdn.net/article/details/161186514
---

和 Claude HUD 走同一条原生 `statusLine` 管道，定位不一样：HUD 强在工具 / Agent / Todo 活动；ccstatusline 强在 **50+ 组件 + Powerline 皮肤 + 交互式 TUI**，更像「Claude Code 版 Oh My Posh」。

原版：[sirmalloc/ccstatusline](https://github.com/sirmalloc/ccstatusline) · 中文版：[huangguang1999/ccstatusline-zh](https://github.com/huangguang1999/ccstatusline-zh)

## 先装再挂进 settings

国内建议先换 npm 镜像（旧淘宝域名已废）：

```bash
npm config set registry https://registry.npmmirror.com
npm install -g ccstatusline-zh
```

也可用 `x install ccstatusline`（x-cmd）。

`~/.claude/settings.json`（Windows：`%USERPROFILE%\.claude\settings.json`）：

```json
{
  "statusLine": {
    "type": "command",
    "command": "ccstatusline-zh",
    "padding": 0
  }
}
```

不想全局装就用 `npx -y ccstatusline-zh@latest`。改完重启 Claude Code。

## 配好看：TUI 比手写 YAML 省事

```bash
ccstatusline-zh setup
```

| 键 | 干什么 |
|---|---|
| ↑↓ / Enter | 导航、确认 |
| a / d / e | 增删改组件 |
| w | 组件选项 |
| / | 搜索 |
| q | 退出 |

第一次别全开。够用的三件套：

1. 当前模型
2. 上下文占用率（油表）
3. Git 分支

上下文习惯：50% 随便聊；逼近 80% 就准备 `/compact` 或开新会话。第二行可以再挂思考力度、输入/输出速度、会话累计 Token。

Powerline 模式在「主菜单 → Powerline 设置」。分隔符用 `|` 最干净，花哨符号看心情。

## 和 Claude HUD 怎么选

| | Claude HUD | ccstatusline |
|---|---|---|
| 安装 | 插件市场 | npm / x-cmd |
| 杀手锏 | transcript：工具 / Agent / Todo | 组件库 + Powerline + TUI |
| 配置 | `/claude-hud:configure` 或 config.json | `setup` TUI / YAML |
| 更适合 | 盯 Agent 干活 | 盯 Token / 成本 / 外观 |

`statusLine` 同一时间只能挂一个 command。想换皮就改 `command` 字段，别两套配置叠着写指望都生效。

## 坑

- npm 官方源慢：先换 npmmirror，别用废弃淘宝域名
- 原版与 `-zh` 包名别混；TUI 语言跟包走
- 和 HUD 互斥：改 `settings.json` 的 `statusLine.command` 即切换
- 它不会让模型变聪明，只是把你本来要敲命令查的东西摊在底下

## 相关阅读

- [Claude HUD 装上以后，才知道自己以前多瞎](/posts/claude-hud-statusbar/)
- [不装插件也能有 statusLine：一段 Python 顶一行 HUD](/posts/native-statusline-script/)

> 素材来源：[CSDN 原文](https://aidev.blog.csdn.net/article/details/161186514)
