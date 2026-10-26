# 09: Series 系列文章机制

**What to build:** 连载支持：`src/content.config.ts` posts schema 加 `series: string` / `seriesOrder?: number`（判断必须 `!== undefined`，0 会被误判）；聚合逻辑进 `src/utils/content-utils.ts`（按 seriesOrder 升序、未设置排最后）；新增 `/series/` 索引页（手风琴卡片，aria-expanded + max-height 动画，事件委托防 Swup 重入）；文章页加 SeriesNav 导航盒；i18n 补键；Agent 发文流水线（post-publish）加 seriesOrder 维护提示。

**Blocked by:** None

**Status:** needs-info（`src/i18n/**` 仍被其他 Agent 的 WIP 占用；等 i18n 落地后继续）

- [ ] schema 两字段 + 聚合函数（含 0 值与未设置的边界测试）
- [ ] `/series/` 索引页 + 文章页 SeriesNav，开关可配（siteConfig.pages 或 post 段）
- [ ] Swup 软导航后手风琴交互正常（防重入）
- [ ] post-publish 流水线加 series/seriesOrder 提示
- [ ] 本地造 3 篇同系列文章走通索引与导航
- [ ] `pnpm check && pnpm type-check && pnpm check:gates` 绿

**参考**：上游 `src/content.config.ts:24-25,82-83`、`src/utils/content-utils.ts:86-152`、`src/pages/series/index.astro`、`src/components/misc/SeriesNav.astro`（浅克隆 `temp/repos/Firefly/`）；`temp/reports/batch1/cuteleaf-firefly-borrow.md` 第 2 条。与已有 wiki-link 互补（线性次序 vs 网状引用），是「数字花园无双链」的最轻补丁。
