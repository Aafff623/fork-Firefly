# Codex Pet DeepSeek · 提炼对照

> 源：`temp/maid-deepseek-whale/` · `temp/openpet-ai-girls/`（相对工作区 `blog/`）  
> 日期：2026-08-04 · **只记灵感，不写实现**  
> 分析 Agent：6593231b（maid）· 427e20ef（openpet）；本篇合并落盘，未重新下载

## 路径清单

| 角色 | 绝对/工作区相对路径 |
|---|---|
| A 解包目录 | `temp/maid-deepseek-whale/` |
| A zip | `temp/maid-deepseek-whale.zip` |
| A 溯源 | `temp/maid-deepseek-whale/SOURCE.txt` |
| A 核心资源 | `pet.json` · `spritesheet.webp`（另有 poster/preview/share.webp·png，来自 CDN，非 zip 必含） |
| B 仓根 | `temp/openpet-ai-girls/` |
| B DeepSeek | `temp/openpet-ai-girls/deepseek/`（`pet.json` + `spritesheet.webp`） |
| B 其它角色 | `doubao/` · `gemini/` · `chatgpt/` · `claude/`（同构，未逐张复测） |
| B 分析副产物 | `temp/openpet-ai-girls/_analysis/`（切帧预览等；**非产品资源**） |

### A 下载溯源（SOURCE.txt）

| 项 | 记录 |
|---|---|
| aimcp `package.zip` | 曾 HTTP 500 |
| 可用上游 | `https://codex-pets.net/api/pets/maid-deepseek-whale/download?...` |
| aimcp 元数据 | `https://www.aimcp.info/api/codex-pets/maid-deepseek-whale-fe712941` |
| 官方 zip 内容 | 仅 `pet.json` + `spritesheet.webp` |

---

## 几何对照

| 维度 | Firefly `PET_ATLAS_V2` | A · maid | B · openpet deepseek |
|---|---|---|---|
| columns × rows | 8 × **11** | 8 × **11** | 8 × **9** |
| cell | 192 × 208 | 192 × 208 | 192 × 208 |
| sheet | 1536 × **2288** | 1536 × **2288** | 1536 × **1872** |
| spriteVersion | 2 | `pet.json`: `spriteVersionNumber: 2` | 未声明（经典 8×9） |
| kind / id | （站内自有 id） | `kind: object` · `id: maid-deepseek-whale` | `id: deepseek` |

**结论**：A 与现核几何一致；B 行数少 2（缺 look），格宽高与列数仍同。

---

## 帧行表（相对 `PET_ANIMATION_DEFINITIONS`）

站内九态行索引（`petAnimation.ts`）与 look 行：

| row | 状态 / 用途 | A · 8×11 | B · 8×9 |
|---|---|---|---|
| 0 | idle | ✓ | ✓（九态对齐） |
| 1 | running-right | ✓ | ✓ |
| 2 | running-left | ✓ | ✓ |
| 3 | waving | ✓ | ✓ |
| 4 | jumping | ✓ | ✓ |
| 5 | failed | ✓ | ✓ |
| 6 | waiting | ✓ | ✓ |
| 7 | running | ✓ | ✓ |
| 8 | review | ✓ | ✓（末行） |
| 9 | look（方向扇区） | ✓ | **缺** |
| 10 | look（续） | ✓ | **缺** |

`getPetLookFrame`：方向索引 < 8 用 row 9，否则 row 10（见 `petAnimation.ts`）。  
因此 B **不能**在默认 `lookFollow: true` 下无改接入。

### 接入选项（灵感级，非实现）

| 方案 | 适用 | 代价 |
|---|---|---|
| 原样当 v2 宠 | **仅 A** | 许可闸 |
| `lookFollow: false` + 仍按 v2 读前 9 行 | B（危险：若核仍按 11 行算 background-size 会错） | 需调研：高度/background-size 是否绑死 11 行 |
| 正式 `codex-8x9` / atlas 分支 | B 与多角色仓 | PRD：双几何常量 + 配置字段 |
| 重绘/补 look 两行合成 v2 | B→A 几何 | 美术工作量 |

---

## `pet.json` 要点

### A · maid-deepseek-whale

```json
{
  "id": "maid-deepseek-whale",
  "displayName": "Maid-DeepSeek-Whale",
  "spritesheetPath": "spritesheet.webp",
  "spriteVersionNumber": 2,
  "kind": "object"
}
```

视觉摘要：蓝发双马尾女仆 + 鲸鳍/尾巴 chibi；作者线索 DeaDumB；许可 **unknown**。

### B · openpet deepseek

```json
{
  "id": "deepseek",
  "displayName": "DeepSeek",
  "spritesheetPath": "spritesheet.webp"
}
```

视觉摘要：蓝发蓝白裙 + 鲸鱼发夹；与 maid **同题材异 atlas**。仓 README：个人项目 / demo / 实验 companion UI；**无 LICENSE 文件**。

---

## 择包建议

| 优先级 | 包 | 条件 |
|---|---|---|
| **默认候选** | A · maid-deepseek-whale | 接受 **unknown** 许可风险并完成授权核验后；几何零改迁入 `PET_ATLAS_V2` |
| 备用 / 多角色 | B · openpet-ai-girls | 单宠：关 look 或加 8×9 分支；多宠：五角色同构扩展 |
| 不推荐 | 未核许可即上线任一方 | 侵权与再分发风险 |

```text
许可过闸？
  ├─ 是（A）→ 默认候选 maid v2 → PRD：拷 public/pets + petConfig
  ├─ 是（仅 B）→ 先定 look 策略 → PRD
  └─ 否 → 仅灵感/本地实验，不上站
```

---

## 与现站桌宠关系

| 现站 | 本 theme |
|---|---|
| cc-haha 四宠 · MIT · Atlas v2 | A 同几何，可当第五皮肤候选 |
| `lookFollow` 默认开 | A 可开；B 不可默认开 |
| Spine / Live2D 互斥 | 不变；本素材仍走 SpritePet 路径 |

未开 PRD 前：不改 `src/`、不拷 `public/pets`。
