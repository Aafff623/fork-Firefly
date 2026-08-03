# master · 2026-08-03 · workspace rollup

## Status

shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-03 | master | 01459277 | chore | workspace | 忽略本地运行日志、工具状态与临时交接产物。 |
| 2026-08-03 | master | cdc7fe14 | docs | readme | 更新项目介绍、页面展示截图与架构素材。 |
| 2026-08-03 | master | 8176c0f1 | feat | media | 接入首页背景视频，调整横幅标题与播放状态。 |
| 2026-08-03 | master | 25e60e40 | feat | comment | 优化 Waline 编辑器、图片预览与上传交互。 |
| 2026-08-03 | master | 4acd1866 | feat | post-list | 升级分类栏、分页控件、文章卡片与列表布局。 |
| 2026-08-03 | master | 7b87ba09 | fix | navigation | 修复导航下拉菜单的焦点残留和多菜单并开。 |
| 2026-08-03 | master | 4c95d4a9 | feat | widget | 重塑侧栏资料、动态、时钟和站点统计组件。 |
| 2026-08-03 | master | 88726dcd | feat | widget | 强化礼盒、像素标签墙与日历视觉。 |
| 2026-08-03 | master | 5e9ace0e | chore | sponsor | 暂停展示支付宝、微信收款方式。 |
| 2026-08-03 | master | 01c42919 | feat | post | 优化文章阅读宽度、目录高亮和正文图片尺度。 |
| 2026-08-03 | master | 664948a2 | feat | dynamic | 优化动态页信息层级和交互反馈。 |
| 2026-08-03 | master | efd522e2 | feat | friends | 升级友链页内容与展示体验。 |
| 2026-08-03 | master | eb216b37 | feat | categories | 重构分类页展示布局。 |
| 2026-08-03 | master | fc003bac | feat | gallery | 优化图库手风琴与页面样式。 |
| 2026-08-03 | master | 46b19849 | feat | anime | 丰富动漫页布局与筛选展示。 |
| 2026-08-03 | master | 4da67251 | style | about | 微调关于页卡片视觉。 |
| 2026-08-03 | master | 49b36fa2 | docs | posts | 更新文章内容、封面与 MiniMax 图组。 |

## 做了什么

本轮统一收口多个 Agent 会话的站点视觉、交互、内容和媒体改动，并按独立能力拆成原子提交。
首页与文章页分别强化了背景媒体、阅读宽度、目录联动和正文图片尺度。
侧栏、导航、文章列表及独立页面完成针对性的视觉与交互升级。
本地开发日志、工具状态和交接文件已清理并加入忽略规则；收款方式暂时隐藏，等待新的素材。

## 关联

- 关键范围：`src/`、`src/content/posts/`、`public/assets/videos/`、`assets/images/readme/`
- 验证：`pnpm check`、`pnpm type-check`、`git diff --check`、本地 `http://127.0.0.1:4321/`

## 回滚

- 单项功能可用 `git revert <hash>` 独立回滚。
- 如需整体撤回本轮，在不含本文件提交的前提下按表格从 `49b36fa2` 逆序 revert 至 `01459277`。
