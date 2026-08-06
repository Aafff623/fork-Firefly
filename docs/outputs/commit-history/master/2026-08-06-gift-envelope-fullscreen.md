# master · 2026-08-06 · gift envelope fullscreen

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | 58ea850c | feat | 惊喜信封全屏 | 模块拆分、全屏慢放大、「我已阅读」收卡、点点 pose、DEV 常显（同批误入 content-posts 摘要 commit） |
| 2026-08-06 | master | TBD | docs | seasonal-gift-box | 交互约定改为全屏确认流 |

## 做了什么
左栏惊喜礼盒从侧栏小信封改为全屏阅读层：开盖后从礼盒位置慢放大，确认后淡出并整卡收起。代码拆到 `gift/` + `gift-surprise.css`；信封嵌点点固定 idle；本地 DEV 不写 localStorage 便于反复测。

## 关联
- 实现：`src/components/widget/gift/*`、`Announcement.astro`、`gift-surprise.css`
- 规则：`.cursor/rules/seasonal-gift-box.mdc`

## 回滚
- `git revert 58ea850c`（注意该 commit 信息混有 content-posts 摘要，回滚前核对 diff）
