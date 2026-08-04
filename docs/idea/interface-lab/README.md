# theme · `interface-lab`

[Interface Lab](https://github.com/ggkim0614/interface-lab)（ggkim0614）实验原型橱窗 → 博客可借鉴的 **Motion / 媒体懒播 / 橱窗编排** 灵感。

| 文件 | 说明 |
|---|---|
| [`extract.md`](./extract.md) | 可移植点对照表、反模式、与 Firefly 映射 |

**状态**：step-1 分析完成（2026-08-04）；**灵感 ≠ 实现**，落地须走调研 → PRD 门禁。  
**本地源**：工作区 `temp/interface-lab/`（clone，相对 blog 根）。

---

## 一句话

它是「组件展厅」：首页注册表 + 视频缩略图懒播 + Drawer 打开真交互；折纸邮件是拖拽驱动的分段展开——**抄手感与编排纪律，不抄 Next/React 栈，也不抄 Desktop-only 硬墙**。

## 灵感来源

- 仓库：https://github.com/ggkim0614/interface-lab
- 栈：Next.js 16 · React 19 · Framer Motion · Tailwind · Shadcn/vaul Drawer
- 本地：`temp/interface-lab/`（相对工作区 `blog/`）

## 想要的感觉

- **橱窗感**：先看短循环预览，点开再加载真交互（省电、省带宽）
- **纸感开合**：折纸/信封分段展开，和现站「不期而至」惊喜信封气质可对话（见 `announcementConfig.loveLetter` / `.gift-surprise`）
- **与现站关系**：气质可对齐「手作惊喜」；技术栈须映射到 **Astro + Svelte 岛 + Hallmark×GSAP**（见 `hallmark-gsap-ui`），禁止整仓移植 React

气质关键词：`showcase · lazy-media · origami · drag-unfold · craft`

## 可借鉴（摘要）

| 点 | 为何值得记 |
|---|---|
| 视频缩略图懒播 | `IntersectionObserver` + `preload="none"` + 离屏 `pause`，避免首页多路解码 |
| 折纸/信封 Motion | `useMotionValue` 拖拽 → 分段 `useTransform`（位移/缩放/亮度/路径） |
| 橱窗注册表 | 单一数组描述 title / 预览媒体 / 真组件 / 标签 → Masonry 渲染 |
| Drawer 试玩壳 | 缩略图进抽屉再挂完整原型，首页保持轻 |

## 不做清单（本 theme 明确不做）

| 不做 | 原因 |
|---|---|
| 整站 Desktop-only（`<1024` 白屏） | 博客必须移动可读；见 extract「反模式」 |
| 把 Framer Motion / Next App Router 整栈搬进 Firefly | 栈冲突；动效用 GSAP / CSS，岛用 Svelte |
| 在灵感阶段改 `src/` | 灵感库只写文档；实现走 PRD |
| 为「展厅」新建独立营销站 | 本站是博客，至多 spec 页 / 侧栏彩蛋 |

## 可能落点（猜，调研时再核）

| 构想 | Firefly 可能落点 |
|---|---|
| 视频/动图进视口才播 | 侧栏封面 GIF（`calendar-cover`）、画廊、动态流媒体 |
| 折纸开合手感 | 公告惊喜信封进阶；或 `spec` 特殊页 demo |
| 注册表式 demo 橱窗 | 可选 `src/pages/spec/...` 实验页，非布局内核 |
| Drawer 试玩 | 慎用全站；仅特殊页；优先轻量 dialog / 岛内面板 |

## 开放问题

- 折纸手感用 **GSAP Draggable + timeline** 还是纯 CSS + 少量 JS？与 Hallmark 克制如何划豁免？
- 预览媒体用短 MP4 还是已有 GIF/WebP 池？构建体积与 LQIP 策略如何对齐？
- 「橱窗」是否值得单独 spec 页，还是只把技巧拆进现有组件？

## 下一步（若要落地）

```text
docs/idea/interface-lab/   ← 你在这里
  → docs/outputs/report/interface-lab/   # 可选调研（栈映射、体积、a11y）
  → docs/outputs/prd/interface-lab/prd.md
  → handoff → 实施
```

未开 PRD 前：**禁止改产品 `src/`**。
