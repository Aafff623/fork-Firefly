# handoff · dual-pet-deepseek · 2026-08-04

## Status

**shipped + pushed**（`origin/master` @ `8384c322`）  
旧 handoff「ready-for-implement」已过期；本文件为接续真源。

旧四宠手递：`docs/outputs/handoff/archive/cc-haha-pets/2026-08-01-master-sprite-pet.md`（已废，勿按 `petId`/`dada-code` 操作）。

## Scope（已交付）

单实例 `SpritePet` 路由换皮：

| 路由 | 宠 | Atlas |
|---|---|---|
| 浏览态（非 `/posts/*`） | `maid-deepseek-whale` | v2 8×11 + look |
| 文章页 `/posts/*` | `openpet-deepseek` | classic 8×9 |

另含同批 UI：sticky 顶栏滚向显隐、标签墙折叠 + `/tags/` 砖墙、关于页扁平化、双宠成帖与 README showcase。

## 行为要点（接续必读）

1. **游走**：浏览态 Maid 挂侧栏卡片**外侧留白**（左卡左缘 / 右卡右缘），不压正文；朝向内容（左→右脸，右→左脸镜像）。
2. **计时**：卡间固定 **5s**（无 jitter）；仅用户拖拽改坐标后走 **2s**，并作废原计划目标，在视口可见卡里重随机。
3. **拖放坐标**：松手后为**文档绝对坐标**（`position: absolute`），滚窗口不跟视口跑；约 2s 后再钻洞回卡片游走。
4. **响应式**：`hideOnMobileBrowse: false` · `hideOnMobilePost: true`。
5. **开关**：`src/config/petConfig.ts` → `enable` / `defaultPetId` / `postPetId` / `roam.*`。

## Touch points

| 路径 | 职责 |
|---|---|
| `src/components/features/SpritePet.svelte` | 渲染 / 拖拽 / 游走 / 朝向 |
| `src/lib/pets/petRoamAnchors.ts` | 可见锚点、外侧角、朝向 |
| `src/lib/pets/builtinPets.ts` · `petAnimation.ts` | 双宠定义与 atlas |
| `src/config/petConfig.ts` · `src/types/petConfig.ts` | 配置契约 |
| `src/layouts/MainGridLayout.astro` | 挂载 props |
| `src/layouts/Layout.astro` | sticky 顶栏 `navbar-scroll-hidden` |
| `public/pets/maid-deepseek-whale/` · `openpet-deepseek/` | 资产 |
| `src/content/posts/dual-pet-deepseek/` | 成帖 |
| `docs/knowledge/dual-pet-deepseek.md` | 知识 |
| `docs/outputs/prd/dual-pet-deepseek/prd.md` | PRD |
| `docs/outputs/commit-history/master/2026-08-04-dual-pet-ui.md` | 本批 commit 表 |

## Commits（本批）

`6fb0b158` pets → `a715450c` nav → `accfa9e9` tags → `c5620ca0` about → `70cf5e7f` posts → docs/skills/idea → `8384c322` commit-history  
详见 commit-history 文件，勿逐条抄 log。

## Verify（接续自检）

- [ ] 首页 Maid 在左右**页边留白**，不挡「最新动态 / 热笺 / 统计」正文
- [ ] 左留白朝右、右留白朝左；卡间约 5s 换位
- [ ] 拖一下：停在落点（滚页不跟视口）；约 2s 后钻洞到新卡（非拖前计划卡）
- [ ] `/posts/*` 变 OpenPet；Swup 回首页再变 Maid ×3
- [ ] 窄屏：浏览可见 / 进文隐藏
- [ ] sticky 顶栏：下滑藏、上滑出
- [ ] `pnpm check` · `pnpm type-check`（若接续改代码）

## Backlog（未做）

- 外侧偏移再加大 / 贴浏览器最外红框的微调（若线上仍略挡字）
- 访客面板切换宠 / 自定义 atlas（明确不做，除非新 PRD）
- 旧 `cc-haha-pets` handoff 可归档进 `archive/`（可选）

## Suggested skills

- `humanizer-output-style` — 对园主回复语气
- `site-cascade` — 若再发文/改动态
- `ob2blog` — Obsidian → 帖
- `knowledge-extract` / `knowledge-output` — 知识成帖
- Firefly GSAP skills — 仅当改动效时

## 下一会话怎么开

1. 读本 handoff + `docs/outputs/commit-history/master/2026-08-04-dual-pet-ui.md`
2. 本地 `pnpm dev`（`http://localhost:4321`，勿用死 `127.0.0.1`）
3. 按 Verify 勾一遍；有挡字/朝向问题再改 `petRoamAnchors.ts` + `SpritePet.svelte` 偏移常量
