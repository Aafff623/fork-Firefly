---
name: release-post
description: >-
  Draft professional GitHub Release notes and SemVer tags for open-source repos
  (library, CLI, blog theme/template). Use when the user asks to publish a
  release, write release notes, changelog, version bump, gh release create,
  release-post, 发布, 版本说明, or tag a product version. Draft first; never
  create a GitHub Release/tag unless the user explicitly says 发布.
---

# release-post

Reusable workflow: **draft → user confirm → (only if authorized) publish**.

**SSOT path (this repo)**: `Firefly/.cursor/skills/release-post/`  
Global discovery: `~/.agents/skills/release-post` and `~/.claude/skills/release-post` are junctions to this directory — do not fork a second copy.

## Hard gates

1. Draft release notes in chat (or a local file the user asked for). **Wait for confirmation.**
2. Run `gh release create` / `git tag` **only** when the user explicitly says **「发布」** (or clear English: “publish the release now”).
3. Saying “写一下 release notes / 准备发版 / bump version” ≠ authorization to publish.
4. Never inherit upstream theme versions (e.g. Firefly theme `6.15.3`) as **product** SemVer. Product line starts at **`1.0.0`** unless the user states another number.
5. `package.json` `version` may still mirror an upstream theme; treat **product Release tag** and **upstream theme version** as separable. Align them only when the user asks.

## When to load

- User wants GitHub Release / release notes / CHANGELOG entry / SemVer bump
- Repo is personal blog, Astro theme/template, library, or CLI
- Keywords: release, release notes, changelog, SemVer, `gh release`, tag, 发布, 版本说明, v1.0.0

## SemVer quick map

| Bump | When (libraries/CLI) | Blog / theme / template (pragmatic) |
|------|----------------------|-------------------------------------|
| **MAJOR** `X.0.0` | Breaking API/CLI/config | Breaking config keys, removed features, incompatible content model, “must migrate” |
| **MINOR** `x.Y.0` | Backward-compatible features | New widgets/features, notable UX, new optional config |
| **PATCH** `x.y.Z` | Fixes, docs, chore | Bugfixes, copy, dependency bumps without behavior change |

- First public product release → **`1.0.0`** (tag `v1.0.0` recommended).
- Pre-releases: `1.1.0-beta.1` / tag `v1.1.0-beta.1` only if user wants.

Details + research patterns: [references/research-notes.md](references/research-notes.md)

## Workflow (agent checklist)

Copy and track:

```text
Release progress:
- [ ] 1. Classify repo type (library | cli | blog-theme-template)
- [ ] 2. Decide SemVer + tag name (prefer v-prefixed: v1.2.3)
- [ ] 3. Gather changes (git log / compare / user list)
- [ ] 4. Draft English notes from template below
- [ ] 5. Optional: short Chinese summary appendix
- [ ] 6. User confirms wording + version
- [ ] 7. Alignment checklist (below)
- [ ] 8. ONLY if user said 发布 → gh release create
```

### Alignment checklist (before publish)

- [ ] Tag matches notes title (`v1.0.0`)
- [ ] If user wants: `package.json` `"version"` matches product SemVer (strip `v`)
- [ ] README badge / docs version strings updated **only if** repo already uses them
- [ ] No leftover wrong tags (e.g. mistaken upstream `v6.x`)
- [ ] Previous tag known for Full Changelog compare URL
- [ ] Assets: skip for blog/theme unless user wants zip; CLI may attach binaries

### Publish command (authorized only)

```bash
# notes.md = confirmed body; create from target commit/branch
gh release create "v1.0.0" \
  --title "v1.0.0" \
  --notes-file notes.md \
  --target main
```

Optional: `--latest`, `--prerelease`, attach files after title args.  
Prefer `--notes-file` (UTF-8) over inline `--notes` on Windows.

If first release and no prior tag, omit compare link or link from initial commit.

## Repo-type cuts

### library / framework

- Prefer curated bullets over raw commit dumps.
- Sections: Added / Changed / Fixed / Deprecated / Removed / Security; add Breaking + Migration when needed.
- Link PRs (`#123`) and authors when known; Changesets-style “Thanks @user” is fine.
- Assets usually **none** (npm publishes separately).
- Point to `CHANGELOG.md` when the repo maintains one (Vue/Vite pattern).

### CLI tool

- Title often includes product name: `Biome CLI v2.5.7` / `Bun v1.3.14` / `pnpm 11.20`.
- Lead with install/upgrade one-liner when helpful.
- Breaking Changes first if any.
- Assets: platform binaries **when the project ships them**; otherwise none.

### blog / theme / template (incl. fork-Firefly)

- Audience: site owners forking/using the template, not npm consumers.
- **No npm package requirement**; Assets optional (usually omit).
- Emphasize config, content model, Agent/workflow, UX — not internal chores.
- Collapse pure `chore(deps)` unless security-relevant.
- GitHub auto “What's Changed” is a draft source; **rewrite** into curated Added/Fixed.
- First product release: state standalone lineage briefly (optional one line), then features.

Filled examples: [examples/](examples/)

## English release notes template (primary)

Use this body for `--notes-file` (adjust sections; delete empties).

```markdown
## What's new

<!-- One or two sentences: why this release exists. Skip if PATCH with nothing to say. -->

### Breaking Changes

- …

### Migration

1. …
2. …

### Added

- …

### Changed

- …

### Fixed

- …

### Deprecated

- …

### Removed

- …

### Security

- …

### Documentation

- …

### Credits

- Thanks @user for #123

### New Contributors

- @user made their first contribution in #123

**Full Changelog**: https://github.com/OWNER/REPO/compare/vPREV...vTHIS
```

**Title conventions**

| Style | Use |
|-------|-----|
| `v1.2.3` | Default for blog/theme/template and most libs |
| `1.2.3` | OK if repo already omits `v` (Prettier, VS Code) — stay consistent |
| `Product v1.2.3` | CLI/apps with brand recognition (Bun, Biome, Firecrawl) |

Optional subtitle / release name: `v1.0.0 — Initial public release` (GitHub “Release title”).

**Breaking / Migration**

- Breaking: state old vs new behavior in one line each.
- Migration: numbered steps a human can follow; link docs if any.
- Do not hide breaks under “Changed”.

**Full Changelog**

```text
https://github.com/<owner>/<repo>/compare/<prev_tag>...<this_tag>
```

First release: omit, or `https://github.com/<owner>/<repo>/commits/<this_tag>`.

## Tone rules (do / don't)

**Do**

- User-facing outcomes: `Added draftbox preview for local posts`
- Past tense or noun phrases: `Fixed …` / `Added …` (Keep a Changelog style)
- Concrete nouns; link PR/issue when it helps verification
- Short bullets; one idea per line
- English primary for public GitHub notes

**Don't**

- AI filler: “In this exciting release…”, “robust”, “seamless”, “comprehensive”, “leverage”
- Empty buckets: “Various improvements”, “Miscellaneous bug fixes” with no detail
- Dump every dependabot PR into theme releases
- Claim “production-ready / enterprise” without substance
- Invent contributor names or PR numbers

Prefer human curation over auto-generated walls of commits (Zod-style raw lists are a last resort).

## Optional Chinese appendix

For Chinese-speaking maintainers (e.g. Firefly): keep **English body as the GitHub Release**; append a short bilingual block only if the user wants:

```markdown
---

## 中文摘要

- …
- …

本次版本：`vX.Y.Z`。完整说明见上方英文 notes。
```

Do not make Chinese the only body unless the user asks for a Chinese-first release.

## Firefly / fork-Firefly notes

- Repo: `Aafff623/fork-Firefly` — Astro blog + Agent publishing pipeline; Template distribution.
- Product SemVer from **`1.0.0`**; ignore upstream theme `6.15.3` for Release tags.
- Typical v1.0.0: curated Added (config-driven site, draftbox, agent skills pipeline), no Assets, English notes + Chinese section.
- Local bilingual preview: `preview-release.html` + `release-notes/<tag>.md` on port **8090** (same server as README preview).
- Still: draft → confirm → only `gh release create` after 「发布」.

## Progressive disclosure

- Research summary (20+ repos): [references/research-notes.md](references/research-notes.md)
- Example — framework-like: [examples/framework-release.md](examples/framework-release.md)
- Example — blog template v1.0.0: [examples/blog-template-v1.md](examples/blog-template-v1.md)
