# master · 2026-08-02

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-02 | master | 6fd8aeeb | content | Engineering Type | Obsidian→帖 + MiniMax 封面 + 动态 emit + manifest |

## 做了什么
把 vault「Engineering Type」转成公开帖 `engineering-type`：正文配图齐全，卡片封面用 MiniMax 编辑静物生成；site-cascade 写入「新笔记」动态。排查首页不可见后确认：卡片读 posts 集合，需刷新 Astro；未 push 前线上不会有。

## 关联
- Vault：`D:\OneDrive\Desktop\Notes\threetwoa_ob\素材处理区域\Engineering Type.md`
- 帖：`src/content/posts/engineering-type/`
- 动态：`src/content/dynamic/2026-08-02-220119.md`
- 映射：`.ob2blog/manifest.json`

## 回滚
- `git revert 6fd8aeeb`
