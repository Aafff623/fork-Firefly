# 03: article meta + JSON-LD 补全（dateModified/image）

**What to build:** 文章页补 SEO 元数据：`article:published_time` / `article:modified_time`（有 updated 时）；JSON-LD 补 `dateModified` 与 `image`（封面图；代码里现有 cover image TODO 一并处理，无封面时省略或给默认图——与批 1 票 01 的默认封面衔接）。

**Blocked by:** None

**Status:** resolved（2026-10-26）

- [x] article:published/modified meta 输出（updated 缺省时不输出 modified）
- [x] JSON-LD 补 dateModified/image；无封面回落批 1 默认 OG 图
- [x] 构建抽 3 篇文章验证 meta 与 JSON-LD
- [x] `npx tsc` + `npx astro check` 绿

## Result

- Layout 通过 `getEntry("posts", postSlug)` 输出 `article:published_time` / `article:modified_time`。
- JSON-LD `dateModified` 有 updated 用 updated、否则回落 published；`image` 用封面或默认 OG 图。
- 抽查 `xiuxing-worldly` / `java-course9` / `ai-video-making`：canonical、published meta、JSON-LD 正确；构建中 75 篇文章含 modified meta。

**参考**：`temp/reports/batch2/astro-paper-borrow.md` 第 2 条 + `astro-paper-features.md`（缺口清单）。上游 `temp/repos/astro-paper/src/layouts/Layout.astro`。
