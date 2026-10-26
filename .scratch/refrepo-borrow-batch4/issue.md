# Issue · 参考仓库借鉴第四批（quartz + vitepress）

Status: ready-for-agent

## 来源

2026-10-26 参考仓库调研第四批。前三批已立项 50 项（`.scratch/refrepo-borrow-batch1/2/3`）；本批分析 **jackyzha0/quartz**（13.5k★，MIT，数字花园标杆 SSG）与 **vuejs/vitepress**（18.4k★，MIT，Vue 官方文档生成器），每仓 3 个 agent 分维度深挖，6 份报告在 `temp/reports/batch4/`，汇总版 `temp/reports/batch4-summary.md`。园主确认全量立项，本 effort 承接 18 项。远端汇总 issue：#6。

## 问题

1. **「数字花园」名不副实（本批核心发现）**：我们有 wiki-link 出链语法（渲染比 Quartz 更 rich），但零反链、零图谱、零嵌入、无链接关系数据——`src/lib/article-index*.ts` 只存元数据不存正文链接关系；当前形态是「带 wiki-link 语法糖的标签博客」。且 133 篇仅 5 篇用 `[[]]`（60 处），链接密度低，属坐实定位的基础设施投资。
2. **死链零护栏**（已亲证）：`scripts/`+`src/` 无死链检测；130+ 篇文章互链无检查。Quartz 与 VitePress 两仓互证同指出这一点。
3. **文章/文档体系小缺口**：outline 层级写死 3（参数已有未接线）；搜索无键盘导航（已亲证：Search 仅 Escape、AdvancedSearch 零 keydown）；frontmatter 缺每页开关字段；无片段包含机制。
4. **插件管线隐式契约**：`astro.config.mjs` 20+ 插件平铺、顺序靠数组位置隐式表达，无分层无校验（Quartz 四层管线+YAML 显式 order+构建期校验）。

## 证据（摘要）

- 报告：`temp/reports/batch4/{quartz,vitepress}-{arch-perf,features,borrow}.md`；汇总 `temp/reports/batch4-summary.md`。
- 亲自核实（2026-10-26）：backlink/反链 grep src/ 0 命中；死链检测 0 命中；`remark-wiki-link.js` 无 inlink/outlink 数据；Search.svelte keydown 仅 Escape（line 274）。
- 上游浅克隆（本地专属）：`temp/repos/quartz/`（v5 分支）、`temp/repos/vitepress/`；公网路径见各票。
- Quartz 关键架构决策：ContentIndex（`contentIndex.json`，含每文件 links）一次构建、Backlinks/Graph/Search/Explorer/Popover 五处消费——我们应对应建一份构建期 link-graph 数据，反链/图谱/断链/Explorer 共享，避免四张票各扫一遍 AST。

## 本轮决策（2026-10-26 园主确认）

- 范围：18 项全量立项（J 组数字花园 11 + K 组文章/文档体系 7）。
- **枢纽票先行**：J1 链接图谱数据底座是 J2/J3/J5/J9 的共同前置，先做 J1（或至少先做数据契约设计）。
- J4 死链+孤儿检测低成本，建议作为探针先行（接 validate_post.py/CI）。
- K7 lastUpdated git 化**暂缓**：与本站「发布时间=发布动作时间」口径冲突；CI 浅克隆会全错（deploy-cf.yml 无 fetch-depth）；.git 实测 2.88GB 不宜全量拉；三份报告两份倾向不搬。
- **不建 /docs 子站**（明确结论）：official 本地 gitignore CI 拿不到、内部治理文档公开即泄露、无真实产品文档缺口；未来要公开就在现有站加 /docs 路由。
- 跨栈仓库，全部思想迁移 + Astro 重实现；MIT 无许可障碍。

## 边界

- 不 push、不打 tag；远端 issue #6 已建。
- **WIP 冲突**：改 `Layout.astro`/`package.json`/`src/config/`/`src/styles/` 的票实施前查 git status；WIP 中保持 blocked。
- 不动架构；J3 图谱不引重依赖（d3-force 或轻量自绘要先评估体积）；K4 只加可选字段不破坏存量 frontmatter。
- 每票完成标准：`pnpm check && pnpm type-check`；数据管线票加构建验证；CI 票跑 `pnpm check:gates`。
- 票的最终状态与实现记录进本目录；不放 `TODO.md`。
