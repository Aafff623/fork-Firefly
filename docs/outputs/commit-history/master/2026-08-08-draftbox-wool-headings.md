# master · 2026-08-08

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-08 | master | 89902044 | feat | 草稿箱本地预览 | `_draftbox` gitignore + 路由剥前缀 + DEV 置顶；README 约定 |
| 2026-08-08 | master | ea01dd0e | feat | 羊毛揭秘分类 | CONTEXT 词表 + 图标 + 标签别名；与中转分桶 |
| 2026-08-08 | master | 5e219aae | docs | 小节标题防 AI 味 | knowledge-output/extract 禁「一句话收束」等；heading-anti-ai 范例库 |

## 做了什么
定稿「草稿 = 本地可预览、不入库」；发帖分类补「羊毛揭秘」；成帖流程禁止课件收尾目录腔。箱内 WIP 帖（Kiro / Step Explore）仍只在本地，未进 git。

## 关联
- `src/content/posts/_draftbox/README.md`
- `src/utils/url-utils.ts`（`toPostSlug`）
- `.cursor/skills/knowledge-output/references/heading-anti-ai.md`

## 回滚
- `git revert 5e219aae ea01dd0e 89902044`
