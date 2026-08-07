---
title: Kimi Code 的 hook 装好不算完，怎么证明它真在拦？
published: 2026-08-07
updated: 2026-08-07T14:25:19
description: Kimi Code 的 PreToolUse hook 装好不代表真在拦。记一套三层验证法（配置层/单测层/实弹层），顺带修掉 matcher 不锚定、Windows 下 ~ 路径哑火两个配置坑，以及博客卡片边框颜色公式漂移。
image: ./cover.jpg
tags: [Kimi Code, AI Coding, hook, PreToolUse, 验证]
themeTags: [kimi-code, pretooluse-hook, hook验证, 边框漂移, loop-control, 防护验证]
category: Agentic Coding
collections: [agentic-coding]
draft: false
lang: ""
slug: kimi-code-hook-verify
pinned: false
comment: true
---

前一阵 Kimi Code 会话里工具调用陷入过循环报错：模型拿 `Read` 去读图片，报错，再读，再报错。后来给 CLI 配了一个 PreToolUse hook，从入口把这种调用直接掐掉。

配置写完那天我没敢信。「文件里写着」和「真的拦得住」之间，隔着好几个会翻车的细节。这次把验证过程和顺带揪出的一个博客样式问题一起记下来。

## 这个 hook 在拦什么

规则本身很简单：模型对图片/视频文件调用 `Read` 时，hook 在工具执行前拦截，stderr 返回一句「改用 ReadMediaFile」，进程 exit 2 阻断这次调用。其它文件类型正常放行，stdin 解析失败时 fail-open 不误伤。

脚本本身没什么可说的，四十行不到。真正的坑在配置层。

## 配置里修掉的两个真问题

| 坑 | 错的写法 | 对的写法 | 为什么 |
|---|---|---|---|
| matcher 太宽 | `matcher = "Read"` | `matcher = "^Read$"` | 不锚定的话，任何工具名里含 Read 的都会被误伤 |
| 路径依赖 `~` | `node ~/.kimi-code/hooks/xxx.mjs` | `node C:/Users/.../xxx.mjs` | Windows 下 `~` 展开不可靠，hook 会直接哑火 |

第二个坑尤其阴：配置写错了 hook 不执行，但表面上一切正常——没有报错，只是「没拦」。这也是为什么必须做下面这套验证。

## 三层验证法

| 层 | 做什么 | 能证明什么 | 证明不了什么 |
|---|---|---|---|
| 配置层 | 对照配置历史（`.bak` 文件 diff），确认 hook 块语法、matcher、路径都正确 | 注册意图是对的 | CLI 真的加载了它 |
| 单测层 | 手动给脚本喂 JSON：`.png` 应拦截 exit 2，`.astro` 应放行 exit 0，大写扩展名、坏 JSON 各试一遍 | 脚本逻辑是对的 | 会话里真的接了这根线 |
| 实弹层 | 在真实会话里故意拿 `Read` 读一张图片 | 端到端真拦住了 | — |

实弹层是关键，也是最容易被跳过的一层。这次验证时翻了运行日志，里面只有启动记录，没有任何 hook 执行的痕迹——光看日志既证明不了它在工作，也证明不了它没工作。唯一的硬证据是在会话里故意犯一次规，看拦截信息是不是脚本里写的那句 stderr。

结果是拦住了，返回的就是脚本里那句提示。三层证据凑齐，这事才算闭环。

## 防循环其实有两道闸

hook 只是入口那道。配置里还有一层 `[loop_control]`：

```toml
[loop_control]
max_steps_per_turn = 300
max_attempts_per_step = 2
```

`max_attempts_per_step = 2` 和「同一调用失败两次就停手」的纪律是同一个思路：循环靠重试续命，把重试次数掐死，循环就起不来。一道闸拦错误的工具选择，一道闸拦无底线的重试，两层是互补的。

## 顺带揪出的卡片边框漂移

验证之余还排了一个博客（Astro/Firefly）的卡片边框问题，根因是典型的「两处公式漂移」：

| 位置 | 作用 |
|---|---|
| `src/styles/main.css:286-294` | 全局卡片边框，`.enable-card-border .card-base` |
| `src/styles/main.css:329-336` | 壁纸透明模式下把边框压淡 |
| `src/styles/dynamic.css:931-938` | 动态页又单独覆盖了一套边框颜色公式 |

同一个卡片，全局规则和动态页覆盖用的是两套不同的 `color-mix` 公式，视觉上自然不一致。最小修法二选一：直接删掉动态页那段覆盖回归全局，或者把覆盖里的公式对齐全局。改之前先在 `pnpm dev` 下切壁纸模式肉眼对比，再决定删还是对齐。

## 两个顺手的教训

**剪贴板管理器的截图路径会失效。** 这次两张截图里有一张路径已经不存在——剪贴板工具会清图。收到这类路径先确认文件还在，再决定用哪个工具读，能省一轮无效往返。

**「故意犯错」是验证防护机制最硬的证据。** 防护类配置（hook、拦截规则、权限门禁）静默时不产生任何痕迹，日志里也看不见。想知道它在不在岗，就得在安全范围内真的踩一脚红线。踩中了，才是真的。

之前还记过一次 Kimi CLI 工具调用陷进循环的事，[那篇在这里](/posts/kimi-cli-tool-loop/)，这道 hook 就是防它的入口闸。
