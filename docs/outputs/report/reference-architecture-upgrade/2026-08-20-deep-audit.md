# 参考站体系深挖与 Firefly 差距审计（2026-08-20）

> 范围：Cursor session `b1fb44b1-79f5-453b-8484-6757539f8be3`、`ReferenceRepo/fuwari`、`ReferenceRepo/analysis-reports`、2x.nz 现网与作者公开仓库、Firefly `master@06de3a48`。
> 证据边界：参考仓库只读；线上性能为单次实验室观测，不替代真实用户数据；未把 AGPL-3.0 源码复制进 MIT 项目。

## 一、结论

Firefly 不应迁成 2x.nz 的复刻版。Firefly 当前首页单次实验室观测为 LCP 1.13s、CLS 0.01，已经快于同次观测的 2x.nz `/posts/`（LCP 2.03s、CLS 0.39）。真正值得借鉴的是 2x.nz 在站点变复杂之后形成的边界意识：阅读站保持静态、评论交给成熟身份系统、论坛和工具箱独立部署、构建时处理重资源、客户端只保留页面所需生命周期。

本轮优先做三件事：

1. 文章、留言板等主讨论面恢复 Giscus，复用仍然有效的 GitHub Discussions，动态时间线继续用 Waline。
2. 把 GitHub Discussions 产品化成站内社区入口，覆盖公告、交流、问答、想法和个人身份，不新造密码与 OAuth。
3. 收紧评论加载和 Swup 生命周期，保持已有预取与软导航优势，不做框架迁移。

## 二、参考项目的演进，不只看旧 Fuwari

| 阶段 | 公开实现 | 解决的问题 | 暴露的问题 | Firefly 应学什么 |
|---|---|---|---|---|
| Fuwari/AcoFork | Astro SSG + Svelte 5 + Tailwind 3 + Giscus | 文章、搜索、归档、评论与主题快速成站 | 功能变重后，Swup 与大量客户端脚本的 DOM/生命周期冲突增多 | 小模块借鉴；不要复制旧事件模型 |
| svaf | SvelteKit + mdsvex + markdown-it + adapter-static | SPA 导航、会话数据常驻、静态文章与动态论坛并存 | 博客、论坛、工具仍在同一前端，职责继续膨胀 | 内容编译与运行时内容分流；构建期图片流水线 |
| 模块拆分 | Next 静态博客、React CSR 论坛、React CSR 工具箱、独立 SEO 生成器 | 按部署和变化频率拆边界，单模块独立发布 | CSR 论坛天然损失首屏 SEO、无 JS 可用性和真实 404 | 社区是独立产品边界；若将来做论坛，要同时设计 SEO 补偿 |
| 现网入口 | `2x.nz` 统一品牌与路由，子系统可独立部署 | 用户看到一个站，工程上不是一个巨石 | 公开仓库与现网已经存在版本差，不能把旧报告当当前真相 | 统一导航和身份叙事，底层保持可替换 |

作者在迁移文章中明确说明：旧站随着 Swup 和客户端逻辑增多，开始出现生命周期与 DOM 问题；迁到 SvelteKit 后用 mdsvex 处理静态文章、markdown-it 处理运行时论坛内容，并把图片按文章归档、在构建后用 Sharp 转 AVIF 和缓存增量结果。随后公开仓库又把博客、论坛、工具箱拆开，说明“成熟体系”最终靠边界，而不是把更多模块塞进同一壳。

## 三、功能与设计亮点

### 阅读与内容

| 亮点 | 参考实现价值 | Firefly 现状 | 决策 |
|---|---|---|---|
| 文章软跳转 | 减少重复 HTML 与会话数据重取 | Swup cache + hover/visible preload 已有 | 保留，重点做回归和评论生命周期 |
| 构建期图片压缩缓存 | 大幅降低重复构建时间 | 有 LQIP、Astro Image、字体子集，但媒体仍大 | 后续独立专项，不在评论切换中混改 |
| Git 历史/编辑入口 | 内容可信、可追溯、可反馈 | 有 lastModified，无统一编辑/反馈 CTA | P1 候选 |
| `ai_level` 披露 | 对 AI 参与程度透明 | 无统一字段 | P1 候选，需内容 schema 设计 |
| URL 卡片、spoiler | 写作表达能力更丰富 | 有 GitHub/Note 卡片，无通用 URL 与 spoiler | P1 候选，分别做插件测试 |
| 静态文章与运行时内容分流 | 构建稳定，论坛可动态 | 博客内容静态，动态/Ask/评论各自运行 | 已具雏形，继续分边界 |

### 社区与身份

| 能力 | 2x.nz 体系 | Firefly 当前 | 本轮处理 |
|---|---|---|---|
| 文章评论 | GitHub/Giscus 历史路径 | Waline，历史 Discussions 仍在 | 恢复 Giscus |
| 社区首页 | 论坛分类、搜索、排序、分页 | 社交菜单只有友链与留言 | 新增 `/community/` |
| 公告 | 论坛/站内发布链路 | 已有侧栏公告，但没有讨论闭环 | 社区页连接 Announcements |
| 登录/注册 | 独立论坛后端与 OAuth | 无本站账号，Waline 可匿名 | 第一阶段使用 GitHub 身份，不伪装本站账号 |
| 个人中心 | 资料、发帖、订阅 | 站内 Profile 是园主资料 | 第一阶段链接 GitHub profile 与个人 Discussions 活动；完整个人中心留到独立社区应用 |
| 邮件订阅 | 用户资料开关 + 发布 webhook | 无 | 需邮件合规、退订与后端，单独 PRD |
| 实时评论 | 后端有 SSE，前端未完全接入 | 无 | 不做，先证明需求与运维能力 |

### 工具与部署

参考站把封面、水印、图片转换等纯前端工具拆成静态 CSR 应用，图片处理尽量在浏览器本地完成；论坛也拆成静态前端直连独立 API，并用独立生成器补 SEO。这种拆法适合未来的 Firefly 工具和社区，但不适合本轮直接塞进 Astro 主站。

Firefly 当前默认 Vercel adapter，同时保留 Cloudflare/EdgeOne 适配链。生产入口是 `www.threetwoa.live`，本轮不改变部署拓扑。任何本地 build 只证明适配链，不等于 Vercel、DNS、SSL 或公网访问已经成功。

## 四、Firefly 自身底账

### 已有优势

- Astro 7 静态内容、Pagefind、RSS、sitemap、分类/标签/合集、动态、相册、友链、赞助、问答和多主题已经远超旧 Fuwari。
- Swup 已开启 cache、hover/visible preload，并对 saveData/弱网退避。
- 首页单次无节流 trace：LCP 1.13s，CLS 0.01；当前不是“框架必须迁移”的证据。
- GitHub Discussions 仍开启，仓库 ID `R_kgDOToSNAw` 与 Announcements 分类 ID `DIC_kwDOToSNA84DCe8K` 仍有效。
- 已有统一评论组件槽位和精简 Giscus 组件，可以垂直恢复，不需要重建评论抽象。

### 当前风险

- Giscus 精简组件存在乱码注释、全局 observer、CDN ESM 动态导入和不完整的 Swup 销毁语义。
- `Layout.astro` 只要 Waline URL 存在就 preconnect，即使主评论切到 Giscus 也会建立无效连接。
- 动态时间线直接依赖 Waline API；简单把全局 `type` 改成 Giscus 会让逐条回复退化。
- 多渲染器、超大共享 CSS、复杂 Swup 脚本仍是长期维护成本，但不应和评论迁移一次性重构。
- 现有公告是展示卡，没有“看公告后继续讨论”的社区闭环。

## 五、方案比较

| 方案 | 收益 | 代价/风险 | 结论 |
|---|---|---|---|
| 全站迁 SvelteKit/Next | 理论上统一 SPA 与服务端能力 | 重写路由、内容、岛组件、部署和所有视觉；无法证明比当前 1.13s 更快 | 拒绝 |
| 把完整论坛塞进 Astro | 单仓看似方便 | 账号、OAuth、风控、审核、通知、隐私和数据库全部进入博客故障域 | 拒绝 |
| 直接复制 2x.nz 论坛/工具代码 | 开发快 | 公开代码 AGPL-3.0，与 Firefly MIT 边界冲突；还复制已归档实现 | 拒绝 |
| Giscus + Discussions 社区层 | 复用 GitHub 身份、审核、通知和历史评论；无新后端 | 依赖 GitHub，可达性和非 GitHub 用户门槛存在 | 本轮采用 |
| 未来独立社区应用 | 可逐步实现注册、个人中心、订阅与实时能力 | 需要单独安全/隐私/运维预算 | Phase 2 以后评审 |

## 六、实施顺序

1. 决策与配置：以新 ADR 取代 ADR-0001，恢复 Giscus 配置并声明动态页 Waline 例外。
2. 评论运行时：重写轻量挂载、主题同步、超时状态与 Swup 清理；不恢复导航轮询与跨域 CSS 注入。
3. 社区入口：新增静态 `/community/`，在社交菜单中展示社区、友链、留言；四类 Discussions 直接对应公告、交流、问答、想法。
4. 加载路径：Giscus 接近评论区或浏览器空闲后才连接；仅在 Waline 页面预连接 Waline；评论 iframe 不进入首屏关键路径。
5. 回归：check、type-check、build、门禁、桌面/移动、亮/暗色、主页到文章软跳、文章间跳转、返回、动态逐条回复。
6. 未来候选：编辑/反馈 CTA、`ai_level`、spoiler、URL 卡片、Git 历史、独立社区应用与订阅，不混进本轮垂直切片。

## 七、验收与回滚

| 项 | 验收 | 回滚 |
|---|---|---|
| Giscus | 文章页 iframe 可加载、主题同步、pathname 映射正确、软跳无重复 iframe | `commentConfig.type` 回 `waline`，保留新组件不加载 |
| 动态回复 | 时间线列表和 composer 仍读写 Waline 路径 | 移除显式 `service="waline"` 前先恢复全局 Waline |
| 社区页 | 四类入口可达、外链标识清楚、无伪登录/伪注册 | 关闭导航入口并删除静态页 |
| 性能 | 首页不新增 Giscus 请求；文章评论延后加载；软跳无控制台错误 | 关闭延后逻辑，恢复同步挂载 |
| 部署 | `master` 云构建成功后再做公开域名检查 | 回滚对应原子 commit，不发布 Release |

## 八、本轮落地与验证证据

### 已落地

- `commentConfig.type` 改为 Giscus，并使用已验证的 repo / category ID；Giscus 只加载官方 `client.js`。
- `Comment` 支持页面级 service override；`/dynamic/comments/` 显式固定 Waline，避免全局切换破坏逐条动态回复。
- Giscus 增加接近视口 / idle 延迟挂载、主题同步、超时提示、AbortController 与 Swup 清理。
- Waline 基础样式改为运行时注入，组件覆盖样式只随 Dynamic 评论 HTML 出现；最终文章产物没有 Waline CSS 引用。
- 新增 `communityConfig`、`/community/` 与导航入口，四类链接对应 Discussions 的公告、交流、问答和想法。
- README、CONTEXT、配置/组件说明、知识库存量文档和 ADR 已统一到“文章 Giscus + Dynamic Waline”的现行事实。

### 当前分支验收

| 证据 | 结果 | 边界 |
|---|---|---|
| `pnpm check` | 0 error，12 个既有 hint | 静态诊断 |
| `pnpm type-check` | 通过 | TypeScript / isolated declarations |
| `pnpm check:community` | 9/9 | 评论双通道、社区、样式与预连接门禁 |
| `scripts/check-v41-gates.mjs` | 29/29 | 既有性能与生命周期门禁 |
| Astro/Vite/预渲染/图片 | 85 HTML、250 图片完成 | Vercel adapter 最后软链接仍受 OneDrive `EPERM` 限制 |
| Pagefind | 28 页、8127 词、14 个输出文件同步 | 本地构建产物 |
| 构建产物路由检查 | 首页/社区无评论资源；文章仅 Giscus；Dynamic 仅 Waline | 静态 HTML + 浏览器网络 |
| 20-hop Swup | 20/20 路径正确；错误 0；重复 ID 0；Giscus 最大 1；Waline 泄漏 0 | 本地最终构建、无节流 |
| 软跳事件 | 中位 291ms，P90 414ms，最大 505ms | 单机实验室样本，不是公网或 CrUX |
| 文章直达 trace | LCP 1.346s，CLS 0.00 | 本地最终构建、无网络/CPU 限速 |
| 社区移动 Lighthouse | Accessibility 100、SEO 100、Agentic Browsing 100 | Best Practices 81 仅因本地 HTTP |

Computer Use 曾按要求启动，但 Windows 安全门禁无法高置信识别 Chrome URL，工具主动中止；随后使用能明确选择页面与 URL 的 Chrome DevTools 通道完成同等桌面、移动、主题、网络、Lighthouse 和跨页验收。未提交评论、未新建 Discussion，也未触发任何外部写操作。
