# Codex 桌宠选择器（访客换皮）

> PRD：`docs/outputs/prd/codex-pet-picker/prd.md`  
> 配置：`src/config/petConfig.ts` · `displaySettingsConfig.petPickerSwitchable`  
> 组件：`SpritePet.svelte` · `DisplaySettingsIntegrated.svelte`  
> 角色表：`src/lib/pets/builtinPets.ts`（按宠覆盖字段）

## 行为

| 设置选项 | 浏览态 | 文章页 `/posts/*` |
|---|---|---|
| **默认 · DeepSeek** | Maid（v2 · look · 游走） | OpenPet（classic · 无关 look · 不游走 · 视口定格） |
| 任一 Codex 单皮 | 该皮（classic · 无关 look · **可游走**） | **仍为 OpenPet**（换皮不覆盖文章宠） |

偏好 key：`localStorage.firefly-sprite-pet-id-v1`（`default` | picker id）。  
改选派发 `firefly:pet-change`。

## 按宠调参（覆盖全局默认）

全局默认：`size=128` · `roam.intervalMs=7500` · `resumeAfterDragMs=2000` · idle 原速。

| 宠 | 卡间间隔 | 拖后恢复 | 宽度 | idle 节奏 | 换卡形态 | 设置黄线 |
|---|---|---|---|---|---|---|
| DeepSeek 默认 | **7.5s** | 2s | 128 | 1× | 默认钻洞跑 | — |
| 点点 | **7.5s** | 2s | 128 | 1× | 方向跑→停→蜷睡 | 无 |
| Claude | **7.5s** | 2s | **96** | 1× | 默认 | 无 |
| 伊蕾娜 | **7.5s** | 2s | 128 | **1.8× 更慢** | **骑扫帚女巫**（加长） | 无 |
| GPT-muse | **7.5s** | 2s | 128 | 1× | 默认 | 无（按仓 CC BY-NC） |
| Gojo | **7.5s** | 2s | 128 | 1× | 默认 | 无 |

字段：`sizePx` · `roamIntervalMs` · `idlePaceMultiplier` · `portalMotionState` / `portalLeadMs` / `portalFadeMs` / `portalHoldMs` / `portalExitMs` / `portalArrivalLoops` / `portalArrivalSequence` · `licenseKind`。

伊蕾娜换卡：atlas 第 7 行 `running` = 女巫骑扫帚；钻洞前后各多亮一会儿，再回日常 idle。  
点点换卡：按卡左右方向跑 → 落地再跑 → `waiting` 停一下 → `idle` 蜷睡（睡姿由 `dockFacing` / `is-face-left` 镜像）。

## 首批可选皮

| ID | 显示名 | 许可 |
|---|---|---|
| `diandian--lllucasxu` | 点点 | MIT |
| `claude--xiangking` | Claude | MIT |
| `elaina--nyakku-shigure` | 伊蕾娜 | 非商业再分发已授权 |
| `gpt-muse--opask` | GPT-muse | 仓默认 CC BY-NC（设置不标黄线） |
| `gojo--lilokhalikfa` | Gojo | 非商业再分发已授权 |

来源：[legeling/awesome-codex-pet](https://github.com/legeling/awesome-codex-pet)。复拉：`node scripts/fetch-codex-pets.mjs`。

## 与 DeepSeek 文档关系

默认双宠细节（换班叙事、近跑远洞、无锚点兜底、跟读、后台停表）见 `dual-pet-deepseek.md`；本文件只描述访客覆盖层与按宠调参。
