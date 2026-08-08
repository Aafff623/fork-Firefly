# GitHub Wiki research (condensed)

Survey date: 2026-08-08. Method: fetch live Wiki Home/sidebars + prior discussion of README/`docs/`/Wiki roles. Patterns below are durable.

## Sample set (usable Wiki patterns)

| # | Repo | Wiki role | Home pattern | Page strategy | Notes |
|---|------|-----------|--------------|---------------|-------|
| 1 | ohmyzsh/ohmyzsh | Textbook **user handbook** | Install table → Getting started links → Advanced → Community | FAQ, Plugins Overview, Themes, Troubleshooting, Contributing; strong `_Sidebar` groups | Content synced from separate `ohmyzsh/wiki` (PR-able) |
| 2 | tonsky/FiraCode | **Fragment tutorials** | Ultra-thin Home = TOC only | One page per editor (VS Code, JetBrains, Windows Terminal, …) | Wiki’s best niche: many small how-tos |
| 3 | microsoft/vscode | **Contributor / project** | Explicitly “for contributors”; users sent to product site | Bug reporting, contributing, project management | Proves Wiki ≠ always end-user docs |
| 4 | Homebrew / Astro / github-readme-stats | Often `has_wiki: false` | — | Manual on website or repo `docs/` | Modern default when docs site exists |

## Pattern statistics (qualitative)

| Pattern | Prevalence among “alive” Wikis | Takeaway |
|---------|--------------------------------|----------|
| Home as navigation hub | Very high (OMZ) | Do not paste full README |
| `_Sidebar` grouped links | High on mature Wikis | Mirror Home sections |
| FAQ + Troubleshooting split | OMZ classic | Keep FAQ short; put diagnosis steps in Troubleshooting |
| One-topic pages | FiraCode extreme | Prefer many short pages over one megapage |
| Contributor-only Wiki | VS Code | Valid when product docs live elsewhere |
| Wiki disabled | Common in docs-site projects | Not a failure mode |
| Separate wiki repo + sync | OMZ | Only if you need PR review on Wiki |
| Default `.wiki.git` no PR | Universal GitHub default | Draft carefully; push is publish |

## README · docs/ · Wiki (roles)

| Layer | Job |
|-------|-----|
| README | Front door: what it is, quick start, badges, link out |
| `docs/` | Versioned, PR-reviewed, travels with tags/branches |
| Wiki | Multi-page handbook shelf; easy web edits; **drifts from tags** |

One-liner: README is the storefront; Wiki is the instruction bookshelf; many modern projects put the bookshelf in `docs/` or a docs site instead.

## Conclusions for this skill

1. **Default audience for blog/theme templates = user handbook** (OMZ + FiraCode hybrid), not VS Code contributor Wiki.
2. **Home + Sidebar first**, then P0 trio (Getting-Started / FAQ / Deploy or Config).
3. **Feature shards** beat megadocs — one concern per page.
4. **Never dual-write SSOT** with `docs/` / AGENTS / ADR; Wiki links inward.
5. **Publish is a human gate** — same spirit as `release-post`「发布」.
6. If `docs/` is already thick, Wiki is optional discoverability — start small (3 pages).

## Normative / example URLs

- https://github.com/ohmyzsh/ohmyzsh/wiki
- https://github.com/tonsky/FiraCode/wiki
- https://github.com/microsoft/vscode/wiki
- GitHub Docs: about Wikis (side repository `*.wiki.git`)
