# master · 2026-08-07 · 时钟天空层

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-07 | master | a47390bc | feat | 天空资产与 layeredClock 配置 | 昼夜 clear GIF、天气 GIF 脚本、配置/类型导出 |
| 2026-08-07 | master | 1bf57280 | feat | 惊喜钟天空层软边与浓度收束 | SurpriseClock/LayeredClock/ClockCorner 接入天空；软 mask；角区裁切防外溢 |

## 做了什么
右侧惊喜数字钟补齐昼夜天空 GIF，并做软边缘与浓度收束，避免亮块挡中间栏。分层时钟共用同一套天空配置。品牌积水描边由其他会话负责，本批未纳入。

## 关联
- 组件：`SurpriseClock.astro` · `LayeredClock.astro` · `ClockCorner.astro`
- 配置：`layeredClockConfig.ts` · `types/layeredClockConfig.ts`
- 资产：`public/assets/images/widgets/clock/`

## 回滚
- `git revert 1bf57280 a47390bc`
- 或关闭/清空 `layeredClockConfig.skyAssets` 路径回退 CSS 日月云
