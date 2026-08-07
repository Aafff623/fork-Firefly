# master · 2026-08-07（标签球计时 + 品牌渐变擦出）

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-07 | master | 9d432c4f | fix | 标签球悬停计时 | 进墙首次 0.5s / 墙内换签 1s / 离墙重置 |
| 2026-08-07 | master | ae3c057a | style | 品牌名横向渐变擦出 | 粉→橙→站点紫混色过渡，非整词单色 |

## 做了什么
纠正标签墙悬停时序；品牌用户名悬停改为沿字横向渐变擦出。未停 `pnpm dev`。未动他 agent 时钟/发文在制品。

## 关联
- `TagChalkSphere.astro`
- `Navbar.astro` / `navbar.css`

## 回滚
- revert 本文件对应两笔业务 commit
