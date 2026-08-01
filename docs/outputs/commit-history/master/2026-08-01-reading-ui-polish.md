# master · 2026-08-01 · reading-ui-polish

## Status
shipped（本地已提交；未 push）

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-01 | master | 5f0d3276 | docs | 阅读面抛光 PRD/handoff | 落盘 `reading-ui-polish` 门禁文档 |
| 2026-08-01 | master | 37915af9 | feat | TOC Index-First | 共享编号、中心高原焦点渐变、两侧立方衰减 |
| 2026-08-01 | master | 825e2052 | feat | 列表/About/点缀 | list Featured+行；Quote-Led About；分类标签单色点缀 |
| 2026-08-01 | master | b45c5cc2 | fix | 标题井号与暖黄焦点 | 卸 autolink、strip 插件；正文高亮包字且浓度跟焦点 |
| 2026-08-01 | master | bb7f096f | fix | 热力图贪吃蛇 | 有绿贡献时仍在空格播放空闲紫蛇 |
| 2026-08-01 | master | f0a4e1f1 | chore | 移除 answer-format | 删 alwaysApply 规则并更新 AGENTS/voice 引用 |

## 做了什么
按 Hallmark Index-First / Quote-Led 气质抛光阅读面：目录、list、About、点缀预算与标题焦点同步。顺带恢复日历热力图空闲蛇，并去掉强制「简述/Summary/Full」的 answer-format 规则。

## 关联
- PRD：`docs/outputs/prd/reading-ui-polish/prd.md`
- handoff：`docs/outputs/handoff/reading-ui-polish/2026-08-01-master-reading-ui.md`
- 关键：`src/utils/toc-*` · `src/styles/{toc,post-card,markdown,categories,tags}.css` · TOC/卡片/About · `Calendar.astro` · `rehype-strip-heading-anchors.mjs`

## 回滚
- 整批：`git revert --no-commit f0a4e1f1^..5f0d3276` 后视冲突拆 revert
- 仅蛇：`git revert bb7f096f`
- 仅规则：`git revert f0a4e1f1`
