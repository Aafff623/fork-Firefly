# 性能优化 V5 方案 · Grok 执行 Review + 收口计划（2026-08-15）

> **实测记录（2026-08-15 晚，Phase R + B7 + B2 外科项完成后）**
>
> | 指标 | 开工前 | 现在 | 目标 | 判定 |
> |---|---|---|---|---|
> | dist 总量 | 453MB | **185MB** | <200MB | ✅（`agents.astro` 根级 glob 根治：`_astro` 266→33MB；tmp 旧构建 612→4MB；pio 15MB 移 `.scratch`；孤儿 2.2MB 清零；KaTeX ttf/woff -0.78MB） |
> | 内容重复（>300KB） | 59 组 / 35-41MB | **0 组 / 0MB** | 0 | ✅（pets/garden-note 双份随 glob 修复消失） |
> | 门禁 | 16 项（A5 误报） | **28/28 PASS**（含 dist 产物断言） | — | ✅ |
> | 20-hop Swup 回归 | 未跑 | **~21 跳 0 error / 0 重复 id / 0 横向溢出** | 三断言 | ✅ |
> | R1 Waline 竞态 | 理论推演 | **浏览器实测**：不滚评论区跳走再回，滚近正常 boot | — | ✅ |
> | R6/B5 桌宠 | 双 sheet 2.6MB | 宽屏文章页恰好 1 张（openpet）；701px 窄屏文章页 **0 张** | 单张/零张 | ✅ |
> | R2 时钟 IO | 死路径 | 1513px 构建并走秒；1038px 不建不跑（省资源） | 双视口正确 | ✅ |
> | CLS | 0.27（间歇，快条件下复现） | **0.01**（`.float-panel-closed` 补 `invisible`） | ≈0 | ✅ |
> | 首页 HTML / 内联 | 304KB / 49KB | 304KB / 49KB | <350/<60KB | ✅ 维持 |
> | 首页 CSS | 521KB | 526KB（guestbook 下沉被主 CSS 波动抵消） | <300KB | ❌ **B2 主战场未动** |
> | LCP（本地 Fast4G 实验室） | — | 508ms（Render delay 475ms 主导 = 渲染阻塞 CSS；本地无 gzip 放大） | 生产 <350ms | ⚠️ 待 B2 + 生产实测 |
>
> 附带收获：`/agents` 页头像空 src bug（glob 基错误）随根治修复；`explorer.json` 双实现合一；
> A2 被并行 agent 改为模板级 DEV 门（产物层等价，门禁已改双写法兼容）。
> 遗留跟进：桌宠入坞三小跳 CLS 0.11（Slow4G 下，改 transform 定位，D 阶段）；
> Layout.css 387KB 拆层（B2）；E/F 阶段未动；Windows 本地构建 EPERM 为已知环境边界（CI 正常）。

> 真源链：V2（-2026-08-09）→ V3（-2026-08-13-v3）→ V4.1（-2026-08-15-v4-plan）→ **本篇**。
> 本篇 = 对 grok 落地结果（Phase A 八项 + B1/B3/B5）的全量 review 结论 + 返工与收口计划。
> Review 方法：三路深审代理（Phase A diff 逐项 / B1 外置脚本 swup 契约 / B3+B5 水合与桌宠）+ 亲跑验证链（check-v41-gates 16 PASS / astro check 0 error / tsc 干净 / 桌宠门测试 PASS / dist 字节级实测）。**类型链全绿但运行时逻辑层发现 2 个确认 bug + 1 个纸面完成项 + 多处契约缺陷——「check 过 ≠ 做对了」再次成立。**

---

## 第一部分 · Review 总判定

### 指标记分板（dist 2026-08-15 08:05 构建实测）

| 指标 | 8-13 基线 | grok 后 | 目标 | 判定 |
|---|---|---|---|---|
| 首页 HTML | 651.0KB | 304.5KB | <350KB | ⚠️ 达标但含删帖红利（24 卡变少量卡），B1 贡献需拆分归因 |
| 每页内联脚本 | 162-174KB | 49KB / 21 段 | <60KB | ✅ 真达标 |
| 每页 CSS | 522-601KB | **520.7KB** | <300KB | ❌ B2 完全未动 |
| music 解析阻塞 | 48KB 无 defer | 双 defer + data-swup-ignore-script | 0 | ✅ 真达标 |
| PostPinAdmin 岛 | 每列表页水合 | 生产 HTML 岛消失 | 0 | ✅ |
| gallery three | client:load 536KB | launcher 2.9KB + 点击才拉 536KB | 点击才载 | ✅ dist 可证 |
| qrcode / AnimeGrid | load | visible/动态 import | — | ✅ dist 可证 |
| 桌宠移动文章页 | sheet 照载 | skip 门 + 测试过 | 不下载 | ⚠️ 约八成（岛 JS 31.5KB 仍载 + R6 双 sheet 竞态） |
| 孤儿产物 | 2.2MB | **原样仍在**（AskChat 742KB / Live2D 649KB / ask.css 886KB） | 0 | ❌ |
| dist 总量 | 571.4MB | **453MB**（减量主要是删帖） | <200MB | ❌ |
| 内容重复（>300KB 件） | 142.4MB（全量口径） | 41MB | 0 | ❌ |
| pio/ 15MB | 在 | **在** | 移出 | ❌ |
| LCP / 20-hop / 内存 | 2221/420ms | **全部未测** | — | ❌ 验收缺位 |

### 逐项判定

| 项 | 判定 | 一句话 |
|---|---|---|
| A1 banner eager | ✅ | 改对了枝，仅一处 |
| A2 PostPinAdmin | ✅ | DEV 三元 + 动态 import，构建可证死代码消除 |
| A3 缓存规则 | ✅ | vercel/edgeone 各 4 条，顺序与既有规则无冲突 |
| A4 Waline 懒启动 | ⚠️ **确认 bug** | swup 先于 IO 触发 → hooks 永不注册 → 评论区永久死（R1） |
| A5 Live2D 孤儿治理 | ❌ **纸面完成** | MainGridLayout 的 import 门控写了（行为等价），但孤儿 chunk 649KB 实测仍在（动态 import 反而强制分 chunk，条件非常量无法 DCE）；pio 15MB 未搬。**gates 脚本「ok A5」是误报** |
| A6 preconnect | ⚠️ 优先级反了 | jsdelivr 只有未启用的 Twikoo 用（浪费连接+crossorigin 不匹配）；unpkg（Waline 表情真源）只给了 dns-prefetch（R5） |
| A7 音乐开关 | ⚠️ 门控漏洞 | Layout/Navbar 接了 enable，`widget/Music.astro:21` 侧栏入口没接——关开关后侧栏仍拉播放器脚本（R4） |
| A8 依赖清欠 | ❌ 未做（自认） | satteri/marked/npm 卫生 |
| A9 BackToTop | ✅ | 双监听冲突消除，Layout rAF 版健在 |
| B1 外置 7 脚本 | ⚠️ 数据迁移全对，契约四分五裂 | 转义安全、data-* 完整、defer 落实；但 swup 事件契约混乱（见下） |
| B3 水合四项 | ✅ 质量良好 | 机制全部落实且 dist 可证；欠错误兜底与并行化（R7） |
| B5 桌宠门 | ⚠️ 八成 | 状态机干净（无死态、幂等、测试过）；skip→start 过渡有双 sheet 下载回归（R6） |

### 确认 bug / 缺陷全清单（按危害排序）

1. **R1【高】Waline swup 竞态致死**（Waline.astro:71-75）：hooks 只在 IO 触发后的 start() 里注册；用户落在文章页未滚近评论区就 swup 跳走 → IO 永不触发 → 之后所有页面评论区不 boot，直到硬刷新。
2. **R2【高】surprise-clock.js 夹带新增 IO + visible 门控**（:274/:277/:283/:347-363）：旧内联无此逻辑。IO 只 observe 首次 root，无 re-observe/复位——侧栏配置改为 left/right（root 进 swup 容器被替换）时 `visible` 永久锁 false，**时钟永久死**。当前 position:"both" 侥幸未爆。「纯迁移」里埋新逻辑违反外科手术原则。
3. **R3【中】三个脚本把死事件当重初始化契约**：`swup:contentReplaced` 在 swup@4.8.2 **不存在**（实为 content:replace）、`astro:page-load` 无 ClientRouter 永不触发。layered-clock.js:250-258 / surprise-clock.js:366-374 / calendar-widget.js:1245 全靠秒级 tick 自愈或静态侧栏侥幸；**日历切页后从不重初始化**（唯一导航监听是死事件）。注释宣称的重启行为是假的。
4. **R4【中】音乐门控漏洞**：`src/components/widget/Music.astro:21` 只判 showInSidebar 不判 enable。
5. **R5【中】preconnect 优先级反**：jsdelivr（无用）preconnect、unpkg（Waline 表情实际来源）仅 dns-prefetch；脚本 no-cors 与 crossorigin preconnect 不匹配。
6. **R6【中】桌宠 skip→start 双 sheet 下载**（SpritePet.svelte:1797-1798/1887-1888）：`updateHidden()` 先于 `applyRendererGate()` 执行——窄屏文章页转宽/切浏览页时先按默认皮下载 2.6MB，随后 syncPetFromPath 换 postPet 再拉第二张。**本次优化自己引入的带宽回归**。
7. **R7【中】gallery launcher 无异常兜底**（InfiniteCanvasLauncher.svelte:32-53）：try/finally 无 catch——fetch 网络错误 unhandled rejection、按钮无反馈无重试；fetch 与 import(536KB) 串行多付一个 RTT；无 hover 预取。
8. **R8【低】tag-chalk-sphere boot 依赖首屏随机 cloudId**（tag-chalk-sphere.js:11-12/:1091）：侧栏一旦进 swup 容器/换配置即球死；陈旧 sphereItems 首屏快照靠脚本 DOM 序侥幸被纠正。旧病搬运。
9. **R9【低】recommend/tags 每次导航跑 3 遍**：page:view DOM 事件 + hooks page:view + content:replace 三通道同逻辑（3 次全量评分 + 3 次 innerHTML 重建）。旧病搬运，B1 是收敛的最佳时机。
10. **R10【低】杂项**：background-player.js hasMultiple 死变量 + JSON.parse 无 try/catch；calendar-widget.js 双配置通道（window.__calendarWidgetConfig 成死代码）；gallery-utils.ts:133-136 复制残留注释 + index.astro 与 listExplorerPhotos 双份照片真相；explorer.json 的 Response Cache-Control 是死配置（静态文件不保留 header）且 24h 滞后；B5 reduced-motion 读取时序晚于 waving 使用点；skip 态旁路初始化（observeFooter/enterBalancePark）仍跑。
11. **R11【流程·高危】7 个外置脚本是 untracked 文件**：`public/scripts/{banner-carousel,tag-chalk-sphere,surprise-clock,recommend-widget,layered-clock,tags-widget,background-player}.js`——若按「只提交已跟踪修改」的习惯操作，**轮播和五个挂件直接 404 全挂**。提交时必须连 untracked 一起 add。
12. **R12【验收缺位】**：LCP、20-hop Swup 回归、内存三断言、干净 dist 复测全部未跑；`check-v41-gates.mjs` 的 A5 检查是误报（源码模式匹配，产物实测打脸）——**门禁脚本本身要修**。
13. **R13【盲区】**：当前 dist `posts/` 为空（文章全在草稿箱），SharePoster / 桌宠文章页行为、文章页 CSS 总量（601KB 档）无法实测——**文章重整发布后必须补一轮文章页专项验证**。

---

## 第二部分 · V5 收口计划

### Phase R · 返工 Grok 遗留（先于一切新优化，1-2 天）

| # | 改什么 | 怎么改 | 验收 |
|---|---|---|---|
| R1 | Waline.astro | 把轻量 `swup:page:view` 监听提到模块作用域（IO 等待期间也能重挂/注册 hooks）；或 start() 外无条件注册 | 落文章页不滚评论区直接跳走 → 新页面评论区正常 boot |
| R2 | surprise-clock.js | 二选一：删掉新增 IO/visible 回归纯迁移（推荐，符合铁律「迁移不加戏」）；或保留 IO 但补 re-observe + visible 复位 | 与 HEAD 归一化 diff 为 0；或侧栏改 left 配置下时钟仍活 |
| R3 | layered-clock/surprise-clock/calendar-widget | 死事件（swup:contentReplaced/astro:page-load）统一换 `swup:page:view`；与 recommend/tags 契约对齐 | grep 全部 public/scripts 无死事件名；20-hop 日历/时钟正常 |
| R4 | widget/Music.astro:21 | 补 `musicPlayerConfig.enable !== false` | enable:false 构建下 Network 无 music-player.js |
| R5 | Layout.astro head | jsdelivr preconnect 删除（或等 D4 自托管后删）；unpkg 升为 preconnect；核对 crossorigin 用法 | head 3 条提示每条都有真实消费者 |
| R6 | SpritePet.svelte | resize/swup 路径先 `applyRendererGate()` 再 `updateHidden()`；或 updateHidden 挪进 bootRenderer；或渲染加 booted 门槛 | 窄屏文章页→宽屏，Network 恰好 1 张 spritesheet |
| R7 | InfiniteCanvasLauncher.svelte | catch + 失败 UI/重试 + aria-busy；`Promise.all([fetch, import])` 并行；hover 时 modulepreload canvas chunk | 断网点击有提示；点击→画窗 ≤1 RTT + chunk |
| R8 | tag-chalk-sphere.js | boot 改为实时 `querySelector`（类名/role）而非缓存随机 ID；sphereItems 从实时 data-* 重读 | 侧栏配置改 left 后球仍能挂载 |
| R9 | recommend/tags-widget.js | 三通道收敛为单 `hooks.on("page:view")`；幂等键保留 | 一次导航 applyRecommend/applyTagWallFocus 恰好 1 次（计数探针） |
| R10 | 杂项一批 | 死变量、try/catch、calendar 双通道删旧、gallery 双实现合一（index.astro 改用 listExplorerPhotos）、explorer.json 缓存改 vercel.json 规则、reduced-motion 读取前置 | 对应 grep/审查过 |
| R12 | check-v41-gates.mjs | A5 检查改为 dist 产物断言（孤儿 chunk 扫描），杜绝源码模式误报 | 故意留下孤儿时脚本 fail |

### Phase B2 · CSS 520KB → <300KB（最大未动战区）
1. Layout.css 387KB 拆层：gift-surprise(41KB)/dynamic(29KB)/site-footer(29KB) 等页面级大件下沉；
2. main.css:22 的 guestbook-cicada 全站携带下沉回页面；
3. KaTeX ttf 553KB + woff 296KB 从产物剔除（保留 woff2）；
4. stylus 双栈：新样式禁入。
验收：首页 CSS <300KB；文章页（重整后有样本时）<350KB；5 页视觉 diff。

### Phase B7 · 去重与媒体（dist 453MB → <200MB）
1. **41MB+ 重复**（>300KB 口径实测）：8 套桌宠 spritesheet、pio texture、garden-note、media/minimax——public 与 _astro 单一路径二选一；
2. pio/ 15MB 移出 public（去 `.scratch` 或 R2，**等园主拍板**）；
3. 孤儿三件套 2.2MB：Live2DWidget 挂载行注释 + `l2d-widget` 依赖暂移 devDeps 或卸载（git 可回）；AskChat/ask.css 随 ask DEV 门控改为构建期剔除或接受（等园主定点）；
4. hero GIF 三连（friends 2.82 / guestbook 2.02 / dynamic 1.74MB）推广 about 的 poster+IO 方案或转 webm；
5. 音频 36MB + wav 7.1MB + 视频 16MB 迁 R2（musicConfig/视频清单改 URL）；
6. 时钟 GIF 1.3MB×2 双案预览页交园主拍板。
验收：md5 重复扫描 = 0（>300KB）；dist <200MB。

### Phase C · Swup 跳转减负（V4.1 原案 + review 新料）
C1 预取（hover-only → 桌面 visible 并发 3）/ C2 六项行号级减负（applyWallpaperChrome 双跑、Intl 重建、4 定时器、重复绑 scroll、强制回流批、scrollTo 裸调）/ C3 MutationObserver 正则预编译或事件化 / C4 事件契约文档 + **R3/R9 的运行时统一** / C5 重定向三形态线上验证。

### Phase D · 渲染期（原案不变 + 并入 R2 时钟 IO）
D1 navbar blur 去 transition + 20→12px、waves 滚动暂停、樱花移动/data-saver 门控 / D2 scrollFunction 强制布局读缓存化 / D3 卡片 IO 入场 / D4 TagCloud 自托管（顺带解决 R8 的 CDN 依赖）/ D5 CategoryBar 节流。

### Phase E · 架构（原案）
E1 适配器收敛 / E2 ask 上云再战 / E3 统计选一套 / E4 kroki 自建 / E5 SideBar React 移除（S-A 方案，单独放）/ E6 图标收窄 + symbol sprite / E7 OG 图决策项。

### Phase F · 验收（本次 review 暴露的最大欠账）
1. **20-hop Swup 回归立即补跑**（外置脚本 + Waline 改动后的切页稳定性是本次最大风险面）；
2. LCP 基线（干净 profile、生产域名、`rm -rf dist .astro`）；
3. 内存三断言（C3 之后）；
4. R12 门禁升级后纳入 build 链；
5. **文章重整发布后**：补文章页专项（SharePoster/桌宠换皮/评论区/文章页 CSS 601KB 档实测）——R13 盲区。

### 执行顺序

```
R1-R7（bug 返工，高危先行）→ R8-R12 → 20-hop + LCP 补测（F 前置）
→ B2 CSS → B7 去重媒体 → C → D → E → F 常态化
```

### 提交纪律（R11 高危项）
性能改动 commit 时**必须** `git add public/scripts/*.js src/lib/pets/ scripts/check-v41-gates.mjs scripts/test-*.ts src/pages/gallery/explorer.json.ts` 等 untracked 文件；继续避开 content/posts（801 有意删除）与其他 agent 在制品（site-footer.css 约 120 行 Footer 视觉在制品、main.css 合集扁卡修复、collections 三件套）。
