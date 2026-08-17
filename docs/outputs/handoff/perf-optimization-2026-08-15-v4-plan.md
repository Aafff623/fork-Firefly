# 性能优化 V4.1 方案（2026-08-15 · 复扫修订版）

> 承接 V2（perf-optimization-2026-08-09.md）与 V3（perf-optimization-2026-08-13-v3.md）。
> V4 初稿经三路复扫（Layout 运行时深扫 / 逐页门控核验 / dist 字节级实测）修订为本版。
> 标记说明：【复扫修正】= V4 说错已改；【复扫新增】= 本轮新发现；无标记 = V4 原有结论经复核成立。
> 继承铁律：① 不阉割视觉换性能；② CSS 隐藏不算优化；③ 探针验收 + 按模块独立 commit。

## 0. 基线与目标（dist 字节级实测，8-13 构建）

| 指标 | 现状（实测） | V4.1 目标 |
|---|---|---|
| 移动 LCP | 2221ms（V3 实测） | < 1800ms |
| 桌面 LCP | 420ms | < 350ms 且稳定 |
| 首页 HTML | **651.0KB**（167 页均值 479.8KB，90% 页面 480-670KB——全局布局膨胀） | < 350KB |
| 每页内联脚本 | **162-174KB / 28-31 段**（占 HTML 25%） | < 60KB |
| 每页 CSS | **522-601KB**（Layout 384 + MainGridLayout 120 占 97%） | < 300KB |
| dist 总体积 | **571.4MB（字节口径）**，其中**内容级重复 142.4MB（25%）** | < 200MB |
| 解析阻塞 JS | music 双脚本 48KB 无 defer，在 `<slot/>` 之前 | 0 |
| 孤儿产物 | AskChat.js 742KB + ask.css 886KB + Live2DWidget.js 650KB ≈ **2.2MB 零引用** | 0 |

【复扫新增】关键事实：pagefind 索引部署期生成（dist 内为 0，不计入）；OG 图当前为 0（`siteConfig.generateOgImages:false`）；**R2 图床引用为 0**——首页/文章页图片 100% 走本地部署产物，这是 571MB dist 的直接原因（「新图纪律」尚未落到已构建内容）。

---

## Phase A · 立即修复（低风险高收益，每项独立 commit，1-2 天）

### A1 桌面 Banner LCP 矛盾 ✅复核成立
`MainGridLayout.astro:508-509` 桌面首帧 `loading="lazy"` + `fetchpriority="high"` 并存（移动 :489 是 eager）。改桌面 `eager`。验收：桌面 LCP 元素为 banner avif，无 lazy 延迟。

### A2 PostPinAdmin 全访客水合 ✅复核成立（作用面修正）
`PostPage.astro:90-94` `client:load`，`isDev={import.meta.env.DEV}` 只是显示开关。作用于**首页/列表页/合集页**（文章页无此项）。改外层 `{isDev && <PostPinAdmin client:load />}`，构建期剔除。验收：生产 HTML 无该 island。

### A3 缓存规则补口 ✅复核成立（vercel.json 逐行核实）
`/scripts/*`（music×2 + calendar 共 90KB）、`/pio/*`、`/pets/*`、`/generated/*` 落全局 `max-age=0, must-revalidate`。补 `max-age=86400 + SWR`（vercel.json + edgeone.json 同步）。线上 curl 验证真实头。

### A4 Waline 按需启动 ✅复核成立（细节补全）
`waline-boot.ts:1` 静态 `@waline/client/full`（272KB chunk）页面加载即 boot，作用于 posts/guestbook/friends/sponsor/dynamic 六类页。改 IO（视口前 200px）或 idle 触发。**附带**：Waline server 自建 `threetwoa-waline.vercel.app`，全站无 preconnect——A6 一起补。

### A5 Live2D 与 ask 孤儿产物 【复扫修正】
V4 误判为「运行时全站加载」。实测：`live2dWidgetConfig.enable:false`（pioConfig.ts:90）且位于 `spritePetConfig.enable` 短路的 else 分支（MainGridLayout.astro:1266），**页面零加载**；但产物 `Live2DWidget…js` 650KB 仍被产出且全域零引用。同理 `/ask` 生产重定向存根，`AskChat.js` 742KB + `ask.C4ieYl84.css` 886KB 零引用。三者合计 **2.2MB 纯部署死重**。
改法：
1. `public/pio/` 15MB（live2d 5.7MB + spine 8.8MB，双关）移出 public（R2 或 `.scratch` 暂存，git 历史可回）；
2. 孤儿 chunk 治理：Live2DWidget 组件移出 MainGridLayout 的静态 import（或临时注释挂载行），`l2d-widget` 依赖暂留（互斥想用再恢复）；ask 孤儿接受或把 `ask.astro` 的 AskChat import 改为条件动态（收益 1.6MB 部署体积，运行时无差）。
验收：构建后 `_astro` 无零引用 chunk（用复扫同款孤儿检测脚本，纳入 B8 门禁）。

### A6 资源提示补全 【复扫新增】
全站 head：preconnect/dns-prefetch/modulepreload **全部为 0**。补：
1. `threetwoa-waline.vercel.app` preconnect（评论页体验）；
2. `cdn.jsdelivr.net` preconnect（若 D4 前暂保留 TagCloud CDN；自托管后删除）；
3. swup 依赖 chunk（Swup.modern + Scripts 插件）modulepreload，首跳转场快一拍；
4. 复核 3 个字体 preload 是否 LCP 关键（72KB），非关键的降级。
验收：head 出现提示标签；评论首次交互无 TLS 冷启动。

### A7 音乐系统治理 【复扫新增】（V4 只提了缓存，漏了加载位置）
`musicConfig` **没有 enable 字段**——「音乐关闭」状态不存在。`MusicManager.astro:62` 在 `<slot/>` 之前注入 `music-manager.js`（20KB，is:inline 无 async/defer，**解析阻塞**）；`MusicPlayer.astro:185` 的 `music-player.js`（28KB）同样阻塞且在顶部 Navbar。共 48KB/页。
改法：
1. musicConfig 加 `enable` 总开关，Layout.astro:685 挂载改 `{musicConfig.enable && <MusicManager/>}`；
2. 两个脚本加 `defer`（或改 module），music-manager 移到 `</body>` 前；
3. 保持现行启用态不变（观感铁律——只是加开关和挪位置，不是关功能）。
验收：Network 面板 music 脚本不再阻塞 HTML 解析（Coverage 面板主线程提前）。

### A8 依赖清欠 ✅复核成立
卸 `satteri` + `@astrojs/markdown-satteri`（零引用）、npm `marked`（零引用，自托管副本在用）；`wrangler`/`pagefind`/`sharp`/`glob` 移 devDependencies。验收：install/build/check 全绿。

### A9 BackToTop 双监听冲突 【复扫新增】
`BackToTop.astro:34-48`（阈值 200px，scroll 同步执行）与 `Layout.astro:1524-1532` scrollFunction（阈值 `innerHeight*35%`，rAF）**写同一个按钮的同一个 `.hide` 类**，窗口越小分歧越大。二选一（建议留 Layout 的 rAF 版，删 BackToTopManager 监听）。验收：0-600px 窗口高度区间滚动，按钮显隐无抖动。

---

## Phase B · 首屏体积（HTML / CSS / JS / 媒体，3-5 天）

### B1 内联脚本外置（162KB → <60KB）【复扫新增：精确清单】
首页 29 段 166KB，Top 来源（dist 实测字节）：

| 来源 | 大小 | 处置 |
|---|---|---|
| TagChalkSphere.astro:129（含全量标签 JSON） | 39.4KB | 外置 module + 数据走 `data-*`/fetch，**每页只此一份** |
| Layout.astro:249-619 主题初始化 | 14.9KB | 保留内联（防闪烁，正当） |
| MainGridLayout.astro:560-929 banner 轮播 | 14.5KB | 外置 `/scripts/banner-carousel.js` |
| Calendar.astro:174 | 13.9KB | 与已有 calendar-widget.js 44KB **合并为一个 module**（合计 57.7KB→1 份） |
| SurpriseClock.astro:79-432（~1s 常驻 tick） | 12.2KB | 外置 + IO 离屏暂停 tick |
| Recommend.astro:116 | 12.1KB | 外置 + client idle 时段 |
| LayeredClock.astro:135 | 8.5KB | 外置 |
| Tags.astro:323 | 8.0KB | 外置 |
| BackgroundPlayer | 7.9KB | 外置 |

验收：首页内联 <60KB（保留主题初始化+swup 小段）；**20-hop 回归重点盯外置脚本在 swup cache 命中时的重放行为**（配合 C4 契约）。

### B2 CSS 522KB → <300KB
1. Layout.css 384KB（101 @media / 54 @keyframes / 72 @property，全站聚合）拆层：页面级大件（gift-surprise 41KB、dynamic 29KB 等）下沉到对应页面；
2. 【复扫新增】`main.css:22` 把 guestbook-cicada.css 打进全站——hero 页样式回归页面级；
3. 【复扫新增】KaTeX 字体 ttf 553KB + woff 296KB 随构建发布（woff2 378KB 已够现代浏览器）——从产物剔除 ttf/woff；
4. stylus 双栈：新样式禁入，存量渐进迁。
验收：首页 CSS <300KB；5 页视觉 diff 抽查。

### B3 水合策略修正 ✅复核成立（清单微调）
- gallery three.js 526KB chunk：`InfiniteCanvasLauncher` client:load → **点击图标才动态 import**（`InfiniteAlbumCanvas.svelte:7` 静态 import 改动态）；同时 gallery 页 photos 全量序列化进 props 造成 HTML 膨胀，数据改 fetch。
- `BangumiGrid`/`AnimeGrid`（bangumi 生产关，anime 在）→ client:visible。
- `ShareBar→SharePoster client:load + qrcode`【复扫新增】每篇文章页水合——改「点击分享才 import qrcode」。
- SpritePet 保留（见 B5）。

### B4 列表与合集页
1. `postsPerPage` 24→12-16；stagger 只给前 8 卡（见 D3）。
2. 【复扫新增】`collections/[slug].astro:29` `page = { data: posts }` **全量 SSR 无分页**——大合集 HTML 无上限。改 `paginate()` 或「前 N + 展开」模式，与首页同构。
验收：合集页 HTML 与首页同量级；首页 `<img>` < 30。

### B5 桌宠瘦身 ✅复核成立（门控细节修正）
petConfig：`hideOnMobileBrowse:false`（浏览页移动端可见）、`hideOnMobilePost:true`（文章页移动端隐藏但**岛照载再自隐藏**——正是「CSS 隐藏不算优化」违例）。改法：
1. 文章页移动端：构建期/运行时不挂载岛（`client:only` 改条件渲染或岛内提前 return 前不拉 renderer）；
2. spritesheet 压缩 2.6/2.45MB → <800KB（尺寸/质量/帧拆分）；
3. 8 套 spritesheet 在 `pets/` 与 `_astro/` **双份共存**（见 B7 去重）。
验收：移动文章页 Network 无 spritesheet；观感不降。

### B6 库收敛 ✅复核成立
framer-motion → motion 统一；三套 Markdown 收敛（低优先）。另【复扫新增】：`InfiniteCanvasLauncher` 内 `@fancyapps/ui` 为静态 import（dynamic-gallery.ts），随 gallery 一起延后。

### B7 媒体治理与 142MB 去重【复扫新增：重量级】
dist 内容级重复 **1205 组 / 142.4MB（25%）**，三类成因全部可修：
1. **public ↔ _astro 双份**（~40MB+）：pets spritesheet ×8 套、garden-note gn-01/03/05、media/minimax 系列——统一走 astro:assets 或 public 直引**单一路径**；
2. **双哈希伪变体**（banner-08/m1/m2/cover 等 `X_hash.Y` 双重哈希，~10MB）：同名图两个 quality/width 参数产物并存——统一图片组件参数；
3. **未压缩透传**：pio texture 5.5MB、claude-mem-preview 3MB——A5 已覆盖 pio；后者统一参数。
4. hero GIF 三连（friends 2.82MB / guestbook 2.02MB / dynamic 1.74MB CSS 背景 eager）——**推广 about 页已有的 poster webp + IO 懒换方案**（about.astro:52-54,146-175），GIF 转 webm 更佳；
5. 音频 36MB（mp3×7）+ wav 7.1MB + 视频 16MB → 迁 R2（musicConfig 改 URL 数据源）；
6. 时钟 GIF 1.3-1.4MB×2 → 出并排预览页（webm / 降帧两案）等拍板。
验收：dist < 200MB；`check-bundle-budget` 内置重复检测（md5 报警）。

### B8 Budget 门禁 ✅复核成立 + 扩展
`check-bundle-budget.ts`：HTML 350KB / CSS 300KB / 内联脚本 60KB / 常驻 JS 150KB / 单媒体 1MB（白名单）/**孤儿 chunk = 0（引用扫描）**/**内容重复 = 0（>500KB md5）**。恢复被静默的 Rollup 混用警告。

---

## Phase C · 页面跳转 Swup（2-3 天）

### C1 预取策略统一 【复扫描正：现状定性】
亲验 `@swup/astro@1.8.0`：`preload:true` 实际映射 `{hover:true, visible:false}`——**当前是纯 hover 预取**（保守安全，V2 带宽教训已在位）。改法：桌面端改 `preload:{hover:true, visible:true}`（插件内建 saveData 感知），限并发 3、`data-no-swup` 排除 gallery/search 重页；移动维持 hover-only。加 A6 的 modulepreload。验收：弱网 LCP 关键请求无排队；swup cache 命中率提升。

### C2 跳转期运行时减负【复扫新增：六项具体清单】
Layout.astro 跳转路径实测问题：
1. `applyWallpaperChrome()` 在 content:replace（:1167）与 page:view（:1364）**跑两遍**——去重；
2. page:view 每跳重建 `Intl.DateTimeFormat`（:1397-1416）重算 time 主题——先比对再算，或交给已有 `initThemeListener`（:1844）；
3. 4 个叠层定时器（120/300/600/200×2ms，:1373/:1430/:1389/:1449-1458）——收敛为 1 个 rAF+idle 双段；
4. `initSemifullScrollDetection` visit:start 与 page:view **重复绑 scroll**（:1232/:1379）——幂等化；
5. visit:start 同步样式批量写 + 3 处强制回流读（:1181/:1209-1211 `void offsetWidth`）——读挪到写前，写合并；
6. `window.scrollTo` 未包 rAF（:1346-1351）。
验收：跳转 Performance trace 无紫色强制回流深谷；转场动画仅 opacity/transform。

### C3 内存泄漏收口 ✅复核成立 + 扩展
`Layout.astro:227-243` noReferrer MutationObserver：常驻无 disconnect + `matchesDomain()`（:199-212）**每次调用重建正则**（每图 × 每 pattern）。改法（二选一）：预编译正则一次；或去 observer，改 `firefly:page:loaded`/`password:decrypted` 事件扫描（站内已有事件）。目标：监听器净增 +9,979 → <2,000；20-hop heap 9.5MB → <3MB。

### C4 外置脚本与事件契约 ✅成立 + 【复扫新增】三套切页事件收敛
现状：`astro:page-load`（swup 下**永不触发，纯死码**）+ `swup:contentReplaced` + `swup:page:view` 三套并存且逻辑相同（TypewriterText:238/FloatingTOC:358/RepelText:467/Layout:1887/SidebarTOC:142）——contentReplaced 与 page:view **每次跳转各跑一遍**（幂等 guard 保安全但白耗）。统一收敛到 `page:view` 单事件 + page-lifecycle；写 `docs/agents/swup-script-contract.md`（全站一次/每页重跑/纯事件三类标注）。

### C5 重定向一致性 ✅成立
线上实测 `/archive` 三形态跳转与 query 保留；`cleanUrls:true` × `trailingSlash:"always"` 双跳核查。

---

## Phase D · 渲染期性能（2-3 天）

### D1 四层合成面调度 ✅成立 + 细节升级
1. navbar `backdrop-filter` **transition 0.36s**（navbar.css:27）——滚动切 `scrolled` 类时动画化 blur 是最贵的一种动画，**去 transition（状态直切）+ blur 20px→12px**；
2. waves 滚动中 `animation-play-state:paused`，scrollend 恢复；
3. 樱花【复扫修正】：`enable:true` + 21 片 + `limitTimes:-1` 无移动判断；未钉住时每次整页加载播 5s Intro。改法：移动端/data-saver/`saveData` 默认不启 Worker（桌面全保留，钉住常驻逻辑不变）；
4. `prefers-reduced-transparency` 降级。
验收：中端机滚动 fps ≥ 55；DevTools 像素预算下降。

### D2 滚动路径强制布局 ✅成立（P1.2）+ 精确化
`scrollFunction`（Layout:1508-1600）每帧 `getElementById("navbar"/"top-row")`（缓存）；`updateSidebarStickySpacing`（:1766）每帧读 `offsetHeight`×2（缓存 + resize 才失效）；L1602 `window.onresize=` 直接赋值改 addEventListener。forced layout 2590ms → <1500ms。

### D3 卡片入场 IO 触发 ✅成立
stagger 前 8 卡，其余 IO 触发；首屏完整呈现提前 ~0.8s。

### D4 标签墙本地化 ✅成立 + 数据瘦身
39.4KB 内联脚本外置（B1）+ TagCloud 2.5.0 自托管（去 jsdelivr，配 A6 短期 preconnect 过渡）+ 标签 JSON 只传必需字段。reflow 140ms 不回退。

### D5 CategoryBar 微调 ✅成立
`updateScrollHint` 读数 rAF 节流；wheel `passive:false` 保留（业务需要）。

---

## Phase E · 架构与第三方集成（3-4 天）

### E1 适配器收敛 ✅成立
CF_WORKERS 链路退役（wrangler assets 路径本就不符）或修通后保留，倾向退役；`build:edgeone` 补齐 LQIP/字体子集或标注降级产物。可选 `.nvmrc` 锁 22。

### E2 /ask 与评论 【复扫修正：定性下调】
`/ask` 生产 frontmatter 直接 redirect（ask.astro:7-9），岛**不进 HTML**；LiveChatWidget 生产整块不渲染（MainGridLayout.astro:1271）；api 层同步返回 closed。运行时零成本，只剩 A5 的 1.6MB 孤儿产物。上云时再做 HeroUI purge + 单 Markdown 收敛。Waline 六类页按 A4 懒启动 + A6 preconnect。

### E3 统计选型 ✅成立（现状确认零统计）
四套 ID 全空、零渲染。选一套（建议 CF Web Analytics 或自托管 Umami），删其余代码路径，补 preconnect 模板，RUM p75 开始积累。

### E4 图表链路 ✅成立
PlantUML 构建期依赖 plantuml.com → 自建 kroki（CF Workers 可部署）；mermaid alpha 锁死。

### E5 SideBar React renderer 移除 ✅成立（方案 S-A 在案，高风险单独放）

### E6 构建卫生 ✅成立
图标 8 集 `["*"]` 收窄；`astro-icon` 273 内联 SVG 改 symbol sprite（配合 B1，PostCard 每卡 3-4 个 × 24 卡是主力）；依赖瘦身后重测 EdgeOne 构建内存。

### E7 【复扫新增】OG 图决策项
`generateOgImages:false` → 社交分享零图片（og:image 全站 0）。这不是性能问题而是**功能缺口**：开启会加构建时长与产物体积，建议等文章重整完成后与 R2 图床一起定（OG 图直接出 R2 URL）。

---

## Phase F · 验收与长期治理 ✅成立
生产 5 次中位数 + 干净 profile + `rm -rf dist .astro`；B8 门禁 + Lighthouse CI + 20-hop 三断言 + 内存复测进 CI；RUM p75；每 Phase 回填实测。

---

## 实施顺序与预期收益（修订版）

| 顺序 | 内容 | 主收益 | 风险 |
|---|---|---|---|
| 1 | Phase A 九项 | 桌面 LCP 稳定、解析阻塞清零、缓存命中、dist -33MB（pio+孤儿） | 极低 |
| 2 | B1+B3+B5 | HTML -300KB、移动文章页 -2.5MB、gallery 点击前 -526KB | 中（C4 契约兜底） |
| 3 | C1-C4 | 跳转回流减半、事件收敛、泄漏收口 | 中 |
| 4 | B2+B4+B6+B7 | CSS -200KB、**dist -142MB 去重**、hero GIF -6MB、音频出仓 | 中（视觉抽查） |
| 5 | D1-D5 | 滚动 55fps+、forced layout 减半 | 低-中 |
| 6 | Phase E | 依赖面收缩、构建可重复 | 中（E5 单独放） |
| 7 | Phase F 常态化 | 不回退 | — |

## 明确不做
不换 View Transitions / 不弃 Swup；不砍美化组件（时钟 GIF 双案预览等拍板；hero GIF 是 about 方案等价推广）；音乐/樱花只加开关与门控不关功能；不动发文流水线与内容层。

## 执行前置检查（build & 执行门）
1. 工作区现状：1018 项未提交变更在位（含园主有意的 801 删帖）——**Phase A 开工前先单独提交一个基线 commit 或由园主确认在制品归属**，避免性能改动混入内容重整；
2. 本地验证链：每项改动 `pnpm check && pnpm type-check`，Phase 收口 `pnpm build`（Windows 下 Vercel adapter 已知 EDEM 权限坑，构建验证以 astro build 产物为准）；
3. 回滚单位：一个 commit 一个可验证子项（宪法 §10）；push 前需园主批准；
4. 基线快照：开工前跑一次 20-hop + Lighthouse 存档，作为 V4.1 对照组。
