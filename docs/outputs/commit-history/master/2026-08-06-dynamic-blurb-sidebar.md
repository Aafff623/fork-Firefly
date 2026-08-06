# master · 2026-08-06

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | 511540cf | feat | 动态批注双层卡 | 全文 blurb 回填 + Zen Maru + 动态页锐边 |
| 2026-08-06 | master | 0c704c8a | feat | Best Codex 帖 | 中转实测成帖与动态 |
| 2026-08-06 | master | c650d1e8 | feat | OpenCode 协作帖 | Luna/DeepSeek/MiniMax 分工与互链 |
| 2026-08-06 | master | 39bb7083 | fix | 侧栏顺序 | 标签墙与分类墙对调 |

## 做了什么
动态页笔记批注改为完整 description、字体与卡片锐边；发布 Best Codex 与 OpenCode 协作两帖并级联动态；左栏标签墙与分类墙顺序对调（曾误做左右整栏互换后已还原）。

## 关联
- knowledge-output：OpenCode / BestCodex 素材成帖
- site-cascade：blurb 全文 + emit-dynamic

## 回滚
- `git revert` 上述 hash；侧栏可单独 revert sidebar commit
