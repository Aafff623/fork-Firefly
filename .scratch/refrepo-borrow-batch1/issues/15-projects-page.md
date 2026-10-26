# 15: Projects 项目展示页

**What to build:** 项目展示：新增 `projects` content collection（glob 加载 `src/content/projects/**/*.{md,mdx}`，frontmatter 含 link/status/tags/cover）；`/projects/` 索引页（按状态筛选，PROJECT_STATUS_KEYS）+ `[slug].astro` 详情页 + ProjectCard 组件；开关 `siteConfig.pages.projects`；i18n 补键。

**Blocked by:** None

**Status:** needs-info（`src/i18n/**` 仍被其他 Agent 的 WIP 占用；等 i18n 落地后继续）

- [ ] collection + schema（status 枚举）
- [ ] 索引页筛选 + 详情页 + 卡片
- [ ] pages 开关关闭时路由不存在（或 404 行为与现有特殊页一致）
- [ ] 本地造 2 个示例项目验收筛选与详情
- [ ] `pnpm check && pnpm type-check && pnpm check:gates` 绿

**参考**：上游 `src/content.config.ts:108-142`、`src/pages/projects/`、`src/utils/projects-utils.ts`、`src/components/pages/projects/ProjectCard.astro`（浅克隆 `temp/repos/Firefly/`）；`temp/reports/batch1/cuteleaf-firefly-borrow.md` 第 6 条。成本中；剩余成本主要是内容侧（每个项目要封面图与文案）。
