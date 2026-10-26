# 15: Markdown 内容驱动按需加载

**What to build:** 首页/全局 CSS 按内容命中拆包：现在首页 CSS 约 510KB（KaTeX/Mermaid/PlantUML/Expressive Code 等重语法样式全量进包）；改为按文章实际命中的语法拆包或异步化（命中语法才加载对应样式/组件）。**先量首页 CSS 构成再定拆分粒度；成本中高，可降级为「重语法组件异步化」最小版。**

**Blocked by:** None

**Status:** open

- [ ] 现状测量：首页 CSS 构成 Top N 及字节（记录数值）
- [ ] 拆分或异步化方案落地（范围按测量结果定）
- [ ] 无回归：含重语法的文章渲染正常
- [ ] 首页 CSS 字节下降（记录前后数值）
- [ ] `pnpm build` 验证 + `pnpm check:gates` 绿

**参考**：`temp/reports/batch2/shirone-arch-perf.md`（Markdown 内容驱动按需加载，语法命中拆包，直击我们首页 CSS ~510KB 缺口）+ `shirone-borrow.md` 第 7 条。上游做法见 `temp/repos/Shirone/src/`（重实现）。
