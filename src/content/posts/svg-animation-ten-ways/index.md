---
title: SVG 能动起来，这十条路别混着抄
published: 2026-08-11
updated: 2026-08-11T10:55:00
description: SVG 动画十种实现手法对照：CSS、描边、WAAPI、GSAP Morph、mask 与滤镜怎么选，别和动效库选型糊成一篇。
tags: [SVG, 动效, WAAPI, GSAP, MorphSVG]
category: 前端开发
image: ./cover.jpg
draft: true
lang: ''
slug: svg-animation-ten-ways
pinned: false
comment: true
---

刷到「解析 SVG 动画的 10 种实现方法」时，容易和「前端动效库 Top10」糊成一篇。不是一回事：那篇在挑 **anime / GSAP / Three** 进谁的包；这篇在问 **路径、描边、遮罩、滤镜** 本身怎么动。

库是导演椅；下面十条是镜头语言。先认手法，再决定要不要请 GSAP 上场。

姊妹篇：[动效库按场景选型](/posts/motion-lib-pick-by-scene/) · [小程序 Lottie](/posts/miniprogram-lottie-canvas/)（设计导出路，不是手写 SVG）。

## 十法对照：原理 / 场景 / 成本

| # | 手法 | 原理 | 适合场景 | 成本 | 性能/支持注意 |
|---|---|---|---|---|---|
| 1 | **CSS Transition** | 属性变了就插值 | hover、焦点反馈 | 低 | 优先 `transform`/`opacity`；别拿来做多段剧情 |
| 2 | **CSS Keyframes** | `@keyframes` 声明帧 | 循环呼吸、简单入场 | 低 | 跨元素同步脆弱；复杂时间轴易炸 |
| 3 | **Stroke dash 描边** | 调 `dasharray`/`dashoffset` | 签名、logo 描出、路线生长 | 中（要量 path 长） | 视觉便宜、实现不贵；长 path 注意主线程 |
| 4 | **WAAPI** | `element.animate()` | 要暂停/编排又不想引库 | 中 | 可编程；比 CSS 好控，比 GSAP 能力窄 |
| 5 | **GSAP**（MorphSVG / MotionPath…） | 时间线 + SVG 插件 | 多段叙事、morph、滚动驱动 | 高 | 天花板高；包体与学习成本换可控性 |
| 6 | **Motion Path** | CSS `offset-path` 或 SMIL `animateMotion` | 图标沿轨、飞行轨迹 | 中 | **SMIL 有弃用/收缩风险**；新项目偏 CSS 或 JS |
| 7 | **SVG 滤镜动画** | 动画化 filter 参数 | 水波、噪点、扭曲转场 | 中高 | 滤镜重；大面积常驻慎用 |
| 8 | **Morphing** | 两段 `path d` 插值 | 图标态切换、流体形变 | 高（点要对齐） | 原生难对齐；工程上常借 MorphSVG 一类 |
| 9 | **mask / clipPath** | 动画遮罩或裁剪形 | 擦除转场、聚光灯显隐 | 中 | 比硬切 `display` 更有设计感 |
| 10 | **CSS 3D on SVG** | `perspective` + 3D rotate | 轻空间层次、翻转感 | 中 | 不是真 3D 引擎；重场景仍看 WebGL |

最短示意只记字段，不贴长墙：

- 描边：`stroke-dasharray` + 动画 `stroke-dashoffset`
- 路径走位（CSS）：`offset-path` + `offset-distance`
- WAAPI：`svgQuery.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing })`
- 形变：对齐后的 `d` A → `d` B（或交给 MorphSVG）

## 怎么选，别十条全上

| 你卡住的问题 | 先试 | 升级条件 |
|---|---|---|
| 按钮 / 图标 hover 一下 | CSS Transition | 要多关键段 → Keyframes 或 WAAPI |
| 循环装饰、轻入场 | CSS Keyframes | 要和滚动/状态机咬合 → WAAPI / GSAP |
| 「像被画出来」 | Stroke dash | 还要沿轨飞 → Motion Path（CSS） |
| 要 JS 控进度，但不想加依赖 | WAAPI | 时间线变脏、多目标编排 → GSAP |
| 图标 A 融成图标 B | Morph（或 GSAP MorphSVG） | path 点对不齐就先整理矢量，别硬插 |
| 擦除 / 显露内容 | mask / clipPath | 要扭曲质感再叠滤镜，并盯帧率 |
| 轻微翻转层次 | CSS 3D on SVG | 真场景、灯光、相机 → 别硬撑 SVG，换 WebGL |

经验边界：

- **CSS 够用就别上库**：交互反馈和循环装饰，Transition / Keyframes 已经体面。
- **WAAPI 是「可编程的 CSS」**，不是 GSAP 平替；缺的是成熟插件生态和脏活封装。
- **描边 ≠ morph**：一个在「露出线」，一个在「改形状」。
- **mask 解决显隐叙事，滤镜解决质感**；滤镜贵，能少用少用。

## 比第十一种手法更重要的坑

1. **SMIL**：`animate` / `animateMotion` 在部分浏览器支持收缩或标弃用。新代码默认走 CSS `offset-path`、WAAPI 或 GSAP，别把关键动效绑死在 SMIL 上。
2. **`prefers-reduced-motion`**：系统要求减少动态时，关掉非必要循环与大位移；至少提供静止态。
3. **性能**：动画优先 `transform` / `opacity`。狂改 `d`、大面积滤镜、布局几何，掉帧比「不够炫」更伤。
4. **3D 预期管理**：CSS 3D 贴在 SVG 上只是空间感，不是 Three 的替代品。

先分清「用什么库」和「SVG 上哪一种镜头」。选错层，后面全是补丁。
