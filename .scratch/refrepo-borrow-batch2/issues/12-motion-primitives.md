# 12: 动效原语库（WAAPI collapse/FLIP + 站点级 reduce-motion）

**What to build:** 新建 `src/utils/motion.ts`：① WAAPI 原语——collapse/expand（高度动画）、FLIP（列表重排）；② 站点级 reduce-motion 统一降级开关（一个读取点，全局生效）；③ 现有散落动效不强制迁移，新动效先入原语库；framer-motion 两处 .tsx 记录在案，不主动扩用（如需迁移单独评估）。

**Blocked by:** None

**Status:** open

- [ ] `src/utils/motion.ts` 上线（collapse/FLIP + reduce-motion 读取）
- [ ] 至少 1 个现有动效改用原语验证（如手风琴或设置面板）
- [ ] reduce-motion 开启时原语全部降级为无动画
- [ ] 行为测试覆盖原语降级路径
- [ ] `pnpm check && pnpm type-check && pnpm check:gates` 绿

**参考**：`temp/reports/batch2/shirone-borrow.md` 第 3 条 + `shirone-arch-perf.md`（动效零依赖 WAAPI + `--m3e-*` 令牌 + 统一降级；我们动效散落 20+ 文件、framer-motion 实证在用 2 处 .tsx）。上游实现见 `temp/repos/Shirone/src/`（重实现，不整段拷）。
