# 03: 内容派生属性（写入时算一次）

**What to build:** dynamic 派生属性写入/构建时算一次（kind、是否系统动态等），落 frontmatter 或索引；替代每次筛选实时反推 `detectDynamicKind` 的做法；存量动态回填一次。

**Blocked by:** None

**Status:** open

- [ ] 派生属性清单确定（哪些算、在哪算）
- [ ] 写入/构建时计算 + 存量回填脚本
- [ ] 消费方（时间线/筛选/热力图）改读派生值
- [ ] 行为测试：派生值正确性
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch5/memos-borrow.md` M2（Memos 写时派生 RefreshMemoDerivedPayload，替代我们每次筛选实时反推）。上游 `temp/repos/memos/`（思想迁移）。
