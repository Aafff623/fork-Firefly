---
title: GLM-5.2 在 Pi 里 thinking 死循环，问题不在模型，在 provider 配错了
published: 2026-08-06
updated: 2026-08-06T13:51:34
description: Pi 接智谱 GLM-5.2 时 thinking 阶段反复重复 50+ 次、工具调用卡死。根因不是模型不支持 thinking，而是自定义 provider 走了 Anthropic 兼容端点，丢了 GLM 的 Preserved Thinking 协议。换内置 zai-coding-cn 一行配置解决。
image: ''
tags: [Pi, GLM, AI Coding, 死循环, thinking, Provider]
category: Agentic Coding
draft: false
lang: ''
slug: pi-glm-thinking-loop-fix
pinned: false
comment: true
---

用 Pi 接智谱 GLM-5.2 写代码，模型在 thinking 阶段反复重复同一句话 50 多次，工具调用卡住不动。折腾了一圈发现，GLM 本身支持 thinking，问题出在 provider 协议层——自定义的 Anthropic 兼容端点根本不走 GLM 的 thinking 协议。

## 踩坑现场

Pi v0.83.0，自定义 provider `zhipu-anthropic`，端点 `open.bigmodel.cn/api/anthropic`，模型 glm-5.2，thinking level 开 high。

死循环的三种表现：

- thinking 阶段同一句话重复 50+ 次，每轮都生成"我注意到 thinking 又在重复……立即停止"这种自我纠正，但纠正本身也成了重复内容
- 模型在微决策点上反复横跳——"该先确认方案还是直接开干"能重复十几次
- 多轮对话间完全失忆，每轮都从零开始，工具调用卡住输出 "Working..." 但不动

## 根因：provider 协议错配

`models.json` 里 `zhipu-anthropic` 只写了 `reasoning: true`，没有 `thinkingFormat`、没有 `thinkingLevelMap`、没有 `compat`。Pi 拿到 `reasoning: true` 就按标准 Anthropic thinking 协议发请求（`thinking.type: "enabled"` + budget），但智谱的 Anthropic 兼容端点对这个协议支持不完整。

GLM 走的是自己的 **Preserved Thinking** 协议，跟标准 Anthropic thinking 不是一回事：

| | 标准 Anthropic thinking | GLM Preserved Thinking |
|---|---|---|
| 协议标记 | `thinking.type: "enabled"` | `thinkingFormat: "zai"` |
| 状态保持 | 靠 `thinkingSignature` | 靠回传 `reasoning_content` |
| 清除控制 | 无 | `clear_thinking: false` |
| 端点要求 | Anthropic Messages API | OpenAI Completions API |

Anthropic 兼容端点不回传 `reasoning_content`，GLM 每轮都丢失推理状态，等于每次都在"重新思考"，表现为死循环。

这个问题不止 Pi 有。Goose（#7363）、oh-my-pi（#517）、OpenClaw 都踩过同一个坑——只要走 Anthropic 兼容端点 + GLM，就会丢 reasoning state。

## 修复：换 provider，一行配置的事

Pi 内置了 `zai-coding-cn` provider，走 OpenAI 协议，端点 `open.bigmodel.cn/api/coding/paas/v4`，自带完整的 `thinkingFormat: "zai"` + `thinkingLevelMap` + `compat` 配置。

改两个文件：

**`~/.pi/agent/settings.json`**：

```json
{
  "defaultProvider": "zai-coding-cn",
  "defaultModel": "glm-5.2",
  "enabledModels": ["zai-coding-cn/glm-5.2", "..."]
}
```

**`~/.pi/agent/auth.json`**：添加 `zai-coding-cn` 的 key（和 zhipu 用同一个智谱 API key 就行）。

改完重启 Pi，完事。

## 验证结果

修完后跑了 6 轮递进测试——查目录、读组件、分析 CSS、搜关键词、查 session 信息。20 条 assistant 消息、33 次工具调用：

- thinking 零重复，长度 53~6915 chars，和任务复杂度正相关
- 工具调用链健康，无同参数反复调用
- 多轮记忆完整，第 3 轮能引用第 2 轮的结果
- 零报错、零 abort、零超时

## 记住这几点

1. **GLM 支持 thinking，但只在自己的协议下**。走 Anthropic 兼容端点就会丢 reasoning state。
2. **自定义 provider 时 `reasoning: true` 不够**，必须配 `thinkingFormat` 和 `compat`，否则 Pi 会按错误的协议发请求。
3. **优先用 Pi 内置 provider**。`zai`（国际）和 `zai-coding-cn`（国内）已经配好了正确的 thinking 参数，别自己造轮子。
4. **Z.AI 的 Preserved Thinking 是特有协议**，需要 `reasoning_content` 回传 + `clear_thinking: false`，和标准 Anthropic thinking 不兼容。

## 参考

- [Z.AI Preserved Thinking 官方文档](https://docs.z.ai/guides/capabilities/thinking-mode)
- [Pi Discussion #292 — GLM thinking tag leakage](https://github.com/badlogic/pi-mono/discussions/292)
- [oh-my-pi #517 — GLM-5 thinking loops](https://github.com/can1357/oh-my-pi/issues/517)
- [goose #7363 — GLM loses reasoning state](https://github.com/aaif-goose/goose/issues/7363)
