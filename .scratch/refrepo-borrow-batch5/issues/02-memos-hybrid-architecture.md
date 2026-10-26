# 02: Memos 混合架构（手机摄入层 + 构建期同步）

**What to build:** 手机发动态链路：Memos 自托管实例（VPS/容器/Fly.io/NAS+Tunnel 之一，**园主先定托管方案再开工**）→ Memos webhook（HMAC 验签）→ CF Worker 验签端点 → repository_dispatch → CI 重建时拉取动态写回仓库 → dynamic 仍是静态产物，浏览器零运行时依赖。**明确不做**「浏览器运行时拉取」路线（开 enable 整页退化 CSR）。

**Blocked by:** None（前置：园主托管方案决策；建议 01 修完后再评估启用）

**Status:** open（高成本大票，待托管决策）

- [ ] 托管方案决策记录（园主）
- [ ] webhook → Worker 验签 → repository_dispatch 链路
- [ ] CI 拉取脚本（构建期从 Memos 拉 PUBLIC 动态，写入 dynamic 内容或索引）
- [ ] 端到端演练：手机发一条 → 分钟级线上出现（记录时延）
- [ ] 隐私模型：只读 PUBLIC visibility，显式限定
- [ ] `pnpm check && pnpm type-check && pnpm check:gates` 绿

**参考**：`temp/reports/batch5/memos-borrow.md`（条件建议混合架构；不推荐浏览器运行时拉取；不建议全量替换文件底座）+ `memos-arch-perf.md` 第 11/13 条（混合架构可行但代价：重写 adapter、多养常驻服务+备份、memos 模式下首屏/计数退化）。上游 `temp/repos/memos/`（架构思想）。
