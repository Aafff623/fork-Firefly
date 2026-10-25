# 15: SpritePet 接入 animator

**What to build:** SpritePet 的帧时钟与状态优先级移到 animator；组件保留渲染与放置。清理未登记的 timeout 与重复的 swup hook。props 缩减拆到 20，避免和动画接线混在一起。

**Blocked by:** 14（桌宠 animator 核心）

**Status:** ready-for-agent

- [ ] 帧时钟、状态机、优先级由 animator 驱动
- [ ] 组件只负责 DOM 渲染、皮肤、拖拽、停靠
- [ ] 清理未登记 timeout 与重复 swup hook
- [ ] 保留 `playTransient` / `playSequence` 的现有调用面
- [ ] 浏览器：动画、拖拽、停靠、切页后不重复启动
