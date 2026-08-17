---
title: 中文故事进竖屏手绘轨：这仓库把 Skill 和 Remotion 焊在一起
published: 2026-08-11
updated: 2026-08-11T01:39:19
description: story-to-handdrawn-video：中文故事或有序图 → 3:4 竖屏手绘日记漫画静音 MP4；Skill 契约 + Remotion 画面轨。
image: ./cover.jpg
tags: [story-to-handdrawn-video, 手绘动画, Remotion, Codex Skill, 竖屏]
category: 指南
draft: false
lang: ''
slug: story-to-handdrawn-video
pinned: false
comment: true
---

GitHub 上这仓库一句定位很清楚：中文故事文案，或一组有序图片 → 3:4 竖屏手绘日记漫画动画（静音 MP4）。核对日 2026-08-11，约 1190★（MIT）。公众号水印来自 CodeAI研习社。

::github{repo="gnipbao/story-to-handdrawn-video"}

它不是「再写一个 prompt 模板」。根目录是 Remotion 渲染器；`skill-package/` 才是可拷进 `~/.codex/skills/`（或 `~/.claude/skills/`）的 Agent Skill。自然语言驱动，底层仍走 `scripts/run_story_video.py`。

跟 baoyu-comic 知识漫画拆解别并成一篇：那边是翻页漫画 PDF；这边是竖屏揭示/翻书视频轨。本机若已有同名 skill 目录，那是可执行包——本篇是开源项目文档提炼，勿与本地 skill 目录混淆，也别往 Firefly 仓里装。

仓库示例故事带医院冲突画面——样例叙事敏感，仅技术演示。

## 两条进线，六种模式

| 输入 | 结果 |
|---|---|
| 中文故事 | 分句 → 分镜 → 生图 → 渲染 |
| 有序图片 | 直切揭示，或翻书（要完整页） |

入口永远是 `scripts/run_story_video.py`。模式：`plan` / `preview` / `full` / `generate` / `import` / `render`。

文本默认走 Codex Image2；OpenAI 要显式选 API 生成器并自备 Key。敏感情节（时间跳跃、指代乱、医疗、年龄）先 `--mode plan` 或丢 `--visual-plan` JSON，人眼过一遍再生图——别一上来 `full`。

## 画面怎么动

正式画布 1080×1440（预览 720×960），字幕在上、插画在下，插画 `contain` 不裁。

直切节拍从左到右：

```text
文字 → 黑白画稿 → 彩色插画
```

![黑白画稿层](./images/fig-04-bw-plate.jpg)

![彩色插画层（无字幕）](./images/fig-05-color-layer.jpg)

翻书另一套规矩：上传页原样静置，再从右下角卷页；不要再叠字幕/黑白/上色。纸背留淡化原页。翻书素材必须是完整页，别塞半截裁图。

成片是 H.264 静音画面轨——配音和 BGM 是后期的事。

彩铅日记四格（字幕+插画）长这样：

![四格彩铅+字幕示例](./images/fig-02-colored-pencil.jpg)

## 20 种风格，默认彩铅日记

风格库二十档，编号 / 英文 id / 中文名 / 别名都能查；默认 `colored-pencil-diary`（彩铅日记漫画）。同场景对照网格一眼能选风：

![20 风格同场景网格](./images/fig-01-styles-grid.jpg)

完整表与 prompt 块在仓库 `references/handdrawn-style-library.json`，笔记里不复读二十段形容词。

## 装起来怎么预览

环境：Node 20+、Python 3.10+、FFmpeg、npm、Chrome/Remotion。

```bash
git clone https://github.com/gnipbao/story-to-handdrawn-video.git
cd story-to-handdrawn-video
npm ci && npm run check

cp -R skill-package/story-to-handdrawn-video ~/.codex/skills/
export STORY_VIDEO_PROJECT=/absolute/path/to/story-to-handdrawn-video
```

Agent 里：

```text
使用 $story-to-handdrawn-video 先给这个故事生成一个预览版。
```

或脚本：`--mode preview` 看 720×960，确认后再正式渲染。

## 边界写在前面

- 故事文本路径只认中文；无内置配音。
- 复杂分格不会自动拆成多镜。
- 留言区老问题：烧 Token——多镜多风格会啃额度；先 plan/preview。换其它大模型不在默认契约里，得自己改生成器。
- 易翻车点：时间跳跃、指代、医疗与年龄敏感 → 先 JSON 规划，人工确认。

认清它卖的是「Skill 契约 + Remotion 画面轨」，不是万能漫剧工作室，选型会轻松很多。
