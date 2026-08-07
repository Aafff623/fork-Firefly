# master · 2026-08-07

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-07 | master | e98c662e | fix | 导航品牌积水按钮悬停闪烁 | 去掉 scale-animation 冲突；悬停白字稳定；SVG 描边填白 |
| 2026-08-07 | master | 3671b810 | feat | 标签球悬停转正中 | 0.5s 复核 / 满 1s 触发；密排布 sticky；轴角缓动 + 黄高亮 |

## 做了什么
修导航品牌「积水」按钮悬停黑白闪。标签墙改为悬停 dwell：半秒确认仍悬停、满一秒丝滑转到正中并黄高亮；鼠标离开从零重计。未停本地 `pnpm dev`。

## 关联
- `src/components/layout/Navbar.astro`
- `src/styles/navbar.css`
- `src/components/widget/TagChalkSphere.astro`

## 回滚
- `git revert 3671b810 e98c662e`
