# master · 2026-08-05

## Status

partial（实现完成，待园主 Review / commit）

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-05 | master | （待提交） | feat | Codex 桌宠选择器 | 首批 5 皮 + 设置 Tab + 默认 DeepSeek 双宠保留 |

## 做了什么

把 awesome-codex-pet 的 v1 桌宠适配进 SpritePet：素材落盘、注册表扩展、访客 localStorage 覆盖全站单皮（浏览可游走）、显示设置「桌宠」Tab。DeepSeek Maid/OpenPet 默认路径不变。许可署名与 gpt-muse 黄线写入 README / UI。

## 关联

- PRD：`docs/outputs/prd/codex-pet-picker/prd.md`
- handoff：`docs/outputs/handoff/codex-pet-picker/2026-08-05-master-codex-pet-picker.md`
- 知识：`docs/knowledge/codex-pet-picker.md`

## 回滚

- `spritePetConfig.pickerEnabled = false` 或 `displaySettingsConfig.petPickerSwitchable = false`
- 删除 `public/pets/{diandian,claude,elaina,gpt-muse,gojo}--*/`
