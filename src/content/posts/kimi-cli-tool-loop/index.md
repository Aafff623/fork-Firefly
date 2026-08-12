---
title: 工具失败还在原参数重试：掐断 Kimi 死循环
published: 2026-08-04
updated: 2026-08-04T22:15:00
description: 截图验证里 Read 连环 failed，多半不是宿主坑：模型不记失败，默认循环上限又太松。收紧 loop_control，提示词写清失败即停。
image: ./cover.jpg
tags: [Kimi, CLI, 死循环, Agent, 工具调用]
themeTags: [循环控制, 截图验证, 失败即停]
category: Agentic Coding
collections: [tool-kimi-code]
draft: false
lang: ""
slug: kimi-cli-tool-loop
pinned: false
comment: true
author: threetwoa
---

用 Kimi Code CLI 做截图验证时，很容易撞上同一出戏：Read 一批 PNG 失败后，界面反复刷 "Read 4 files · failed"，参数纹丝不动，直到你手动 Esc。这不是偶发，换到 Claude Code 挂同一模型也会复现——根子不在宿主兼容，而在**工具失败后的策略**。

相关阅读：[对话与回路：Harness / Loop 笔记](/posts/vibe-coding-tips-index/)。同站还有一篇 Claude → OpenCode / Kimi 迁移笔记（`claude-migration-opencode-kimi`，目前仍是草稿，链接后补）。

## 现象：同一参数的死循环

典型触发是截图验证：

- 要读 `temp\…\*.png` 做视觉核对
- 临时文件生命周期、Windows 路径、权限或同步延迟 → Read 失败
- 模型收到失败后，**不更新「已失败」状态**，继续发完全相同的调用
- 界面连环 failed，直到人打断

同类变体还有：同一批文件反复 grep/sed；auto-compact 后「忘了」失败，又从头循环；长会话里默认循环上限太高，死循环能跑很久。

## 根因：模型策略 + 配置过松

### 模型侧

对照 GitHub Issues（如 #2557、#2142、#1950、#640）和实操观察：

- 工具失败后，仍常发出**参数完全相同**的下一次调用
- 失败结果没进有效记忆，或被当成「再验证一次」的信号
- 上下文压缩后更容易失忆，重新开跑同一循环

官方 changelog 里有过「重复无效工具调用后停轮」一类修复，但模型侧的重复倾向并未消失。

### 配置侧

默认循环控制偏宽：

| 项 | 大致默认 | 体感 |
|---|---|---|
| `max_steps_per_turn` | 已抬到约 1000 | 死循环能拖很久 |
| `max_retries_per_step` | 约 3 | 单步还能再撞几次 |

截图 + `temp\` 路径会放大问题：文件可能已不存在、路径/权限失败、图片字节预算踩线后无限重试；Ralph 循环（`--max-ralph-iterations`）若没停条件，会再放大一轮。

## 怎么掐：配置优先，提示词托底

### 收紧循环控制（优先做）

在 `~/.kimi-code/config.toml`（或项目级配置）写明：

```toml
[loop_control]
max_steps_per_turn = 40          # 建议 30–60，默认 1000 太高
max_retries_per_step = 2         # 建议 1–2
max_ralph_iterations = 0         # 不需要 Ralph 就关掉
```

命令行临时覆盖：

```bash
kimi --max-steps-per-turn 40 --max-retries-per-step 2
```

或环境变量：

```bash
KIMI_LOOP_MAX_STEPS_PER_TURN=40
KIMI_LOOP_MAX_RETRIES_PER_STEP=2
```

改完 `/reload` 或重开会话。

### 提示词写清「失败即停」

任务描述或 `/goal` 里直接写死：

- 同一工具（尤其 Read 图片 / 同一文件）连续失败超过 2 次：停止重试，报告原因并结束本轮，禁止同参再调
- 验证结束就输出结论，别继续啃已失败的截图或临时文件
- `Do not retry identical tool calls with the same arguments after failure.`

官方也建议用 `/goal` 给多步任务一条清晰 finish line；很多人反馈，加上「失败即停」后循环明显少。

### 截图 / 临时文件习惯

- 先 `ls` / `dir` 确认存在，再 Read
- 验证图放到稳定路径，别赌 `temp\` 寿命
- 一旦连环 failed：立刻 Esc / Ctrl-C，新开一轮或明确说「这些已失败，跳过」

### 长会话

- 主动 `/compact` 或开新会话，减轻压缩后遗忘
- CLI 保持较新版本（官方修过无效工具调用无限重试）

## 防循环 checklist

| 场景 | 操作 | 优先级 |
|---|---|---|
| 日常配置 | 收紧 `max_steps_per_turn` / `max_retries_per_step` | 高 |
| 任务提示 | 写入「失败即停」 | 高 |
| 撞上循环 | 立刻 Esc，告诉模型跳过 | 高 |
| 图片验证 | 先确认文件存在再 Read | 中 |
| 临时文件 | 用稳定路径 | 中 |
| 长会话 | `/compact` 或新会话 | 中 |
| 版本 | 升级 CLI 吃官方修复 | 低 |

## 边界

这不是「Kimi 和 Claude 工具不兼容」的单一锅。同一模型挂到别的宿主也会转圈，说明要**模型侧继续改策略 + 用户侧主动拧上限**。步数和重试压下来，再配退出指令与操作习惯，频率会明显下降。

## 出处与边界

| 项 | 说明 |
|---|---|
| 素材 | Knowledge「Kimi-Code-CLI-死循环问题」（仓外留档） |
| 配图 | 素材 `assets/` 当时未随目录落地；封面为本站生成，小节示意图从缺 |
| 非目标 | 不替代官方文档；具体默认值以你本机 CLI 版本为准 |
