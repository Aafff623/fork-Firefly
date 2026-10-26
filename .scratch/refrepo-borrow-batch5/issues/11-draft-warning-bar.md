# 11: 草稿文章页内警示条

**What to build:** draft 文章在文章页顶部显示醒目警示条（「本文是草稿，未发布」）；现在 draft 只是列表角标，文章页无任何提示——正好服务草稿箱防误截屏分享。样式可配置；dev/生产行为一致（草稿箱本地可见）。

**Blocked by:** None

**Status:** resolved（2026-10-26；草稿箱 DEV 未逐篇点验）

- [x] 文章页 draft 警示条（含 _draftbox 内文章）
- [x] 与列表角标并存不冲突（文章页新增，列表角标未改）
- [ ] 本地 DEV 打开草稿箱文章验收（未做）
- [x] `npx tsc` + `npx astro check` 绿

## Result

- `[...slug].astro` 在正文前按 `entry.data.draft || entry.id.startsWith("_draftbox/")` 渲染 DRAFT 警示条。
- PROD 不产出草稿页；DEV 草稿箱可直接看到警示条，未逐篇点验。

**参考**：`temp/reports/batch5/antfu-me-borrow.md` 第 2 条（draft 目前只是列表角标，文章页无提示）。上游 `temp/repos/antfu.me/`（设计借鉴）。
