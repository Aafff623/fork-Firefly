---
title: 把 MiniMax 生成当制片：H3 视频、叙事句音乐与五条心智模型
published: 2026-08-06
updated: 2026-08-06T01:27:05
description: 额度有限，废片就是烧钱。把生成当制片、提示词当分镜简报——H3 视频三字段、音乐叙事句、五条心智模型，一套减少废片的 MiniMax 生成规范。
image: ./cover.jpg
tags: [MiniMax, H3, 提示词, 视频生成, 音乐生成, AI Coding]
category: Agentic Coding
collections: [agentic-workflow]
draft: true
lang: ''
slug: minimax-generation-as-production
pinned: false
comment: true
---

用 MiniMax Max 档（海螺 / H3 / 音乐 2.0）最怕一件事：额度烧了不少，产出一堆"看着像、用不了"的废片。图生一次改一次、视频分不清是运镜问题还是提示词问题、音乐像标签堆砌。问题不在模型，在提示词没有结构。

把生成当**制片**、提示词当**分镜简报**，是这个体系的核心。下面是这一轮落地后最有用的东西。

## 五条心智模型

1. **生成 = 制片，prompt = 分镜简报**。角色、动作时序、运镜、光影、声音、约束一次钉死。
2. **结构 > 文采**。模型强项是吃固定字段，不是吃形容词。字段齐输出稳，字段缺模型就猜。
3. **职责分配**。参考图各司其职：图1定氛围、图2锁身份、图3是产品。锁住不能变的，模型只在该变的上面发挥。
4. **负面清单比正面描述更值钱**。畸形手 / 跳切 / 换脸 / 水印，写清楚禁止，比堆十个形容词省事。
5. **规范是活的**。官方结构 → 本机内化 → 测试池 → 实测回写，循环迭代，不是一次写完。

额度就是预算，废片就是烧钱。"一次写对"比"多试几次"省。

## 现成的轮子

| 轮子 | 仓库 | 干什么 |
|---|---|---|
| `h3-prompt-writing` | [MiniMax-AI/MiniMax-H3](https://github.com/MiniMax-AI/MiniMax-H3) | 视频 H3 提示词官方结构（另附 8 个风格 skill） |
| `minimax-music-gen` | [MiniMax-AI/skills](https://github.com/MiniMax-AI/skills) | 音乐叙事句结构（`references/prompt_guide.md`） |
| `awesome-minimax-h3-prompts` | [BeatAPI/awesome-minimax-h3-prompts](https://github.com/BeatAPI/awesome-minimax-h3-prompts) | 125 条 H3 测试池，100 条已 X 源核验 + WebM 证据 |

装 skill 的一个坑：`npx skills add` 的 agent 名是 **`claude-code`**（不是 `claude`）；逗号分隔的 agent 列表不认，要**重复 `-a`**；Cursor 侧有时要补 junction。有些清单里标的仓库在 GitHub 根本不存在，装之前先核对一眼。

## 视频：H3 五模式 + 三字段

先判定输入模式：**T2VA**（文生）/ **I2VA**（首帧）/ **FL2VA**（首尾帧）/ **L2VA**（末帧）/ **Ref2VA**（全参考：图+视频+音频 ≤~12 文件）。

Base 模式三个字段按序填满：

| 字段 | 写什么 |
|---|---|
| `integrated_multimodal_description` | 主体叙事：每镜头 = 构图 + 主体 + 环境 + 动作 + 运镜 + 声音 + 参考出现点 |
| `overall_soundscape` | 整体音景：环境音 / 空间 / 层次 |
| `non_diegetic_music` | 画外音乐：情绪 + 配器 + 节奏 |

要点：

- **参考职责写清楚**（"图1定胶片质感与场景、图2锁主角身份、图3是产品"）比堆图有效得多。
- **时间线按秒切**动作（0-4s / 4-9s / 9-13s），一次一个主动作；复杂叙事分段生成再剪辑。
- **声音轨必须写**，不写模型自己猜。对话保留原文语言不改写。
- **负面锁定**：禁止跳切 / 换脸 / 服装变形 / 畸形手 / 多余肢体 / 荧光色 / 水印字幕。
- **图生视频时**，prompt 只写"运动 + 运镜 + 变化"，别重复图片已有的外观。
- 运镜：老 Hailuo 吃括号指令（`[推进]` `[左摇,上升]`），H3 更吃自然语言描述。

## 音乐：叙事句，不是标签

官方原话："写生动完整的英文叙事句，不是逗号分隔的标签。" 把 prompt 当给音乐人的创作简报。

结构（一个完整句式，按序）：`mood+BPM+genre → 人声（角色化）→ 叙事主题 → 氛围场景 → 关键乐器`。

- 人声要具体：`sultry sophisticated male baritone with jazz inflections`，别写 `female vocal`。
- 纯器乐：人声位置换成乐器焦点 + 场景叙事（"evoking a sunrise drive along a coastal highway"）。
- 挑 2-3 个关键乐器写精确，其余留白。
- 速查：Genre 九类（Pop/Dance、Rock、R&B-Soul-Funk、Hip-Hop、Electronic、Folk、Jazz-Blues、Classical、World）；BPM 40-160 按情绪分档；英文提示效果最好。

## 图片：一帖一概念

- 先定概念句：`主题物件 + 材质/工艺 + 光线 + 情绪 + 禁止项`，至少 2-3 个可辨要素。
- 参考图锁特征：只改姿势/场景/光影，主体特征（脸/服装结构）严格不变。
- 负面：蓝紫玻璃拟态、弥散光球、同批同构图、画面内英文标题。

## 落地怎么用

三条调用路径，**都先过额度门禁**（图/音乐走 general 池查百分比，视频走 video 池查次数），再生成、落盘、质检：

```
生图：选风格 → 概念句 → text_to_image → 落盘 → 看图质检
视频：H3 结构 → 查视频额度 → generate_video(6s/768P/async) → 轮询 → 落盘
音乐：叙事句 → 查额度 → music_generation(lyrics 必填) → 落盘
```

测试池用法：抽 5-10 条不同场景（时尚广告 / 一镜到底 / 音乐 MV 各几条）真实跑一轮，把有效 / 失败模式记下来，回写进自己的 prompt 规范。规范是跑出来的，不是一次写出来的。

---

**相关阅读**：[给 DeepSeek 装眼睛：文本主模型外挂视觉 + MiniMax 全家桶](/posts/deepseek-external-vision-minimax) —— 上篇讲"理解 + 生成闭环怎么接"，本篇讲"生成这一侧怎么写 prompt"。
