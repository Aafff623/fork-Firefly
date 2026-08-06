# 日历封面：像素粉发 idle · 认可观感

## 灵感来源

- 对话：园主认可侧栏笔记本日历封面的一帧截图（2026-08-03）
- 剪贴板原图：`C:\Users\Lenovo\AppData\Local\quickclipboard\clipboard_images\f3bad864b941771b.png`
- 入库截图：[`assets/ref-loop-ok-2026-08-03.png`](./assets/ref-loop-ok-2026-08-03.png)
- 当时画面素材：`public/assets/images/widgets/calendar/06.gif`（像素粉发角色 · 无缝闭环）

## 想要的感觉

- **像素动漫人物**：圆润 16-bit / chibi，粉发双丸子，平静表情；主体居中偏上
- **背景克制**：柔粉紫天空 + 少量樱花点，不抢前景，方便叠白字与翻月按钮
- **与日历 UI 合拍**：浅色封面底 + 半透明日期区，动图像「封面纸」而不是另贴海报
- **循环观感**：idle 闭环（轻浮 / 呼吸），单圈内不突然跳帧；多图可轮询

气质关键词：`soft · pixel · sakura · calm · calendar-banner-safe`

## 可能落点

- 组件：`src/components/widget/Calendar.astro` 封面区（`.calendar-cover-media`）
- 资产：`public/assets/images/widgets/calendar/*.gif`
- 轮询：`data-cover-gifs` + 切换间隔（现约 4.5s）
- 生成链路（若再扩池）：MiniMax 视频 → `scripts/video_to_seamless_gif.py`（ping-pong + xfade）
- 提示词：`firefly-minimax-media` · prompt-craft **style-taste 17 卡通人物风**（与 01 像素场景区分；合集卡同族）

## 开放问题

- 01–04 旧 GIF 是否也要重做成同级无缝闭环，还是只保留轮询即可？
- 轮询顺序 / 间隔是否按月份或节日加权（例如 520 优先人物向）？
- 暗色模式下 scrim 是否需单独调一版参考截图？
