# handoff · reading-ui-polish · 2026-08-01

## Status
awaiting-review

## Done
- Phase 0–5 已按 Plan 落地
- `pnpm check` / `pnpm type-check`：0 errors

## Touch surfaces
- TOC：`toc-shared.ts` · `toc.css` · SidebarTOC · FloatingTOC
- List：`PostPage` · `PostCard` · `post-card.css` · ArchivePanel · RecommendedPost
- About：`about.md` · `about.astro`
- Accent：`categories.css` · `tags.css` · `variables.styl` 注释

## Verify
1. `pnpm dev` → 首页切 list/grid；文章 TOC；`/about/`；`/archive/`；tags
2. 暗色 + reduced-motion
3. 你确认后再 commit/push → 核线上
