# PRD：阅读面 UI 抛光（approved）

> 状态：**approved**（2026-08-01）  
> 主题：`reading-ui-polish`  
> 依据：Workbench/Hallmark 对比页 `__tmp__/ui-compare/` · Plan `reading_ui_polish`

## 一句话

用 Hallmark Index-First / Quote-Led 与 Aceternity 行列表气质，抛光 Firefly 阅读面：共享 TOC、list Featured+行、About、点缀预算与微交互配额；保持默认 grid，不动布局内核与相册。

## 已拍板

| # | 决策 |
|---|---|
| 1 | `postListLayout.defaultMode` 保持 **grid**；重点改造 **list** |
| 2 | About 改 `about.md` 结构 + `about.astro` 壳，不新路由 |
| 3 | 相册手势 / 桌宠 **不在本 theme** |
| 4 | 不拆 `Layout.astro` / `MainGridLayout.astro` |
| 5 | 壳层中性灰 + 彩仅点缀（hue 290）；禁奶油纸 / 紫光 / SaaS CTA 堆 |

## 范围

- Phase 0：本 PRD
- Phase 1：TOC Index-First（`toc-shared` + `toc.css` + 两侧 TOC）
- Phase 2：list Featured+行；grid/归档/相关文克制
- Phase 3：About Quote-Led
- Phase 4：CategoryBar / Tags / 卡片点缀降噪
- Phase 5：微交互 ≤ 3 原语 + reduced-motion

## 非目标

- bangumi / anime / gallery 手势
- Pio / Live2D / 桌宠
- 评论系统、Swup 内核、Markdown 插件管线

## 成功标准

1. TOC 两侧共享 Index-First  
2. list = Featured + 行；grid 更克制仍可用  
3. About = Quote-Led 编号结构  
4. CategoryBar/Tags 不再彩虹化  
5. 阅读面微交互 ≤ 3  
6. `pnpm check` 通过；交付闭环后核线上  

## 交付闭环

本地 `pnpm dev` → `pnpm check` → 你确认 → push → https://fork-firefly.vercel.app
