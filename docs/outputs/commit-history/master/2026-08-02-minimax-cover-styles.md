# master · 2026-08-02

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-02 | master | 3126ca53 | docs | MiniMax 封面风格路由 | 口味硬规范 + 通用/特定风格库写入 firefly-minimax-media |
| 2026-08-02 | master | 73358e05 | feat | 风格规范帖与样张 | 发布 minimax-cover-styles，嵌入样张，附 style-taste 挑选页与动态 |
| 2026-08-02 | master | a88534c4 | fix | ob2blog 默认发布 | 未声明 draft 时改为 false；模板与 prep_convert 同步 |

## 做了什么
为 Firefly 封面生成建立「通用列选项 / 特定直出」两池路由，并把口味规范写进 skill。同主题多样张做成挑选页与正式指南帖已发布。顺带修正 ob2blog 默认草稿策略，避免新帖在本地预览里「找不到」。

## 关联
- Skill：`.cursor/skills/firefly-minimax-media/`、`.cursor/skills/ob2blog/`
- 帖：`src/content/posts/minimax-cover-styles/`
- 样张页：`public/media/minimax/style-taste/index.html`
- 动态：`src/content/dynamic/2026-08-02-123150.md`

## 回滚
- `git revert a88534c4 73358e05 3126ca53`（逆序）
- 或仅撤帖：删 `minimax-cover-styles` 与对应 dynamic 后重建索引
