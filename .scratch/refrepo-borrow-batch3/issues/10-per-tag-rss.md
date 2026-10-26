# 10: 每标签 RSS

**What to build:** 每标签独立 RSS 端点：在批 2 票 04 的静态标签路由体系上，为每个标签生成 RSS feed；列表页/标签页加 RSS 订阅按钮（可配置）。

**Blocked by:** 批 2 票 04（每标签静态可分页 URL，.scratch/refrepo-borrow-batch2/issues/04）

**Status:** open

- [ ] 每标签 RSS 端点（构建期生成）
- [ ] 标签页订阅按钮（开关）
- [ ] feed 内容模式与站级 RSS 一致（尊重批 1 票 11 的 contentMode）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/papermod-borrow.md` 第 4 条 + `papermod-features.md`（per-section RSS、列表页 RSS 按钮我们没有）。上游 `temp/repos/hugo-PaperMod/`（思想迁移）。
