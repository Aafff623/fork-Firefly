---
title: pi 的脸也是能整的：主题挑一个，状态栏挑一个，别贪
published: 2026-08-06
updated: 2026-08-06T11:34:54
description: pi 默认那张脸能用但想换。美化分两类：主题是 JSON 颜色方案，多装互不影响；状态栏是 TS 扩展，抢 footer 渲染权只能装一个。记录 Catppuccin + pi-inline-statusline 的最稳组合，以及两个真坑：glm 系列不支持 thinking、enabledModels 会反噬默认模型。
image: ""
tags: [Pi, 美化配置]
themeTags: [pi-coding-agent, Catppuccin, pi-inline-statusline, theme, statusline, enabledModels, GLM-5.2]
category: Agentic Coding
collections: [tool-pi]
draft: false
slug: pi-theme-statusline-setup
pinned: false
comment: true
---

手里 AI 编程工具越堆越多，pi 的脸算是这批里最朴素的：默认 `dark` 主题黑得发灰，底部一条光秃秃的状态栏。这画风跟它那套「primitives, not features」的极简内核倒是统一，但看久了确实想换换。

折腾一圈下来最核心的认知就一句：**pi 的美化分两类，主题随便装、状态栏只能装一个，搞反了就打架。** 这篇记一下装什么、怎么踩的坑，给同样想给 pi 整容的人抄作业。

## 主题和状态栏，根本不是一回事

pi 官方把美化拆成两块，机制完全不同，装法、共存性也截然相反。一开始没搞清这个分工，看清单上二十个包很容易犯选择困难。

| 维度 | 主题（Theme） | 状态栏 / UI 扩展（Extension） |
|---|---|---|
| 本体 | 一个 JSON，定义 51 个颜色 token | 一个 TS 模块，订阅事件渲染 footer |
| 共存 | 多装互不影响，切换用 | 抢 footer 渲染权，**装两个就打架** |
| 切换 | `/settings` 或改 `theme` 字段 | 装上就生效，`/reload` |
| 热重载 | 编辑当前主题文件自动重载 | 改源码后 `/reload` |
| 入口 | `~/.pi/agent/themes/*.json` 或 package | `~/.pi/agent/extensions/` 或 package |

记住这个分工，后面所有选择都不纠结了：**主题像换壁纸，想换就换、想留几个备着都行；状态栏像装输入法，同时装两个会互相抢权。**

## 装什么：两步到位的最稳组合

本来拿来一份二十个美化包的清单（主题包 + 状态栏扩展两大类），第一反应是不信——AI 编的包名十有八九是幻觉。结果逐个去 npm 查，居然全是真包，而且都带 `pi-package` 关键字，是货真价实的 pi 专用。这点得记一笔，下次别再重复验。

真要落地不用贪，先装最稳的一对把脸换掉：

- **主题挑 `@sherif-fanous/pi-catppuccin`** —— Catppuccin 是公认最护眼的配色，社区维护活跃，一次带四个变体（Mocha / Macchiato / Frappe / Latte），深浅全覆盖。
- **状态栏挑 `pi-inline-statusline`** —— 单行、响应式、信息不丢，默认 Tokyo Night 预设就很好看，零配置即用。

这套组合的好处是**互不冲突、立刻见效、不喜欢能干净卸**。激进派想一步到位也可以上 `@rokiy/pi-ui`（带 Boxed Editor 那个 ╭─╮ 包裹），但它和状态栏是二选一，第一轮不建议冒险。

装完跑起来长这样，底部一行信息密度恰到好处，又不挤：

![实拍：Catppuccin Mocha + pi-inline-statusline 跑起来的样子](./images/statusline-real.png)

## 真正值得记的，是这两个坑

装主题本身没坑，`pi install npm:xxx` 一条命令就进 `settings.json` 的 `packages` 数组。真正让我翻车的，是后面优化时踩的两个配置坑。

### 坑一：glm 系列压根不支持思考

zhipu 全家桶（glm-4-flash / glm-5-turbo / glm-5.2）在 `pi --list-models` 里 thinking 列全是 `no`。给它们设 `defaultThinkingLevel` 不会报错，但也不会触发——静默浪费。

正确做法不是设全局思考级别，而是**按场景切模型**：日常留 glm-5.2 省钱，遇到复杂任务 `Ctrl+P` 切到支持思考的备选。我在 `enabledModels` 里配了这几个，都是带思考的：

| 模型 | 什么时候切过去 |
|---|---|
| `deepseek/deepseek-v4-pro` | 推理 / 代码强，复杂调试 |
| `google/gemini-3-pro-preview` | 要看图 / 多模态 |
| `kimi-coding/k3` | 长上下文 coding |
| `minimax/MiniMax-M3` | 1M 上下文，读长文档 |

> 关于 pi 怎么把 adapter / subagents / memory 三包补齐内核能力的，可以看[这篇开荒记](/posts/pi-coding-agent-setup)。这篇只讲脸。

### 坑二：enabledModels 会反噬默认模型

这个坑最隐蔽。`enabledModels` 一旦设置，就**接管**了 `Ctrl+P` 的循环列表，列表里没有的模型切不过去。第一次配的时候只列了四个备选，没把默认的 glm-5.2 加进去——结果切到 deepseek 就切不回来了，状态栏的模型名直接换走，人傻了。

修复就一条铁律：**配 enabledModels 时，默认模型必须放进数组，而且放第一位**。

```json
"enabledModels": [
  "zhipu-anthropic/glm-5.2",
  "deepseek/deepseek-v4-pro",
  "google/gemini-3-pro-preview",
  "kimi-coding/k3",
  "minimax/MiniMax-M3"
]
```

## 配完长什么样

下面是最终跑起来的 `settings.json`，删掉了和美化无关的字段，只留视觉相关的几行。一张表看完整配置思路：

| 字段 | 值 | 作用 |
|---|---|---|
| `theme` | `catppuccin-mocha` | Catppuccin 最深款，护眼 |
| `packages` | 含 catppuccin + inline-statusline | 一个管颜色，一个管 footer |
| `externalEditor` | `code --wait` | `Ctrl+G` 弹 VS Code 写长 prompt |
| `enabledModels` | 5 个（含默认） | `Ctrl+P` 循环切换，默认在内 |

## 几个能继续挖的方向

美化到这儿只是开了个头，pi 还有一堆没碰的能力，列出来下次有兴致再挖：

- **shell-aliases** —— 自定义快捷命令，`c` 直接等于 `git commit` 那种
- **keybindings** —— 改键位，把不顺手的快捷键挪地方
- **prompt-templates** —— 常用 prompt 存成模板，`/template` 一键调
- **Boxed Editor 外观** —— `@rokiy/pi-ui` 那套一体化 UI，但要替换现在的状态栏

这些都没装，等主题和状态栏用顺手了再决定要不要继续往上堆。**美化这事最怕一次堆太多，出了问题都不知道是哪个包的锅。**

## 一条速查

| 想做的事 | 怎么做 |
|---|---|
| 装包 | `pi install npm:<包名>` |
| 卸包 | `pi remove npm:<包名>` |
| 换主题 | `/settings` 或改 `"theme"` 字段 |
| 换状态栏预设 | `PI_STATUSLINE_PRESET=classic pi`（默认 tokyo-night） |
| 切模型 | `Ctrl+P`（受 `enabledModels` 限制） |
| 外部编辑器 | `Ctrl+G`（走 `externalEditor`） |
| 完全回滚 | 还原备份的 `settings.json.bak.*` |
