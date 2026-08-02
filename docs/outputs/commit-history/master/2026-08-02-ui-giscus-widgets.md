# master · 2026-08-02

## Status
shipped

## Commits

| 日期 | 分支 | commit hash | 类型 | 主题 | 描述 |
|---|---|---|---|---|---|
| 2026-08-02 | master | 55070e0b | feat | Giscus 主题鉴权 | 自定义主题、导航登录态与 GitHub 入口 |
| 2026-08-02 | master | 2acdc32e | feat | 置顶 API | 本地 pin 接口 |
| 2026-08-02 | master | 08a9c235 | feat | 关于页视觉 | about/about-site 拆分与翻页组件 |
| 2026-08-02 | master | ed8625e9 | feat | 砖石与 Letter | brick 布局 + Letter 卡片 |
| 2026-08-02 | master | 00617ad7 | feat | 搜索增强 | 搜索面板交互与结果呈现 |
| 2026-08-02 | master | 5c276494 | feat | 侧栏小组件 | 公告情书卡、日历、意想不到时钟 |
| 2026-08-02 | master | 383a6501 | feat | Anime 百叶窗 | blinds 动效与演示资源 |
| 2026-08-02 | master | 15fb876c | feat | Gallery 样式 | 手风琴与画廊视觉 |
| 2026-08-02 | master | 89a17b5e | chore | UI 微调 | 宠物层级、打赏入口、文案 |
| 2026-08-02 | master | 3941be39 | chore | Hallmark skill | 设计参考资料入库 |

## 做了什么
本批把评论鉴权入口、关于页视觉、列表砖石/Letter、侧栏时钟与公告、Anime/Gallery 动效样式，以及 Hallmark skill 资料一并落地。评论图床上传方案已搁置并撤回，未纳入提交。

## 关联
- 评论：`src/components/comment/Giscus.astro`、`public/giscus/`、`GiscusAuthStatus.svelte`
- 关于：`src/pages/about.astro`、`src/components/pages/about/`
- 布局：`src/styles/brick.css`、`post-card-letter.css`
- Skill：`.agents/skills/hallmark/`

## 回滚
- 整批：`git revert --no-commit 3941be39^..55070e0b` 后视情况拆分；或按上表自新到旧逐笔 `git revert <hash>`
