# master · 2026-08-04 · 音乐 / 横幅媒体 / 侧栏

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-04 | master | ef01d783 | feat | 默认本地曲库并与背景视频互斥 | local + ambient + 角标/持久化/Media Session + ADR-0002 |
| 2026-08-04 | master | 6aba2631 | feat | Banner 轮播与背景视频四片替换 | 11 张 AVIF Banner；四片 bg-* 视频；移除 firefly.mp4 |
| 2026-08-04 | master | c99a940e | style | 压矮侧栏卡片并下移顶距 | Profile/动态更紧凑；`--sidebar-top-nudge`；桌宠跟卡片锚点 |

## 做了什么
站点音乐默认改自托管 ambient，不再依赖公共 Meting；横幅换成自选 Banner + 本地背景视频轮播；左右侧栏相对分类栏下移并压矮卡片，DeepSeek 猫娘仍卡停靠。

## 关联
- ADR：`docs/adr/0002-local-music-default.md`
- 配置：`musicConfig.ts` / `backgroundWallpaper.ts` / `MainGridLayout.astro`
- 资产：`public/assets/music/` · `public/assets/videos/bg-*.mp4` · `DesktopWallpaper/banner-*.avif`

## 回滚
- `git revert c99a940e 6aba2631 ef01d783`
- 或临时：`musicConfig.mode` 改回 `meting`；`playerEnable: false`；`--sidebar-top-nudge: 0`
