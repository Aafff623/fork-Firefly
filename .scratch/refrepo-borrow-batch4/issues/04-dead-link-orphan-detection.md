# 04: 死链 + 孤儿页检测

**What to build:** 构建期站内链接检查：扫全站文章内部链接（wiki-link/相对链接/绝对站内链接），死链分级报告（先警告后硬门禁）；孤儿页列表（无任何入链的文章）供园主参考；接入 CI。**低成本探针，建议先于 02/03 实施。**

**Blocked by:** None（可先用轻量 AST 扫描，不依赖 01 的完整数据）

**Status:** open

- [ ] 死链扫描脚本（警告级，报告清单）
- [ ] 孤儿页检测（无入链文章列表）
- [ ] CI 接入（先警告不红，稳定后升级硬门禁——升级需园主点头）
- [ ] 对现有 130+ 篇文章跑一次全量扫描，记录基线死链数
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/quartz-borrow.md` 第 4 条 + `vitepress-arch-perf.md`（构建期死链检测——我们 130 篇文章零站点级死链检查）+ `vitepress-borrow.md` 第 1 条；两仓互证。已亲证 scripts/+src/ 无死链检测。上游 `temp/repos/quartz/`、`temp/repos/vitepress/`（思想迁移）。
