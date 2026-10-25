# 16: Profile 与桌宠的 DOM 边界

**What to build:** Profile 轮播与桌宠不再各自读取同一张卡片的 DOM 状态；用一个显式接口传递位置、模式与停靠信息。两套动画系统各管各的时钟，但共享一份明确的卡片状态。

**Blocked by:** 15（SpritePet 接入 animator）；external：`Profile` 的未提交 WIP 必须先落地

**Status:** ready-for-agent

- [ ] Profile 轮播不再直接读桌宠的 DOM 状态；桌宠不再把整张卡当隐式锚点
- [ ] 位置/模式/停靠通过显式接口传递
- [ ] 两套动画时钟互不打断
- [ ] 浏览器：首页、文章页、切页后轮播与桌宠都正常
- [ ] 不改变视觉与交互文案
