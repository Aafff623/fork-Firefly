# PRD：双桌宠 DeepSeek（Maid + OpenPet）

> 状态：**approved**（2026-08-04）  
> 主题：`dual-pet-deepseek`  
> 依据：`docs/idea/codex-pet-deepseek/dual-pet-migration.md` · Cursor Plan「双桌宠迁移方案」  
> 批准：园主确认实施 Plan（Implement the plan）视同批准本 PRD

## 已拍板

| # | 决策 |
|---|---|
| 1 | 同时只出现一只交互宠（单 `SpritePet` + Swup permanent） |
| 2 | 浏览态默认 **`maid-deepseek-whale`**（Atlas v2 · 8×11 · 可 look） |
| 3 | 文章页 `/posts/*` 切换为 **`openpet-deepseek`**（classic-8×9 · 强制关 look） |
| 4 | 换皮触发 = URL 落地后（D1）；不做卡片悬停预换皮、不做双侧栏双实例 |
| 5 | 手机：浏览态显示 A；文章页隐藏 B |
| 6 | 与 Spine/Live2D **互斥**（桌宠优先）不变 |
| 7 | 根除 cc-haha 四宠（`dada-code` 等）配置与 `public/pets` 资源 |
| 8 | 许可：站内试用可接入；公开再分发前须授权闸（A unknown / B 无 LICENSE） |

## 范围（首期）

- P0：本 PRD + knowledge 更新
- M0：Maid 默认替换搭搭
- M1：`classic-8x9` atlas 变体 + 路由换皮接 OpenPet
- M2：旧宠根除、手机规则、`pnpm check` / `type-check`

## 非目标（首期）

- 卡片左右轨挂宠 / 双侧栏装饰双宠
- 访客选宠面板 / openpet 五角色选择器
- Spine/Live2D 与桌宠混开
- 卡片按下瞬间预换皮

## 成功标准

- 非 `/posts/`：可见 Maid；桌面可 lookFollow
- `/posts/*`：可见 OpenPet（桌面）；无 11 行错帧；look 关闭
- 移动端：浏览见 A，进文隐藏
- 产品路径无 `dada-code` / `huhu-plan` / `bubu-fix` / `huihui-build` / `getDadaFrameOffset`
- `pnpm check` 与 `pnpm type-check` 通过
