# 性能优化 V4.1 · GLM 接手 Handoff（2026-08-15）

> 给接手者的上下文交接：本次是 **GLM 主笔方案、grok 落地前段、现交回 GLM review/补充/优化收口**。
> 真源：`perf-optimization-2026-08-15-v4-plan.md`（V4.1 方案，未跟踪文件，勿动）。
> 承接：`perf-optimization-2026-08-09.md`（V2）、`perf-optimization-2026-08-13-v3.md`（V3）。

---

## 一、任务链与角色

1. **GLM-5.3 max（Zcode `sess_670b3d47`）**：用户三段任务
   - ①「深度分析项目」→ 清仓库根卫生（只完成一半：`D:\OneDrive\Desktop\blog\debug-e61d29.log` 还在、`blog/src/` 空壳还在；`engines.node>=22` 已加到 `Firefly/package.json:140-142`）。
   - ②「801 删帖是有意的别恢复；风险先修；只要一份很细的优化方案」→ 派 6 路只读审计 agent（`C:\Users\Lenovo\.zcode\cli\agents\sess_670b3d47-*`，全 completed）+ V4 初稿。
   - ③「搜索拉满再扫、没问题就 build」→ 三路复扫 + 亲验 6 项 + **改写为 V4.1 plan**，停在开工门（等基线 commit / 喊开工）。
   - **GLM 没改业务代码**（`.mimosa/hook-state` 钩子档案可独立证明），方案回写在 `Firefly/docs/outputs/handoff/perf-optimization-2026-08-15-v4-plan.md`。
2. **grok（会话 `197e8ba8`，已从 VelaTerm 删除但会话记录在 `~/.grok/sessions/.../blog/197e8ba8-*`）**：接手后落地了 **Phase A 部分 + B1/B3/B5**，会话中途被关，**未 commit / 未 push / 未跑全量 build**。
3. **现在**：交回 GLM 做最终 review、补充、优化收口。

## 二、V4.1 方案核心（真源 v4-plan，229 行，实施顺序）

```
A → B1/B3/B5 → C（Swup 跳转）→ B 其余（B2 CSS/B4 列表/B6 库/B7 媒体/B8 门禁）→ D（渲染期）→ E（架构/第三方）→ F（验收常态化）
```

铁律三条（继承 V3）：**① 不阉割视觉换性能；② CSS 隐藏不算优化；③ 探针验收 + 按模块独立 commit**。
明确不做：不换 View Transitions、不弃 Swup、不砍美化组件（时钟 GIF 双案预览等拍板）、音乐/樱花只加开关不关功能、不动发文流水线与内容层。

基线与目标（8-13 dist 实测）：移动 LCP 2221→<1800ms；桌面 420→<350ms；首页 HTML 651→<350KB；内联脚本 162-174→<60KB；CSS 522-601→<300KB；dist 571.4MB→<200MB（内容级重复 142.4MB 去重）；music 阻塞→0；孤儿产物 AskChat/Live2D/ask.css ≈2.2MB→0。

## 三、grok 已落地明细（本次进度，需你复核）

### Phase A（8 项已改，`pnpm check` 0 error / `type-check` 过，未 commit）

| 项 | 改动 | 验收口径 |
|---|---|---|
| A1 | `MainGridLayout.astro` 桌面轮播首帧 `lazy`→`eager` | 单图枝本就 eager，未动 |
| A2 | `PostPage.astro` 仅 DEV 动态 import `PostPinAdmin` | 生产模块图不再有该岛 |
| A3 | `vercel.json`/`edgeone.json` 补 `/scripts` `/pio` `/pets` `/generated` 一天缓存 | 待部署后 curl 验头 |
| A4 | `Waline.astro` 动态 import + 视口前 200px boot | 骨架先出，滑近才拉 272KB |
| A5 | `Live2DWidget` 改配置为真才 `await import` | **没搬 15MB `pio/`**（等你定点） |
| A6 | Layout head 补 Waline/jsdelivr preconnect + unpkg dns-prefetch | 全站 +3 条提示 |
| A7 | `musicConfig` 加 `enable:true` + Navbar/Layout 门控 + 双脚本 `defer` | 功能仍开，解析不再堵 `<slot/>` 前 |
| A9 | `BackToTop.astro` 删 200px 监听 | 显隐只剩 Layout rAF 版 |

**A8 卸依赖（`package.json` 脏）与 A5 pio 搬家刻意留下，未做。**

### Phase B（B1/B3/B5 已落地，未 commit）

- **B1 内联脚本外置** ✅：外置 7 个到 `public/scripts/`——`banner-carousel.js`/`tag-chalk-sphere.js`/`surprise-clock.js`（离屏停 tick）/`recommend-widget.js`/`layered-clock.js`/`tags-widget.js`/`background-player.js`；日历配置改 `data-config`；主题初始化保留内联（防闪烁）。改动文件：`src/components/widget/{Calendar,LayeredClock,Recommend,SurpriseClock,TagChalkSphere,Tags}.astro`、`src/components/features/BackgroundPlayer.astro`、`public/scripts/calendar-widget.js`。
- **B3 水合策略** ✅：gallery 画布点击才 `import` three 岛（`InfiniteCanvasLauncher.svelte`）；照片走 `/gallery/explorer.json`；`AnimeGrid` 改 `client:visible`；海报点击才 `import("qrcode")`（`ShareBar.astro`/`SharePoster.svelte`）。
- **B5 桌宠生命周期** ✅（最新一版，刚修完）：抽 `src/lib/pets/petRendererGate.ts`——`shouldSkipPetSheet` 只决定要不要拉 sheet，`createPetRendererGate(startRenderer).evaluate(ctx)` 窄屏文章页 `skip`、路径/宽度变浏览态后首次调用跑真实 `startRenderer`；`SpritePet.svelte` `onMount` 不再提前 `return`，`resize` 与 Swup `page:view` 都 `applyRendererGate()`，`bindSwup` 始终挂上。附门测试 `scripts/test-pet-renderer-gate.ts`。

### 指标现状（同一 `dist/client/index.html` 测两次）

| 指标 | 8-13 基线 | grok 本次 | V4.1 目标 | 判定 |
|---|---|---|---|---|
| 首页 HTML | 651.0KB | 304.5KB（311839 B） | <350KB | 数值到了，**含 801 删帖内容变少，不能全记 B1 头上** |
| 内联脚本 | 162–174KB | **49.3KB / 21 段** | <60KB | ✅ 达标 |
| CSS | 522–601KB | 520.7KB | <300KB | ❌ **未达标** |
| music 阻塞 | 48KB 无 defer | 0 / 2 defer | 0 | ✅ 达标 |
| AskChat/Live2D 引用 | 零引用仍产出 | 58 页全 0 命中 | 0 文件 | 运行时干净，**孤儿文件还在 `_astro`** |
| LCP | 2221 / 420ms | **未跑** | <1800 / <350 | ⚠️ **未测** |
| dist 总量 | 571.4MB | **未在干净产物重测** | <200MB | ⚠️ **未测** |

## 四、未完成项与门控（你的下一步）

**未达标/未验证**：
1. **CSS 520.7KB → <300KB**（B2：Layout.css 384KB 拆层、main.css 的 guestbook 下沉、KaTeX ttf/woff 剔除、stylus 双栈）
2. **LCP 重测**（F：干净 profile + 20-hop 基线未跑）
3. **dist 总量重测 + 142MB 内容级重复去重**（B7：public↔_astro 双份、双哈希伪变体、GIF 转 webm、音频视频迁 R2）
4. **孤儿 chunk 清理**（A5：Live2DWidget 移出静态 import、ask 孤儿）
5. **20-hop 回归**（B1 外置脚本在 swup cache 命中时的重放行为）

**门控/待拍板（不做不写完成）**：
- A8 卸依赖（`package.json` 脏，先定归属）
- A5 `public/pio` 15MB 搬去哪（`.scratch` 还是 R2）
- 时钟 GIF 双案（webm / 降帧）预览
- E5 侧栏 React renderer 移除（高风险，单独放）
- E7 OG 图（`generateOgImages:false`，功能缺口非性能，等文章重整 + R2 图床一起定）
- 音乐/樱花只是加开关不关功能（已验证默认仍开）

**阶段全未做**：C（Swup 跳转减负 C1-C5）、D（渲染期 D1-D5）、E（除 A8/A5 外）、F（验收常态化）。

## 五、工作区现状与红线（动手前必读）

- **git（`D:\OneDrive\Desktop\blog\Firefly`）当前 1060 项未提交**，分三类：
  - **801 条 `src/content/posts/` 有意删除**（园主操作，Zcode memory 已写 `posts-deletion-intentional.md`）——**勿 `git restore`、勿提交**。
  - ~218 项在制品（动态稿、合集、日历 stock GIF、skills 等），**与性能无关**，勿混入性能 commit。
  - 性能改动（A/B 上述文件）。
- 脏文件：`package.json`（会绊 A8）；Phase A 主文件几乎全 CLEAN。
- **本地验证链**：每项改动 `pnpm check && pnpm type-check`；Phase 收口 `pnpm build`（Windows 下 Vercel adapter 已知 EPERM 权限坑，构建验证以 `astro build` 产物为准）。
- 验收脚本：`Firefly/scripts/check-v41-gates.mjs`（grok 实测 PASS 16）；B5 门测试 `pnpm exec tsx scripts/test-pet-renderer-gate.ts`。
- **回滚单位**：一个 commit 一个可验证子项（宪法 §10）；**push 前需园主批准**（grok 全程未 commit 未 push）。

## 六、给接手者的建议顺序

1. 复核 grok 的 B1/B3/B5 改动（对照上面清单与 git diff），先独立 commit 已达标部分（A1-A7/A9 拆 8 条、B1、B3、B5 各一条，避开 posts 与在制品）。
2. 补 B5 门测试全量跑 + LCP 干净 profile 复测，把「未测」项补上。
3. 攻 CSS（B2）与孤儿 chunk（A5）——当前最确定的两个未达标。
4. 内容重复去重（B7）重量级，按 v4-plan B7 的三类成因逐类做。
5. 剩余 C/D/E/F 按 v4-plan 顺序，每 Phase 收口回填实测。

> 铁律重申：**未达标不得写成完成；`pnpm check`/`type-check` 的 stdout 是验收依据，不是「我看过」**。
