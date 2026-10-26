# 15: JSON Feed + Atom 订阅源

**What to build:** 订阅源族扩展：现只有 RSS 2.0（`src/pages/rss.xml.ts`），补 JSON Feed 1.1 与 Atom 1.0；三格式同源数据；尊重批 1 票 11 的 contentMode；sitemap/head 加 alternate 链接。

**Blocked by:** None

**Status:** open

- [ ] JSON Feed + Atom 路由（与 RSS 同源）
- [ ] head alternate 链接补全（三格式）
- [ ] 本地构建三格式各验证一次
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch5/antfu-me-borrow.md` 第 6 条（JSON Feed + Atom，我们只有 RSS2）。上游 `temp/repos/antfu.me/`（设计借鉴）。
