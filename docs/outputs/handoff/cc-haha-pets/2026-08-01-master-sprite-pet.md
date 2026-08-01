# Handoff：cc-haha 站内桌宠

## Status

implementing → awaiting local verify

## Decisions

互斥 · `petConfig.ts` · 默认 `dada-code` · 无设置面板 · 无自定义导入

## Touched

- `public/pets/**`
- `src/lib/pets/*`
- `src/config/petConfig.ts` · barrels
- `src/components/features/SpritePet.svelte`
- `src/layouts/MainGridLayout.astro`
- `docs/knowledge/cc-haha-pets.md`

## Verify

1. `petConfig.enable = true`
2. `pnpm dev` → 左下角搭搭
3. `pnpm check && pnpm type-check`
