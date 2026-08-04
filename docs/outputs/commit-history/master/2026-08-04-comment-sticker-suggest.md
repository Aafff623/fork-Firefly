# master · 2026-08-04 · 评论梗图联想

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-04 | master | e7b031f8 | feat | 评论梗图联想 | L1 词表 + 可选 DeepSeek；短码插入；浮层相对 textarea；默认关 |
| 2026-08-04 | master | 7019edec | docs | PRD / 架构 | idea + PRD；插入决策改为优先短码 |
| 2026-08-04 | master | 6716c2c2 | chore | 词表 bench | corpus 评测脚本（语料在 temp/） |
| 2026-08-04 | master | 9bac068e | chore | 本地 dev host | Astro 绑定 127.0.0.1 |

## 做了什么
评论区旁挂 type-ahead：打热梗词出候选，Tab/点击插入 Waline 短码；视觉镜像渲染短码；草稿迁移旧 Markdown 贴纸。可选 Agent（默认关）。修了浮层压进输入框的图层错位。

## 关联
- `docs/outputs/prd/comment-sticker-suggest/prd.md`
- `docs/idea/comment-sticker-suggest/`
- `src/components/comment/sticker-suggest/` · `src/lib/sticker-suggest/`
- `src/pages/api/comment-sticker-suggest.ts`
- `src/data/sticker-lexicon/zh-meme.json`

## 回滚
- 配置：`commentConfig.waline.stickerSuggest.enabled = false`（默认已关）
- 代码：`git revert 9bac068e 6716c2c2 7019edec e7b031f8`
