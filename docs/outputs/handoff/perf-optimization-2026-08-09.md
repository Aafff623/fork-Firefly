# Firefly 性能优化专项 · 交接文档(Kimi K3 接手)

> 面向接手的 Kimi K3:这是 Firefly 博客性能优化专项的完整上下文。读完本文即可无缝接续。
> 最后更新:2026-08-10｜分支:`optimize-blog-performance`｜交接方:Claude Code(执行方)+ 用户(园主)

---

## 1. 索引、链接与文档

| 资源 | 位置/路径 |
|---|---|
| 仓库根 | `D:\OneDrive\Desktop\blog\Firefly`(git 仓库;上级 `blog\` 只是容器) |
| 工作分支 | `optimize-blog-performance`(已 push 22+ 性能 commit) |
| **V2 执行规划(完整 6 阶段,源头)** | SOTA Codex 会话 `~/.codex/sessions/2026/08/09/rollout-2026-08-09T10-21-34-019fe453-5685-7f02-9498-b3ebaae8fc0d.jsonl`(含 V1/V2 两版规划,V2 更严谨;V2 目标表在此会话的正式回复里) |
| SOTA 诊断证据 | `~/.codex/visualizations/2026/08/09/019fe453-5685-7f02-9498-b3ebaae8fc0d/`(探针脚本 firefly_perf_probe.py / firefly_final_acceptance.py、截图、probe json) |
| 历史交接文档 | `docs/outputs/handoff/perf-optimization-2026-08-09.md`(本文件) |
| 现有 handoff 目录 | `docs/outputs/handoff/`(项目交接惯例) |
| 相关 Claude 记忆 | `~/.claude/projects/D--OneDrive-Desktop-blog/memory/`:project-blog-perf-optimization.md(完整数据)、codex-sessions-index.md、feedback-three-way-collab-roles.md |
| 本地验证方法 | `rm -rf dist .astro` + `pnpm build`(完整流水线)+ `python -m http.server 4323` serve `dist/client` + 探针 `FIREFLY_PERF_BASE=http://127.0.0.1:4323` |
| 部署 | Vercel 项目 `fork-firefly`;分支 Preview 有 SSO 保护(浏览器实测被拦,用 `vercel curl` 走 CLI token) |

## 2. 上下文描述

### 项目
- **threetwoa's blog**:基于 CuteLeaf/Firefly 主题的 Astro 博客二次开发。技术栈:Astro 7 + Svelte 5 + React 19(仅动态页)+ Tailwind 4 + Swup + Pagefind + Waline 评论。
- **性能优化专项目标**(用户最痛):「点击跳转要极快」(SPA 跳转/Swup/LCP/TTI)。

### 铁律(不可违背)
界面样式是用户精心美化的,**绝不阉割/删除美化组件换取性能**;只优化「加载策略 + 生命周期」(防重复注册、按需加载、离页销毁)。任何触碰视觉/交互的改动必须先经用户同意。时钟 GIF 观感敏感,默认不动。

### 已完成(22+ commit,已 push 到 optimize-blog-performance)
| 类别 | 内容 | 实测效果(本地,相对优化前) |
|---|---|---|
| 泄漏治理 | page-lifecycle runtime、WalineController(离页销毁实例)、TagCloud keep:false 根治 window mousemove、14+ 组件幂等 guard、assetsInlineLimit:0、agent-avatar observer 接 lifecycle | 监听器净增 -28%(+14,097→+9,979)、heap -49%(+18.9→9.5MB)、document/window 常驻 -79% |
| 图片加载 | 桌宠只预取当前皮、氛围层按需物化、idle 预取改 hover、Calendar IntersectionObserver 按需、轮播物化上限 + m1 eager/avif | 响应体 15.35→12.5MB、移动 LCP 25s→20.7s |
| 覆盖率 | 三岛 client:idle、Pagefind 懒加载 | 覆盖率 37→38%(受限) |
| 其他 | type-check 4 处类型修复、Pagefind 修复(404→200)、字体收敛(50→6) | 桌面 LCP 1.1-1.3s✅、字体 6✅、Pagefind 200✅、功能回归全过 |

### 已知关键坑(踩过)
- **本地 server 锁 dist**:验证前必须 `rm -rf dist .astro` + 停 4323 server,否则 build 产物不更新,复测全假象。
- **精细 hunk 分离在 Windows 有 CRLF 坑**:`git diff`→python 提取→`git apply --cached` 反复 corrupt;被占用文件已用「整体 commit + 注明收编他人在制品」处理。
- **page-lifecycle 之前没人 boot**:agent-avatar 修复时才发现 runtime 未启动,已补幂等 boot。

## 3. 原始规划(V2 6 阶段)与当前实际进度

| 阶段 | V2 规划内容 | 实际进度 |
|---|---|---|
| 阶段0 | 可信基线(泄漏归因 + 5 次中位数) | ✅ 完成(基线与 handoff 一致) |
| 阶段1 | Swup 泄漏三件套(Waline/内联脚本/生命周期) | ✅ 完成(净增降 28%;剩余元素级泄漏见待办) |
| 阶段2 | 图片三刀(桌宠/氛围层/时钟GIF)+ 次要 | ✅ 前 3 刀完成(响应体 -2.8MB);时钟 GIF 观感敏感未动;日历/轮播已补 |
| 阶段3 | JS 覆盖率与切页耗时(三岛 idle/Pagefind/热路径) | ✅ 部分完成(三岛 idle + Pagefind 懒加载;Layout 热路径因被占用跳过) |
| 阶段4 | Q1-Q6 遗留(React renderer/m1 eager/字体/轮播兼容) | 🔄 部分(m1 eager 已做;React renderer 待做= P2.3;字体已收敛) |
| 阶段5 | 最终验收(全量探针 + 功能回归 + V2 目标对照) | ⏳ 待做(等 P2.3 与移动 LCP 诊断后) |

## 4. 后续规划 + 需 review 项

### 4.1 优先:移动 LCP 20.7s 诊断(K3 第一任务)
- **现象**:移动 4G LCP 仍 20.7s(目标 ≤8s)。P2 复测显示 **LCP 元素 = `m1.avif`(首帧),startTime 24.4s**——轮播已卡下载,但 m1 仍被其他资源抢带宽拖到 20s+。
- **诊断方向**:用探针 mobile_4g 的 Network 瀑布看 1.6Mbps 下「LCP 之前」有哪些大资源竞争(桌宠 spritesheet、背景视频 bg-benben.mp4 7.9MB、氛围层等)。核心是「LCP 关键路径上谁在抢带宽」。
- **参考**:V2 明确「移动 LCP 20.79s 是轮播第六张移动壁纸变成 LCP 的时间」——但卡轮播后仍 20s,说明还有其他大户。

### 4.2 P2.3:SideBar 移除 React renderer(高风险,方案已备)
- **目标**:首页移除 React DOM 181KB,覆盖率 38→50% 方向。
- **方案 S-A(推荐,功能完全等价)**:`SideBar.astro` L104-108 `filterAndSortComponents` 加 `!(comp.type==="dynamicNav" && !isDynamicPage)`;`MainGridLayout.astro` 左栏在动态页渲染进 `#left-sidebar-dynamic` swup 容器,非动态页置空。**必查 swup 首页↔动态页往返**(dynamicNav 出现/可折叠/滚动高亮)。
- 备选 S-B:仅非动态页去掉 `client:visible`(省 181KB,但首页→动态页需刷新才水合)。

### 4.3 元素级泄漏(+9,979,agent-avatar 已修但净增没降)
- **真相**:agent-avatar observer 120s→换页断已做,但净增仍 +9,979。真凶是「被 JS 引用钉住的元素」。
- **下一个嫌疑**:`Layout.astro` L227-243 noReferrer `MutationObserver`(observer `documentElement` subtree,永不 disconnect)。改法:接入 page-lifecycle `observePage` 或「用完 disconnect」。Layout.astro 被其他 agent 占用(改动集中 L994+ 壁纸/过渡重构,observer 区 L227-243 未被碰)。
- 若仍不降,需 CDP `HeapProfiler.takeHeapSnapshot` 分析 Detached DOM retainer 链(脚本框架在 `C:/Users/Lenovo/AppData/Local/Temp/heap_retainer_probe.py`,未完善 CDP 流式收集)。

### 4.4 阶段5 最终验收
- 重建 + 全量探针(5 次中位数 + 20-hop + 7 页功能回归)+ V2 目标表对照 + 截图 diff。
- 移动 LCP 若超 15s settle,临时调 `settle_ms` 25-30s 复测(记录口径)。

### 4.5 Review 项(建议先审再改)
- **轮播观感**:物化上限(mobile3/desktop4)+ 已物化内循环——确认切换/键盘/触摸观感无异常(用户在意样式)。
- **m1 avif**:确认 avif 变体生效(复测已见 `m1.*.avif`,但确认尺寸 ≤200KB)。
- **agent-avatar boot**:`bootPageLifecycle()` 补在 agent-avatar.ts(全局幂等),确认无副作用。
- **page-height-extend 收编**:MainGrid commit `a1e86474` 收编了其他 agent 的在制品,确认不冲突。

### 4.6 剩余待办(低优先级)
- Calendar.astro 首张 img lazy(配合 calendar-widget.js 的 IntersectionObserver)。
- 时钟 GIF 换轻量(1.3MB,观感敏感,需用户拍板)。

## 关键 Commit 参考(部分)
`44d6a536` page-lifecycle｜`a95206bc` WalineController｜`46f9dd3b` TagCloud keep:false｜`4f3d733d` 桌宠按需｜`63babfe6` 氛围层按需｜`add07616` hover 预取｜`5ec897ec` 三岛 idle｜`31ac0d60` Calendar 按需｜`a1e86474` 轮播+m1｜`049b24f9` agent-avatar

## 协作背景
- 多 agent 并行工作区:其他 agent 在发布文章/动态、搭 ask/RAG 评论系统(已完成,ask.astro + MaxKB,与性能主线零重叠)。
- 用户可提供:被占用文件的释放确认、时钟 GIF 的观感取舍、Vercel Automation Bypass(若要线上浏览器实测)。
