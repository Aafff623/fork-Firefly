# 性能优化 V6 · 终局收官计划（2026-08-15 夜）

> 前序：V2→V3→V4.1→V5（见同目录）。V5 已完成 Phase R 返工 + glob 根治 + CLS 修复。
> 本篇 = 剩余全部可自主完成项的一次性收官；执行完仅剩「园主拍板项」。
> 铁律不变：不阉割视觉、CSS 隐藏不算优化、探针验收 + 独立 commit。

## 现状与剩余空间（诚实盘点）

| 指标 | 现状 | 剩余空间 |
|---|---|---|
| 首页 CSS | 526KB | 主战场：页面级大件下沉 + KaTeX 按需；全部清完理论可到 ~400KB，<300KB 需 Tailwind 工具类层重构（本轮不做，见拍板项） |
| LCP Render delay | 475ms（本地无 gzip） | CSS 下沉 + D1 合成面减压后收窄；生产 gzip 后预计显著低于实验室值 |
| Swup 跳转 | 可用但浪费 | C2 六项：双跑/重建 Intl/叠定时器/重复绑 scroll/强制回流/裸 scrollTo |
| 滚动期 | 四层合成面 | D1：navbar blur 去 transition 降半径、waves 滚动暂停、樱花移动门控 |
| CLS | 0.01（桌面）/ 0.11（慢网桌宠入坞） | D6：桌宠定位改 transform |
| TagCloud | jsdelivr CDN 运行时 | D4：自托管 bundle |
| 依赖 | satteri/marked 等零引用 | E-clean：卸载 + 构建工具移 devDeps |

## Phase X · CSS 下沉（B2 可自主部分）

| 文件 | 判定依据 | 动作 |
|---|---|---|
| gallery.css | PhotoCard/相册/画布仅 gallery 页用 | main.css 移除 → gallery/index.astro + [album].astro 引入 |
| anime-bangumi.css | 仅 anime/bangumi 页 | 同上（bangumi 关停仍保留文件） |
| hero-bg.css | 仅 about/friends/guestbook/dynamic 四 hero 页 | 移到四页引入 |
| text-voice.css | 若全仓无消费 → 删除；有消费 → 下沉 | 先 grep 判定 |
| guestbook-cicada.css | V5 已下沉 ✓ | — |

验收：首页 CSS 显著下降；各 hero/gallery/anime 页视觉 diff 抽查。

## Phase D · 渲染期

1. **D1 合成面**：navbar.css `transition: backdrop-filter` 删除（状态直切）+ blur 20→12px；waves.css 三层动画滚动中 `animation-play-state:paused`（Layout scrollFunction 里 scrollstart 暂停 / scrollend 恢复）；SakuraEffect 移动端 + `navigator.connection.saveData` 不启 Worker（桌面不变）。
2. **D2 scrollFunction 强制布局**：navbar/top-row getElementById 缓存；updateSidebarStickySpacing 的 offsetHeight 缓存（resize 才失效）；window.onresize 改 addEventListener。
3. **D3 卡片入场**：stagger 只给前 8 卡，其余 IO 触发。
4. **D5 CategoryBar**：updateScrollHint 读数 rAF 节流。
5. **D6 桌宠 CLS**：placement 写 transform 而非 left/top（CLS 免计分）。
6. **D4 TagCloud 自托管**：`public/scripts/vendor/tagcloud.min.js`（2.5.0 官方 dist），tag-chalk-sphere.js 的 CDN URL 改本地 + 失败逻辑保留；删 jsdelivr preconnect。

## Phase C · Swup 跳转（安全子集）

1. applyWallpaperChrome 双跑去重（content:replace 与 page:view 各一次 → 幂等短路）。
2. page:view 的 Intl.DateTimeFormat 重建加「先比对再算」守卫。
3. initSemifullScrollDetection 重复绑 scroll 幂等化。
4. window.scrollTo 包 rAF。
5. C3：noReferrer MutationObserver 正则预编译（patterns → RegExp 一次构建）。
（叠定时器合并为激进重构，本轮不做，防回归。）

## Phase E-clean · 依赖卫生

卸载 `satteri`、`@astrojs/markdown-satteri`、npm `marked`；`wrangler`/`pagefind`/`sharp`/`glob` 移 devDependencies。验收：install/build/check 全绿 + lockfile diff 干净。

## 园主拍板项（执行完剩下的全部）

1. 音频 36MB+视频 16MB 迁 R2（需上传操作/凭据）；
2. 时钟 GIF webm/降帧双案预览；
3. analytics 四选一（建议 CF Web Analytics）；
4. CF_WORKERS 链路退役确认（wrangler.jsonc + @astrojs/cloudflare 删除）；
5. E5 SideBar 去 React renderer（181KB，高风险单独做）；
6. CSS <300KB 的 Tailwind 层重构（大工程，建议独立专项）；
7. OG 图开启时机（等文章重整 + R2）。

## 验收口径

gates 28/28 + 新增 CSS 下沉断言；`pnpm check`/`type-check`；重建后 dist 复测（体积/重复/孤儿）；浏览器 20-hop 三断言 + Slow4G trace（LCP/CLS/桌宠位移）。

---

## V7 补充（2026-08-16 · 园主定向「保视觉、专攻跳转与加载」）

| 项 | 改动 | 实测 |
|---|---|---|
| 跳转提速 | swup `preload: {hover:true, visible:true}`（插件 v3.2.11 内建 saveData/effectiveType 带宽感知+节流，V2 带宽教训在库层兜底） | 实测 swup 启动后 **11 个视口内页面被节流批量预取**，软导航即点即达 |
| hero GIF 懒换 | hero-bg 共享层加渐变兜底 + Layout 通用脚本：首绘先渲染渐变，idle(≤1200ms) 后注回 --hero-img 拉真图（friends 2.82MB/guestbook 2.02MB/dynamic 1.74MB 三页受益；GIF 原样保留，仅推迟出首屏关键路径） | /friends/ 实测 GIF 请求从解析期推迟到 **773ms**，armed→done 恢复链完整 |
| 页脚 CSS 异步 | site-footer.css（纯手写 22KB）改 `?url` + print→all 异步链 + noscript 兜底 | 阻塞 CSS **526→510KB**；页脚样式正常应用（media 已翻 all） |

验证：check 0 err / tsc 净 / gates 29 PASS / console 零本站错误（一条 503 为友链 replow.org 站点自身宕机）。
Waline 懒启动链在 /friends/ 真评论页完整走通（IO→表情包→评论 API 全 200）。

## 收官记录（2026-08-15 夜 · 接手 GLM 额度中断后完成）

原会话 `sess_670b3d47` 于 19:54 撞 5 小时额度上限，停在 E-clean 改 `package.json` 的中途。本节记录接续完成的内容与终验结果。

### 中断点遗留（已修）

| 问题 | 影响 | 处置 |
|---|---|---|
| `package.json` 已删 `@astrojs/markdown-satteri`，`pnpm-lock.yaml` 未同步 | **部署级**：Vercel 默认 `--frozen-lockfile`，会以 `ERR_PNPM_OUTDATED_LOCKFILE` 直接失败 | 补完 E-clean 后 `pnpm install`，`--frozen-lockfile` 复验通过 |
| `SakuraEffect.astro:572` `navigator.connection` 未加 Navigator 扩展类型（D1 樱花门控引入） | `astro check` error | 改 `(navigator as Navigator & { connection?: ... })` |
| `PostCard.astro` `style: string` 必填，D3 懒入场卡传 `undefined` | `astro check` error | 改 `style?: string`（PostCard 唯一消费者是 PostPage） |
| **`Layout.astro` 顶层求值中断**（见下） | **高危**：模块后半段全部未初始化 | 提升 D2 缓存变量声明位置 |

### 最高危项：Layout 模块顶层求值中断

D2 的 `sidebarMetricsDirty` / `sidebarTopVisibleCache` 声明在 1799 行，而 `scrollFunction()`
首次同步调用在 1638 行 → `updateSidebarStickySpacing()` 读到 `undefined` 抛 TypeError →
**整个 Layout 模块顶层求值就此中断**，其后的 `GRID_COL_CLASSES`、`MULTI_COL_POS_CLASSES`、
`DOMContentLoaded` 初始化块（`applyResponsiveGridLayout` / 侧栏可见性 / TOC 等）、
`firefly:sidebar-layout` 监听全部未执行。

症状是每次软导航稳定 3 个 uncaught TypeError（21 跳 = 63 个）：
`Cannot read/set properties of undefined (reading/setting 'left')` + `X is not iterable`。

修复：把两个缓存变量移到 `sidebarStickyState` 旁（1517 区块），即首次调用点之前。
该文件 1525 行本就有一条同类警告注释（「必须在 scrollFunction() 首次调用前定义」），
D2 加缓存时踩了同一个坑——**新增模块级变量必须核对首次同步调用点**。

### 本轮完成项

- **E-clean**：卸 `satteri`、`marked`（`@astrojs/markdown-satteri` 原会话已删）；
  `glob` / `pagefind` / `sharp` / `wrangler` 移 devDependencies。
  运行时安全性已核：`sharp` 仅 `scripts/generate-lqips.ts`（构建期）与 `og/[...slug].ts`（`prerender = true`）使用；
  `glob` 仅两个构建脚本；4 条 `prerender = false` 的 API 路由均不依赖这四个包。
  npm `marked` 零引用——`NoteCardPreview` 用的是 `public/assets/js/marked.min.js` 自带副本。
- **D5**：`CategoryBar` 的 `updateScrollHint` 走 rAF 节流（scroll 加 `passive`），
  `scrollWidth/clientWidth` 强制布局读从逐事件降到每帧一次。

### 终验结果

| 项 | 结果 |
|---|---|
| `check-v41-gates.mjs` | **29/29 PASS**（含 dist 产物断言，对新构建复跑） |
| `pnpm check`（astro check） | **0 errors / 0 warnings / 11 hints**（修前 2 errors） |
| `pnpm type-check`（tsc） | 干净 |
| `pnpm build` | `astro build` 完整产出 58 页；仅末端 Vercel adapter symlink 撞 Windows EPERM（**已知环境边界，CI 正常**）。lqips / subset-fonts / strip-legacy-fonts / pagefind 逐步手动复跑全绿 |
| 21-hop 软导航 | **21/21 soft nav · 0 error · 0 重复 id · 0 横向溢出 · 0 URL 错位**（修前 63 error） |
| dist 总量 | 182.6MB（<200MB ✅） |
| 首页 HTML / 内联 | 312.0KB / 50.6KB·21 段（✅ / ✅） |
| 首页 CSS | 551.8KB（❌ 目标 <300KB，见拍板项） |
| 孤儿产物 | AskChat 0 / Live2D 0；`ask.css` 1 件但 HTML 零引用 |

### 口径修正

- `/bangumi/` 是 294 字节重定向壳（番剧页已关停），`/dynamic/comments/` 无 swup 容器（独立 Layout），
  两者都会走整页加载——**不是回归**，做 hop 回归时应排除，否则会误判为掉出软导航。
- 全站 58 页 HTML 编码扫描：0 异常（UTF-8 全通）。

### 仍未动 / 待园主拍板

1. 首页 CSS 551.8KB（V6 Phase X 判定「无安全可下沉件」，要降到 <300KB 需 Tailwind 工具类层重构，独立专项）；
2. 音频 36MB + 视频 16MB 迁 R2（需凭据）；
3. 时钟 GIF webm/降帧双案；
4. analytics 四选一；
5. CF_WORKERS 链路退役确认；
6. E5 SideBar 去 React renderer（181KB，高风险）；
7. OG 图开启时机（等文章重整 + R2）。

### 新发现的候选项（未改，防回归）

`CategoryBar.astro` 的两个导航监听都是死事件：`astro:page-load`（无 ClientRouter，永不触发）
与 `swup:contentReplaced`（swup 4 实为 `content:replace`）。当前靠 swup scripts-plugin 重放整段脚本
+ `visit:start` 活钩子兜住，看不出问题，但属于 V5 里 R3 同类残留（R3 门禁只扫 `public/scripts`，
没覆盖 `src/components`）。改动会牵动重复执行语义，建议单独一轮处理。
