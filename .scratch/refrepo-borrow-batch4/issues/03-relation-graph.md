# 03: 局部/全局关系图谱

**What to build:** 关系图谱组件：局部图（当前文章 ±1 跳）优先，全局图其次；节点可点跳转；**d3-force 体积先评估，超预算则 canvas 自绘轻量实现**；island 按需加载（不进首屏包）。

**Blocked by:** 01

**Status:** open

- [ ] 依赖体积评估记录（d3-force vs 自绘，数值写进票）
- [ ] 局部图上线（±1 跳，点击跳转）
- [ ] 全局图（可按页/按配置开）
- [ ] island 按需加载，首页 JS 无感
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/quartz-borrow.md` 第 2 条 + `quartz-features.md`（链接密度低——133 篇仅 5 篇用 [[]]，即时观感收益有限，属基础设施投资）。上游 `temp/repos/quartz/`（Graph 插件思想，重实现）。
