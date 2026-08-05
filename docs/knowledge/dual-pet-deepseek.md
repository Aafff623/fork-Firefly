# 双桌宠 DeepSeek（Maid + OpenPet）

> 配置：`src/config/petConfig.ts` · 组件：`SpritePet.svelte` · 锚点：`src/lib/pets/petRoamAnchors.ts`  
> PRD：`docs/outputs/prd/dual-pet-deepseek/prd.md`  
> Handoff（shipped）：`docs/outputs/handoff/dual-pet-deepseek/2026-08-04-master-dual-pet.md`

## 映射

| 页面态 | 宠 ID | Atlas | lookFollow |
|---|---|---|---|
| 非 `/posts/`（浏览） | `maid-deepseek-whale` | v2 · 8×11 | 可开（跟配置） |
| `/posts/*`（文章） | `openpet-deepseek` | classic-8×9 | **强制关** |

手机：`hideOnMobileBrowse: false` · `hideOnMobilePost: true`。

## 视口内卡片外侧留白游走（仅 Maid）

| 规则 | 说明 |
|---|---|
| 落点 | **挂到侧栏卡片外侧留白**（左卡→左缘、右卡→右缘；`position:absolute` 随卡片走）；不压正文区 |
| 朝向 | 朝向内容：左留白→右脸，右留白→左脸（镜像） |
| 起始 | 优先贴「最新动态」卡片外侧（须在视口内可见） |
| 候选 | `dynamics` · `announcement` · `hotPosts` · `stats` · `profile` · `tags` · `calendar` · `clock` |
| 硬约束 | **只选当前窗口内可见**的侧栏卡；滚出视口的卡永不落点 |
| 停留 | 卡间固定约 **5s** 再换（`intervalMs` / `minIntervalMs` = 5000，`jitterMs` = 0） |
| 迁移 | 钻洞：淡出 → 瞬移到目标外侧 → 淡入跑步「爬出」；抵达再播一次短动作 |
| 滚动 | 当前卡滚出后 **先等 ~2.4s**（`scrollLeaveDelayMs`；还在滑就不急），再钻洞挪到仍可见的卡 |
| 拖拽 | 只有拖拽才改自由坐标；松手后为**文档绝对坐标**（滚窗口不跟视口跑）；约 **2s**（`resumeAfterDragMs`）后作废原计划目标，在视口可见卡里重随机并钻洞回游走 |
| 文章页 | OpenPet，不游走 |

配置：`spritePetConfig.roam`（`enable` / `intervalMs` / `minIntervalMs` / `jitterMs` / `fadeMs` / `scrollLeaveDelayMs` / `resumeAfterDragMs` / `pauseWhenPinned`）。

## 怎么开

1. `petConfig.ts` → `enable: true`
2. Spine / Live2D 保持 `enable: false`
3. `pnpm dev`：首页见 Maid；进文章见 OpenPet

可调：`defaultPetId` · `postPetId` · `position` · `size` · `lookFollow` · `responsive.*` · `roam.*`  
位置记忆：`localStorage` key `firefly-sprite-pet-pos-v3`（仅用户拖过写入）。

## 交互（两宠共用）

- 点头 / 身 / 脚分区动作；抓取时跳一下；拖拽记忆位置
- Swup 切页换皮（预加载双图 + opacity 交叉淡化）
- Maid 可视线跟随；OpenPet 无 look 行
- 亮暗色滤镜随 `html.dark`；主题开关轻脉冲
- `prefers-reduced-motion`：跳过淡化 / 主题脉冲 / 游走插值

## 许可

见 `public/pets/README.md`。历史：`docs/knowledge/cc-haha-pets.md`（已归档）。

## 访客换皮

设置面板「桌宠」Tab 可覆盖为 Codex v1 单皮（全站同皮）。语义见 `docs/knowledge/codex-pet-picker.md`。
