# 媒体

**文章视频 ≠ 站点壁纸。** 禁止为嵌视频去改 `backgroundWallpaper`。

Obsidian 附件解析详见 [obsidian-vault.md](obsidian-vault.md)。

## 图

| 类型 | 落盘 | 写法 |
|------|------|------|
| 封面 | `./cover.*` | 只写 FM；正文勿重复贴 |
| 静图 | `./images/` | `![说明](./images/x.webp)`；空 alt 保持空 |
| OB 带宽度 `![[x\|750]]` | `./images/`（默认）或 `public/posts/<slug>/`（保宽） | 默认 `![…](./images/x)`；**禁止** `<img src="./images/…">`（会 404） |
| GIF | `public/posts/<slug>/` | `/posts/<slug>/x.gif` |
| 远程 https | 不强制下载 | 原 URL |
| Grid | — | 保留 `[grid]…[/grid]` |

`![[x]]` 必须消解；盘符绝对路径拒绝。正文 Markdown 图不走 LQIP。  
落盘文件名优先 ASCII（`cover.webp`、`figure-1.png`），避免中文路径在部分工具链出问题。

## 视频

**Bilibili**（取 `BVxxxx`）：

`//player.bilibili.com/player.html?bvid=BVxxxx&p=1&autoplay=0`（套 100% 宽 iframe）

**YouTube**（`watch?v=` / `youtu.be/`）：  
`https://www.youtube.com/embed/ID`；`t=`/`t=1m30s`→`?start=秒`

**本地 mp4**：用户明确要文内播 → `public/posts/<slug>/` + `<video controls src="…">`

## 音频

有文件再拷贝 + `<audio controls>`；否则 `<!-- TODO audio: … -->`，勿留必 404 标签。
