# Grok L0/L1 回复消化（2026-08-05）

> 来源：园主粘贴的 Grok 落地建议（Astro + Svelte + CSS columns 语境）。  
> 本文对照本站现码，标出「已有 / 可做 / 纠偏」。

## 决策边界（采纳）

| 场景 | CSS columns（默认） | Masonry.js（可选 L1） |
|---|---|---|
| 图量 | ≤ 50–80 | 更多或动态追加 |
| 手感 | 竖向填满再换列 OK | 要最短列优先 |
| 成本 | 零 JS | init / destroy / resize |
| 本站 | **相册内页已落地** | 配置开关后再做 |

**结论与 Grok 一致：默认继续 CSS columns；L1 仅作开关。**

## 对照现码：L0 清单

| Grok 建议 | 本站现状 | L0 还要不要动 |
|---|---|---|
| `break-inside-avoid` | `PhotoCard.astro` 已有 | 否 |
| `loading="lazy"` + `decoding="async"` | 已有 | 否 |
| `rounded-xl` | 已有 | 否 |
| Fancyapps 灯箱 | `data-fancybox` 已挂 | 否 |
| LQIP 占位 | `getLqipProps` 已有 | 否 |
| 响应式列数 / `columnWidth` | `gallery.css`：`column-width: var(--col-width)`；`[album].astro` 注入 | **微调**：统一 gap、检查窄屏 columns-1、与 Tailwind 间距对齐 |
| 写死 `width`/`height` 降 CLS | **未写**（仅有 LQIP + opacity 过渡） | **可做**：扫描或构建时带出尺寸；或 `aspect-ratio` |
| 纵向间距靠 `mb-*` | 已有 `mb-3` | 可与 `column-gap` 视觉对齐（如统一到 12/16px） |

→ L0 **不是从零搭墙**，是「密度/间距/CLS」抛光；工作量小。

## L1 纠偏（若以后做）

| Grok 示例 | 本站注意 |
|---|---|
| `npm i` | 用 **pnpm** |
| 新建 `PhotoWall.svelte` 整页替换 | 优先在现有 `PhotoCard` + 容器上包一层岛，或 `layout` 开关切换引擎 |
| `onMount` + `imagesLoaded` | 正确；须 `client:visible` / `client:only="svelte"` |
| `transitionDuration: 0` | 静态相册采纳 |
| 与 CSS columns 同一 HTML | 可行；容器去掉 `columns-*`，改 Masonry 选项 |

**现在不做 L1**（无 PRD、图量不大、CSS 已够用）。

## 推荐执行序

1. **先 L0**（无新依赖）→ 可开小 PRD 或直接外科手术改 `gallery.css` / `PhotoCard` / `[album].astro`
2. L1 进 `docs/idea` 待命；园主明确「最短列」或无限追加时再 PRD
3. L2 Pixtale 侧栏壳继续挂 `pixtale-gallery`，与 L0/L1 解耦

## 给实施 Agent 的一句话

> 别照抄 Grok 的整段 Tailwind `columns-1 sm:columns-2…` 重写；在现有 `.gallery-masonry` + `PhotoCard` 上补 gap/CLS/窄屏，灯箱与懒加载已齐。
