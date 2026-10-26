# 05: 页面小件打包（面包屑/阅读进度/编辑此页/分享外跳/envField+GSC）

**What to build:** 一串低成本页面增强打包实现：① 面包屑（或降级为「当前位置」文本，筛选态寻路）；② 文章页阅读进度条；③ 「编辑此页」链接（指向 GitHub 对应源文件，可按配置开关）；④ 每平台分享外跳（Twitter/Mastodon 等 intent URL）；⑤ envField（Astro 6+ 环境字段机制，若我们的版本支持）+ google-site-verification meta 配置位。

**Blocked by:** None

**Status:** open

**WIP 注意：** 若面包屑/进度条落在 post-card 或 PostPage，注意 `src/styles/post-card*.css`、`src/components/layout/PostPage.astro` 在制品中（2026-10-26 git status）。实施前重新查 git status。

- [ ] 五项各自可按配置开关（默认关或按需开，行为不变优先）
- [ ] 阅读进度条在长文工作正常、reduce-motion 下降级
- [ ] 编辑此页链接指向正确源文件路径
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch2/astro-paper-borrow.md` 第 5/8 条 + `astro-paper-features.md` 缺口清单。上游对应实现见 `temp/repos/astro-paper/src/`。
