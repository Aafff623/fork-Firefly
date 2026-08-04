# handoff · dual-pet-deepseek · 2026-08-04

## Status

ready-for-implement（PRD approved）

## Scope

单实例 SpritePet 路由换皮：默认 Maid（v2）· 文章 OpenPet（8×9）· 根除 cc-haha 四宠。

## Touch points

- `src/lib/pets/petAnimation.ts` — atlas 变体
- `src/lib/pets/builtinPets.ts` — 两新宠
- `src/config/petConfig.ts` + `src/types/petConfig.ts`
- `src/components/features/SpritePet.svelte`
- `src/layouts/MainGridLayout.astro`
- `public/pets/*`
- `CONTEXT.md` · `docs/knowledge/dual-pet-deepseek.md`

## Verify

- 首页 Maid · `/posts/*` OpenPet · Swup 来回 ×3
- 移动浏览见 A / 进文隐
- `rg` 无旧四宠 ID（产品路径）
- `pnpm check` · `pnpm type-check`
