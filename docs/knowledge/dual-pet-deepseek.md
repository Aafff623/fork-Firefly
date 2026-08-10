# 双桌宠 DeepSeek（Maid + OpenPet）

> 配置：`src/config/petConfig.ts` · 组件：`SpritePet.svelte` · 锚点：`src/lib/pets/petRoamAnchors.ts` · 场景：`src/lib/pets/petScenarios.ts`  
> PRD：`docs/outputs/prd/dual-pet-deepseek/prd.md`  
> Handoff（shipped）：`docs/outputs/handoff/dual-pet-deepseek/2026-08-04-master-dual-pet.md`

## 映射

| 页面态 | 宠 ID | Atlas | lookFollow |
|---|---|---|---|
| 非 `/posts/`（浏览） | `maid-deepseek-whale` | v2 · 8×11 | 可开（跟配置） |
| `/posts/*`（文章） | `openpet-deepseek` | classic-8×9 | **强制关** |

手机：`hideOnMobileBrowse: false` · `hideOnMobilePost: true`。

**换班不是随机换宠**：进文 / 回浏览是固定双 DeepSeek 路由换班。进文前短跑 → 淡出 → 切 OpenPet → 淡入 → `review`；回浏览挥手告别 → 切回 Maid（或访客覆盖皮）→ `waving` → 恢复游走。

## 可见性兜底

浏览态侧栏锚点为空（about / 相册 / 合集 / 标签 / 友链等）时：强制视口角兜底（`position` / `offset`），`skinOpacity = 1`，并轻挥手一次（冷却）。禁止长期停在「无坐标」中间态。

## 视口内卡片外侧留白游走（浏览态）

| 规则 | 说明 |
|---|---|
| 落点 | **挂到侧栏卡片外侧留白**（左卡→左缘、右卡→右缘）；不压正文区 |
| 朝向 | 朝向内容：左留白→右脸，右留白→左脸（镜像） |
| 起始 | 优先贴「最新动态」卡片外侧（须在视口内可见） |
| 候选 | `dynamics` · `announcement` · `gardenNote` · `hotPosts` · `stats` · `profile` · `tags` · `categories` · `calendar` · `clock` |
| 硬约束 | **只选当前窗口内可见**的侧栏卡；滚出视口的卡永不落点 |
| 停留 | 卡间固定约 **7.5s** 再换（`intervalMs` / `minIntervalMs` = 7500，`jitterMs` = 0） |
| 近距迁移 | 同栏且视口距离 ≤ `nearMoveMaxPx`（默认 420）：插值小跑 `nearMoveMs`（默认 520）+ `running-left/right` |
| 远距迁移 | 跨栏 / 过远 / reduced-motion / 拖后恢复 / 滚出换卡：**钻洞**淡出 → 瞬移 → 淡入 |
| 滚动 | 贴卡坐标**不夹视口**：卡滚出则宠离开视野；约 **2.4s** 后再换到仍可见的卡；无可见卡则视口角兜底 |
| 拖拽 | 松手后约 **2s** 强制钻洞回游走 |
| 文章页 | OpenPet，不游走，钉视口角 |
| 侧栏失衡 | 浏览页左 sticky 裁切 + 日历下空隙 ≥ `balanceParkMinGapPx`（默认 160）：分类墙手风琴收起，宠强制 `dock` 日历并停 roam；滚回平衡后恢复。**例外**：`/dynamic` 路径下左溢出即失衡（不依赖日历空隙；右侧有动态目录抬高日历） |

配置：`spritePetConfig.roam`（含 `nearMoveMaxPx` / `nearMoveMs` / `balanceParkMinGapPx`）。

## 页面 persona 与动作优先级

见 `petScenarios.ts`：`home | post | gallery | friends | search | notFound | other`。  
优先级：`hard`（404/fail）> `route`（换班/进页）> `ui`（控件点击）> `ambient`（闲置/跟读）。同刻只跑更高或相等优先级。

## 文章跟读情绪（不改坐标）

OpenPet 仍 `position: fixed` 钉角。滚动进度：前 15% → `waving`；中段 → `review`；≥85% → `waiting`（各带冷却）。

## 后台停表

`visibilitychange`：Tab 隐藏时停 playback / roam / idle；回前台恢复 idle 与浏览态游走。

## 怎么开

1. `petConfig.ts` → `enable: true`
2. Spine / Live2D 保持 `enable: false`
3. `pnpm dev`：首页见 Maid；进文章见 OpenPet

可调：`defaultPetId` · `postPetId` · `position` · `size` · `lookFollow` · `responsive.*` · `roam.*`  
位置记忆：`localStorage` key `firefly-sprite-pet-pos-v4`（仅用户拖过写入）。

## 交互（两宠共用）

- 点头 / 身 / 脚分区动作；抓取时跳一下；拖拽记忆位置
- Swup 切页换班（按需加载目标皮 + opacity 交叉淡化）
- Maid 可视线跟随；OpenPet 无 look 行
- 亮暗色滤镜随 `html.dark`；主题开关轻脉冲
- `prefers-reduced-motion`：跳过淡化 / 主题脉冲 / 近距小跑插值（改钻洞或直切）

## 许可

见 `public/pets/README.md`。历史：`docs/knowledge/cc-haha-pets.md`（已归档）。

## 访客换皮

设置面板「桌宠」Tab 可覆盖为 Codex v1 单皮（**仅浏览态**）；文章页始终 OpenPet。语义见 `docs/knowledge/codex-pet-picker.md`。  
文章页定格偏移：`spritePetConfig.postOffset`（默认加大 right，躲开右侧浮动三钮）。

## 回归清单

- 桌面：首页贴卡游走；about/gallery/collections/tags/friends 1–2s 内右下可见
- 首页 ↔ 文章换班 5 次：皮正确、不卡 opacity:0
- 同栏近卡小跑；跨栏/远距钻洞；拖后 2s 钻洞恢复
- 文章滚动有跟读情绪、坐标不动
- 手机：浏览可见、文章隐藏
- 设置换皮仅浏览态；文章仍 OpenPet
- reduced-motion / Tab 切后台停表后回前台可恢复
