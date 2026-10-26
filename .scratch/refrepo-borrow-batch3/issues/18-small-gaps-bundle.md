# 18: 小件打包（归档/订阅/无障碍/交互）

**What to build:** 一批低风险小件打包：① 归档按月分组（在现有年分组下细一档）；② 列表页 RSS 订阅按钮；③ accesskey（主要导航）；④ 全局 toast（复制成功/操作反馈统一出口）；⑤ 分类栏滚动位置记忆；⑥ Mermaid 大图缩放/新窗（构建期 SVG 已优，只补交互）；⑦ 阅读模式轻量开关（与批 1 票 14 沉浸阅读分工：本票是轻量档）。

**Blocked by:** None

**Status:** open

- [ ] 七项各自可独立开关（默认值按项定，行为不变优先）
- [ ] 归档按月：timeline/ArchivePanel 扩展
- [ ] toast：统一组件，复制版权（票 12）等复用
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/papermod-features.md`（按月归档/accesskey/列表 RSS）、`papermod-borrow.md` 第 10 条（分类栏滚动记忆）、`butterfly-features.md`（全局 toast/阅读模式）、`butterfly-borrow.md` 第 9 条（Mermaid 缩放）。上游 `temp/repos/hugo-PaperMod/`、`temp/repos/hexo-theme-butterfly/`（思想迁移）。
