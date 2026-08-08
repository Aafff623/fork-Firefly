# SSOT boundaries — keep Wiki from rotting

## Why this file exists

GitHub Wiki lives in `OWNER/REPO.wiki.git`. It does **not** ride along with git tags/branches of the main repo. If agents paste AGENTS/ADR/PRD into Wiki, two truths diverge within weeks.

## Put in Wiki

- How to install / run locally
- How to flip config knobs (with key names + paths)
- Feature handbooks (music, pets, wallpaper, comments…)
- FAQ and Troubleshooting steps
- URL map for humans
- Short Architecture overview that **points** to source files

## Keep in main repo (`docs/`, `AGENTS.md`, `CONTEXT.md`, ADR)

- Agent discipline and delivery loops
- PRD / handoff / commit-history
- Architecture Decision Records (full text)
- Versioned tech-stack inventories
- Secrets handling rules
- Anything that must match a specific commit/tag

## Linking rules

```text
Wiki page → "详见仓库 docs/adr/0001-waline-over-giscus.md"
Wiki page → "配置真源：src/config/commentConfig.ts"
docs/     → optional "访客向说明见 Wiki · Comments"
```

Prefer one direction for narrative depth: **decisions in docs/, procedures in Wiki**.

## Anti-patterns

| Anti-pattern | What happens | Fix |
|---|---|---|
| Paste entire CONTEXT into Home | Stale within one config rename | Home = links + 5-line blurb |
| Wiki-only deploy secrets | Leaks + no review | Env vars stay in host dashboard; Wiki lists **names only** |
| Duplicate FAQ in README and Wiki | Drift | README links to Wiki FAQ |
| Publish every agent transcript | Noise | Curate; leave research in `docs/idea/` |

## Staging drafts (optional)

If the user wants review before `.wiki.git` push, stage under a **local-only** path they choose (e.g. `.scratch/wiki-draft/` — often gitignored). Do not commit Wiki bodies into `src/` or pretend they are Content Collections.
