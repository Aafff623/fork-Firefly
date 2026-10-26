# 06: site-root 产物根目录解析

**What to build:** 新增 `scripts/site-root.ts`：解析构建产物根（`dist/client` 存在则用之，否则 `dist`），统一 CF Workers 适配器与本地构建的产物路径；`package.json` build 链里的 `pagefind --site`、以及 07 的 subset-fonts、现有 `strip-legacy-fonts.ts` 全部改吃它。保留上游注释里记录的事故背景（曾因 pagefind 索引假路径导致线上搜索 404）。

**Blocked by:** None

**Status:** resolved（2026-10-26；pagefind 索引落在 `dist/client/pagefind`，strip 清理 `dist/client/_astro`，无 `dist/pagefind` / `dist/_astro` 误产物）

- [x] `scripts/site-root.ts` 上线：导出 `resolveSiteRoot()`（`existsSync("dist/client")` 则 `dist/client`，否则 `dist`），并把上游 run-pagefind.ts 的事故注释（CF 上 `pagefind --site dist` 索引出 `/client/...` 假路径、索引写进 `dist/pagefind` 不随站点部署、线上搜索一直 404）挪进本文件
- [x] `package.json` build：`pagefind --site dist/client` → `npx tsx scripts/site-root.ts --pagefind`（本票文件边界只允许新建 site-root.ts，所以把 pagefind 启动器作为它的 `--pagefind` CLI 模式，没有另建上游那样的 run-pagefind.ts；`spawnSync` 带 `shell: win32` 以解析 `.cmd`）
- [x] `scripts/strip-legacy-fonts.ts` 的 `dist/client/_astro` 改从 site-root 取
- [x] `npm run build` 后核对：`dist/client/pagefind/pagefind-entry.json` 存在、`dist/pagefind` 不存在；KaTeX ttf/woff 删掉 40 个（0.78MB），`dist/client/_astro` 残留 0 个；`dist/_astro` 未被误建
- [x] 门禁：`npx tsc --noEmit --isolatedDeclarations` exit 0；lifecycle / v41 / 文章导航 / UI 动效 / 社区评论门禁 + 13 条行为测试全过（逐条 `npx tsx`，未用 pnpm）

**实现记录**

- 作为 CLI 运行时：不带参数打印产物根（`dist/client`），`--pagefind` 在产物根上跑 Pagefind 后按退出码退出；被其他脚本 import 时不触发任何副作用（`import.meta.url === pathToFileURL(argv[1]).href` 守卫）。
- 还没吃 site-root 的脚本（本票未授权改动，留作观察）：`scripts/check-v41-gates.mjs`、`scripts/measure-dist-home.mjs` 里仍写着 `dist/client` 字面量。
- 构建环境注意：多 agent 并行构建会互相清 `dist`，出现 `Cannot find module .../.prerender/chunks/*.mjs` 的假失败；串行 + 先删 `dist` 后一次通过（本次 exit 0）。

**参考**：上游 `temp/repos/Firefly/scripts/site-root.ts` + `run-pagefind.ts` 头部注释（公网同路径）；`temp/reports/batch1/cuteleaf-firefly-borrow.md` 第 4 条。本票是 07 的前置。
