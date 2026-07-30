# README 出图规范（执行层）

> 标杆图目录：`_skill-references/`（相对本文件）。视觉标准见 skill `readme-polish/references/visual-standards.md`。  
> Agent **不代出图**；你把下文 Prompt + 标杆图投给 GPT Image（img2img）后，落盘到 `assets/images/readme/`。

## §0 全局

| 项 | 值 |
|---|---|
| 项目 | threetwoa's blog |
| 标语 | code less, architect more |
| 色板 | `#0D9488` · `#0F172A` · `#FFFFFF` · `#F1F5F9` · `#94A3B8` ·（可选）`#F59E0B` |
| 命名 | `banner.png` `features.png` `architecture.png` `tech-stack.png` `workflow.png` `showcase-*.png` |

**系统指令（可贴对话开头）**

```text
GitHub README diagram. White/near-white background. Flat vector. Max 5–6 colors.
Uniform stroke and corner radius. Clear English or project labels. No neon, no spider-web arrows,
no fake micro-UI text, no purple haze, no watermarks, no other-brand logos.
```

---

## banner.png

- 比例：3:1 · 挂载：Header  
- `reference_image`: `_skill-references/banner/brand-system-creative-tim.png`  
- `method`: image-to-image  

**结构**：左几何小标 + 词标 `threetwoa`；右短句 `code less, architect more`；大留白；2–3 色块暗示青绿板。

**English Prompt**

```text
[system instruction above]
Compact brand-system banner 3:1 for GitHub README.
Geometric quiet mark + wordmark "threetwoa" + tagline "code less, architect more".
Palette: teal #0D9488, ink #0F172A, white, light gray. Generous negative space.
Not: mascot spam, capsule clutter, neon grids, long paragraphs, fake dashboard.
```

**Avoid**: crowded collage, fake UI, rainbow.

---

## features.png

- `reference_image`: `_skill-references/features/infographic-modules-pack.png`  
- `method`: image-to-image  

**模块标签（真实）**：Config-driven · Astro SSG · Svelte islands · Pagefind search · Wallpaper modes · Dual sidebar · Markdown extensions · Vercel deploy

**English Prompt**

```text
[system instruction]
Module infographic like a clean icon-grid pack.
Eight equal cards with unified line icons and short labels:
Config-driven, Astro SSG, Svelte islands, Pagefind, Wallpaper modes,
Dual sidebar, Markdown extend, Vercel.
Teal accents on white. No long poster paragraphs per card.
```

---

## architecture.png

- 标杆：`_skill-references/architecture/three-tier-layered.png`  
- `style_key`: three-tier-layered  
- `method`: image-to-image  

**三层（真实节点）**

1. Authoring：`src/config` · `src/content` · `Firefly_docs`（旁路）  
2. Build：Astro 7 · remark/rehype plugins · LQIP · font subset · Pagefind  
3. Runtime：static `dist` · Vercel CDN · Browser（Swup / islands）

**English Prompt**

```text
[system instruction]
Three horizontal layered architecture diagram (Presentation / Business / Data style language),
but relabeled for a static blog pipeline:
Top layer "Authoring": boxes Config TS, Content Collections, Docs.
Middle "Build": Astro 7 SSG, Markdown plugins, LQIP, Pagefind.
Bottom "Runtime": dist static assets, Vercel CDN, Browser with Svelte islands.
Thin black arrows downward. Teal #0D9488 accents. White background. No microservices sprawl.
```

**Avoid**: inventing databases/API gateways this project does not have.

---

## tech-stack.png

- `reference_image`: `_skill-references/tech-stack/icon-wall-slidestack.png`  
- `method`: image-to-image  

**标签**：Astro 7 · Svelte 5 · Tailwind 4 · TypeScript · pnpm · Biome · Pagefind · Swup · Vercel · Node 22+

---

## workflow.png

- `reference_image`: `_skill-references/workflow/stage-decision-sales.png`  
- `method`: image-to-image  

**主路径**：Edit config/content → `pnpm dev` 本地验收 → push → Vercel build → 核线上  
**决策菱形**：本地 OK？ · 仅文档无产物？

---

## structure

- `method`: markdown-tree（README `<details>`，**不出图**）

---

## Showcase / Preview（截图）

| asset | method | 说明 |
|---|---|---|
| `showcase-home.png` | screenshot | 首页 https://fork-firefly.vercel.app/ |
| `showcase-post.png` | screenshot | 任意 `/posts/...` |
| Preview 站 | — | **省略** |
| README 壳 | HTTP | `preview-readme.html` @ `http://127.0.0.1:8090/preview-readme.html` |

截图命令示例（本机有 Playwright 时）：

```bash
# 示意：对线上首页截图后移入 assets/images/readme/showcase-home.png
```

气质参考：`_skill-references/showcase/`（勿用生图伪造 UI）。
