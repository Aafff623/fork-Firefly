# 11: 加密页 shadow index（隐藏于列表/RSS）

**What to build:** 加密文章从列表/归档/RSS/llms.txt/搜索隐藏（shadow index），保留直链可访问（打开后输密码）；与票 08 的可见态词汇协同（unlisted 是「不列出但明文可访」，加密是「不列出且密文」两级）。

**Blocked by:** None（与 08 协同设计，可并行）

**Status:** open

- [ ] 加密文章消费方过滤规则表（列表/归档/RSS/llms.txt/Pagefind/sitemap 逐条）
- [ ] 直链访问保留（现有 EncryptedContent 行为不回退）
- [ ] 行为测试
- [ ] `pnpm check && pnpm type-check && pnpm check:gates` 绿

**参考**：`temp/reports/batch4/quartz-borrow.md` 第 10 条 + `quartz-features.md`（我们加密文仍进列表/RSS——Quartz 有 unlisted/stealth 分级）。上游 `temp/repos/quartz/`（可见性分级思想，重实现）。
