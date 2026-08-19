# master · 2026-08-19（问答岛 / 标签球远近）

## Status
shipped-local（未发 GitHub Release / Wiki）

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-19 | master | b764fed7 | fix | DEV `/ask` 岛 | `AskChatIsland` 静态 `client:load`，生产仍 DCE |
| 2026-08-19 | master | da7cb9b0 | fix | 标签粉笔球远近 | 按帧 min/max 归一化；正中满亮，背面约 0.4 不糊 |

## 做了什么
DEV `/ask/` 对 TSX 动态 import 会 `NoMatchingImport`。薄包装 `AskChatIsland.astro` 静态挂岛，页面仍只在 DEV 动态引入该 `.astro`，生产 742KB 岛继续剔除。

侧栏标签球：12 点到不了球极，按理论 `z` 会把最近那颗压灰。改为当前帧最近/最远归一化；闲置转速 0.28→0.40。园主看过：背面不要雾，轮廓可读。

## 未纳入
- 按发布日留精华帖：只出建议，未改 `draft`
- `public/notes/v4-pro-first-round-catalog/`（其他 session）
- GitHub Release / Wiki

## 回滚
- `git revert da7cb9b0 b764fed7`（先标签球再问答岛）
