# 74 个 JS chunk 的归属与合并空间

Type: research
Status: resolved（2026-10-19，数据源：本地 dist 全量构建产物；分析脚本 `temp/research/css-js-topology/analyze-js-chunks.mjs`）

## Question

首页发起 74 个 JS 请求、解压 876 KB。文件名形态显示它们来自**逐组件的 `<script>` 块**（如 `Navbar.astro_astro_type_script_index_0/1/2`、`Profile...index_0/1`、`PostPage...index_0/1`），而非统一入口 + 按需 chunk。

需要回答：
- 74 个 chunk 里，哪些是**首屏必需**、哪些可延后（`defer` / 空闲 / 交互时）？
- 每个 chunk 的实际用途与体积归属（当前最大：`translation` 121 KB、`client` 55 KB、`Icon` 50 KB、`geometry-data` 47 KB、`calendar-widget` 44 KB）。
- 有没有「同页多份重复代码」——例如 `translation.BEzIkmdt.js` 121 KB 在首页是否真的需要全量？
- 参考站只用了 5 个入口 chunk + 60 个按业务域懒加载 chunk，且 `<head>` 里 `modulepreload` 15 个关键 chunk。Firefly 能否照此建立「入口 + 按域懒加载」的分包策略？
- 现有门禁 `scripts/check-v41-gates.mjs` 有「无 >50KB 孤儿 chunk」断言，它与现状是否一致？

产出：chunk 归属表 + 「可延后 / 可合并 / 可删」三档清单。

## Answer

### 0. 口径修正

产物实际是 **117 个 `_astro/*.js`（2783KB）**，不是 74。首页**静态加载闭包 = 39 个 / 237.5KB**（算法：html 的 33 个 `script src` + 6 个 island `component-url` + 按文件名传递引用闭包）。Chrome DevTools 看到的 74 个 = 静态 39 + 交互后动态 import + swup 预取（冷加载不会全发）。交接基线「首页 JS 876KB」同属交互后口径。**冷加载首屏 JS = 237.5KB**，这是后续优化的正确基准。

### 1. 首页静态闭包 39 个（按大小，即首屏真实成本）

| 大小 | chunk | 归属 |
|---|---|---|
| 35KB | SpritePet | 桌宠引擎（`client:load`，首屏常驻） |
| 33KB | page.KVohGZWq | 页面级公共逻辑（swup/nav 相关） |
| 30KB | DisplaySettingsIntegrated | 显示设置面板 island |
| 24KB | Layout.astro_..._index_1 | Layout 主脚本（暗色/时钟/横幅编排） |
| 10KB | GlyphTitleEffects / Profile / Announcement / SakuraEffect 等 | 横幅艺术字、资料卡、公告、樱花 |
| 4-9KB | Search / FancyboxManager / DynamicNavPanel / LightDarkSwitch / LoginStage 等 15 个 | 搜索、灯箱管理、导航面板、主题、登录 |
| ≤3KB | Navbar×3 / Footer / CategoryBar / PostPage×2 等 16 个 | 小组件脚本 |

规律清晰：**>24KB 的 4 个（122KB，占闭包 51%）是宠物 + 设置面板 + Layout 编排 + page 公共逻辑**；其余 35 个都是小组件。

### 2. 大件归属表（全站 117 个中的按需部分）

| 大小 | chunk | 归属 | 首页闭包 |
|---|---|---|---|
| 524KB | InfiniteAlbumCanvas | 相册无限画布，仅相册页 | 否 |
| 323KB | AskChat | /ask DEV-only island（PROD WIP 占位，无引用孤儿） | 否 |
| 273KB | waline-boot | Waline 评论（动态回复），评论加载时才走 | 否 |
| 182KB | DynamicTimelineFeed | 动态时间线 feed | 否 |
| 181KB | client.B5ZbM7qN | Astro island client runtime（hydration 核心） | **是** |
| 153KB | lib.DLT78m9P | 共用 lib（含宠物/图标依赖） | 否 |
| 152+112KB | dist.C1ssBKSQ / dist.C3UEz7Vn | 库产物切片（动画/时钟/宠物相关） | 否 |
| 121KB | translation | **i18n 词条字典**（home/about/archive/search… 多语言文案） | 否（被 9 个 chunk 静态引用，但引用方均不在首页闭包） |
| 91KB | browser.8_GEwmss | 浏览器 API polyfill/工具 | 否 |
| 55KB | client.CFighDJQ | island runtime 第二部分（被 17 个引用） | 否 |
| 50KB | Icon | 图标组件（被 7 个引用） | 否 |

### 3. 对四个具体问题的回答

**Q: translation 121KB 首页是否真需要全量？** 不需要——它不在首页静态闭包（39 个里没有它）。它是 i18n 词条字典，被 9 个按需 chunk（设置面板/搜索/时间线等）引用，交互后才加载。词条本身无法拆（一个字典文件），但确认无首页成本。

**Q: 同页多份重复代码？** 未发现。117 个 chunk 无重复内容切片；`dist.*`/`browser.*`/`client.*` 是库级公共 chunk 被多页共用（正确行为）。

**Q: 照参考站建「入口 + 按域懒加载」？** Firefly 的 island 架构**已经是**「按域懒加载」：每个组件脚本独立 chunk、按 `client:*` 指令激活。差异只在两点：(a) 参考站 `<head>` 有 15 个 `modulepreload`，Firefly 首页 **0 个**（可给宠物/时钟/主题这三个首屏交互件加 modulepreload，降低 hydration 延迟，纯增量改动）；b) 参考站 5 个入口 vs Firefly 33 个 script src——但 Firefly 的 script 是组件脚本不是入口分包，数量多不等于差。

**Q: 孤儿 chunk 门禁一致性？** `AskChat` 323KB 是唯一 >50KB 孤儿（`/ask` PROD 走 WIP 占位导致）。已在本次 `70b72aa0` 给门禁加 DEV-only island 豁免并附理由；`/ask` 转 PROD 正式开放后豁免自然失效。

### 4. 三档清单

**可删**
- 无。（AskChat 是待激活资产，不是死代码）

**可延后（首屏不必，交互/空闲时加载）**
1. `SpritePet` 35KB——首屏最大的单块。建议 `client:load` 改 `client:idle` 或加 2-3s 延迟启动，首屏 JS 立省 15%。注意宠物是站点特色功能，改加载时机需园主认可（不改功能只改时机）。
2. `DisplaySettingsIntegrated` 30KB——设置面板 island 改 `client:idle`（用户点设置才交互），省 30KB。
3. `page.KVohGZWq` 33KB 与 `Layout index_1` 24KB 是首屏编排核心，暂不可延后；若要动需先审计里面哪些逻辑可移入 idle。

**可合并**
4. `Navbar index_0/1/2`、`Profile index_0/1`、`PostPage index_0/1` 等同源小组件多块（各 1-3KB）——合并没有收益（请求数已由 swup 持久连接缓解，HTTP/2 多路复用下小 chunk 开销可忽略），**不建议合并**，保持组件边界。
5. 真正的请求数优化在 CSS/JS 之外的资产层（图片/视频），不在 chunk 数。

**必须保留**
6. island runtime（client 181+55KB）、lib、translation、Icon：hydration 基础设施。
7. waline/相册/动态 feed 的 200-500KB 大块：按需加载已生效，只在对应功能/页面付出。

### 5. 结论

首页冷加载 JS 237.5KB / 39 个请求，结构健康（按需分发已成立）。三个可延后项合计可省 ~65KB（-27%），其中宠物延后需园主拍板功能体验。**与参考站的差距不在 chunk 策略，在资产预算**；下一步优先级仍是首页 2.5MB 宠物 spritesheet + 2.5MB 横幅 + 1.6MB 氛围图。
