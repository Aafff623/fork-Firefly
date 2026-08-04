# theme · `codex-pet-deepseek`

Codex / OpenPet 系 **DeepSeek 题材**桌宠素材对照 → 站内 `SpritePet` / `PET_ATLAS_V2` 迁入灵感。

| 文件 | 说明 |
|---|---|
| [`extract.md`](./extract.md) | 几何对照、帧行表、路径清单、择包建议 |
| [`dual-pet-migration.md`](./dual-pet-migration.md) | **双桌宠主方案**：路由映射、单实例换皮、atlas 8×9、旧宠根除清单 |

**状态**：step-1 分析 · step-2 方案 · **step-3 已按 PRD 落地**（2026-08-04，`docs/outputs/prd/dual-pet-deepseek/`）。许可黄线仍在，公开再分发前须授权。  

**本地源**（相对工作区 `blog/`）：

| 包 | 路径 |
|---|---|
| A · maid Atlas v2 | `temp/maid-deepseek-whale/`（zip：`temp/maid-deepseek-whale.zip`） |
| B · openpet 8×9 | `temp/openpet-ai-girls/`（主看 `deepseek/`；仓内另有 doubao/gemini/chatgpt/claude） |
| 分析副产物（非产品资源） | `temp/openpet-ai-girls/_analysis/` |

术语对齐：站内桌宠 = `petConfig` / `SpritePet` / spritesheet atlas；**勿与 Spine / Live2D 混名**。

---

## 一句话

两条 DeepSeek 蓝发鲸题材素材：**Maid = Atlas v2（8×11）浏览默认；OpenPet = classic 8×9 文章页（关 look）。** 产品路径已接入 `public/pets/{maid-deepseek-whale,openpet-deepseek}/`；许可黄线见该目录 README。

## 灵感来源

- Agent 分析：`maid-deepseek-whale`（6593231b）· `openpet-ai-girls/deepseek`（427e20ef）
- 上游线索：codex-pets.net 下载包 · aimcp 元数据（package.zip 曾 500）· OpenPet AI Girls 公开仓
- 站内既有：`docs/knowledge/cc-haha-pets.md` · `src/lib/pets/petAnimation.ts`（`PET_ATLAS_V2`）

## 两包对照（摘要）

| 项 | A · maid-deepseek-whale | B · openpet deepseek |
|---|---|---|
| Atlas | **8×11** · 格 192×208 · 整图 **1536×2288** | **8×9** · 格 192×208 · 整图 **1536×1872** |
| `spriteVersionNumber` | `2`（`pet.json`） | 未标（经典 8×9） |
| 视线行（look） | 有（行 9–10） | **无** → 不能开 `lookFollow` 除非改核或关跟随 |
| 与 `PET_ATLAS_V2` | **几何一致**，迁入可行性高 | 前 9 行可对齐九态；需关 look 或加 codex-8×9 分支 |
| 视觉 | 蓝发双马尾女仆 + 鲸鳍/尾巴 chibi | 蓝发蓝白裙 + 鲸鱼发夹（同题材、不同 atlas） |
| 许可 | **unknown**（作者 DeaDumB） | 仓内 **无 LICENSE**；README 偏个人欣赏/参考 |
| 结构 | `pet.json` + `spritesheet.webp`（另有 poster/preview/share，非 zip 必含） | 各角色夹：`pet.json` + `spritesheet.webp` |

## 与 Firefly 映射（猜，调研时再核）

| 构想 | Firefly 可能落点 |
|---|---|
| 默认候选素材 | 优先 A（v2 maid），接受 unknown 许可后再谈 `public/pets` |
| 多角色扩展 | B 仓其余 AI 拟人（仍为 8×9 族，同一接入约束） |
| 配置 | `petConfig` / `SpritePetConfig`；与 Spine/Live2D 互斥不变 |
| 视线 | A 可保留 `lookFollow`；B 须 `lookFollow: false` 或新 atlas 分支 |

气质关键词：`codex-pet · atlas-v2 · deepseek-whale · license-gate`

## 许可风险（黄线）

| 黄线 | 说明 |
|---|---|
| A unknown | 作者署名 DeaDumB，许可未在包内声明；**上线前必须确认**（书面/页面授权或换 MIT/CC 等明确许可源） |
| B 无 LICENSE | README 语气偏展示/参考；**不可默认视为可商用/可再分发** |
| 灵感阶段 | **禁止**把素材拷进 `public/pets` 或改 `src/`；分析副产物 `_analysis/` 勿当产品资源 |

## 不做清单（本 theme 明确不做）

| 不做 | 原因 |
|---|---|
| 本阶段拷贝 spritesheet 进产品目录 | 许可未清；灵感库纪律 |
| 把 Spine / Live2D 当「同一桌宠」混接 | 互斥模型已定；术语分离 |
| 为 B  silently 假定有 look 行 | 8×9 缺行 9–10，开 `lookFollow` 会读越界/错帧 |
| 在灵感阶段改 `petAnimation` / `SpritePet` | 实现走 PRD |

## 开放问题

- A 的许可能否在上线前拿到明确授权？拿不到是否换自有绘制 / 仅内部实验？
- 若用 B：产品策略是「关 lookFollow」还是正式支持 `codex-8x9` atlas 分支？
- 多角色（openpet 五夹）是否值得做 pet 选择器，还是单宠换皮即可？

## 下一步（若要落地）

```text
docs/idea/codex-pet-deepseek/dual-pet-migration.md   ← 主方案
  → （可选）docs/outputs/report/dual-pet-deepseek/    # 许可核验
  → docs/outputs/prd/dual-pet-deepseek/prd.md       # 须批准
  → handoff → 实施（含 public/pets 拷贝与 petConfig）
```

未开 PRD 前：**禁止改产品 `src/`**，禁止把素材拷进 `public/pets`。  
落地前请先确认 `dual-pet-migration.md` §9「卡片左右两边」歧义（推荐 D1）。
