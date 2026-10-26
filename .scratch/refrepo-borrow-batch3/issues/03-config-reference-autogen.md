# 03: 配置参考自动生成 + 扩展点清单

**What to build:** 从 `src/config/*.ts` 的类型与注释自动生成配置参考（或扩展点清单），落 `docs/`；替代现在只有手工 README 的状态。遵守 AGENTS.md「能从代码或确定性来源重建的现状文档不手工维护」。降级方案：生成「配置域清单 + 每个域一句话职责」也远胜无。

**Blocked by:** None

**Status:** open

- [ ] 生成脚本（读 config 类型/JSDoc → markdown）或清单生成
- [ ] 产物进 docs/（明确是否入库、放哪）
- [ ] 与现有 `src/config/README.md` 的关系明确（替代或互补）
- [ ] 本地跑一次验证产物准确
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/papermod-borrow.md` 第 3 条（36 个 config 文件只有手工 README，违背 AGENTS.md 条款）。上游 `temp/repos/hugo-PaperMod/`（思想迁移，对方也无自动生成，是它的文档组织给我们的启示+我们的既有条款）。
