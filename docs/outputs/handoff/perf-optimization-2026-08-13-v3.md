# Firefly 性能优化专项 V3 · 现状、验收与后续计划

> 更新：2026-08-13｜现行分支：`master`｜适用范围：性能、加载、Swup 生命周期、移动端适配、缓存、跨平台构建
>
> 本文接替 `perf-optimization-2026-08-09.md`。旧文只作 V2 历史证据，不得继续把 `optimize-blog-performance` 当作生产分支。

## 1. 结论与边界

本轮已把 Cursor 工作区内的优化草案逐模块审查、补缺并合并为一套可验证实现。移动端不再等比例缩小桌面布局，而是采用“保留高频动作、次级入口归入菜单、长条 icon 化、隐藏区域不执行、重复内容不渲染”的独立信息预算。

当前可确认：

- `pnpm check`、`pnpm type-check`、脚本语法检查与 `git diff --check` 通过。
- EdgeOne 本地全量适配构建通过；Pagefind 能生成并同步。
- 最终生产产物完成移动端 20-hop 与桌面端 8-hop Swup 连续导航：两端 `errors = 0`、重复 `id = 0`、横向溢出 `0`；搜索各返回 18 条结果。
- 本地静态桌面 LCP 单样本 `420 ms`、CLS `0`；移动 Fast 4G + 4x CPU 单样本从线上参考 `3241 ms` 变为本地 `2221 ms`，CLS `0`。
- 本地结果证明代码与适配链，不证明 EdgeOne/Vercel 云端部署、DNS/SSL、真实公网或中国大陆访问质量。
- Vercel 本地 adapter 在 Windows 因创建 pnpm 软链接触发 `EPERM`；Astro 页面生成已完成，失败点属于本机权限边界，仍需 CI/Linux 或 Windows Developer Mode 复验。

## 2. 任务契约

| 字段 | 内容 |
| --- | --- |
| Goal | 降低首屏和切页主线程压力，消除重复初始化与移动端隐藏工作，建立可回滚的缓存和平台适配方案 |
| Non-goals | 不删除桌面视觉特色；不替用户部署生产；不把本地单次 trace 当作真实用户 p75；不重写完整主题 |
| Context | Astro 7 + Svelte 5 + React 19 + Swup + Pagefind；生产以 `master` 为唯一分支 |
| Acceptance | 类型/静态检查为 0 error；EdgeOne 构建和索引通过；关键页面可达；移动端无横向溢出；静态模式不加载 TagCloud CDN/Calendar 数据；CLS ≤ 0.1 |
| Constraints | 保留桌面观感；移动端触控目标约 40–44 px；外部资源失败必须可降级；缓存不得污染 API/HTML 更新 |
| Allowed actions | 审查并收编当前 WIP、修改前端/配置/文档、运行本地验证、按任务拆分提交并 push `master` |
| Verification | Astro/TypeScript、EdgeOne/Vercel 构建边界、Chrome trace、关键 DOM/网络断言、7 页回归、20-hop 导航 |
| Main risks | TagCloud 私有 API、首页超大 HTML、SpritePet/礼物盒既有主线程成本、平台 adapter 版本漂移、真实公网缓存未验 |

## 3. 基线与当前证据

以下数据口径不同，不能把“线上网络 + 扩展环境”和“localhost”直接当 A/B；可比较的是行为变化、DOM 数量与同一浏览器下的趋势。

| 场景 | 参考/当前 | LCP | CLS | DOM | 主要结论 |
| --- | --- | ---: | ---: | ---: | --- |
| 线上桌面，无限速 | 2026-08-13 参考 | 1696 ms | 0 | 3598 | TTFB 604 ms；TagCloud 回流约 723 ms |
| 本地桌面，无限速 | 本轮实现 | 420 ms | 0 | 约 3200 | 无横向溢出、无新控制台错误；TagCloud 回流约 140 ms |
| 线上移动，390×844、Fast 4G、4x CPU | 2026-08-13 参考 | 3241 ms | 0 | 3597 | Calendar 与 TagCloud 是明显工作量来源 |
| 本地移动，同口径 | 第一轮 | 3383 ms | 0 | 3127 | AdGuard 注入主线程 1234 ms；静态降载已生效 |
| 本地移动，同口径 | 关键路径修正后 | 2221 ms | 0 | 3015 | `<2.5s`；AdGuard 仍占 727 ms；单样本，不替代 5 次中位数 |

## 4. Cursor 计划逐模块 Review

| 模块 | Cursor/既有意图 | Review 结果 | 本轮维护 | 状态与验收 |
| --- | --- | --- | --- | --- |
| TagCloud | keep:false、避免切页监听累积 | 原方案仍在每帧测量、移动端仍下载 CDN；destroy 后 key 写入顺序错误 | 移动/触控/减弱动效改静态列表；CDN 失败降级；缓存 item metrics；可见性暂停；修复幂等顺序 | **达到预期**；移动不加载 CDN，桌面回流明显下降 |
| RepelText | 鼠标斥力保留观感 | 移动端仍拆 33 个字符节点；初始测量进入关键路径 | 移动/粗指针/减弱动效直接文本；桌面 pointerenter 再测量 | **达到预期**；移动 `.repel-char = 0` |
| TypewriterText | Swup 下可重复初始化 | 存在 timeout/实例重复和 Unicode 分割兼容边界 | `Intl.Segmenter` + fallback；实例/timeout 清理；reduced-motion 首句 | **达到预期**；兼容旧浏览器降级 |
| CoverImage | LQIP、远程重试、错误提示 | Swup 重入可能重复监听；重试索引重置；本地图破损可能透明卡死 | 幂等监听、持久 retry、远程 fallback、本地错误显式化 | **达到预期**；仍需真实 CDN 404 故障注入 |
| Calendar | IntersectionObserver 按需 | CSS 隐藏右栏不等于停止脚本；移动仍可能 fetch 与排版 | `<1280px` 直接不初始化 | **达到预期**；移动无 `allPostMeta.json` 请求、0 day cell |
| Recommend | 文章页相关内容动态同步 | 手机侧栏虽隐藏，仍在软导航后拉全量 `allPostMeta.json` | `<768px` 直接跳过；桌面保留动态重算 | **达到预期**；移动请求 0，桌面渲染 3 条 |
| Sidebar/移动底部 | 从 8 组减到 3 组 | 仍在正文末尾重复桌面信息，页面很长 | 最终改为 0 组；高频入口由顶栏菜单/分类 icon 承载 | **达到预期**；不再渲染重复卡片 |
| Navbar/分类条 | 桌面视觉原样响应式 | 手机顶栏 9 个入口 + 85px 主题长条；分类完整文字占满一行 | GitHub/樱花归入菜单层；主题 40px icon；分类 40px icon 横滑 | **达到预期**；触控目标不低于约 40px，桌面不变 |
| Footer | 重新设计、SSOT 链接 | 移动仍展示 5 栏；数字花园 URL 有重复源风险 | 园趣/工具在移动隐藏；数字花园取 nav config | **达到预期**；移动核心 3 栏 |
| Layout/transition | 缩窄 `transition-all` | `PostPage` 用 `offsetHeight` 强制整列表同步排版 | 两帧后恢复 transition，不在 LCP 前读取布局 | **部分达到**；trace 仍有 Layout/SpritePet 热点，列入 P1 |
| SurpriseClock | 视觉大钟逐帧动画 | 隐藏右栏仍运行；每帧读 clientHeight/offsetHeight/offsetTop | 从 60Hz 改按秒调度；隐藏/后台/移动右栏跳过 | **达到当前目标**；桌面秒级显示不变 |
| Music player | 外置缓存、虚拟列表 | `public/scripts/music-player.js` 有多余 `)`，整文件无法解析 | 单行修复并用 `node --check` 验证 | **功能缺陷已修复** |
| Ask/LiveChat | MaxKB 问答入口与 API | token/浏览器注入、localhost、跨域 URL 与 XSS/契约风险 | 生产 feature flag 默认关闭；Widget 改同源 `/api/ask`；服务端代理；输出转义 | **达到安全底线**；启用前仍需服务端环境变量与端到端 SSE 验收 |
| Dynamic/React | SSR 首批 + 客户端懒加载 | Custom Element 首访注册后，二次进入 `/dynamic/` 触发 React 19 hydration #418 | 评论容器改普通 SSR `div`，hydration 后以控制器 + MutationObserver 绑定；图库仍保留静态 SSR | **达到预期**；移动 20-hop、桌面 8-hop 均 0 error，评论每次至少绑定 8 条 |
| Cache | Vercel/EdgeOne 缓存加速 | 仅写笼统缓存会导致 HTML/API 陈旧 | HTML 浏览器 revalidate、边缘短 TTL+SWR；API private/no-store；指纹资产 1y immutable；Pagefind/普通资产分层 | **配置完成**；远端响应头未验 |
| 示例内容 | 避免 demo 污染站点/索引 | 多篇模板内容仍参与生产 | demo/guide 统一 `draft: true`；修复 encrypted-demo 乱码 | **达到预期**；真实文章不受影响 |
| TypeScript/依赖兼容 | Astro 7/TS 6 升级后保持绿 | WebCrypto ArrayBuffer、isolatedDeclarations、Fancybox 6 options、CJS default 类型报错 | 按官方类型收敛，不加兼容壳 | **达到预期**；两类检查 0 error |
| Node/tsx 兼容 | 共享配置同时供 Vite 与命令脚本读取 | `import.meta.env.PROD` 在普通 Node 导入时为 undefined，`new-dynamic` 启动即崩 | 使用可选链判断；无正文时能进入预期 Usage 分支 | **达到预期**；命令加载阶段不再异常 |
| LQIP | 新内容封面占位 | 清单落后 19 张 | 构建生成并纳入 manifest | **达到预期**；第二次生成 0 新项 |
| Pagefind | 静态搜索可用 | disabled redirect shell 无 `<html>` 会告警 | 119 页/15475 词/14 文件同步；禁用页不索引 | **可接受**；警告有意保留 |
| Platform adapters | Vercel + EdgeOne 双平台 | EdgeOne 可构建；Vercel Windows symlink EPERM | 明确验证边界；不把权限错归因业务代码 | **EdgeOne 通过 / Vercel 本机受阻** |

## 5. 移动端设计规范（本项目现行）

后续 agent 修改共享布局时必须遵守：

1. 手机不是桌面的等比例缩小；先删除重复和低频内容，再压缩间距。
2. 顶栏只放高频即时动作；外链、装饰开关、低频工具进入菜单或设置面板。
3. 短状态、分类和模式在手机上优先 icon；用 `aria-label`/`title` 保留语义，不仅靠图形猜测。
4. icon 视觉可小，但触控目标保持约 40–44 px；不以牺牲可点性换“精致”。
5. 长条控件默认按内容收缩；只有搜索、正文、主要工作区吸收剩余宽度。
6. CSS 隐藏不足以称为优化；隐藏组件不得继续 fetch、测量或逐帧执行。
7. 侧栏内容不在正文末尾机械重复；必要信息进入导航、详情或按需展开。
8. 保证 `scrollWidth <= clientWidth`；横滑只给有明确集合边界的分类条等单一容器。
9. 支持 `prefers-reduced-motion`、coarse pointer 与 touch；动画组件必须有静态降级。
10. 每次响应式改动至少验 390×844、768px 和桌面 ≥1280px 三个代表视口。

## 6. 缓存与发布策略

| 资源 | 浏览器 | CDN/边缘 | 理由 |
| --- | --- | --- | --- |
| HTML | `max-age=0, must-revalidate` | 1h + SWR | 浏览器及时看到更新，边缘吸收重复请求 |
| `/api/*` | `private, no-store` | 不缓存 | 防用户态/动态数据串用 |
| `/_astro/*` | 1 年 immutable | 1 年 immutable | 文件名含 hash，可长期缓存 |
| `/pagefind/*` | 1 天 | 1 天 | 索引会随发布变化，不能 1 年 |
| `/assets/*` | 浏览器 1 天 | 边缘 7 天 | 大量非 hash 资源，兼顾复访与更新 |

远端发布后必须分别用 Vercel/EdgeOne 实际域名检查 `Cache-Control`、`CDN-Cache-Control`/平台等价头、`Age`、304 与新发布失效行为；本地 JSON 语法正确不代表 CDN 已接受。

## 7. V3 后续执行队列

### P0：本轮收尾

- [x] 两轴 Review：标准/安全 + 需求/功能。
- [x] 修复 P1 功能缺陷与移动隐藏工作。
- [x] Astro/TypeScript/EdgeOne 构建与基础浏览器 trace。
- [x] 移动 20-hop、桌面 8-hop、React hydration、搜索与隐藏网络工作回归。
- [ ] push 后核对 GitHub/云端 CI 与生产 `master` 状态。
- [ ] 生产域名 5 次中位数、缓存响应头、真实公网验收。

### P1：下一轮高收益（不得与内容 agent 混写）

| 优先级 | 模块/文件 | 方法 | 预期收益 | 风险/回滚 | 验证 |
| --- | --- | --- | --- | --- | --- |
| P1.1 | `SpritePet.svelte` / `MainGridLayout.astro` | 按媒体条件决定是否水合；手机明确隐藏时不下载 renderer/spritesheet | 移动减少约 1s 级 trace 工作和 JS | 桌宠状态/Swup 跨页；单 commit 回滚 | 390px 无 island 网络；桌面可拖拽/换皮 |
| P1.2 | `Layout.astro` / `setting-utils.ts` | 拆出 LCP 前后阶段，缓存 device/layout 读数，合并 rAF 写操作 | 降 render delay 与 2.59s 回流热点 | 设置面板闪烁；逐函数回滚 | 5 次 mobile trace 调用树对比 |
| P1.3 | 首页文档 | 把低优先交互/侧栏从 696KB HTML 中延后或按页裁剪 | 降 TTFB/解析/DOM | SEO/Swup 容器边界 | raw HTML、DOM、Pagefind、7 页 |
| P1.4 | TagCloud | 用本地小型实现替代对 2.5.0 私有 `_next` patch | 去 CDN/升级脆弱性 | 球体观感 | 桌面交互截图 + 回流 + reduced motion |
| P1.5 | 构建产物 | 设 JS chunk 和大静态资源 budget；审计 5.66MB texture/3MB 图片重复 | 防回归、降低冷访 | 内容图画质 | manifest budget + 真实页面瀑布 |

### P2：平台与长期治理

- 跟进 `@edgeone/astro` 的 `entrypointResolution` deprecation 和 default export warning，升级前锁定对照构建。
- 在 Linux CI 验 Vercel adapter；Windows 如需本地验收，开启 Developer Mode 后重试，禁止用管理员权限当长期方案。
- 给性能验收脚本增加无扩展干净 profile，避免 AdGuard 的 727–1234 ms 污染。
- 记录生产 p75（若有 RUM）而非长期依赖 localhost 单样本。
- Pagefind 对 redirect shell 的 warning 可保持；若禁用页不再生成，需确认路由 404/重定向策略。

## 8. 回归矩阵

| 检查 | 当前结果 | 完成标准 |
| --- | --- | --- |
| `pnpm check` | 268 文件，0 error，10 hints | 通过；既有 hints 不扩改 |
| `pnpm type-check` | 通过 | 0 error |
| `node --check public/scripts/music-player.js` | 通过 | 0 syntax error |
| `git diff --check` | 通过 | 无空白错误 |
| EdgeOne build | 通过 | 完整产物 + Pagefind 同步 |
| Vercel build | 页面生成完成后 Windows symlink `EPERM` | Linux/CI 或 Developer Mode 再验 |
| 首页 desktop | LCP 420 ms、CLS 0、无横溢 | 5 次中位数不回退 |
| 首页 mobile | LCP 2221 ms、CLS 0、无横溢 | 干净 profile 5 次中位数 ≤ 2500 ms |
| 移动降载 | Repel 0 字符节点、TagCloud 0 CDN、Calendar 0 fetch | 持续成立 |
| Pagefind | 119 页、15475 词、14 文件 | 搜索页面输入/结果跳转正常 |
| 7 页功能 | 首页/文章/动态/合集/搜索/赞助/相册均通过 | 页面标题、main、链接、无新 error |
| 20-hop | 移动 20/20；`content:replace`/`page:view` 各 20；0 error、0 重复 id、0 横溢 | 无监听/DOM/heap 单调异常，无功能失效 |
| 桌面软导航 | 8/8；0 error；桌面 TagCloud/Calendar/Recommend 保持启用 | 桌面能力不因移动降载回退 |

## 9. 回滚与提交边界

建议保持五个可独立回滚的提交：

1. `fix(app): 修复问答安全与框架兼容`
2. `perf(frontend): 收敛移动渲染与组件生命周期`
3. `perf(cache): 配置多平台分层缓存`
4. `chore(content): 隐藏示例内容并更新 LQIP`
5. `docs(perf): 更新 V3 性能验收与后续计划`

任一平台异常时只回滚对应 commit；不要用整仓 reset 覆盖其他 agent 的内容提交。缓存回滚优先恢复 JSON header 配置，前端回滚按组件文件处理，内容 draft 与性能代码分开。

## 10. project-init 资产维护结论

- `CONTEXT.md`、`AGENTS.md`、`CLAUDE.md` 与 `docs/knowledge/firefly-ops.md` 继续作为现行入口。
- `docs/outputs/report/project-init/phase-a.md` 已明确标记历史快照，无需删除。
- 不复制全局 `.cursor/rules` 模板：仓库既有规则明确该目录只放 Firefly 特有事实，机械引入会制造重复与冲突。
- 本文成为性能专项唯一现行 handoff；旧 V2 文档保留且加历史标记，避免 agent 继续在旧分支执行。
