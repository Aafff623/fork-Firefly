# master · 2026-08-06

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | c111dcda | feat | 四帖入库 | 连环画 / MiniMax 制片 / pi setup·theme + 动态；gpt-relay 出稿 |
| 2026-08-06 | master | 96c84d93 | fix | 礼盒与壁纸浮标 | 信封停留淡出；惊喜 toast 2s+音效；previewBadge 关 |
| 2026-08-06 | master | e6428f18 | feat | NoteCardPreview | Layout 挂载笔记卡预览岛屿 |
| 2026-08-06 | master | ff66bf5d | docs | Showcase 重截 | archive→timeline；Playwright 清旧重截 |
| 2026-08-06 | master | 1c3834f8 | docs | minimax skill | prompt-craft 扩写 |

## 做了什么
内容侧补齐四篇新帖与配套动态，并把双 Pro 中转实测出稿。交互侧修礼盒信封硬切、缩短惊喜 toast 并加提示音，默认隐藏壁纸 BA 浮标；Layout 挂上笔记卡预览。文档侧按 timeline 路由重截 README Showcase，并扩写 MiniMax 媒体 skill。

## 关联
- 本地验收：`http://127.0.0.1:4321`
- 截图脚本：`scripts/capture-readme-showcase.py`

## 回滚
- 内容：`git revert c111dcda`
- 礼盒/浮标：`git revert 96c84d93`
- Showcase：`git revert ff66bf5d`
