# master · 2026-08-14

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-14 | master | 50bc49ab | feat | 发文四渠 + 退役 ob2blog | extract 按输入分流；output 发布岗 + 合集一二级心智缓存；vault 脚本迁 `_shared` |
| 2026-08-14 | master | 051a6e29 | docs | 治理文件对齐四渠 | AGENTS/CONTEXT/LANGUAGES/README；`.agents/wiki-post` 去重只留 junction |

## 做了什么

写稿只进 `knowledge-extract`（四渠），成帖只走 `knowledge-output`（无主题分批扫 todo，自检过了才落盘）。合集路由只缓存一级/二级用途，不记文章名单。旧 `ob2blog` skill 入口删除。

## 关联

- `.cursor/skills/knowledge-extract/` · `knowledge-output/` · `_shared/`
- `AGENTS.md` · `CONTEXT.md` · `LANGUAGES.md` · `docs/agents/workflow.md`

## 回滚

- `git revert 50bc49ab 051a6e29`（会把 ob2blog 入口和旧「必须带主题」口径一并还原）
