# master · 2026-08-02

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-02 | master | 7f1bcbc3 | content | AI Coding 帖同步 | Obsidian 改名后同步标题/正文/配图/manifest/动态锚文本 |
| 2026-08-02 | master | 967f53b2 | docs | ob2blog 改名规则 | 补充「本地改名必跟」与 prep_convert UTF-8 控制台输出 |
| 2026-08-02 | master | 22631fa9 | content | 关于页重构 | 按 GitHub profile 重写 about 内容并加强排版样式 |

## 做了什么
把 vault 笔记 `论 AI Coding 的奇淫技巧👿` 与博客帖 `ai-coding-save-money` 重新对齐（保留 slug）；ob2blog skill 写明改名/改标题以 Obsidian 为准。关于页内容对齐 GitHub profile（Now / Agent / Practice / Competitions / Project / Learning / Stats），并补轻量 Markdown 排版样式。

## 关联
- Skill：`.cursor/skills/ob2blog/`
- 帖：`src/content/posts/ai-coding-save-money/`
- 关于：`src/content/spec/about.md`、`src/pages/about.astro`
- Vault：`D:\OneDrive\Desktop\Notes\threetwoa_ob\Agentic Coding\论 AI Coding 的奇淫技巧👿.md`

## 回滚
- 三笔逆序：`git revert 22631fa9 967f53b2 7f1bcbc3`
