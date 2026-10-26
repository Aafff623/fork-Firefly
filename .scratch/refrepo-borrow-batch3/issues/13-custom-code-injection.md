# 13: inject 自定义代码注入点（head/bottom/footer）

**What to build:** customCodeConfig 配置域：head / body bottom / footer 三个注入点，各存原始 HTML 字符串，默认空；渲染进 Layout 对应位置。FooterConfig.html 先例泛化；**侧栏保持 componentMap 一条路，不并存逃逸舱**。注入内容原样输出（不转义）——需在配置注释明示安全边界（只有园本能改配置）。

**Blocked by:** None

**Status:** open

**WIP 注意：** 改 `src/layouts/Layout.astro`，实施前查 git status。

- [ ] customCodeConfig 三点配置域（默认空，行为不变）
- [ ] Layout 三处渲染（head/bottom/footer）
- [ ] 配置注释明示「原样输出、仅限受信来源」
- [ ] 本地配置一段验证注入（如统计代码）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/butterfly-arch-perf.md`（inject 专题：6 处逃逸舱 vs 我们 footer 单点，建议推广三点）+ `butterfly-borrow.md` 第 1 条；已亲证 `src/config/` 无 customCode/injectHtml。上游 `temp/repos/hexo-theme-butterfly/`（思想迁移）。
