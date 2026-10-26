# Issue · 参考仓库借鉴第五批（usememos/memos + antfu/antfu.me）

Status: ready-for-agent

## 来源

2026-10-26 参考仓库调研第五批（末批）。前四批已立项 68 项（`.scratch/refrepo-borrow-batch1/2/3/4`）；本批分析 **usememos/memos**（64k★，MIT，自托管碎片笔记全栈）与 **antfu/antfu.me**（1.1k★，MIT，设计参照系个人站），每仓 3 个 agent 分维度深挖，6 份报告在 `temp/reports/batch5/`，汇总版 `temp/reports/batch5-summary.md`。园主确认全量立项，本 effort 承接 18 项。远端汇总 issue：#7。

## 问题

1. **已核实休眠缺陷（本批最重要）**：`src/utils/memos-adapter.ts:194` 请求 `${apiUrl}/api/v1/memos`——Memos 主干该路径返回 410 Gone（其自带兼容测试 `server/testdata/http_compat.jsonl:41` 与 `proto/api/CHANGELOG.md` 证实「API v1 has been removed」）；`dynamicConfig.memos.enable` 默认 false 故今天不炸，一开即全站动态报错。附带 pageSize 默认 10000 超新 API 上限 1000、`parent` 参数新版已无（需 CEL `creator==`）。
2. **dynamic 发布面单一**：只有桌面 Agent 写文件 + git + CI，无移动端/API 发布路径；`/api/admin/pin.ts` 写死 posts 不覆盖 dynamic。
3. **dynamic 内容模型薄**：schema 仅 published/pinned/location/author，无 tags（Pagefind 只覆盖首屏 8 条，动态无法按主题检索）；热力图只吃 posts，122 条动态从未进。
4. **人格化细节缺口**（antfu.me 对照，均已 grep 验证全无）：文章页脚父级返回/comment on intent、草稿文章页无警示条、无副标题排版约定、筛选态不可分享、无 JSON Feed/Atom。

## 证据（摘要）

- 报告：`temp/reports/batch5/{memos,antfu-me}-{arch-perf,features,borrow}.md`；汇总 `temp/reports/batch5-summary.md`。
- 亲自核实（2026-10-26）：adapter 路径（memos-adapter.ts:194）、pageSize（:187）、dynamicConfig memos.enable 默认 false、Memos 主干 410 测试数据与 CHANGELOG。
- 上游浅克隆（本地专属）：`temp/repos/memos/`、`temp/repos/antfu.me/`；公网路径见各票。

## 本轮决策（2026-10-26 园主确认）

- 范围：18 项全量立项（L 组 Memos/动态 9 + N 组 antfu.me 人格化 9）。
- **L1 修缺陷最高优先**（低成本除雷）；L2 混合架构为高成本大票，需园主先定托管方案再开工。
- dynamic 路线明确：**不换文件底座**；Memos 做手机摄入层 + 构建期同步（webhook HMAC → CF Worker 验签 → repository_dispatch → CI 重建）；明确不推荐「浏览器运行时拉取」（整页退化 CSR）。
- N 组最优先 N1/N2/N3（纯增量零破坏不动设计系统）；N8 里「巨型描边年份标题」需园主视觉决策。
- antfu.me 动效哲学只作为批 2 票 12 的结构输入，不重复立项。

## 边界

- 不 push、不打 tag；远端 issue #7 已建。
- **WIP 冲突**：改 `memos-adapter.ts`/`dynamicConfig.ts`/`content.config.ts`/`Layout.astro` 的票实施前查 git status；WIP 中保持 blocked。
- 不动架构；L2 未定托管方案前不开工；L1 修完默认仍关（enable 保持 false，只保证开了能用）。
- 每票完成标准：`pnpm check && pnpm type-check`；L1 加「开 enable 本地起 Memos 新桩验证」或等效 mock 验证；CI 票跑 `pnpm check:gates`。
- 票的最终状态与实现记录进本目录；不放 `TODO.md`。
