# 16: editLink 函数式 pattern + 单篇关闭

**What to build:** 「编辑此页」完整模式：URL 函数式生成（按内容源映射：posts/dynamic/spec 三套路径 → GitHub 对应文件）；单篇可关（frontmatter 字段）；docs/agents 与 spec 页先行；与批 2 票 05 的「编辑此页」小件合并或分工（批 2 是页面增强包里的一个，本票是文档级完整 pattern——实施时二选一或明确边界）。

**Blocked by:** None

**Status:** open

- [ ] URL 函数式生成（三套内容源路径映射）
- [ ] 单篇关闭字段
- [ ] docs/agents + spec 页先行接入
- [ ] 与批 2 票 05 去重（实施前确认边界）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/vitepress-borrow.md` 第 7 条（editLink 函数式 pattern+单篇关闭；公开页 editLink 仅园主编辑器 API 有 edit URL 拼接，src/pages/api/admin/pin.ts L30 先例）。上游 `temp/repos/vitepress/`（editLink 思想）。
