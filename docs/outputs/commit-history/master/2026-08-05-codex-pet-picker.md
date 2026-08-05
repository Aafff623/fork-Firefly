# master · 2026-08-05

## Status

shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-05 | master | 9f2d9408 | feat | Codex 桌宠换皮与锚定 | 五皮素材、设置 Tab、按宠调参、body+fixed 外侧锚定 |
| 2026-08-05 | master | 7c952f04 | feat | 礼盒/园径/横幅预览 | 礼物 emoji、北京日切颜文字 tip、description 样式 A–E 预览页 |

## 做了什么

把 awesome-codex-pet 五皮接进 SpritePet 设置换皮；按宠轮询/尺寸/女巫与点点跑停睡；修复挂进卡片被 overflow 裁切。另：惊喜文案加 emoji、园径便签北京日切 + 引猫颜文字、横幅摘要样式静态预览页。

## 关联

- PRD：`docs/outputs/prd/codex-pet-picker/prd.md`
- handoff：`docs/outputs/handoff/codex-pet-picker/2026-08-05-master-codex-pet-picker.md`
- 知识：`docs/knowledge/codex-pet-picker.md`
- 预览：`docs/scratch/banner-description-styles.html`

## 回滚

- `spritePetConfig.pickerEnabled = false` 或 `displaySettingsConfig.petPickerSwitchable = false`
- 删除 `public/pets/{diandian,claude,elaina,gpt-muse,gojo}--*/`
- 横幅样式尚未改站内 CSS，删预览页即可
