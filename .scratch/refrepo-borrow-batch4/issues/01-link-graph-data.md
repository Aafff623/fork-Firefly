# 01: 构建期链接图谱数据底座（枢纽票）

**What to build:** 构建期 link-graph 数据：slug → outlinks/inlinks（含锚点与显示文本），落构建产物（JSON 或索引），供反链/图谱/悬浮预览/Explorer 共用。数据契约先定并写进 spec；复用 `remark-wiki-link.js` 现有三级解析（slug/路径/裸文件名）；与 `article-index` 关系明确（扩展或并存）。**本票是 02/03/05/09 的共同前置，先做数据契约。**

**Blocked by:** None

**Status:** open

- [ ] 数据契约（字段/格式/落点/消费方清单）写入 spec
- [ ] 构建期采集：扫全站文章出链（wiki-link + 普通 markdown 链接至少覆盖 wiki-link）
- [ ] 反链索引生成（inlinks 由 outlinks 反转）
- [ ] 消费方最小验证（一个只读组件能拿到数据）
- [ ] 构建耗时增量可接受（记录数值）
- [ ] `pnpm check && pnpm type-check && pnpm build` 绿

**参考**：`temp/reports/batch4/quartz-arch-perf.md`（ContentIndex 一次构建五处消费）、`quartz-features.md`（我们 article-index 只存元数据不存链接关系，差的不是组件是整条数据链）、`quartz-borrow.md` 关键建议。上游 `temp/repos/quartz/`（ContentIndex 思想，Astro 重实现）。
