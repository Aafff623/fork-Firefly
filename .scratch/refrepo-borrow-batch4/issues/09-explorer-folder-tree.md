# 09: Explorer 文件夹树导航

**What to build:** 侧栏文件夹树：按 posts 目录层级构建树（slug=路径），文件夹可展开/折叠、文件夹页列出该夹文章；**只做侧栏组件，不改内容组织**；与现有 nav/合集导航的关系先设计（并存或互补）。

**Blocked by:** 01（树数据可由 link-graph 或独立构建期扫描产出，契约随 01 定）

**Status:** open

- [ ] 文件夹树组件（展开/折叠/当前高亮）
- [ ] 文件夹索引页（可选，第二阶段）
- [ ] 与现有导航并存不冲突
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/quartz-arch-perf.md`（Explorer「slug=路径、文件夹即导航」，FileTrie 构建期建树；我们 posts/<slug>/ 有目录层级但不暴露为导航）+ `quartz-borrow.md` 第 9 条。上游 `temp/repos/quartz/`（Explorer 思想，重实现）。
