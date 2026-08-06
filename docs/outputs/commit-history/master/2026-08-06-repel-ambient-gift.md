# master · 2026-08-06 · repel / ambient-fx / gift

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | 96ff20fc | perf | 文字排斥卡顿 | RepelText 去掉 forwards 锁与软大阴影，活动期 will-change |
| 2026-08-06 | master | d35b4cf1 | feat | 环境特效 | 桌宠双击 yzhan；礼盒 confetti / tsParticles；ambientFxConfig |
| 2026-08-06 | master | 121d0069 | fix | 礼盒时序与收合 | 悬停不换皮；阅读后特效；侧栏卡高度同步收合 |

## 做了什么
本会话把欢迎语排斥动画磨顺，把对比台挑中的 E04/E05/E08/E09 接到桌宠与礼盒；礼盒改为悬停只晃 3D、点击快拆再弹信封，我已阅读后信封收起再放粒子，并修掉收卡后左栏大留白卡顿。

## 关联
- 交互约定：`.cursor/rules/seasonal-gift-box.mdc`
- 入口：`src/utils/ambient-fx.ts` · `gift-lifecycle.ts` · `gift-surprise.css`

## 回滚
- `git revert 121d0069 d35b4cf1 96ff20fc`
- 或关 `ambientFxConfig.enable` / 各子开关
