# 01: og:image 静态默认封面兜底

**What to build:** 全站输出常驻 og:image 默认封面：在 `public/` 放一张 1200×630 品牌默认图（可用 `src/assets/images/logo/` 现成标识制作），`src/layouts/Layout.astro` 的 og 段无条件输出它；文章页将来开启动态 OG 后再覆盖。消除「全站无 og:image meta」现状。

**Blocked by:** None

**Status:** resolved（2026-10-27）

- [x] `public/` 新增 1200×630 默认封面（≤300KB，webp/png）
- [x] `Layout.astro` og 段常驻输出 `og:image`（含 `twitter:image`），文章页保留动态覆盖位
- [x] 本地 dev 抽查首页/文章页/归档页 HTML 含正确 og:image 绝对 URL
- [ ] 分享到任一带 OG 预览的平台显示品牌图（或 DOM 证据）
- [x] `pnpm check && pnpm type-check` 绿

**实现记录（2026-10-27）**

- 产物：`public/assets/images/og/og-default.png`，1200×630 PNG，183 KiB（≤300KB）。用仓内 `src/assets/images/logo/firefly-dark.png` + sharp 合成（SVG 渐变底 + 左侧标识 + 标题/副标题/域名 + 右侧 5% 透明水印标识），未调用生图模型。生成脚本留在本地 `temp/og-test/gen-og.mjs`（temp/ 不入库）。
- `src/layouts/Layout.astro`：`ogImageUrl` 从 `string | undefined` 改成恒有值——`generateOgImages && postSlug` 时取 `/og/<slug>.png`（动态覆盖位保留），否则回落 `DEFAULT_OG_IMAGE_PATH = "/assets/images/og/og-default.png"`；base 用 `Astro.site ?? new URL(siteConfig.site_url)`，保证绝对 URL。新增 `og:image:width/height/type/alt` 与 `twitter:image`。
- 验证（`npx astro dev --port 4399` + curl）：首页 `/`、归档 `/archive/`（重定向到 `/timeline/`）、文章 `/posts/java-course0/` 三处 HTML 均输出 `og:image = https://www.threetwoa.live/assets/images/og/og-default.png`、宽高 1200/630 与 `twitter:image` 同值。
- 构建验证：`astro build` 成功（2 分 58 秒），`dist/client/assets/images/og/og-default.png` 182.8K 已进产物，`dist/client/index.html` 与 `dist/client/posts/java-course0/index.html` 均带同一 `og:image`。
- 未验证：真实社交平台抓取（需发布到线上或第三方调试器）；`generateOgImages: true` 时的动态卡覆盖未在本轮开启验证（该分支逻辑未改动）。

**参考**：`temp/reports/batch1/fuwari-borrow.md` 第 2 条；我们现状 `src/config/siteConfig.ts` `generateOgImages: false`、`src/layouts/Layout.astro` og:image 条件输出。若 02 实施，本票可关闭（动态卡覆盖默认图）。
