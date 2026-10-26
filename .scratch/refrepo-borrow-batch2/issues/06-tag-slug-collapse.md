# 06: tag slug 坍缩防护

**What to build:** 标签 slug 规范化防坍缩：大小写/空格/连字符归一（如 "Hello World" 与 "hello-world" 归为一 slug），与现有 `src/config/tagAliases.ts` 别名机制互补（别名管同义不同名，本票管同名不同形）；新增标签时提示冲突。

**Blocked by:** None

**Status:** open

- [ ] slug 归一函数上线，标签页/标签球/搜索口径一致
- [ ] 与 tagAliases 兼容（不破坏现有别名）
- [ ] 归一边界用例测试（大小写/空格/unicode/连字符）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch2/astro-paper-borrow.md` 第 10 条。低收益低风险，可与 04 合并实施。
