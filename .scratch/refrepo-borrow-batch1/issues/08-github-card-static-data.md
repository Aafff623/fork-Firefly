# 08: GitHub 卡片构建期静态数据 + localStorage 缓存

**What to build:** GitHub 卡从全客户端渲染改为「构建期静态兜底 + 运行时增量」：新增 `scripts/generate-github-card-data.ts`，构建期扫描内容里 `::github{repo="owner/repo"}` 指令、调 GitHub API 取 description/language/avatar/license 写入 `src/constants/github-card-data.json`（`GITHUB_TOKEN` 走环境变量、5s 超时、失败保留旧缓存）；`src/plugins/rehype-component-github-card.mjs` 改组：先渲染构建期静态数据，stars/forks 由浏览器运行时请求一次写 localStorage（24h TTL，inflight 去重 + Swup 切页防重，失败回退静态数据）。开工前先统计文章里 `::github` 实际用量，评估无 token 60 次/小时限流。

**Blocked by:** None

**Status:** resolved（2026-10-26；完整构建与行为测试已由主对话补跑）

- [x] 统计全站 `::github` 指令数量，评估 API 限流（记录数值）
- [x] 构建期脚本上线，产物 JSON 入库策略明确（生成文件是否 commit）
- [x] 无 JS 场景（view-source / 爬虫 / 分享截图）卡片显示真实仓库信息
- [x] 运行时 stars/forks 缓存与 Swup 行为正常，失败回退不空白（DOM 桩验证，未真机浏览器）
- [x] `npm run build` + `check:behavior` 13/13 + 全门禁绿（主对话补跑；minify 已修复 Windows 路径）

**参考**：上游 `temp/repos/Firefly/scripts/generate-github-card-data.ts`、`src/components/features/GithubCardManager.astro`（公网同路径）；`temp/reports/batch1/cuteleaf-firefly-borrow.md` 第 5 条。成本低-中；GITHUB_TOKEN 只走环境变量不写码。

## 用量与限流（开工实测 2026-10-26）

| 口径 | 数值 |
|---|---|
| `src/content/**` 里 `::github{repo=…}` 指令 | 11 条（`grep -rho "::github{[^}]*}"`） |
| 其中 `posts/_draftbox/` | 3 条（本地草稿，不入库，脚本扫描时排除） |
| 计入构建的指令 | 8 条，分布在 5 个文件 |
| 去重后仓库数（全量 / 计入构建） | 9 / 6 |
| 无 token 限流 | 60 次/小时/IP —— 一次构建 6 次，约占 10% |
| 本机实测 | `curl https://api.github.com/rate_limit` 返回 60 限额、当时剩余 48 |

## 实现记录

- `scripts/generate-github-card-data.ts`（新）：递归扫 `src/content`（跳过 `posts/_draftbox`）→ 正则抽 `repo` → `GET /repos/{owner}/{repo}`（`AbortSignal.timeout(5000)`，token 只从 `process.env.GITHUB_TOKEN` 读、只拼请求头）→ 写 `src/constants/github-card-data.json`（tab 缩进、键排序、末尾换行）。任一仓库失败/404/限流都保留 JSON 旧值；`x-ratelimit-remaining: 0` 后剩余仓库直接跳过，不再继续打。整体异常只打日志，不阻断构建。
- `package.json` `build` 前置增加 `npx tsx scripts/generate-github-card-data.ts`（唯一改动）。
- `src/plugins/rehype-component-github-card.mjs`：模块加载时读 JSON，有数据就渲染 description / language / avatar(`&s=32`) / license；stars / forks 构建期不缓存，无 JS 时显示 `—`。无数据仓库退化为 `card-github fetch-error` + "Repository details unavailable"（不再出现 `Waiting...` 骨架态）。仓库校验改成 `/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/`。
- 客户端逻辑不再每个卡片一份 fetch 脚本：改为同一份内联管理器脚本，**每页只输出一次**（按 rehype-components 传入的 `vfile.data` 标记去重）。管理器挂在 `window.__ffGithubCards` 上，幂等：SwupScriptsPlugin 每次 `content:replace` 重跑内联脚本时只触发一次增量刷新，不会重复请求。
- 运行时：先读 `localStorage["ff-github-card:<owner/repo>"]`（24h TTL），未命中才请求；`inflight` 同页并发去重，`done` 保证同会话每个仓库只打一次（失败也不重试，保留静态值）；`astro:page-load` / `swup:content:replace` / `password:decrypted` 都会补扫新卡片；失败只 `console.warn`，卡片保持构建期信息。

## 产物入库策略（决定：commit）

`src/constants/github-card-data.json` **入库**，理由：CI 无 `GITHUB_TOKEN` 时（或共享 runner IP 被限流时）构建仍有一份上一版数据兜底，卡片不会整片退化成 "unavailable"。数据只含公开仓库的 description / language / avatar / license，不含 token；脚本排除 `_draftbox`，避免把草稿里引用的仓库名随派生数据带进仓库。更新节奏：每次构建自动刷新，刷新结果随正常提交入库即可，不需要单独维护。

## 验证记录（2026-10-26）

| 命令 | 结果 |
|---|---|
| `npx tsx scripts/generate-github-card-data.ts` | 8 指令 / 5 文件 / 6 仓库，全部刷新成功，写出 6 条 |
| `npx tsc --noEmit --isolatedDeclarations` | 通过（无输出；`scripts/` 不在 tsconfig include 内，与既有脚本一致） |
| `npx astro check` | 0 errors（340 files，10 hints 全是既有项） |
| `npx astro build` | 成功（约 3 分钟）；`dist/client/posts/ai-video-making/index.html` 两张卡都是真实 description / language / avatar(style) / license，`Waiting` 字样 0 处，管理器脚本 1 份（`__ffGithubCards` 出现 1 次） |
| 内联脚本 `node --check` | 通过（5184 bytes，未压缩） |
| esbuild 同参数压缩（target es2018、`minifyIdentifiers: false`） | 5184 → 3904 bytes，无 `</script` 提前闭合；压缩版重跑 harness 仍 11/11 PASS |
| DOM 桩 harness（`temp/github-card-check/harness.mjs`） | 11/11 PASS：同 repo 只请求一次、双卡回填、localStorage 带 `fetchedAt`、TTL 过期重取、切页重跑不重发、失败保留 `—` 且同会话不再请求 |
| `node scripts/check-lifecycle-events.mjs` 等 5 个 node 门禁 | 全绿（v41 26 条 / 导航 22 条 / 动效 10 条 / 社区 9 条） |

主对话补验（2026-10-26）：`npm run build` exit 0；minify 已修复 Windows 路径（4669 段，首页内联 JS −36.8%）；pagefind 落 `dist/client/pagefind`；`check:behavior` 13/13；v41 / 文章导航 / UI / 社区 / 死事件门禁全绿。仍未做真机浏览器 stars/forks 实请求与 Swup 软切页（DOM 桩已覆盖）。

## 已知风险 / 注意

- **本地内容缓存会让改动前渲染过的页面继续保持旧卡 HTML**：跑本轮验证时 `/about`（`spec` 集合，`render()` 渲染）仍是旧的 `Waiting...` 卡，而同一插件产出的文章页是新的。`node_modules/.astro/data-store.json` 里存着改动前那次构建的渲染结果，Astro 的内容缓存 key 不包含被 import 的 rehype 插件代码。CI 全新构建不受影响；本地要看到 `/about` 刷新，删缓存目录或改动对应 md 源文件即可。
- `scripts/minify-inline-scripts.ts` 当前在本机 glob 到 0 个 HTML（`resolveSiteRoot()` 返回带反斜杠的 Windows 路径，`${DIST_DIR}/**/*.html` 匹配不到），属票 05/06 的在制品，本轮未改；卡片管理器脚本本身已按同一套 esbuild 参数验证可安全压缩。
- 无 token 时每次构建 6 次请求；GitHub Actions 共享出口 IP 若被其他任务打满 60/小时，构建只会保留上一份 JSON（卡片仍有静态信息，stars/forks 显示 `—`）。
