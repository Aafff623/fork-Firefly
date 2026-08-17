---
title: 小程序里别硬塞 GIF：Lottie JSON 走 canvas 2d
published: 2026-08-11
updated: 2026-08-11T10:55:00
description: uni-app 微信端用 lottie-miniprogram + canvas 2d 落地复杂动效；DPR/rpx、原生层定位、expression 禁区与组件封装面。
tags: [小程序, Lottie, uni-app, canvas, 动效]
category: 前端开发
image: ./cover.jpg
draft: true
lang: ''
slug: miniprogram-lottie-canvas
pinned: false
comment: true
---

复杂高清动效用 GIF，体积先把自己埋了。设计师从 AE（Bodymovin 一类）吐出 JSON，用 `lottie-miniprogram` 吃进微信小程序 canvas。这是**设计导出路线**，不是 GSAP 手写 tween，也不是 SVG 十法那套描边/Morph。

同系列：[动效库选型](/posts/motion-lib-pick-by-scene/)管 Web 引擎；[SVG 十法](/posts/svg-animation-ten-ways/)管矢量镜头。本篇只钉 **uni-app 微信端落地**。

## 栈与生命周期

| 项 | 口径（原文） |
|---|---|
| 宿主 | uni-app + Vue 3.4 + TS |
| 包 | `lottie-miniprogram@1.0.12`（官方推荐适配层，源自 lottie-web） |
| 画布 | `<canvas type="2d">` |
| 基础库 | ≥ **2.8** 新 canvas；**2.9** 起正式开放 |
| 硬限制 | **不支持 expression**，小程序禁动态执行 JS |

核心三拍：`lottie.setup(canvas)` → `loadAnimation({…})` → 页面/组件卸载 `animation.destroy()`。`animationData`（本地对象）和 `path`（**仅网络 URL**）二选一；`rendererSettings.context` 必传 2d 上下文。

## 真机会撞的坑

1. **糊 + 比例飘**：设计稿按 px，界面按 rpx，canvas 再不乘 DPR 就糊。先 `rpx → px`（`rpx/750 * windowWidth`），再设 `canvas.width/height = 逻辑尺寸 * dpr`，最后 `ctx.scale(dpr, dpr)`；样式宽高跟逻辑 rpx 对齐。
2. **CSS 挪不动位置**：type=2d canvas 是原生层，压在 webview 上，CSS 管不住。创建时把样式定死，或走节点/JS API 设位置。
3. **AE 导出部分失效**：渐变等在 AE 里能动，进小程序或 Lottie 编辑器却僵住。多半是导出配置与 Lottie 子集不兼容，别先怪自己写错 API；先丢官方/国内预览器验证 JSON。
4. **expression 直接死**：设计侧若靠表达式驱动，小程序端跑不起来，得在 AE 侧 baked / 换写法。

## 组件该收的面

封装成 `LottieAnimation` 时，够用的 props：`width`/`height`（**rpx**）、`json`（对象 | 远程 path 字符串）、`isShow`（`v-if` 控挂载）。内部把 DPR scale 藏掉；`onUnmounted` 必 `destroy`。页面侧本地 JSON `import` 进来丢给 `:json`，宽高给个 200rpx 量级就能验。

关键片段（DPR + setup，勿整文件照抄）：

```ts
const dpr = uni.getSystemInfoSync().pixelRatio;
canvas.width = rpxToPx(width) * dpr;
canvas.height = rpxToPx(height) * dpr;
ctx.scale(dpr, dpr);

lottie.setup(canvas);
state.animation = lottie.loadAnimation({
  loop: true,
  autoplay: true,
  rendererSettings: { context: ctx },
  ...(typeof json === "string" ? { path: json } : { animationData: json }),
});
```

完整示例仓库（文内 Gitee，勿当 star 榜）：[phao97/miniprogram-lottie-animation-com](https://gitee.com/phao97/miniprogram-lottie-animation-com)。官方适配：[wechat-miniprogram/lottie-miniprogram](https://github.com/wechat-miniprogram/lottie-miniprogram)。素材与校验：[lottiefiles.com](https://lottiefiles.com)、[lottie-docs playground](https://lottiefiles.github.io/lottie-docs/playground/json_editor/)、[json.cn/lottie](https://www.json.cn/lottie/)。

## 什么时候别走这条

Web 营销站滚动叙事、时间线编排，回 GSAP / anime 那张选型表。纯 SVG 手写描边、Morph、滤镜，回 SVG 十法。只有「设计师已经吐出 Lottie JSON、目标是微信小程序」时，才值得把 canvas 2d + DPR 这一套接上。
