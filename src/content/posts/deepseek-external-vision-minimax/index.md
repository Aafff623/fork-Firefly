---
title: 给 DeepSeek 装眼睛：文本主模型外挂视觉 + MiniMax 全家桶
published: 2026-08-05
updated: 2026-08-05T22:29:18
description: 纯文本模型看不懂图？把视觉理解外挂到工具层、生成交给 MiniMax：understand_image 兜底看图、MM 出图出视频，主模型只做编排。本机已跑通的一套接线与纪律。
image: ./cover.jpg
tags: [DeepSeek, MiniMax, 多模态, MCP, 视觉理解, AI Coding]
category: Agentic Coding
collections: [agentic-workflow]
draft: false
lang: ''
slug: deepseek-external-vision-minimax
pinned: false
comment: true
---

用 DeepSeek 这类纯文本模型当主模型，最别扭的一件事是"看不见"：截图、报错图、设计稿、短视频，通通没法直接丢给它——附件常常在模型接口这一层就被拒了，还没轮到工具链处理。

不想为了看图就换模型、换工具。出路是把多模态能力从"主模型"挪到"工具层"：主模型继续做文本编排，看图出图交给专门的后端，理解结果以文本回传。这套思路本机已经能跑通，而且不是靠某一个神器，是几层现成能力拼起来的。

## 接视觉有三条路，不是只有一条

| 路线 | 机制 | 信息损失 | 本机现状 |
|---|---|---|---|
| **桥接脚本式**（以 `see-skill` 为代表） | 媒体走脚本路由到视觉后端，结果 Markdown 回传 | 最低（原图直传） | 未装，需自己接 + 视觉 Key |
| **MCP 理解工具**（`minimax-coding` 的 `understand_image`） | Claude Code 直接调，text-only 模型也能用 | 中（单图为主） | ✅ 已就位，零成本 |
| **CLI 视觉命令**（`mmx vision`） | MiniMax 官方 CLI | 中 | ✅ 已就位，零成本 |

图片理解本机其实不缺，缺的是**视频理解**。所以真正值得盯的，是那种补上视频、且尽量少损失信息的桥接方案。

顺带说一句：Gemini 这类多模态模型只是另一个视觉后端选项，接一个视觉模型而已，跟上面的路线是同一件事，不构成新维度。

## see-skill 里能偷的设计

调研过一个专门做这件事的开源 Skill（`oil-oil/see-skill`，MIT，社区热度涨得很快），它把"文本模型外挂视觉"做到了工程完成度较高的程度。能带走的设计点：

- **图片原图直传**：不预先 OCR、不缩放、不压缩。先 OCR 再让主模型"猜"，等于在理解链路里主动插一次信息损失；原图直传是把损失压到最低的做法。
- **视频不抽帧**：保持完整时间线 + 音频，走视觉模型的原生视频能力，Skill 内部不做抽帧。抽帧会丢掉时序和音频信息，这是很多简易方案偷懒的地方。
- **问题原样透传**：用户问什么，`--task` 就原样交给视觉模型，不套固定报告模板。固定模板会诱导视觉模型泛泛而谈，反而丢了针对性。
- **降级链**：云端供应商按顺序尝试，全挂才落到本地 OCR（macOS 系统 Vision → Windows OCR → Tesseract）。注意视频没有本地降级，没配云端 Key 就明确提示，不硬来。
- **结果可审计**：回传的 Markdown 带 `backend / model / mode / route_attempts` 元信息，主模型能判断这次到底走的哪家、有没有降级。
- **接口极简**：stdout 只吐一个 `output_path=<绝对路径>`，机器可读，主模型读那个 Markdown 就行。

有几点跟 README 第一印象不一样，别照搬：

- 视频"优先 Gemini"只对 `zenmux` / `openrouter` 两家成立；百炼和 TokenDance 默认直接用 Qwen，不是"回退"。
- "压缩到最长边 1920、2 fps"只是三档里的 balanced，还有 compact（1600/1fps）和 strict（1120/1fps），超上传预算自动往下切。
- `see.sh` 是个薄壳，`exec python3 parse_media.py "$@"` 一行透传，全部逻辑在 `parse_media.py`；仓库里还多了个 README 没写的 `tests/`。

## MiniMax 那半边：生成闭环

光有理解还不够，完整的多模态还差"生成"。MiniMax 的权益包恰好把这一侧补全了，而且本机已经接好：

| 侧 | 能力 | 接入点 |
|---|---|---|
| 理解 | 图片理解 / 网页搜索 | `minimax-coding` MCP |
| 生成 | 文生图 | MiniMax MCP `text_to_image` |
| 生成 | 视频（异步） | `generate_video` → 轮询 `query_video_generation` |
| 生成 | 语音 / 音乐 | `text_to_audio` / `music_generation`（音乐必须给 `lyrics`） |
| 额度 | 通用池 + 视频次数 | `mmx quota show` |

额度有个值得注意的语义：**文本、图片、语音、音乐共享同一个 `general` token 池**，按百分比消耗；视频是**按次计数**（海螺视频，按天/周窗口给次数）。所以"先查额度再生成"不是客套，是实打实的成本门禁。

## 落地在 Claude Code 里是什么样

打通点最终落在 AI 编程工具的 workflow 配置上。本机这一套长这样：

1. **双 MCP 分工**：`MiniMax` 管生成（图/视频/语音/音乐），`minimax-coding` 管理解（看图/搜索），主模型只负责编排和判断。
2. **text-only 兜底写成硬规则**：全局 CLAUDE.md 规定，会话启动先自查模型身份；若是纯文本模型，所有图片/视频理解一律走外部视觉兜底（`understand_image`），绝不 native 硬读、也绝不脑补画面。
3. **项目侧再包一层纪律**（blog 项目的 `firefly-minimax-media` skill）：额度门禁（`check_quota.py`）→ 视频先抢槽、提交记账、只许轮询 → MCP 返回的 URL 必须立刻落盘（防盗链）→ 接线。视频生成在这里是"抢到槽位才能下单"，防止多 agent 并发把按次配额打空。

这一层的意义在于：**能力是通用的，纪律是项目化的**。MiniMax 谁都能调，但"先查额度、视频串行、URL 及时落盘"这套行为规范，是沉淀在 skill 里的，换谁来执行都一样。

几个绕不开的坑：

- `text_to_image` 返回的图片 URL 防盗链，程序直接下载恒 403，浏览器能开，签名约一天过期——必须生成后立刻落盘。
- `generate_video` 是异步的，提交只回 Task ID，要轮询状态，完整生成要几分钟。
- 启动 MiniMax 的 MCP 必须带 `--with "mcp<2"`，否则官方包起不来（mcp 2.0 移除了 `fastmcp` 模块）。
- `voice_clone` 要实名认证才能用；`play_audio` 会在本机真实出声，别在调试时踩雷。
- 区域必须匹配：本机 Key 是 cn 区（`api.minimaxi.com`），用国际域会报 invalid API key。

## 能带走的

最核心的一点：**多模态 = 理解（外挂）+ 生成（MiniMax），两者都沉在工具层，主模型始终是文本模型**。理解侧选原图直传、少信息损失的桥接（`see-skill` 是现成参考，本机 `understand_image` 已覆盖图片）；生成侧用 MiniMax 权益包补图、视频、语音、音乐。打通点写进 workflow 配置 + skill 纪律，这套就固化下来了，不用每次重搭。

---

相关阅读：

- [把高成本判断留给 Luna：OpenCode + DeepSeek + MiniMax 协作配置](/posts/opencode-luna-deepseek-minimax/)——那边讲委派分工，这篇讲纯文本模型怎么补视觉
- [MiniMax 封面风格规范：通用与特定场景](/posts/minimax-cover-styles/)——同生态的封面出图规范
