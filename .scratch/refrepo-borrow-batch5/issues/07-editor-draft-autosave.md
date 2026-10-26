# 07: 发文流水线草稿身份键 + autosave

**What to build:** dynamic-publish/new-dynamic 脚本加草稿保护：草稿身份键（按内容 scope 自动生成）+ autosave 模式（编辑中草稿不丢）；参考 Memos 编辑器「草稿按 scope 自动存」。

**Blocked by:** None

**Status:** open

- [ ] 草稿身份键机制
- [ ] autosave（本地草稿存储，恢复入口）
- [ ] 与 _draftbox 机制的关系明确（互补：draftbox 是文章草稿，本票是流水线编辑态草稿）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch5/memos-borrow.md` M4（编辑器草稿身份键+autosave）。上游 `temp/repos/memos/`（思想迁移）。
