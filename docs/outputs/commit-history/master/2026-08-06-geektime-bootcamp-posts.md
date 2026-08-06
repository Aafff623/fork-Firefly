# master · 2026-08-06

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-06 | master | eea980f7 | content | 极客时间三门 AI 训练营拆解四篇 | 总览 + 编程实战营 + 全栈营 + 产品营，互链成系列，配图 Web 化 |
| 2026-08-06 | master | 0d8045c6 | content | 四篇新笔记动态 | site-cascade emit，均带作者批注 |

## 做了什么
把 Knowledge\todo 里四门课程拆解素材（实为一篇总览 + 三篇详篇）经 knowledge-output 落盘成四帖：重建 frontmatter（带时分 updated 保证首页置顶）、官网截图全部转 JPG 并降宽 Web 化、系列互链一次到位；validate_post 全过后跑 site-cascade 发射四条动态并核对统计/分类/热力；素材归档 Knowledge\Archive。

## 关联
- 素材归档：`Knowledge\Archive\2026-08-06_*训练营拆解`（四个目录）
- 关键：`src/content/posts/geektime-*/`、`src/content/dynamic/2026-08-06-2209*.md`

## 回滚
- 单点 revert 上表对应 hash；posts 与 dynamic 两笔可独立回退
