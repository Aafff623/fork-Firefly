# PRD：Codex 桌宠选择器（访客换皮）

> 状态：**approved**（2026-08-05）  
> 主题：`codex-pet-picker`  
> 依据：Cursor Plan「Codex 桌宠适配博客」· awesome-codex-pet 调研  
> 批准：园主确认 Implement the plan 视同批准本 PRD

## 已拍板

| # | 决策 |
|---|---|
| 1 | 素材来自 [awesome-codex-pet](https://github.com/legeling/awesome-codex-pet)；**不**走 Codex CLI `/pet install` |
| 2 | 体验对齐现有 DeepSeek `SpritePet`（滤镜/拖拽/点按/站点联动/Swup 常驻） |
| 3 | 默认不变：浏览 `maid-deepseek-whale`（v2+look+游走）· 文章 `openpet-deepseek` |
| 4 | 访客另选一只 → **全站同一张皮**；`classic-8x9`；强制关 look；浏览可游走；文章停游走 |
| 5 | 设置面板新增「桌宠」单选（含「默认 · DeepSeek」） |
| 6 | 首批：`diandian--lllucasxu` · `claude--xiangking` · `elaina--nyakku-shigure` · `gpt-muse--opask` · `gojo--lilokhalikfa` |
| 7 | 暂缓：ganyu / giyu / gintoki / goblin；MCP Hub 柯基/柯南等另批 |
| 8 | 与 Spine/Live2D 互斥不变；单实例不挂多岛 |
| 9 | 许可：署必备；gpt-muse Unknown 黄线；个人非商业展示 |

## 范围（首期）

- P0：本 PRD + knowledge
- M0：首批 5 宠落盘 `public/pets/` + README 许可
- M1：`builtinPets` / `petConfig` 扩展 + SpritePet 覆盖语义
- M2：DisplaySettings 桌宠 Tab + localStorage + i18n
- M3：验收 · handoff

## 非目标（首期）

- Codex CLI 安装脚本接入
- 「一族双皮」为每只 Codex 宠配 v2 look 皮
- 一次塞满 8+ 粉丝向角色
- Spine/Live2D 混开

## 成功标准

- 默认：首页 Maid 游走+look；进文 OpenPet；Swup ×3
- 选非默认皮：全站该皮；浏览可游走；文章不游走；无 look；刷新记忆
- 切回默认：恢复双宠
- 设置/README 可见署名与 gpt-muse 黄线
- `pnpm check` · `pnpm type-check` 通过
