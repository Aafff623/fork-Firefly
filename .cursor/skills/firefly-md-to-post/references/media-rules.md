# 媒体

**文章视频 ≠ 站点壁纸。** 禁止为嵌视频去改 `backgroundWallpaper`。

## 图

| 类型 | 落盘 | 写法 |
|------|------|------|
| 封面 | `./cover.*` | 只写 FM；正文勿重复贴 |
| 静图 | `./images/` | `![说明](./images/x.webp)`；空 alt 保持空 |
| GIF | `public/posts/<slug>/` | `/posts/<slug>/x.gif` |
| 远程 https | 不强制下载 | 原 URL |
| Grid | — | 保留 `[grid]…[/grid]` |

`![[x]]`→标准语法；盘符绝对路径拒绝。正文 Markdown 图不走 LQIP。

## 视频

**Bilibili**（取 `BVxxxx`）：

`//player.bilibili.com/player.html?bvid=BVxxxx&p=1&autoplay=0`（套 100% 宽 iframe）

**YouTube**（`watch?v=` / `youtu.be/`）：  
`https://www.youtube.com/embed/ID`；`t=`/`t=1m30s`→`?start=秒`

**本地 mp4**：用户明确要文内播 → `public/posts/<slug>/` + `<video controls src="…">`

## 音频

有文件再拷贝 + `<audio controls>`；否则 `<!-- TODO audio: … -->`，勿留必 404 标签。
