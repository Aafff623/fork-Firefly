# 首页装饰资产预算：首屏允许加载多少

Type: grilling
Status: resolved（2026-10-19；门禁已落地，实施项核查后大多为现状）

## Question

首页在加载期拉取的装饰性资产（解压）：宠物 spritesheet 2,538 KB、10 张横幅 avif ~2,479 KB、11 张氛围图 jpg ~1,602 KB、`gn-03.mp4` 1,278 KB、`gn-03.jpg` 530 KB，另有 31 张横幅逐字艺术图 webp。合计约 8.4 MB，占首页解压总量（10.3 MB）的绝大部分。

要决定：
- **首屏（LCP 前）允许加载多少装饰资产？** 给出一个可验收的数字口径。
- 哪些必须移出首屏 / 改懒加载 / 降规格（分辨率、格式、数量）？
- 宠物 spritesheet 2.5 MB 单文件：降分辨率？改按需（现已有 renderer gate，但首页仍在拉）？换格式？还是保留？
- 10 张横幅是否都要预载，还是只预载当前 + 下一张？
- 氛围图 11 张同理。

## Answer

### 现状修正：装饰资产大多走 JS 运行时加载，不在 html 静态引用里

对 dist 首页 html 的实测：`<link rel=preload>` 只有 3 个字体；`loading="eager"` 图片 0 张（列表卡已全 lazy）；html 直接引用的只有背景视频（gn-01.mp4 1.5MB）。横幅 10 张、氛围图 11 张、宠物 spritesheet 全部由 `banner-carousel.js` / `AtmosphereLayer` / `SpritePet` 在运行时拉取。**这意味着预算门禁必须按「首屏时间窗内实际发出的请求」统计（delivery-budget 已有产物级框架），不能只查 html 引用。**

### 代码核查结论（2026-10-19，逐项读过实现）：四项加载纪律均已是现状

| 项 | 票面建议 | 代码现状 |
|---|---|---|
| 视频 preload=none | 改 preload + poster | **已实现**：`GardenNote.astro` 两个 video 均 `preload="none"`，mp4 走 `data-src` + LCP 落定（PerformanceObserver，兜底 8s）后才 `v.src` 注入播放；`BackgroundPlayer` 同样 preload=none |
| 氛围图只加载当前+下一张 | 首屏 3 张 | **已实现且更严**：`AtmosphereLayer.astro` `preloadTarget = currentActive + 1`，非当前+下一张跳过；初始只 preload(1)，随切换再预载下一张 |
| 横幅只预载当前+下一张 | 同左 | **已实现**：`banner-carousel.js` `preloadNextSlide(currentIndex)`，只在切换时预载下一张 |
| 宠物延后到 idle | 首屏窗口外 | **已实现（机制不同但达成）**：`SpritePet` 挂 `boot-schedule` 的 secondary phase（banner ready + 顶部保持期后才触发），spritesheet 2.5MB 不进首屏关键路径；35KB chunk 为 `client:only` 静态下载（island 固有行为，改 client:idle 有 SSR 风险，不动） |

即：**10-18 基线里「首屏 8.4MB 装饰资产」的加载纪律问题，代码已在后续迭代中逐项修掉**；本票不需要再做资产处置改造。

### 门禁化（本轮已落地）

`src/lib/delivery-budget.ts` 新增 `HOME_DECORATIVE_BUDGETS` + `classifyDecorative()`；`scripts/check-delivery-budget.ts` 对 home 页面按四类路径模式断言：

| 类 | 上限 | 当前静态引用实测 |
|---|---|---|
| pets | 1.3 MB | 0 |
| banner | 600 KB | 0 |
| atmosphere | 600 KB | 0 |
| video | 200 KB | 0 |

统计口径 = `extractAssetRefs()` 收的 tag 属性（`src` / `poster` / `srcset`），**不含 `data-src`**，也不含 JSON island 里的运行时清单；上表 0 即四类都未被 HTML 静态引用。此前表里写的「atmosphere 252KB / video 1510KB」是运行时请求口径，与本门禁的输入不是一回事，已更正。

video 上限 200KB 是刻意的：首页视频走 `data-src`，任何改回直接 `src` 的视频最小也有 1.3MB，必越过此线；若沿用 1600KB，单个 1510KB 视频改成 `src` 也不会报警，断言等于失效。

上限的实际作用是**防回归**：谁把运行时按需加载的装饰资产改成首屏静态引用（eager/preload/直接 src），门禁即红。当前 865 页 0 违规。

### 剩余项（都需要园主点头，不在本轮范围）

1. **氛围图 jpg → avif**：11 张重编码预计省 ~40%，需园主先过目一张对比图再批量。
2. **横幅 avif 是否再降一档**：当前 10 张合计 ~2.5MB 但按需加载，暂不动。
3. spritesheet 降规格（2538KB → ~1200KB）：需园主确认画质可接受度；当前已不在首屏窗口，优先级低。

### 不做清单（边界）

- 不为省体积砍横幅艺术图数量（视觉是站点定位，31 张 hover 弹图零首屏成本）。
- 不引入视频流式/多码率（单文件 + poster 足够，不上 HLS）。
- 不动 R2 上的正文图（那是 05 票的线）。
