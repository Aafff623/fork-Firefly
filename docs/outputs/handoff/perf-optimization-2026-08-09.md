# 性能优化专项交接文档(2026-08-09)

> 目的:固化 Firefly 博客性能优化专项的已完成成果、已备方案与待办,供任何后续会话/SOTA/agent 无缝接手。
> 分支:`optimize-blog-performance`(已 push 19+ commit)｜规划来源:V2 执行规划(SOTA Codex 产出)。

## 一、目标与共识(不可违背)

- **目标**:用户最痛「点击跳转要极快」(SPA 跳转/Swup/LCP)。
- **共识(铁律)**:界面样式是用户精心美化的,性能优化**绝不阉割/删除美化组件**,只优化「加载策略 + 生命周期」(防重复注册、按需加载、离页销毁)。任何触碰视觉/交互的改动必须先问用户。
- 部署:Vercel(项目 fork-firefly)。交付闭环:本地预览→校验→push→核线上。

## 二、已完成(push 到分支,累计 19+ commit)

| 阶段 | 内容 | 效果(本地实测 vs 基线) |
|---|---|---|
| 阶段0 基线 | 泄漏归因 + 5 次中位数(桌/移/泄漏/warm) | 可信基线确立 |
| 阶段1 泄漏治理(13 commit) | page-lifecycle runtime、WalineController、TagCloud keep:false 根治、14+ 组件幂等 guard、assetsInlineLimit:0 | 监听器净增 **-28%**、heap **-49%**、document/window 常驻 **-79%** |
| 阶段2 图片(4 commit) | 桌宠只预取当前皮、氛围层按需物化、idle 预取→hover 意图 | 响应体 **15.35→11.08MB(-28%)**、移动 LCP **-24%** |
| 阶段3 覆盖率(1 commit) | 三岛 client:idle、Pagefind 懒加载 | JS 覆盖率 38.2%(略升) |
| Waline dispose 完善 | autosize:destroy 解除元素引用、11 处元素监听走 AbortSignal | 代码更健康(净增未变,见待办) |

**关键教训**:中途多次「复测没降」是**本地 server 锁 dist 导致构建产物未更新**的假象——验证必须 `rm -rf dist .astro` 重建 + 确认产物含修复后再测。

## 三、已备方案(被占用文件,文件释放即实施)

以下文件被其他 agent 在制品占用(未释放),**优化方案已备妥**,释放后按方案实施:

| 文件 | 方案 | 预期收益 |
|---|---|---|
| `Calendar.astro`(脚本已外置到 public/scripts/calendar-widget.js) | 4.5s 周期预取 9 张 GIF 改按需(IntersectionObserver 视口判定 + 首张 lazy),复用现有 `window.__calendarGifCache` | 会话期省 ~5.5MB |
| `MainGridLayout.astro` | ①轮播 rest:删 startAutoPlay 投机预载(行746),保留 commitSlideChange 预载 + 过期 preload 清理;②m1 移动横幅用 `<picture>` 优先 AVIF + aspect-ratio 固定 | 会话期省 ~6.2MB + m1 624KB→150KB |
| `SideBar.astro` | `filterAndSortComponents` 服务端排除 dynamicNav(`showOnlyOnDynamicPage && !isDynamicPage` → 不 SSR),移除首页 React renderer 181KB | 首页移除 181KB React |
| `layout-styles.css` | 氛围层 visibility 辅助(已在工作区,未 commit,含他人在制品) | 配合氛围层 |

## 四、待办

1. **被占用文件补完**(方案见上,等文件释放)。
2. **元素级泄漏**(剩 ~10,127 监听器净增):Waline dispose 做了但净增没降 → 真凶是「被 JS 引用钉住的元素」,需 **heap retainer 分析**(CDP HeapProfiler.takeHeapSnapshot)定位,成本较高。
3. **时钟 GIF 换轻量**(1.3MB):观感敏感,需用户拍板(默认不动)。
4. **最终验收**:等被占用项补完后,重建 + 全量探针(5 次中位数 + 20-hop + 功能回归)对照 V2 目标表。
5. **线上 Browser CWV**:Preview 有 SSO 保护,浏览器实测被拦(vercel curl 只能验 HTTP 层);如需线上浏览器指标,需配 Vercel Automation Bypass 或用户提供已登录浏览器。

## 五、参考资源

- **V2 执行规划(完整 6 阶段)**:SOTA Codex 会话 `~/.codex/sessions/2026/08/09/rollout-2026-08-09T10-21-34-019fe453-5685-7f02-9498-b3ebaae8fc0d.jsonl`(含 V1/V2 两版规划,V2 更严谨)
- **探针脚本**:`~/.codex/visualizations/2026/08/09/019fe453-5685-7f02-9498-b3ebaae8fc0d/`(firefly_perf_probe.py、firefly_final_acceptance.py)
- **本地验证**:临时 worktree 构建(`rm -rf dist .astro` + build + pagefind)后,`python -m http.server 4323` serve dist/client,探针 `FIREFLY_PERF_BASE=http://127.0.0.1:4323`
- **相关记忆**:Claude 记忆 `project-blog-perf-optimization.md`(含完整数据)、`codex-sessions-index.md`、`feedback-three-way-collab-roles.md`
- **并行 agent**:ask/RAG 评论系统(ask agent 已完成,独立 ask.astro + MaxKB,与性能主线零重叠)

## 六、当前进度一句话

> 19+ 优化 commit 已上线分支,泄漏/响应体/移动 LCP 全面下降(守共识零样式改动);剩余 3 个文件的优化方案已备好,等文件释放即可补完;元素级泄漏需 heap retainer 专项。

最后更新:2026-08-09
