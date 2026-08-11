---
title: Gorden 那套 Super PPT：先出图页，再拆成真文本框
published: 2026-08-11
updated: 2026-08-11T01:39:19
description: Codex 专属三技能：内容→图片 PPT→可编辑 PPTX。四层防双影，费用有美元与 Plus 两套口径，装之前先看清宿主和额度。
image: ./cover.jpg
tags: [Codex, PPT, Skill, GordenSuperPPT, 可编辑PPT]
category: skill 测评
draft: false
lang: ''
slug: gorden-super-ppt-pipeline
pinned: false
comment: true
---

仓库：[GordenSun/GordenSuperPPTSkills](https://github.com/GordenSun/GordenSuperPPTSkills)（Python · README 写死**仅 Codex**）。

它不是又一套模板。核心是把「好看」和「能改」拆成两条流水线：内容先变成**真生图**的图片 PPT，再按层拆开重拼成**可编辑 PPTX**。公众号里「AI PPT 赛道终结者」「史上最强」当宣传听就行，别写进选型结论。

![内容 → 图片 PPT → 可编辑 PPTX](./images/fig-01-pipeline.jpg)

## 三技能怎么拆

| 技能 | 干什么 | 带走的约束 |
|---|---|---|
| **GordenImagePPTGen** | 主题/内容 → 每页 PNG + 图片型 PPTX | 必须真调图像生成；禁 SVG/HTML/Canvas/代码画图冒充 |
| **GordenImage2PPTX** | 图片页/截图 → 可编辑 PPTX | 四层重拼，文字必须是真文本框 |
| **GordenSuperPPTSkill** | 串前两步 | 一次交出图片型 + 可编辑 + 中间层产物 |

只要好看图页用第一个；手里已有图页只要第二个；「从内容一路到可改」或没指定时，走编排器。别指望一个 prompt 同时搞定「又炫又能改」——这是架构选择，不是文案技巧。

## 四层：防「假可编辑」

![背景 / 框架 / 图标装饰 / 文字](./images/fig-02-four-layers.jpg)

拆开再按坐标拼回去：

1. 背景
2. 框架
3. 图标与装饰
4. 文字（文本框）

最脏的偷懒是：整页原图当背景，再叠一层字。看起来「能改」，实际**双影**（图上字 + 框里字）。技能门禁就是冲这个来的。

## 装起来三步，宿主别搞错

Codex 里粘贴安装 → `pip install python-pptx`（还要 pillow / numpy）→ 用人话描述需求调用。文内写死只支持 Codex；留言也有人吐槽要 GPT 账号、Deepseek 生不了图。别的 Agent 理论上能蹭接口，仓库没做适配。

## 费用：两套口径别混

| 来源 | 说法 |
|---|---|
| **作者美元口径** | 生图 $0.03-$0.10 / 张；Vision 还原 $0.01-$0.05 / 页；建议单文件 ≤20 页 |
| **Plus 额度口径（README）** | 转 1 张图 ≈ 5 小时额度的 **10%** |

都是作者/README 转述，**没实测**。选型时认清你在比的是哪一套账。先 **1-3 页**摸成本与质量，再放大。

![强但不轻：小样试跑 + 风险边界](./images/fig-03-risks.jpg)

## 市场数字当气氛，别当结论

公众号 pitch 里堆了一堆「痛点证据」，出处作者写了，我没去对原报告。拿来当「值得关心 PPT 链路」的气氛可以；拿来写死结论不行。挑几条有印象的：

- 每天海量 PPT / 管理层周均耗时（LinkedIn、empower®、SketchBubble 等，**未核**）
- AI 演示生成市场数字单位可疑，照录并标未核
- Vision / OCR 准确率数字同理，别当验收标准

留言里有人直接问：效果图呢？问得好——装之前自己跑小样，别被 pitch 带着走。

## 什么时候值得装

**值得试**：要视觉冲击，又要同事/老板在 PPT 里真改字；能接受 Codex 长链路和人工 QA。

**别硬上**：日常周报、改几个数字就交差、不想烧额度、要零验收工业级稳定。

质量跟模型走；高密度页更容易拆歪。形态上它是 Skill / Prompt / Manifest / QA 包，不是点按钮的 SaaS——流程在，责任也在你这边。

## 许可证别想当然

API 查下来 **无 SPDX license**（`license: null`）。README 致谢写「可以商用，必须标明 Github 出处或 @Gorden Sun」。个人学习归档够用；要商用交付，先自己确认这份口头授权是否够用，别默认「开源=随便用」。
