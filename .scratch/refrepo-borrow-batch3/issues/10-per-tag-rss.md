# 10: 每标签 RSS

**What to build:** 每标签独立 RSS 端点：在批 2 票 04 的静态标签路由体系上，为每个标签生成 RSS feed；列表页/标签页加 RSS 订阅按钮（可配置）。

**Blocked by:** 批 2 票 04（每标签静态可分页 URL，.scratch/refrepo-borrow-batch2/issues/04）

**Status:** resolved（2026-10-26；291 个每标签 RSS 已随构建产出，XML 解析与 channel/item link 已核）

- [x] 每标签 RSS 端点（构建期生成）— `src/pages/tags/[tag]/rss.xml.ts`，复用批 2 票 04 的标签分组
- [x] 标签页订阅按钮（开关）— 静态标签页头部 RSS 入口，由 `src/utils/rss-feed.ts` 的 `TAG_RSS_ENABLED` 控制（默认 true）
- [x] feed 内容模式与站级 RSS 一致（尊重批 1 票 11 的 contentMode）— 站级与每标签 RSS 共用 `createRssResponse` / `buildFeedItems`，contentMode / sanitize / 密码占位只有一份实现
- [x] `pnpm check && pnpm type-check` 绿 — 按本轮指示不用 pnpm，等价执行 `npx astro check` 与 `npx tsc --noEmit --isolatedDeclarations`

**参考**：`temp/reports/batch3/papermod-borrow.md` 第 4 条 + `papermod-features.md`（per-section RSS、列表页 RSS 按钮我们没有）。上游 `temp/repos/hugo-PaperMod/`（思想迁移）。

## 实现记录（2026-10-26）

- `src/pages/tags/[tag]/rss.xml.ts`：`getStaticPaths` 与静态标签页同源生成；频道 `link` 指向对应标签静态页，条目 `link` 仍为文章绝对路径。
- `src/utils/rss-feed.ts`：从 `src/pages/rss.xml.ts` 抽出的唯一条目构建入口；站级 `/rss.xml` 改为薄调用，`customData` / lastBuildDate / 密码占位 / sanitize 白名单保持原样。
- 订阅入口：静态标签页头部 `RSS` 胶囊链接（`title` / `aria-label` 用既有 `I18nKey.rss`）；未新增 i18n 文件或 key。
- 开关：本轮文件边界未包含 `siteConfig` / 类型文件，所以开关落在 `TAG_RSS_ENABLED` 常量；关闭只隐藏标签页入口，端点保留，已订阅链接不断。

## 验证

- `npx astro build`：成功；291 个 `dist/client/tags/<slug>/rss.xml`。
- Python `ElementTree` 解析通过：站级 `/rss.xml` 125 items；`/tags/ai-coding/rss.xml` 16 items、`/tags/agent/rss.xml` 11 items、`/tags/%E9%9D%A2%E8%AF%95/rss.xml` 13 items；full 模式每项都有 `content:encoded`。
- 频道 link：站级为站点根，每标签为 `/tags/<slug>/`；条目标题/链接与静态页排序一致。
- `npx tsc --noEmit --isolatedDeclarations`：0 errors；`npx astro check`：0 errors / 0 warnings / 10 条既有 hints。
- `npm run check:behavior`：15 个行为测试全绿。

未验证 / 边界：

- `contentMode: "summary"` 未再单独跑构建对比；站级与每标签共用同一函数，切换是同一代码路径。
- 开关不是 `siteConfig` 字段，站点若要多语言/配置面板可见的开关，后续可并入 `siteConfig.feed`。
