# master · 2026-08-06 · README polish

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | 91ff88fe | docs | 技术栈/样式素材 inventory | `docs/knowledge/*-inventory.md` + docs/assets 索引 |
| 2026-08-06 | master | 2acec92c | feat | README 本地预览壳 | `preview-readme.{html,css,js}` · 端口 8090 · CLAUDE 说明 |
| 2026-08-06 | master | 7513cfcb | docs | README 总览图与顶栏精简 | Features/Integrations/Workflows 主图+折叠详表；英文 README 指向中文 |

## 做了什么
把 README 从密表堆叠改成「总览图 + inventory 细表 + 折叠详表」；补齐 project-init 约定的 README 本地预览壳；顶栏导航与颜文字收敛。未动其他 session 的产品代码改动。

## 关联
- 计划：README 全面优化（清单入 docs · README 总览）
- project-init §3.5.1 · readme-polish
- 关键：`README.md` · `preview-readme.*` · `docs/knowledge/*-inventory.md` · `assets/images/readme/{features,integrations,workflow}.png`

## 回滚
- `git revert 7513cfcb 2acec92c 91ff88fe`
- 或删 `preview-readme.*` 并恢复 CLAUDE「未提供预览壳」表述
