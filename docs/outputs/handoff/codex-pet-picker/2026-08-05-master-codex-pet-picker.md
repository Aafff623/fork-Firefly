# handoff · codex-pet-picker · 2026-08-05

## Status

**implemented · checks green**（`pnpm type-check` · `pnpm check` 0 errors；待浏览器勾验 / 园主确认后再 commit）

## Scope

访客在显示设置「桌宠」Tab 单选换皮；默认保留 DeepSeek 双宠；首批 5 只 Codex v1 皮。

## Touch points

| 路径 | 职责 |
|---|---|
| `docs/outputs/prd/codex-pet-picker/prd.md` | PRD（approved） |
| `public/pets/{5 slugs}/` · `README.md` | 素材 + 许可 |
| `scripts/fetch-codex-pets.mjs` | 复拉脚本 |
| `src/lib/pets/builtinPets.ts` | 注册表 |
| `src/config/petConfig.ts` · `types/petConfig.ts` | picker 配置 |
| `src/components/features/SpritePet.svelte` | 覆盖 / 游走解耦 |
| `src/components/controls/DisplaySettingsIntegrated.svelte` | 桌宠 Tab |
| `src/utils/setting-utils.ts` | localStorage + 事件 |
| `docs/knowledge/codex-pet-picker.md` | 知识 |

## Verify

- [ ] 默认：首页 Maid 游走+look；进文 OpenPet；Swup ×3
- [ ] 选「点点」：全站点点；浏览可游走；文章不游走；刷新记忆
- [ ] 切回默认：恢复双宠
- [ ] GPT-muse 旁有「许可未明确」
- [x] `pnpm check` · `pnpm type-check`（0 errors）

## Backlog

- 柯基 / 柯南等 MCP Hub 批次
- ganyu / giyu / gintoki / goblin
- 设置项缩略预览帧（现为 accent 色点）
