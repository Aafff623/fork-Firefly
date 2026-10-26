# 04: 「站点默认 + 单篇覆盖」显示开关词汇表

**What to build:** 确立显示类开关的标准词汇：站点默认值在 config，单篇覆盖在 frontmatter，读取走统一级联（.Param 思想）；把命名规则、读取 helper、适用场景写成 spec 条款，供后续配置项遵循。**不合并现有 config 文件**（批 1 票 16 已定不重构），只立内核。

**Blocked by:** None

**Status:** open

- [ ] 词汇表与级联读取 helper（或明确复用现有机制）
- [ ] 写入 spec/治理文档（位置由主对话定）
- [ ] 至少 1 个新配置项按此模式落地作为范例
- [ ] 不动现有 36 个 config 文件结构
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/papermod-borrow.md` 第 5 条。上游 `temp/repos/hugo-PaperMod/`（.Param 级联思想迁移）。
