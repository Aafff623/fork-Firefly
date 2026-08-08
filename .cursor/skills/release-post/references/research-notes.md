# Release notes research (condensed)

Survey date: 2026-08-08. Method: `gh release list/view` + Keep a Changelog / SemVer norms. Bodies truncated in collection; patterns below are durable.

## Sample set (28 attempted, 25+ with usable notes)

| # | Repo | Type | Tag / title pattern | Notes style | Assets | Notes |
|---|------|------|---------------------|-------------|--------|-------|
| 1 | vercel/next.js | framework | `v15.5.23` | What's Changed + Full Changelog | no | Auto-PR list common on patches |
| 2 | facebook/react | library | name `19.2.8 (date)`, tag `v19.2.8` | Themed sections + PR + @author | no | Sparse, highly curated |
| 3 | vuejs/core | framework | `v3.5.41` | Points to CHANGELOG.md | no | Release = pointer |
| 4 | sveltejs/svelte | framework | `svelte@5.56.8` | Changesets Patch Changes | no | Monorepo tag style |
| 5 | withastro/astro | framework | `astro@7.2.0` | Changesets + PR/commit/Thanks | no | Long prose for features |
| 6 | microsoft/vscode | app | `1.132.0` (no `v`) | Single URL to updates site | no | Blog is SSOT |
| 7 | rust-lang/rust | language | name `Rust 1.97.1`, tag `1.97.1` | Prose bullets + issue links | no | Product name in title |
| 8 | golang/go | language | — | **No GitHub Releases** | — | Blog + tags historically |
| 9 | prettier/prettier | tool | `3.9.6` (no `v`) | What's Changed + Changelog link | no | PR + author |
| 10 | biomejs/biome | CLI | `Biome CLI v2.5.7` / pkg tag | Patch Changes + Thanks | **yes** binaries | CLI asset pattern |
| 11 | oven-sh/bun | CLI | `Bun v1.3.14` / `bun-v…` | Install blurb + blog link + contributors | **yes** many zips | Blog is detailed SSOT |
| 12 | CuteLeaf/Firefly | theme | — | **0 releases** | — | Topics only; swapped out |
| 13 | withastro/starlight | docs theme | `@astrojs/starlight@0.41.7` | Changesets | no | Monorepo package tag |
| 14 | saadeghi/daisyui | UI lib | `v5.7.16` | Emoji + install + changelog URL | yes (js bundles) | Short GitHub body |
| 15 | satnaing/astro-paper | blog theme | `v6.1.0` | Auto What's Changed + New Contributors + Full Changelog | no | Theme baseline |
| 16 | tailwindlabs/tailwindcss | framework | `v4.3.3` | Keep a Changelog (Fixed/…) + PR | **yes** CLI bins | Strong KaC voice |
| 17 | vitejs/vite | bundler | `v8.2.1` / pkg tags | CHANGELOG.md pointer | no | Monorepo |
| 18 | pnpm/pnpm | CLI | `pnpm 11.20` / `v11.20.0` | Major/Minor Changes (detailed) | **yes** | Breaking first on majors |
| 19 | evanw/esbuild | bundler | `v0.28.1` | Long prose + GHSA/issue links | no | Security-forward |
| 20 | rolldown/rolldown | bundler | `v1.2.3` | Emoji KaC sections + New Contributors | no | git-cliff / conventional feel |
| 21 | colinhacks/zod | library | `v4.4.3` | Raw commit list | no | Low curation (avoid as model) |
| 22 | anomalyco/opencode | app/CLI | `v1.18.15` | Product sections (Core/Desktop) | **yes** desktop | Human product voice |
| 23 | firecrawl/firecrawl | API product | `Firecrawl v2.11.0` | Improvements (marketing prose) | no | Bold feature leads |
| 24 | oxc-project/oxc | toolchain | multi-tool title | Emoji BREAKING/Features/Fixes | **yes** | Breaking first |
| 25 | trpc/trpc | library | `v11.18.0` | What's Changed + New Contributors + Full Changelog | no | Classic GitHub auto+light edit |
| 26 | shadcn-ui/ui | CLI/registry | `shadcn@4.16.2` | Changesets Patch Changes | no | Package-scoped tags |
| 27 | stelcodes/multiterm-astro | blog theme | `Release v2.0.0` / `v2.0.0` | What's Changed + Full Changelog | no | Theme: PR laundry list |
| 28 | saicaca/fuwari | blog theme | — | **No releases** (as of survey) | — | Popular theme, tags optional |

Extra theme checks: `themefisher/bookworm-light-astro` and `davidvkimball/astro-modular` had release list noise / view misses in this pass; multiterm + astro-paper suffice for theme patterns.

## Pattern statistics (qualitative)

| Pattern | Prevalence | Takeaway |
|---------|------------|----------|
| Tag with `v` prefix | High among JS apps/themes; mixed for tools | Prefer `v1.0.0`; stay consistent per repo |
| Product name in title | Common for CLI/apps | Optional for libraries; good for Bun/Biome-like |
| Keep a Changelog sections | Tailwind, Rolldown, pnpm majors | Best default for curated notes |
| Changesets “Patch/Minor Changes” | Astro, Svelte, Starlight, shadcn | Great when monorepo already uses changesets |
| GitHub auto What's Changed | Next, tRPC, Astro Paper, Multiterm | Good draft; rewrite for product releases |
| CHANGELOG.md pointer only | Vue, Vite | OK when file is real SSOT |
| Blog/URL pointer | VS Code, Bun | Apps with marketing sites |
| Full Changelog compare link | Very common on GitHub-native notes | Always add when prev tag exists |
| New Contributors / Credits | Common mid-size OSS | Include when true |
| Binary Assets | CLI/runtime only | Skip for blog templates |
| Emoji section headers | Rolldown, Oxc, daisyUI | Optional; Firefly default = no emoji required |
| Raw commit dump | Zod | Avoid for human-facing product releases |
| AI-sounding fluff | Rare in top repos | Top repos stay concrete |

## Blog / theme vs library / framework

| | Library / framework | Blog / theme / template |
|--|---------------------|-------------------------|
| Consumer | npm/API integrators | Forkers / site owners |
| Body | API/CLI behavior, migration | Config, content UX, setup |
| Assets | Rare | Rare (source is the product) |
| Deps noise | Often hidden or “chore” | Should be collapsed |
| Version story | Tied to package version | May diverge from upstream theme version |
| First 1.0.0 | API stability signal | “Public product baseline” signal |

## Conclusions for this skill

1. **English, curated, KaC-shaped sections** are the mainstream professional default; Changesets prose is the monorepo variant.
2. **Draft from git/PR data, then edit** — do not ship raw dependabot walls for theme repos.
3. **Compare link + optional Credits** are cheap trust signals; use them.
4. **Assets follow distribution** — binaries for CLI; nothing for Firefly-like templates.
5. **Product SemVer ≠ upstream theme SemVer** — especially after a standalone fork; start at `1.0.0` when declaring a product line.
6. **Publish is a human gate** — notes can be prepared anytime; `gh release create` waits for explicit 「发布」.

## Normative refs

- https://keepachangelog.com/en/2.0.0/
- https://semver.org/
