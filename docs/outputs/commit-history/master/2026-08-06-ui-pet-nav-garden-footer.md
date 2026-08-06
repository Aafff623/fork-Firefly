# master · 2026-08-06

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | 0078e1a9 | fix | 文章页桌宠视口固定 | 进文钉窗口角，主页游走不变 |
| 2026-08-06 | master | e9bd0688 | fix | 导航下拉立刻收起 | data-force-closed 盖过悬停 |
| 2026-08-06 | master | 9b46bc00 | fix | 园径便签墨色可读 | 对齐最新动态 ink + 实心卡底 |
| 2026-08-06 | master | bcf7c8df | style | Footer Playfair wordmark | 斜体展示衬线，中文仍 Source Serif |
| 2026-08-06 | master | 08a55d68 | feat | 友链卡氛围底图 | 像素双人图作卡片背景 |
| 2026-08-06 | master | f20af615 | feat | 列表标题情绪色 | title-mood 仅展示层 |
| 2026-08-06 | master | 20b3c300 | fix | 标签页默认列表 | 与侧栏球体记忆解耦 |
| 2026-08-06 | master | 71e14ecb | fix | Waline 暗色可读 | 强制浅色正文 |
| 2026-08-06 | master | e2cbcb36 | style | 横幅呼吸 + 导航积水 | layout-styles / navbar |
| 2026-08-06 | master | c604e55e | style | 礼盒悬停时序 | 3D 销毁再成型盒 |
| 2026-08-06 | master | 400f712a | feat | 园径便签动底 | gn-01..03 mp4 |

## 做了什么
本会话把文章页桌宠与主页游走拆开，修好导航下拉挂着不收的问题；园径便签对比度按最新动态墨色落地；Footer 品牌字换成 Playfair 斜体。顺带收口友链底图、标题情绪色、标签默认列表、评论暗色、横幅/导航动效与礼盒时序，并入库园径动底素材。

## 关联
- 计划：园径便签对比 + Footer 艺术字
- 关键：`SpritePet.svelte`、`DropdownMenu.astro`、`GardenNote.astro`、`site-footer.css`、`friends.astro`

## 回滚
- 单点 revert 上表对应 hash；桌宠/下拉/便签互不耦合
