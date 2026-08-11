---
title: Cursor 外面那层壳：Oh My Posh 提示符 + 编辑器主题别混层
published: 2026-08-11
description: Shell 提示符、编辑器主题、Vibrancy 毛玻璃是三层；Windows 上 Oh My Posh + Nerd Font 装法与常见翻车对照。
image: ./cover.jpg
tags: [Oh My Posh, Cursor, Windows Terminal, 主题, 美化]
category: 指南
draft: false
lang: ''
slug: oh-my-posh-cursor-skin
pinned: false
comment: true
collections: [csdn-tech-tutorials]
updated: 2026-08-11T11:22:39
sourceLink: https://blog.csdn.net/satangele/article/details/135785794
---

AI 编程工具的「好看」其实分两层：一层是 **Shell 提示符**（Oh My Posh / Starship），一层是 **编辑器 / Claude Code 本体 UI**。CSDN 上大量教程只讲其中一层，叠皮时最容易改 A 期望 B 生效。

这篇把 Windows 上最稳的 Oh My Posh 装法钉死，再补 Cursor 主题入口和液态玻璃那条坑路。

## 层 0：Oh My Posh（终端提示符）

环境参考：Win11 + Windows Terminal + PowerShell 7。

1. 装 Oh My Posh（管理员终端）：

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://ohmyposh.dev/install.ps1'))
```

或 `winget install JanDeDobbeleer.OhMyPosh`。

2. 装 **Nerd Font**（Cousine / Meslo / JetBrainsMono 任一）。没字体就方框乱码，这是第一大坑。

Windows Terminal `settings.json` → `profiles.defaults`：

```json
"font": { "face": "Cousine Nerd Font" }
```

3. PowerShell profile：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
# 若无 profile：New-Item -Path $PROFILE -Type File -Force
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH/markbull.omp.json" | Invoke-Expression
```

| 坑 | 解法 |
|---|---|
| 还在用 oh-my-posh2 的 `Install-Module` / `Set-Theme` | 卸旧模块，改走 winget / 官方 install.ps1 |
| Cascadia 字体方框 | 换任意 Nerd Font |
| Cursor / VS Code 集成终端图标歪 | `terminal.integrated.fontFamily` 写成同一款 Nerd Font |
| PS5 自带广告横幅烦 | 升到 PowerShell 7，Terminal 默认启动改成 pwsh |

Starship 是跨平台轻量替代；主题包数量 Oh My Posh 更多。和 Claude Code 的 statusLine **不是同一个东西**：Posh 管 Shell 提示符，statusLine 管 Claude 输入框下方那条。

## 层 1：Cursor 主题怎么进菜单

Cursor 基于 VS Code，左侧菜单常藏着。改主题：

**文件 → 首选项 → 主题 → 颜色主题**（或先右键顶栏勾上菜单栏）。

别指望搜「Cursor 专用主题市场」才有货，大部分 VS Code 主题能直接用。

## 层 2：液态玻璃 / Vibrancy（好看但脆）

CSDN 文介绍 `illixion.vscode-vibrancy-continued`（旧 EYHN vibrancy 续命版）：给 Electron 窗口打系统毛玻璃补丁，再靠 `workbench.colorCustomizations` 把背景改成半透明 hex（如 `#0a0a0a80`）。

预期内的「惊吓」：

- 弹出 *installation appears to be corrupt* → 补丁改了完整性校验，一般可忽略（原项目 README 也写了）
- Cursor 大版本升级后补丁失效 → 重装扩展 / 重开 Vibrancy
- 对比度崩 → 只开透明不够，必须同步抬前景色饱和度

原文后半付费墙，完整 `settings.json` 色板没能无损抓到。落地时以 GitHub 主题仓 + Vibrancy 文档为准，这里只锁「原理 + 风险」。

## 层 3：settings 里真正管「好看」的键

来自 Cursor 个性化教程的可用骨架（键名按 VS Code 习惯写；原文里部分 `cursor.*` 伪键不可照抄）：

```json
{
  "workbench.colorTheme": "Default Dark Modern",
  "editor.fontFamily": "JetBrains Mono",
  "editor.fontSize": 14,
  "editor.lineHeight": 1.5,
  "editor.bracketPairColorization.enabled": true,
  "editor.minimap.enabled": true,
  "terminal.integrated.fontFamily": "MesloLGS NF",
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.cursorBlinking": true
}
```

## 叠皮顺序（别反着改）

```text
Windows Terminal 字体/亚克力
  → Oh My Posh / Starship（Shell 提示符）
    → Cursor 颜色主题 + editor/terminal 字体
      →（可选）Vibrancy 毛玻璃
        → Claude Code 另算：theme / statusLine / tweakcc
```

Claude Code 的 HUD / ccstatusline 挂在 CC 自己的 `settings.json`，不会吃 Oh My Posh 的主题文件。两边可以长得像一套，但是两份配置。

## 相关阅读

- [Claude HUD 装上以后，才知道自己以前多瞎](/posts/claude-hud-statusbar/)
- [不装插件也能有 statusLine：一段 Python 顶一行 HUD](/posts/native-statusline-script/)

> 素材来源：[CSDN 原文](https://blog.csdn.net/satangele/article/details/135785794)
