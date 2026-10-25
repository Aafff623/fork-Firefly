# 14: 桌宠 animator 核心

**What to build:** 从 SpritePet 抽出 `petAnimator`：注入 `now / raf / cancelRaf / timeout / clearTimeout / reducedMotion / pace`，对外只有 `play(state, loops, priority)`、`setGaze(dir)`、`pause()`、`resume()`、`dispose()`，出口 `onFrame` 与 `onIdle`。帧表仍由 `petAnimation` 提供。

**Blocked by:** None (can start immediately)

**Status:** resolved（2026-10-25）

- [x] animator 接口与注入依赖落地
- [x] 优先级抢占、暂停、恢复、销毁语义明确
- [x] 行为测试：优先级、dispose 后零 rAF、reduced-motion 只画首帧、pause 不推进
- [x] 不修改 SpritePet，组件接入留给下一票
- [x] 测试在 node + 假时钟运行，不依赖 jsdom

## Result

- 新增 `petAnimator` 与 `test-pet-animator`；接口为 `play / setGaze / pause / resume / dispose`，帧表仍来自 `petAnimation`。
- 语义：同档或更高优先级可抢占；dispose 后零 rAF/零 timeout/零 onIdle；reduced-motion 只画首帧；pause 冻结、resume 续播；pace 只作用于 idle。
- `npx tsx scripts/test-pet-animator.mts` 通过；Biome 通过。
- 遗留：reduced-motion 下 play 不触发 onIdle，票 15 接线时需保留现有「非 idle 动作直接不播」的门控；导航暂停后是续播还是取消需在票 15 定。
