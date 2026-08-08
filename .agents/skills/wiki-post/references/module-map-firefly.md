# Firefly / fork-Firefly — module → Wiki page map

Load this when the target repo is `Aafff623/fork-Firefly` (or a workspace rooted at this blog). Refresh paths if the tree moves; do not treat as eternal.

Online: https://fork-firefly.vercel.app  
Stack: Astro 7 · Svelte 5 · Tailwind 4 · pnpm 9 · Vercel

## Suggested Wiki pages ↔ modules

| Wiki page | Primary paths | Audience note |
|---|---|---|
| Home | — | Hub only |
| Getting-Started | `package.json` scripts, `pnpm dev`, ports 4321 / 8090 | User |
| Configuration-Overview | `src/config/*`, `src/config/README.md` | User → links shards |
| Wallpaper-and-Atmosphere | `backgroundWallpaper.ts`, `AtmosphereLayer.astro` | User |
| Music-Player | `musicConfig.ts`, `MusicManager.astro`, ADR-0002 | User |
| Sprite-Pets | `petConfig.ts`, `SpritePet.svelte`, `public/pets/` | User |
| Sidebar-Widgets | `sidebarConfig.ts`, `components/widget/*`, gift/, `public/assets/images/widgets/calendar/stock/` | User |
| Comments-Waline | `commentConfig.ts`, `components/comment/`, ADR-0001 | User |
| Search-Pagefind | `Search.svelte`, build `pagefind` | User |
| Writing-Posts | `src/content/posts`, `content.config.ts`, eth path + BibiGPT source modules | User |
| Draftbox | `posts/_draftbox/`, `AGENTS.md` draft rules | User |
| Collections | `collectionsConfig.ts`, `/collections/` | User |
| Dynamic-and-Timeline | `content/dynamic`, `pages/dynamic`, `pages/agents.astro`, `components/pages/dynamic/*`, `scripts/agent-comment.ts` | User — Agent identity |
| Markdown-Syntax | `src/plugins/*`, Mermaid landscape default in workflow | User |
| Deploy-Vercel | `vercel.json`, `astro.config.mjs` | User |
| FAQ / Troubleshooting | ops notes in `docs/knowledge/firefly-ops.md` (link, don’t paste) | User |
| Architecture | `layouts/Layout.astro`, `MainGridLayout.astro` | Contributor short |
| Contributing | link `AGENTS.md`, `docs/agents/workflow.md` | Contributor |

## Eth path source modules (Writing-Posts)

| ID | Input | Skill note |
|---|---|---|
| `session` | Chat / agent research | default extract |
| `paste-md` | Pasted MD (not vault) | extract, not ob2blog |
| `bibigpt` | BibiGPT export (+ video URL) | verify then extract; default draftbox |
| `mixed` | mix of above | use strictest (bibigpt ⇒ verify) |

Detail SSOT: `.cursor/skills/knowledge-extract/references/source-modules.md`

## Component folder counts (approx., 2026-08)

| Folder | ~Files | Wiki shard? |
|--------|-------:|-------------|
| `widget/` | 25 | Sidebar-Widgets |
| `pages/` | 31+ | per feature page (`agents.astro`) |
| `features/` | 17 | Music / Pets / Atmosphere |
| `controls/` | 11 | Display-Settings / Search |
| `layout/` | 11 | Theme-Layout (optional) |
| `comment/` | 13 | Comments-Waline |
| `common/` | 15 | fold into Configuration |
| `analytics/` | 4 | Analytics (optional) |
| `misc/` | 4 | fold into Writing-Posts |

## High-risk files (mention in Architecture, not Home)

- `src/layouts/Layout.astro` (~1600+ lines) — Swup, banner, pets, music hooks
- `src/layouts/MainGridLayout.astro` (~1000+ lines) — grid shell
- `gift-lifecycle.ts` — seasonal gift box state

## Config domains (Configuration-Overview checklist)

`siteConfig` · `profileConfig` · `navBarConfig` · `sidebarConfig` · `backgroundWallpaper` · `commentConfig` · `collectionsConfig` · `musicConfig` · `petConfig` · `pioConfig` · `announcementConfig` · `displaySettingsConfig` · `dynamicConfig` · `galleryConfig` · `effectsConfig` · `analyticsConfig` · …

## Special product facts (don’t contradict in Wiki)

- Comments: Waline (not `none` / not default Giscus)
- Music: default `local` playlist
- Draftbox ≠ theme demo `draft: true` tracked file
- Theme hue: shell neutral gray; purple accents only
- Agent publish pipelines stay in skills/`docs/` — Wiki may link “发文见 AGENTS 双路径（含 BibiGPT）”
- Product SemVer (`v1.x`) ≠ `package.json` upstream theme version (`6.15.3`)

## Shipped Wiki tree (2026-08)

```text
Home · Getting-Started · Official-Docs-Map · FAQ
Configuration-Overview · Writing-Posts · Collections · Deploy-Vercel
Wallpaper-and-Atmosphere · Music-Player · Comments-Waline
Sprite-Pets · Sidebar-Widgets · Search-Pagefind · Dynamic-and-Timeline
Troubleshooting · Architecture · Contributing
```

Workspace clone: `d:\OneDrive\Desktop\blog\fork-Firefly.wiki`  
Local official mirror: `docs/official/` (gitignore) · index: `docs/knowledge/official-docs.tree.json`
