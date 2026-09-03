---
name: wiki-post
description: >-
  Draft and publish GitHub Wiki pages (Home, FAQ, Deploy, feature handbooks)
  from repo module analysis and popular-wiki norms (Oh My Zsh / FiraCode / VS Code).
  Use whenever the user mentions wiki, GitHub Wiki, .wiki.git, wiki-post, Wiki 首页,
  建 Wiki, 写 Wiki, FAQ 页, Wiki 骨架, 说明书书架, or wants multi-page handbook docs
  that are not the repo README / docs/ tree — even if they only say「给仓库加个说明手册」.
  Draft first; never push to OWNER/REPO.wiki.git or click-create live pages unless
  the user explicitly says 发布 / 推送 Wiki / publish the wiki.
---

# wiki-post

Reusable workflow: **research modules → decide audience → draft pages → user confirm → (only if authorized) publish to GitHub Wiki**.

**SSOT path (this repo)**: `Firefly/.cursor/skills/wiki-post/`  
Discovery mirrors（一律 **junction** 指向 SSOT，禁止物理复制防漂移）：

| 位置 | 用途 |
|---|---|
| `Firefly/.agents/skills/wiki-post` | 仓内 Agent / Codex 系发现 |
| `blog/.cursor/skills/wiki-post` | 工作区根为上一级 `blog/` 时 |
| `~/.agents/skills/wiki-post` | 全局 agents |
| `~/.claude/skills/wiki-post` | Claude Code |
| `~/.cursor/skills/wiki-post` | Cursor 全局 skills |

## Hard gates

1. Draft Wiki Markdown in chat and/or a local staging dir the user asked for. **Wait for confirmation.**
2. Push to `https://github.com/<owner>/<repo>.wiki.git` (or create pages only via the GitHub UI) **only** when the user explicitly says **「发布」** / **「推送 Wiki」** / clear English: “publish the wiki now”.
3. Saying “写一下 Wiki / 起个 Home / 分析模块做说明书” ≠ authorization to push.
4. **Do not dual-write** long SSOT into both Wiki and `docs/`. Wiki = handbook / FAQ / how-to; `docs/` + ADR + AGENTS = versioned decisions and agent governance. Link across; do not copy paragraphs.
5. Prefer **Home as a navigation hub** (Oh My Zsh pattern), not a second README dump.
6. Never invent live Wiki page history or claim pages are published before push succeeds.

## When to load

- Empty GitHub Wiki / “Create the first page” welcome screen
- User wants multi-page handbook: Home, FAQ, Deploy, Theme-Customization, feature pages
- User asks to learn from popular Wikis (Oh My Zsh, FiraCode, VS Code) or to map repo modules into Wiki structure
- Keywords: wiki, wiki-post, `.wiki.git`, `_Sidebar`, Home, FAQ, 说明书, 手册, 多页文档

Not this skill: single-file README polish → use repo docs/README skills; release notes → `release-post`; blog posts → `post-publish` / `post-publish`.

## Audience cuts (pick one first)

| Audience | Model repo | Wiki should contain | Keep out of Wiki |
|---|---|---|---|
| **User handbook** (default for themes/blogs) | Oh My Zsh + FiraCode | Install, config how-tos, feature pages, FAQ, Troubleshooting | PRD, commit-history, agent discipline dumps |
| **Contributor / project mgmt** | VS Code Wiki | How to report bugs, contribute, project process | End-user product manual (point to site/docs) |
| **Mixed** | Home with two sections | Short user path + short contrib path; deep content still in `docs/` | Duplicating AGENTS.md verbatim |

For fork-Firefly / Astro blog templates, default = **User handbook** unless the user says otherwise.

## README · docs/ · Wiki (SSOT table)

| | README | `docs/` in repo | GitHub Wiki |
|---|---|---|---|
| Where | repo root | same git tree | side repo `*.wiki.git` |
| Best for | one-screen onboarding | versioned tech docs (PR-reviewed) | multi-page handbook / FAQ / per-tool pages |
| Edit path | commit/PR | commit/PR | web edit or clone `.wiki.git` |
| Tracks tags/branches? | yes | yes | **no by default** — drifts easily |

Popular counterexamples: Homebrew / Astro / github-readme-stats often set `has_wiki: false` and put manuals on the website or in `docs/`. If the repo already has thick `docs/`, Wiki is optional — use it for discoverability and FAQ shards, not a second AGENTS.

Details: [references/research-notes.md](references/research-notes.md) · [references/ssot-boundaries.md](references/ssot-boundaries.md)

## Workflow (agent checklist)

Copy and track:

```text
Wiki progress:
- [ ] 1. Confirm audience (user | contributor | mixed)
- [ ] 2. Detect existing Wiki / docs/ / README (avoid duplication)
- [ ] 3. Module inventory (or refresh) → page map
- [ ] 4. Draft Home + _Sidebar (+ optional _Footer)
- [ ] 5. Draft P0 pages (Getting-Started, FAQ, Deploy or Config-Overview)
- [ ] 6. Draft P1+ feature shards (FiraCode-style: one topic per page)
- [ ] 7. User confirms wording + page tree
- [ ] 8. Alignment checklist (below)
- [ ] 9. ONLY if user said 发布/推送 Wiki → clone/push .wiki.git
```

### Module inventory (when drafting structure)

Scan at least:

- `src/config` (or equivalent knobs)
- content model / routes
- layouts (note high-risk files)
- component folders → candidate feature pages
- deploy adapter (Vercel/CF/…)
- special product features (search, comments, music, pets, …)

For each module capture: path, responsibility, user-facing knobs, contributor gotchas, suggested Wiki page name.  
Firefly-oriented map: [references/module-map-firefly.md](references/module-map-firefly.md) (load when working in this repo).

### Alignment checklist (before publish)

- [ ] Home is a hub with links, not a full second README
- [ ] `_Sidebar` groups match Home sections
- [ ] Every deep “why/ADR/agent” topic **links** to `docs/` or AGENTS — not pasted
- [ ] Page titles are Wiki-slug friendly (`Getting-Started`, `Deploy-Vercel`)
- [ ] No secrets / tokens / private URLs
- [ ] Chinese/English: match repo audience (fork-Firefly default: **Chinese handbook OK**; keep code identifiers in English)
- [ ] Empty sections deleted; no “TODO: fill later” on published pages unless user wants stubs

### Publish commands (authorized only)

```bash
# From a clean temp or user-chosen dir — do NOT commit wiki into the main repo tree
git clone "https://github.com/<owner>/<repo>.wiki.git"
# Write/edit Home.md, _Sidebar.md, ….md
git -C <wiki-dir> add -A
git -C <wiki-dir> commit -m "docs(wiki): add Home and starter handbook pages"
git -C <wiki-dir> push
```

Notes:

- First page on GitHub UI is often titled `Home`.
- Local clone works only after the Wiki has been initialized once (Create first page) **or** when the `.wiki.git` remote already exists.
- Prefer UTF-8 files. On Windows avoid `file://` previews for unrelated HTML shells.
- There is **no PR review** on default Wiki unless the project mirrors from a separate docs repo (Oh My Zsh `ohmyzsh/wiki` pattern). Say so if the user expects PR flow.

## Recommended page tree (blog / theme / template)

P0 — empty Wiki → usable:

1. `Home`
2. `Getting-Started`
3. `FAQ`

P1 — secondary-dev handbook:

4. `Official-Docs-Map`（若工作区有上游主题 docs 镜像 / 出厂文档：对照表，不整篇搬迁）
5. `Configuration-Overview`（含 **官方默认 ≠ 本站** 差异速查）
6. `Writing-Content` (or `Writing-Posts`)
7. `Deploy`

P2 — FiraCode-style shards (one concern per page):

8. Feature pages that **diverge from upstream docs** first (Comments, Music, Wallpaper+Atmosphere, Pets, Sidebar/Gift, …)
9. Then Search / Collections / Dynamic / …
10. `Troubleshooting`
11. `Markdown-Syntax` (optional)

P3 — contributor short pages:

12. `Architecture` (module diagram + “don’t casually split Layout”)
13. `Contributing` (links to AGENTS / workflow — no paste)

When upstream theme docs exist locally (e.g. Firefly `docs/official/`): Wiki writes **delta + how-to**; full key tables stay in official docs. See [references/ssot-boundaries.md](references/ssot-boundaries.md).

Home / Sidebar templates: [examples/home-and-sidebar.md](examples/home-and-sidebar.md)  
Getting-Started skeleton: [examples/getting-started.md](examples/getting-started.md)

## Page writing rules

**Do**

- Lead with what the reader can do in 1–2 sentences
- Prefer tables for install/commands and config keys
- Link to source paths (`src/config/musicConfig.ts`) for contributors
- One topic per page; keep Home thin
- Use `_Sidebar` grouping: Getting started · Handbook · Ops · Contributing

**Don't**

- Dump raw `git status` / internal agent transcripts into Wiki
- Mirror entire `CONTEXT.md` / PRD / commit-history
- Write AI filler (“comprehensive guide to seamlessly…”)
- Claim Astro/Homebrew-style “we disabled Wiki” as a bug — it is a valid choice
- Push half-finished trees without labeling stubs

## Tone

- Handbook voice: direct, skimmable, concrete
- Chinese OK for this author’s blogs; keep filenames/slugs ASCII
- Code, config keys, CLI in backticks
- Same anti-fluff bar as `release-post`

## Firefly / fork-Firefly notes

- Repo: `Aafff623/fork-Firefly` — Wiki enabled but may still be empty welcome page
- Thick `docs/` already exists → Wiki = user/secondary-dev handbook; governance stays in AGENTS/CONTEXT/docs
- Default audience: **user handbook** (config, content, deploy, feature shards)
- Delivery still follows site rules for the **main** site (`pnpm dev` etc.); Wiki publish is a separate `.wiki.git` push gate
- Local README/Release preview on **8090** is unrelated to GitHub Wiki
- **Workspace clone (preferred staging)**: 多仓工作区 `blog/` 下旁挂  
  `D:\code\fork-Firefly.wiki`
  （`git remote` → `https://github.com/Aafff623/fork-Firefly.wiki.git`）。  
  草稿与后续改页优先落这里，不要只写在主仓 `Firefly/` 树内。  
  若远程尚未因「Create the first page」而出生，本地可先 `git init` + 提交；网页点过一次 Create（或远程已可 `ls-remote`）后再 `push`。  
  `temp/research/wiki-draft/` 仅作临时草稿，确认后应同步进上述 wiki 工作副本。

## Progressive disclosure

- Popular-wiki research: [references/research-notes.md](references/research-notes.md)
- SSOT boundaries & anti-drift: [references/ssot-boundaries.md](references/ssot-boundaries.md)
- Firefly module → page map: [references/module-map-firefly.md](references/module-map-firefly.md)
- Examples: [examples/home-and-sidebar.md](examples/home-and-sidebar.md), [examples/getting-started.md](examples/getting-started.md)
