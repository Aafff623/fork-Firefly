# 14: 桌宠 animator 核心

**What to build:** 从 SpritePet 抽出 `petAnimator`：注入 `now / raf / cancelRaf / timeout / clearTimeout / reducedMotion / pace`，对外只有 `play(state, loops, priority)`、`setGaze(dir)`、`pause()`、`resume()`、`dispose()`，出口 `onFrame` 与 `onIdle`。帧表仍由 `petAnimation` 提供。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] animator 接口与注入依赖落地
- [ ] 优先级抢占、暂停、恢复、销毁语义明确
- [ ] 行为测试：优先级、dispose 后零 rAF、reduced-motion 只画首帧、pause 不推进
- [ ] 不修改 SpritePet，组件接入留给下一票
- [ ] 测试在 node + 假时钟运行，不依赖 jsdom
