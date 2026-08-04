# ADR-0002 · 音乐默认 local，与背景视频分轨互斥

- Status: accepted
- Date: 2026-08-04

## Context

导航栏同时存在「音符」（`MusicManager` 音频播放器）与「三角播放」（`BackgroundPlayer` 横幅视频）。默认 `musicConfig.mode` 曾为 `meting`，依赖公共 Meting API，易失效且版权/ToS 灰区大。访客也易把视频钮误当成「站点音乐」。

调研结论（见会话 canvas「博客音乐集成调研」）：中文圈常见 APlayer+Meting，但长期稳播应自托管；国际严肃博客要求 opt-in、不断播与 Media Session。本站播放器壳已足够，无需换 APlayer 吸底/音乐球。

## Decision

1. **默认曲源** `musicPlayerConfig.mode = "local"`；音频放 `public/assets/music/`，清单写在 `musicConfig.local.playlist`。
2. **Meting 配置块保留**，仅作手工备选（改回 `mode: "meting"`），不当生产默认。
3. **与背景视频分轨**：音符=音频，三角=壁纸视频；**后启者优胜互斥**（音乐起播停视频，视频起播停音乐），不做音量 ducking。
4. **体验补强（同轮）**：关面板后导航角标；localStorage 持久化音量/曲目索引/循环模式（硬刷新不自动有声续播）；Media Session 接系统媒体键。
5. **UI 形态不变**：顶栏圆形音符 + `float-panel` 面板；不做左下角音乐球 / 外置 JSON+CDN（后续可选）。

## Consequences

### 正面

- 默认不请求公共 Meting，曲库可控、稳定。
- 音视频不再叠吵；产品语义更清晰。
- 关面板仍可知「正在播」；耳机键/锁屏在支持的环境可用。

### 负面 / 风险

- 加歌需改配置并托管文件（或日后演进 JSON+CDN）。
- 示例曲与自有曲须自行保证版权/授权。
- Media Session / 后台播放受 OS 与浏览器限制，不承诺全平台一致。
