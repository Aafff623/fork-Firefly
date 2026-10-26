# 05: 内联脚本压缩（minify-inline-scripts）

**What to build:** 构建后压缩 `is:inline` 脚本：新增 `scripts/minify-inline-scripts.ts`，astro build 后扫 dist HTML，把内联脚本过 esbuild（`minifyWhitespace` + `minifySyntax`，**`minifyIdentifiers: false` 必须保持**——全局作用域脚本靠函数名互相调用，改名会静默炸掉）；压后检查 `</script` 防提前闭合；串入 `package.json` build 链（astro build 之后、pagefind 之前或之后以不影响 pagefind 索引为准，跑一次构建确认行为不变）。

**Blocked by:** None（与 06 无依赖，可并行；但若 06 先行，本脚本应从 site-root 取产物目录）

**Status:** resolved（2026-10-26；首页内联 JS 57,918 B → 36,610 B（−21,308 B / −36.8%）；全站压 4669 段，省 4755.2 KiB）

- [x] `scripts/minify-inline-scripts.ts` 上线并串入 build（astro build 之后、subset-fonts 之前；产物根走 06 的 `resolveSiteRoot()`）
- [x] 构建后首页 HTML 内联 JS 体积下降：57,918 B（56.6 KiB）→ 36,610 B（35.8 KiB）；`index.html` 总大小 586,865 B → 565,557 B；全站 210/865 个 HTML、4669 段内联脚本，日志报 `saved 4755.2 KiB`
- [x] 内联脚本功能不变：ego-browser 实测 `#display-settings-switch` 显示设置面板开合、Swup 无刷新跳转 `/about/`（哨兵变量保留）、音乐播放列表手风琴 0fr↔1fr，控制台 0 error；`setRandomSubtitle` / `backToTop` / `scrollToCommentSection` / `__ffBootBound` 等全局名压缩后仍在
- [x] `npm run build` 完整跑通一次（exit 0），产物无 `</script` 提前闭合：865 个 HTML 逐段扫描，脚本体内含 `</script` 的 0 处；脚本内出现 `<script` 的段落直接跳过（java-course 系列正文里有未转义的 `<script>` 文本）
- [x] 门禁：`npx tsc --noEmit --isolatedDeclarations` exit 0；`node scripts/check-lifecycle-events.mjs`(+`--self-test`)、v41 / 文章导航 / UI 动效 / 社区评论门禁全过；13 条行为测试逐条 `npx tsx` 全 PASS（未用 pnpm）

**实现记录**

- esbuild 不是本仓直接依赖（依赖树里只有 astro 用，pnpm 只在根 `node_modules` 链接直接依赖）。脚本先 `import("esbuild")`，失败时从 astro 的依赖树解析同一份 esbuild（构建日志会打印解析到的路径），这样不用改 package.json 依赖、不用动 lockfile（CI 是 `pnpm install --frozen-lockfile`）。
- 比上游多两道保险：脚本体内出现 `<script`（正则配对会配错，说明那是正文）直接跳过；压后 `</script` 检查保留。68 段因正文夹杂 `<script>` 或控制字符解析失败被跳过，保持原样。
- 遗留观察（不在本票范围）：`java-course14` / `java-course3` 等文章里有未转义的 `<script>` / `</script>` 纯文本，渲染出来的 HTML 标签计数不平衡（浏览器实测页面正常、无控制台报错），建议另开票处理正文转义。
- 构建环境注意：本地两个 agent 同时跑 `astro build` 会互删 `dist/server/.prerender/chunks`，报 `Cannot find module ...astro-component_*.mjs`；串行构建 + 先删 `dist` 即可通过。

**参考**：上游 `temp/repos/Firefly/scripts/minify-inline-scripts.ts`（公网同路径）；`temp/reports/batch1/cuteleaf-firefly-arch-perf.md`（54KB 实测）。
