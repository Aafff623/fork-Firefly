---
title: pi 开荒之后：命令是快捷键，工具是仪表盘
published: 2026-08-09
updated: 2026-08-09T12:31:51
description: 承接 pi 开荒补产出层：六个斜杠命令当快捷键、三个工具当仪表盘。记下 session 信息走 ctx 拿、model.id 是裸 id、git 工具要 cwd 参数化三个坑，以及"结构对不等于值对"的验收教训。
image: ./cover.jpg
tags: [Pi, AI Coding, extension, prompt-template, tool]
themeTags: [pi, extension, prompt-template, registerTool, pi_env, blog_context, assess_change, 命令快捷键]
category: Agentic Coding
collections: [tool-pi]
draft: false
lang: ""
slug: pi-extension-commands-tools
pinned: false
comment: true
---

上一篇 [pi coding agent 开荒](/posts/pi-coding-agent-setup/) 把接入层补完了：MCP 借 adapter、子 agent 借 subagents、记忆借 hermes，全是"缺啥借啥"。可开荒完回头看，有个更扎眼的缺口没动过——**能接的都接了，能固化的一个没固化**。高频操作还在靠口头触发 skill，看环境还得手搓四五条 bash 拼上下文。这一篇就是补"产出层"：六个斜杠命令当快捷键，三个工具当仪表盘。

## 盘点完才发现：prompts 三处全空

对照 pi 官方文档列的六种扩展能力，本机现状一目了然：

| 扩展维度 | 现状 | 一句话 |
|---|---|---|
| custom provider | 5 家 provider、9 个启用模型 | 超额，接得很爽 |
| skill | 175 个躺平在三个目录 | 海量，但全靠口头触发 |
| pi package | 消费 5 个，自建 0 个 | 只进不出 |
| **prompt template** | 三个目录全不存在 | 🔴 完全空白 |
| **extension** | 只有 1 个 rtk.ts，只用了事件钩子 | 🟡 单一 |
| theme | 用着别人打的 catppuccin | 够用，不折腾 |

之前优化的重心一直在"输入侧"：接模型、接能力、省 token。而文档给的恰好是"输出侧"：把高频流程固化成命令、把本地信号结构化成工具、把整套配置打包分发。**两者互补不冲突——车改完动力，还缺快捷键和仪表盘。**

## 一份社区指南 + 官方 79 个脚手架

参考了一份把 pi 六种扩展串起来演示的实战指南（bibi-share 的 pi-agent 笔记），套路是拿"代码变更评估"当例子：一个 extension 喂结构化上下文、一个 skill 定评估口径、一个 prompt template 当入口。官方仓库 `packages/coding-agent/examples/extensions/` 里还躺着 79 个现成脚手架，从 `dirty-repo-guard` 到 `structured-output` 都有。

有指南、有脚手架，落差就清楚了：**不是能力不够，是没人把它们固化成"顺手的形态"。**

## 六个斜杠命令：文件名即命令

pi 的 prompt template 机制有个妙处：文件名就是命令，`commit.md` 就是 `/commit`。把成熟 skill 套一层入口文件，高频操作就从"说一句话触发"变成"敲一个斜杠"：

| 命令 | 映射 skill | 干的活 |
|---|---|---|
| `/commit` | commit-commands | 规范化提交，禁止自动 commit |
| `/dynamic` | dynamic-post | 在博客发一条动态，内容当参数 |
| `/extract` | knowledge-extract | 把会话提炼成知识笔记 |
| `/publish` | knowledge-output | 素材发布成博客文章 |
| `/status` | 配合 pi_env 工具 | 看环境全景 |
| `/assess` | 配合 assess_change 工具 | 评估工作区变更 |

命令本身只是"请使用 /skill:xxx"加参数传递，真正的流程在 skill 里——入口轻、逻辑不重复，是这套设计最顺的地方。参数替换支持 `$@`、`${1:-默认值}`，`/dynamic 好心情` 会把"好心情"原样传进去。

## 三个工具：上下文从"跑命令"变"拿 JSON"

命令解决入口，工具解决上下文。以前问"当前环境是什么样"，agent 得跑四五条 bash 自己拼；现在三个工具一次调用返回结构化 JSON：

| 工具 | 一句话 | 触发场景 |
|---|---|---|
| `pi_env` | 会话文件、模型、provider、扩展、包、主题一次打包 | 问环境/会话状态 |
| `blog_context` | 博客 git 状态、文章数、动态数、最近提交 | 博客项目干活时 |
| `assess_change` | diff、变更文件、配置改动、大文件分类 | 评估变更/准备提交 |

核心变化是**agent 拿到的从"零散命令输出"变成"固定结构"**——省掉反复试命令，也避免上下文被一堆输出污染。

## 踩坑三连：都是"想当然"害的

这三个坑几乎每个都是"文档没说、跑起来才发现"，写出来能帮人少走三段弯路：

**① session 信息别读环境变量。** 想当然以为 `process.env.PI_SESSION_FILE` 在扩展里能读，结果返回 null。查了 pi 的类型定义才明白：`PI_*` 变量是 pi 在调 bash 工具时注入的，扩展进程里根本没有。正解是 `ctx.sessionManager.getSessionFile() / getSessionId()`——session 信息在上下文里，不在环境里。

**② `ctx.model.id` 是裸 id。** 想当然以为 `model.id` 是 `provider/model` 这种带前缀格式，拿它 split 出 provider，结果 provider 栏显示成了模型名。实测裸 id 就是 `glm-5.2`，不带 provider 前缀。要 provider 得靠 `settings.defaultProvider` 兜底。

**③ 工具默认 cwd 可能不是仓库。** 变更评估工具默认在 `ctx.cwd` 跑 git，agent 的工作目录不是仓库时返回空结果。解法是给工具加可选 `cwd` 参数，并加 `isGitRepo` 检测——非仓库直接返回空结构，别让 git 报错喷一屏。

## 验收的教训：结构对不等于值对

三个工具跑通后，让 Pi 自己复核了一遍，它当场揪出两个问题：provider 串成了模型名（就是坑②），assess 工具没处理非仓库 cwd（就是坑③）。**自检只盯"结构对不对"是不够的，得盯"值对不对"**——返回 JSON 结构再规范，字段值错了就是错的。这一步独立复核比自己闷头测值钱得多。

## 可抄清单

1. 能力分两层看：接入层（provider/MCP/记忆）和产出层（命令/工具/打包），缺哪层补哪层
2. 高频 skill 套 prompt template 当入口，文件名即命令，逻辑仍在 skill 里不重复
3. 工具化场景：环境/项目状态这类"每次都要拼的上下文"，固化成 registerTool
4. session 信息走 `ctx.sessionManager`，别读 `process.env.PI_*`（那只注入给 bash）
5. `ctx.model.id` 是裸 id，要 provider 就兜底 defaultProvider
6. 跑 git 的工具加 `cwd` 参数 + `isGitRepo` 早退，防非仓库空结果
7. 交付前让另一个 AI 复核"值对不对"，别只看结构
8. 官方 `examples/extensions/` 79 个脚手架，抄之前先翻一遍

---

开荒是给车补动力，这篇是装快捷键和仪表盘。pi 从"能用"到"顺手"，差的不是能力，是把高频动作固化成固定形态的那一步 ☕(￣▽￣)ノ
