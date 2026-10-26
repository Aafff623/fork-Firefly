# 14: 片段包含（@include / <<<）

**What to build:** markdown 片段包含：`@include path#region` 与 `<<<` 两种语法，支持行范围；URL 重基（被包含文件里的相对路径按包含者重算）；docs/agents 手册先用起来（消手册与代码漂移）。

**Blocked by:** None

**Status:** open

- [ ] `@include`/`<<<` 语法构建期展开（区域+行范围）
- [ ] URL 重基逻辑 + 用例
- [ ] 循环/缺失容错（明确报错位置）
- [ ] docs/agents 至少一处手册改用片段包含
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch4/vitepress-borrow.md` 第 5 条 + `vitepress-features.md`（`<<<` 代码片段导入与 `<!--@include-->` 文件包含我们没有；写 docs/agents 手册可消漂移）。上游 `temp/repos/vitepress/`（include 机制思想，重实现）。
