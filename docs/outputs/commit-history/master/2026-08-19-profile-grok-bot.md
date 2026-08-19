# master · 2026-08-19（侧栏 Grok Bot 轮播）

## Status
shipped-local（生产无 vendor 几何则锁头像；空圆兜底见 `2026-08-19-profile-avatar-fallback.md`）

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-19 | master | 18d482d7 | feat | 侧栏头像 ↔ Bot 1:4 | Profile 圆槽宏切 + 六桶编舞；vendor 几何 gitignore |
| 2026-08-19 | master | da921482 | docs | ADR-0003 | 几何不入库；CONTEXT / 用词 / 技术栈对齐 |

## 做了什么
左栏 Profile 圆槽：站点头像短、Grok Bot 长（约 1:4）。Bot 六桶（歇着 / 注意 / 干活 / 玩 / 环 / 惊一下），点击不默认 burst。学习仓 replica 只本机拷到 `public/vendor/grok-bot/`。

## 未纳入
- `/ask`、LiveChat 吉祥物（已分析：48/40px、关 overlay/跟手、Ask 页关侧栏 Bot）
- 页脚浇水、标签球、Ask 岛、`preview-footer-wordmark.*` 等其他 session

## 回滚
- `git revert da921482 18d482d7`（先 docs 再 feat）
- 或删 `Profile.astro` 里 `data-profile-grok` 与 carousel script
