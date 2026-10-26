# 05: 工具链版本硬门禁

**What to build:** CI 加工具链版本断言：Node/pnpm 版本不符即红（package.json engines + CI 显式检查或 setup action 的版本对齐）；本地 dev 启动时也给明确警告（不阻断）。

**Blocked by:** None

**Status:** open

- [ ] CI 版本断言上线（Node/pnpm）
- [ ] 本地版本不符时警告清晰
- [ ] `pnpm check:gates` 绿

**参考**：`temp/reports/batch3/papermod-borrow.md` 第 9 条。上游 `temp/repos/hugo-PaperMod/`（思想迁移；对方是 CI 对 Hugo 版本的检查，我们对应 Node/pnpm）。
