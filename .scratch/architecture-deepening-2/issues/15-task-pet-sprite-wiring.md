# 15: SpritePet 接入 animator

**What to build:** SpritePet 的帧时钟与状态优先级移到 animator；组件保留渲染与放置。清理未登记的 timeout 与重复的 swup hook。props 缩减拆到 20，避免和动画接线混在一起。

**Blocked by:** 14（桌宠 animator 核心）

**Status:** resolved（2026-10-25；浏览器已冒烟）

- [x] 帧时钟、状态机、优先级由 animator 驱动
- [x] 组件只负责 DOM 渲染、皮肤、拖拽、停靠
- [x] 清理未登记 timeout 与重复 swup hook
- [x] 保留 `playTransient` / `playSequence` 的现有调用面
- [x] 浏览器：动画、拖拽、停靠、切页后不重复启动

## Result

- `startPlayback` / `playTransient` / `applyGazeFrame` / 暂停恢复全部接 animator；`playSequence` 调用面不变，下一段挂在 `onIdle`。
- 新增 `pendingTimeouts` 登记与 `swupHookBound` 去重；`onDestroy` 走 `petAnimator.dispose()` + 清登记表。
- 真机（dev 4343，1440×900）：idle → waving 帧推进；点击触发 `waiting` 动作；拖拽后位置从 (1154,732) 移到 (1,644)；软导航到 `/timeline/` 后桌宠仍存活并继续 idle。
- 已知偏差：idle 倍速在换皮后可能沿用旧宠快照；`data-pet-motion-state` 在 idle 内挥手时写 `idle`（无消费者）；`waitMs` 未纳入清理。均已在代理报告中记录。
