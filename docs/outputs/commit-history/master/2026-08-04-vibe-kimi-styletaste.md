# master · 2026-08-04 · Vibe 索引 / Kimi / style-taste

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-04 | master | 4d6d85a9 | docs | style-taste 取代默认水彩 | workflow + minimax/knowledge skills；封面与索引同路由 |
| 2026-08-04 | master | 3bcbd8a8 | feat | Vibe 四帖索引与 OpenClaw 改名互链 | basics/tools/tips/mcp + dynamic；OpenClaw 主题向标题 |
| 2026-08-04 | master | e9b9e97a | feat | Kimi CLI 死循环防循环帖 | knowledge-output 成帖 + 封面 + dynamic |

## 做了什么
并发产出 Vibe 四篇索引帖（先正文后配图），集中 review 互链；OpenClaw/Vibe 标题改为主题向。Kimi 死循环素材成帖。规范废止「默认水彩」，强制 style-taste 按章选风格。清理 `temp/ai-guide-toc`、`posts/_tmp-refs`。

## 关联
- `docs/agents/workflow.md`
- `.cursor/skills/firefly-minimax-media/`、`knowledge-output`、`knowledge-extract`
- `src/content/posts/vibe-*-index/`、`kimi-cli-tool-loop/`、`openclaw-tutorial-index/`

## 回滚
- 规范：`git revert 4d6d85a9`
- Vibe/OpenClaw：`git revert 3bcbd8a8`
- Kimi：`git revert e9b9e97a`
