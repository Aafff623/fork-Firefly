# 日历封面 GIF 备用库

按 `docs/idea/calendar-cover/mood.md` + style-taste **17** 规范生成，**未接入** `Calendar.astro` 轮询。要用时拷到上级 `../NN.gif` 并改 `data-cover-gifs`。

## 2026-08-08 批次（当日视频额度 3/3）

| 文件 | 变体 | 源 MP4（tmp） |
|---|---|---|
| `stock-a-pink-sakura.gif` | 粉双丸子 + 樱花 idle | `tmp/minimax/calendar-gif-stock/stock-a-pink-sakura.mp4` |
| `stock-b-mint-notebook.gif` | 薄荷绿短发 + 笔记本 | `tmp/minimax/calendar-gif-stock/stock-b-mint-notebook.mp4` |
| `stock-c-cream-firefly.gif` | 奶油橙辫发 + 萤火点 | `tmp/minimax/calendar-gif-stock/stock-c-cream-firefly.mp4` |

链路：`MiniMax-Hailuo-02` 6s/768P → `scripts/video_to_seamless_gif.py`（pingpong+xfade，宽 500 / 12fps）。

上线前目检：下半留白、闭环、无文字水印。A 体积偏大（~2.5MB），升正式池前可再压一档色板。
