# handoff · reading-ui-polish · 2026-08-01

## Status
shipped-local（6 笔原子 commit 已落；未 push）

## Done
- Phase 0–5 已按 Plan 落地
- 后续：标题井号清除、暖黄焦点包字+浓度渐变、热力图蛇恢复、answer-format 移除
- `pnpm check` / `pnpm type-check`：0 errors（实现期）

## Commits
- `5f0d3276` docs(reading-ui)
- `37915af9` feat(toc)
- `825e2052` feat(reading-ui)
- `b45c5cc2` fix(markdown)
- `bb7f096f` fix(calendar)
- `f0a4e1f1` chore(agents)

## Touch surfaces
- TOC：`toc-shared.ts` · `toc-utils.ts` · `toc.css` · SidebarTOC · FloatingTOC
- List：`PostPage` · `PostCard` · `post-card.css` · ArchivePanel · RecommendedPost
- About：`about.md` · `about.astro`
- Accent：`categories.css` · `tags.css` · `variables.styl` 注释
- Markdown：`astro.config.mjs` · `rehype-strip-heading-anchors.mjs` · `markdown.css`
- Calendar：`Calendar.astro`（蛇）

## Verify
1. `pnpm dev` → 首页切 list/grid；文章 TOC + 暖黄标题；无 `#`；`/about/`；热力图紫蛇
2. 暗色 + reduced-motion
3. 待你说 push → 核线上 https://fork-firefly.vercel.app
