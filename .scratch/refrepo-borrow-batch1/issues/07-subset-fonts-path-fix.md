# 07: subset-fonts 路径缺陷修复

**What to build:** 修 `scripts/subset-fonts.ts` 的产物路径缺陷：`DIST_DIR`/`OUTPUT_DIR` 改从 06 的 site-root 取；替换逻辑的 URL 计算基准同步修正（当前 `path.relative("dist", …)` 产出带 `client/` 前缀的 URL，与 CSS 实际引用的 `/_astro/...`、`/assets/...` 对不上）；修后子集文件落在部署包内、CSS 引用可替换、清理只删已被替换的原字体。是否顺势激活 `--font-greatvibes` 子集（把它接入 config 区域集合）单独小决定，默认不激活。

**Blocked by:** 06（已完成）

**Status:** resolved（2026-10-26；真实字体走通全链：51.7KB OTF → 15.1KB woff2，落 `dist/client/_astro/fonts/`，CSS 引用已替换、format 提示同步改 woff2、原字体删除；默认仍未激活 greatvibes）

- [x] site-root 接入；`DIST_DIR = resolveSiteRoot()`、`OUTPUT_DIR = <root>/_astro/fonts`，构建后确认产物在 `dist/client/_astro/fonts/`
- [x] 用一个真实本地字体走通全链（临时把 `--font-greatvibes` 加进 `fontConfig.selected` 触发，验证后已复原）：字符收集 3883 个 → 子集 `bb94a4be30b15dff.woff2` 15.1 KB（原 51.7 KB，省 70.8%）→ `dist/client/_astro/Layout.*.css` 里的 `url(/assets/fonts/GreatVibes-Regular-2.otf)` 换成 `url(/_astro/fonts/bb94a4be30b15dff.woff2) format("woff2")` → 原 OTF 从 `dist/client/assets/fonts/` 删除；`public/assets/fonts/` 源文件未动，`dist` 里已无任何对原 `.otf` 的引用
- [x] 回归：未激活时脚本仍是无害跳过（`⏭ Skipping '--font-greatvibes' …` + `No local fonts with subset: true found. Skipping.`），`dist/client/assets/fonts/GreatVibes-Regular-2.otf` 51.7K 原样发货
- [x] `npm run build` 后 `dist` 中无孤儿子集文件（`dist/_astro` 不存在）、无被删引用的字体（全站 grep 原 `.otf` 引用 0 处）
- [x] 门禁：`npx tsc --noEmit --isolatedDeclarations` exit 0；lifecycle / v41 / 文章导航 / UI 动效 / 社区评论门禁 + 13 条行为测试全过（逐条 `npx tsx`，未用 pnpm）

**实现记录**

- URL 基准改成产物根（`path.relative(DIST_DIR, file)`），修掉 `client/` 前缀；`subsetUrl` 与 `OUTPUT_DIR` 都相对同一根，两边对得上。
- 顺手补了一处替换漏洞：原来只匹配 `url("…") format("…")`（带引号），没覆盖 `url(…)` 无引号写法，会出现「URL 换成 woff2、format 还写 `opentype`」；现在多一条模板，并对紧跟子集 URL 的 format 提示统一改 `woff2`。
- 未激活的决定维持原样：greatvibes 只被 `GlyphTitleEffects.astro` 的手写 `@font-face` 消费，不在 `collectUsedFontCssVars` 的区域集合里；要激活就把它加进 `fontConfig.selected` 或区域字段，属于内容/视觉决定，不在本票范围。
- 遗留观察（不在本票范围）：`npx biome check scripts/subset-fonts.ts` 报了 1 条 `lint/complexity/noUselessSwitchCase`（`detectFontFormat` 里 `case ".ttf": default:`），是老代码，`pnpm lint` 只扫 `./src` 所以从未被门禁挡住。

**参考**：缺陷核实过程见 `temp/reports/batch1-summary.md`「缺陷核实」节（2026-10-26 亲自核实：产物根 dist/client、脚本写死 dist、greatvibes 因 used 集合不含而跳过）；上游修法 `temp/repos/Firefly/scripts/site-root.ts`。注意：修前该功能从未真正触发，修复后首次跑构建要盯紧字体文件增减。
