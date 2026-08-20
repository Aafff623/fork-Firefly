# master · 2026-08-20（Firefly Bot 纯黑圆润收口）

## Status
shipped-local（已 push 待核线上；未打 tag / 未发 Release / 未推 Wiki）

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-20 | master | 64db580e | feat | 纯黑圆润重制 | 形状族重产、身体 `--body` 与线条色解耦 |
| 2026-08-20 | master | 42d494e7 | docs | ADR-0005 | 纯黑圆润决策与 license 立场 |
| 2026-08-20 | master | c00e61c0 | feat | 实心大眼 | 超椭圆按宏观参数重产，实心度 ≥0.78 |
| 2026-08-20 | master | 9f6e80c2 | feat | 眼神与彩带 | followPointer、弹簧提速、桶切 25% burst |
| 2026-08-20 | master | 8e55ecfa | feat | 首屏招手 | 默认头像轻晃招手；宏切不清 pointerRaw |
| 2026-08-20 | master | 7ccd4957 | feat | idle 开场与分眼 | rest/idle 团子；中缝硬留；歇着 bounce/hop/humming/burst |
| 2026-08-20 | master | bce76572 | docs | ADR-0005 v2.4–v2.5 | CONTEXT / firefly-bot README 对齐 |

## 做了什么
侧栏 Bot 从紫团/空心月牙收到近黑正圆白眼。license 走参数级参考、坐标级独立（生成器在 `.scratch/`，不入库 xAI 点列）。开场不再是 thinking 三点加载；两眼中间留黑缝；没鼠标时歇着桶也会跳和出环带。orbit/radar 仍在 ring 桶，不当默认脸。

## 关联
- ADR-0005（extends ADR-0004）
- `public/vendor/firefly-bot/`
- `src/scripts/profile-firefly-carousel.ts`
- `src/components/widget/Profile.astro`（招手已在 `8e55ecfa`）

## 未纳入
- GitHub Release / tag / Wiki（等园主说「发布」）
- `public/notes/v4-pro-first-round-catalog/`（其他 session）
- 全仓 biome 格式化（`showFace` 预存 `noParameterAssign`）

## 回滚
- 本轮接续：`git revert bce76572 7ccd4957 8e55ecfa`（先 docs 再 feat）
- 整段纯黑圆润：再 revert `9f6e80c2 c00e61c0 42d494e7 64db580e`
