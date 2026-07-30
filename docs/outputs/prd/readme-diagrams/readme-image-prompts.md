# Firefly README · GPT 生图 Prompt（唯一入口）

> 用法：在对话里按模块整块复制 Prompt → GPT Image。落盘 `assets/images/readme/`。  
> Showcase 已截图，勿生图。可选参考：`_skill-references/`。

色板：`#0D9488` · `#0F172A` · `#FFFFFF` · `#F1F5F9` · `#94A3B8`

---

## 一、页头 Banner · `banner.png`

```text
Create a premium GitHub README hero banner for a personal developer blog brand.

FORMAT
- Aspect ratio exactly 3:1 (wide horizontal strip), suitable for GitHub README header
- Flat vector / brand-system illustration, NOT photorealistic, NOT 3D render
- Pure white to near-white (#FFFFFF / #F1F5F9) background with subtle cool gray atmosphere
- Strict palette (max 5 colors): teal #0D9488, ink #0F172A, white #FFFFFF, soft gray #F1F5F9, muted slate #94A3B8
- Uniform thin stroke weight, consistent corner radius, optical alignment like a design-system cover

COMPOSITION
- Left third: a quiet geometric monogram mark (abstract interlocking planes or a minimal "3"/"A" derived glyph) + bold wordmark "threetwoa" in modern grotesque sans
- Right two-thirds: one elegant tagline only — "code less, architect more" — medium weight, generous tracking
- Large intentional negative space; content sits in a calm horizontal band; no vertical stacking of paragraphs
- Optional: 1–2 soft teal geometric planes or hairline rules as brand accents — never competing with type

QUALITY BAR
- Looks like a Creative Tim / Linear-adjacent brand system sheet: restrained, editorial, high-craft
- Typography must be sharp and legible at README thumbnail size
- Single focal composition; brand name must remain the strongest signal

HARD NEGATIVES
- No mascot, no robot, no firefly insect literalism
- No fake UI windows, dashboards, code screenshots, terminal chrome
- No neon glow, purple/indigo gradients, glassmorphism, heavy drop shadows
- No watermarks, stock logos, other brand marks, capsule badge clutter, rainbow accents
- No long body copy, no stats row, no icon strip under the tagline
```

---

## 二、能力与架构

### 2.1 功能模块 · `features.png`

```text
Create a high-clarity module capability infographic for a GitHub README Features section.

FORMAT
- Landscape, roughly 16:9 or 2:1
- Flat vector icon-grid on pure white (#FFFFFF)
- Palette only: teal #0D9488, ink #0F172A, white, soft gray #F1F5F9, slate #94A3B8
- Uniform icon stroke, equal card size, equal gutters, shared corner radius — systematic, not collage

LAYOUT
- Exactly 8 equal modules in a clean 2×4 OR 4×2 grid
- Each cell: one simple line icon (top) + one short English label (bottom), no multi-sentence blurbs
- Labels must be EXACTLY these eight (one per card, do not invent extras):
  1) Config-driven
  2) Astro SSG
  3) Svelte islands
  4) Pagefind
  5) Wallpaper modes
  6) Dual sidebar
  7) Markdown extend
  8) Vercel
- Teal used only as accent (icon stroke / small underline / corner tick); ink for labels

QUALITY BAR
- Feels like a product capability pack / design-system module sheet
- Perfect optical rhythm; cards aligned to an invisible grid
- Icons abstract and readable at small size (config gear/sliders, static pages, island shape, search lens, wallpaper layers, dual columns, markdown document, cloud deploy)

HARD NEGATIVES
- No long marketing paragraphs inside cards
- No 3D icons, skeuomorphism, emoji, or random stock pictograms
- No neon, purple haze, glass cards with multi-layer shadows
- No fake screenshots or browser chrome inside tiles
- No ninth feature, no decorative badge stickers floating on top
```

### 2.2 架构分层 · `architecture.png`

```text
Create a professional three-tier layered architecture diagram for a static Astro blog pipeline (GitHub README).

FORMAT
- Landscape technical diagram, white background
- Flat vector, engineering-brief aesthetic (like a clean three-tier system poster)
- Palette: teal #0D9488 accents, ink #0F172A structure, white fill, soft gray #F1F5F9 layer bands, slate #94A3B8 secondary labels
- Uniform boxes, consistent stroke, thin black/ink downward arrows, generous margins

STRUCTURE (exactly three horizontal layers, top → bottom)

Layer 1 — title "Authoring"
  Boxes: "Config TS" · "Content Collections" · "Docs"
  Meaning: source of truth edited by the author

Layer 2 — title "Build"
  Boxes: "Astro 7 SSG" · "Markdown plugins" · "LQIP" · "Pagefind"
  Small tech chips along the layer edge (not a separate wall): "Svelte 5" · "Tailwind 4" · "TypeScript" · "pnpm"
  Meaning: compile-time pipeline producing static assets

Layer 3 — title "Runtime"
  Boxes: "dist (static)" · "Vercel CDN" · "Browser (Swup / islands)"
  Meaning: edge delivery + client hydration islands only

FLOW
- Clear downward arrows between layers (Authoring → Build → Runtime)
- Optional thin left-to-right order inside a layer; never spaghetti cross-links

QUALITY BAR
- Reads instantly as Presentation / Business / Data style language, but relabeled for a static blog
- Labels crisp, English, short; hierarchy of titles > boxes > chips
- Looks suitable for an architecture section in a serious open-source README

HARD NEGATIVES
- Do NOT invent databases, Redis, API gateways, Kubernetes, message queues, or microservices
- No isometric city, no glowing nodes network, no cyberpunk HUD
- No illegible micro-UI text inside boxes
- No purple gradients, neon edges, or watermark
```

---

## 三、交付主链路 · `workflow.png`

```text
Create a premium horizontal delivery workflow diagram for shipping a static Astro blog (GitHub README).

FORMAT
- Wide landscape strip (about 21:9 or 3:1)
- Flat vector process map on white / near-white background
- Palette: teal #0D9488 for active accents and success path, ink #0F172A for structure, soft gray #F1F5F9 fills, slate #94A3B8 for secondary notes
- Uniform stage cards, consistent corner radius, hairline connectors — sales-funnel clarity, not spaghetti BPMN

MAIN PATH (left → right, five stages, numbered 01–05)
  01 Edit config / content
  02 pnpm dev (local verify)
  03 git push
  04 Vercel build
  05 Verify production

DECISION DIAMONDS (exactly two, integrated without clutter)
  - After stage 02: diamond "Local OK?" — Yes continues to push; No loops back to Edit
  - Near stage 03/04: diamond "Docs-only change?" — Yes may skip heavy rebuild narrative; No continues full Vercel build
  Keep diamond labels short; use thin connectors; primary happy-path emphasized in teal

QUALITY BAR
- Instantly scannable like a stage-decision sales diagram: one story, left-to-right
- Stage titles large; commands (`pnpm dev`, `git push`) as secondary monospace-looking labels if needed
- Professional DevOps/README tone; calm and decisive

HARD NEGATIVES
- No tangled multi-swimlane enterprise BPMN
- No fake CI screenshots, no terminal walls of log text
- No neon glow, purple haze, 3D isometric pipes, mascots
- No watermarks or unrelated brand logos
- No more than two decision diamonds; no side promo callouts
```

---

## 附录 · 不必生图

| 资源 | 原因 |
|---|---|
| `showcase-*.png`（6） | Playwright：home / post / dynamic / archive / about / gallery |
| `structure` | Markdown 树 |
| `tech-stack.png` | 已并入 architecture |
