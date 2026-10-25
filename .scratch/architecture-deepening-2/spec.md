# 架构深化 · 第二轮 Spec

## Problem Statement

六个模块的接口把复杂度推给了调用方，而不是藏在实现里：

- 页面生命周期只负责「拆」，不负责「建」；页面就绪事件散在 37 个文件里，其中 27 处监听一个 Swup 4.8.2 从不派发的死事件，软导航后组件静默失效。
- 设置知识没有单一真源：键名、默认值、门控、DOM 应用在工具、首屏内联脚本、面板三处平行；新增一个设置要改多处。
- API 的横切策略各写各的：15 个端点里有 5 份限流、4 种响应信封；坏 JSON 伪装成缺参、超限答成 200 空结果、502 响应体里带上游 401。
- 文章查询有四套遍历、打分、摘要实现；首页、搜索、问答、日历看到的口径可能不同，草稿与合集规则散落。
- 评论栈有四套生命周期：Giscus 自建 runtime、Waline 一个壳里三个启动器、Dynamic 靠 React effect、贴纸建议 observer 无清理。
- 桌宠组件 2593 行、18 个 props，另有 7 个全局事件、5 个 DOM 选择器作为隐式接口；rAF 常驻且没有可测的动画生命周期。

后果是：维护者要读多个文件才知道顺序；Agent 难以通过接口测试；每次新增设置、端点、评论通道或列表消费方都要复制一套知识。

## Solution

按深模块原则逐条收口，每一块都给出一个小接口和一个明确的测试面：

1. **页面生命周期**：在现有 seam 上补 `onPageView` 与 epoch token，让「建页」和「拆页」走同一个接口；统一页面就绪事件名，清掉死事件。
2. **设置登记表**：一个 `settings` module，每个设置项一行登记（键、默认值、门控、应用、事件），对外只留 `read / apply / applyAll / set / subscribe`；首屏与运行期吃同一份状态。
3. **API 横切面**：一个 server-only 的 `api/http` module 承载 `json`、`readJson`、`createRateLimiter`、`getClientAddress`；端点保留 SSE、multipart、上游白名单等真实业务。
4. **ArticleIndex**：构建期 `ArticleIndex` 统一文章读取、排序、摘要、打分；纯核心可按 `list / search / ask` 模式测试，消费方只认 `list` 与 `collection`。
5. **评论运行时**：一个 `comment-runtime` 负责 `mount(channel, root)` / `dispose()`；Giscus 与 Waline 作为两个 adapter 填入同一个槽。
6. **桌宠动画器**：从 SpritePet 抽出 `petAnimator`，注入时钟与 rAF，对外只有 `play / setGaze / pause / resume / dispose` 和 `onFrame / onIdle`。

每条先落 spec + 票，再按 frontier（无阻塞的票）TDD 实现。被其他 Agent 未提交改动挡住的票保持 open，不并行修改同一文件。

## User Stories

1. 作为读者，我希望软导航后动态卡的关闭按钮仍然有效，而不是刷新才恢复。
2. 作为读者，我希望站点运行天数、广告位、分享复制在切换页面后仍然工作。
3. 作为读者，我希望 About 页的交互卡在从首页软导航过去后也能响应。
4. 作为维护者，我希望所有页面就绪监听使用同一个事件名，不再猜该用哪一个。
5. 作为维护者，我希望页面清理带 epoch token，异步回调不会把清理注册到下一页。
6. 作为维护者，我希望 Profile 每次软导航只启动一套计时链，而不是叠两套。
7. 作为维护者，我希望 GlyphTitle 的 resize 监听在换页时被摘掉，不吊住已卸载的节点。
8. 作为 Agent，我希望生命周期 seam 的接口只有少数几个动词，能在一个文件里看懂。
9. 作为维护者，我希望设置键名、默认值、门控、应用规则只写一遍。
10. 作为读者，我希望首屏主题和壁纸与设置面板一致，不闪错色/错模式。
11. 作为维护者，我希望新增一个设置只改一行登记表，不再改工具、首屏、面板三处。
12. 作为 Agent，我希望设置行为能用假 storage 与假 root 测试，不需要真实浏览器。
13. 作为维护者，我希望限流窗口数学只写一遍，新增端点直接复用。
14. 作为读者，我希望被限流时看到明确的「稍后再试」，而不是「没有内容」。
15. 作为维护者，我希望坏 JSON 与缺参返回不同错误，日志能区分。
16. 作为维护者，我希望上游失败时 502 响应体不把上游 401 当成自己的错误码。
17. 作为维护者，我希望同一类「生产不可写」在所有端点返回一致的状态码与错误码。
18. 作为 Agent，我希望新增 API 端点复用同一套响应与限流接口，测试面是 module 而不是路由。
19. 作为维护者，我希望文章排序、置顶、草稿可见性只写一遍。
20. 作为读者，我希望首页、搜索、问答、日历看到同一批文章与同一套摘要。
21. 作为维护者，我希望搜索/问答的打分核心同源，但保留各自的模式权重。
22. 作为维护者，我希望未知合集 slug 或缺父夹直接报错，而不是静默消失。
23. 作为 Agent，我希望文章索引有纯核心，能用 fixture 测试排序与打分，不依赖 Astro 运行时。
24. 作为评论者，我希望文章评论与 Dynamic 评论在软导航后正确挂载和销毁。
25. 作为维护者，我希望 Giscus 与 Waline 共用 mount/dispose 接口，而不是各建一套 runtime。
26. 作为维护者，我希望贴纸建议的策略顺序由 lib 持有，路由只做 HTTP 翻译。
27. 作为读者，我希望评论上传/删除失败时有明确状态，而不是静默无响应。
28. 作为维护者，我希望桌宠动画有可注入的时钟，能在 node 里测优先级抢占。
29. 作为读者，我希望桌宠在切页后不重复启动动画帧，也不留下旧计时器。
30. 作为维护者，我希望桌宠与 Profile 轮播的 DOM 边界清楚，不再各自摸同一张卡。
31. 作为 Agent，我希望桌宠 props 从 18 个降到少数几个，布局旋钮回到配置里。
32. 作为园主，我希望被其他 Agent WIP 挡住的票保持 blocked，不破坏他们的半成品。
33. 作为维护者，我希望每票都有行为测试，且 `check:behavior` 在 CI 里跑。
34. 作为维护者，我希望旧的公开函数名保留为薄适配器，迁移期间调用方不需要一次性全改。

## Implementation Decisions

### 1. 页面生命周期

- 统一的页面就绪事件名定为 `swup:page:view`；`astro:page-load` 作为 Astro 集成别名保留，但新代码只通过 seam 订阅。
- `page-lifecycle` 新增 `onPageView(fn)`：在当前页就绪时调用；清理函数登记到当前 epoch。
- 新增 epoch token（或在回调参数里给 token）让异步回调能判断「我是否还属于当前页」；重复 `page:view` 只补 controller，不销毁当前页清理。
- 死事件 `swup:contentReplaced` 从干净文件中移除；只监听它的 6 个组件改用统一事件。WIP 文件中的同类监听等 WIP 落地后再清。
- 静态门禁在全部文件清干净后加入；本轮先不引入带 allowlist 的临时门禁。
- Profile 与 GlyphTitle 的迁移票 blocked，等 WIP 清掉。

### 2. 设置登记表

- 每个设置项一行：`id`、`storageKey`、`defaultValue`（来自配置）、`gate`（面板是否可改）、`apply(root, value)`、`event`。
- 对外接口只有 `read(id)`、`apply(id, value)`、`applyAll(root)`、`set(id, value)`、`subscribe(id, fn)`。
- 依赖注入：storage adapter（get/set/remove）、root（document 或测试假对象）、now（时段主题）。
- 首屏状态由登记表序列化成一份初始态，Layout 的内联脚本只消费它；运行期面板只调 `set`。
- 主题、壁纸、overlay、头像框、宠物全部登记；上一轮的 `simple-toggles` 退化为登记表的一个视图，不再作为第二层目录。
- `setting-utils`、`Layout` 正被其他 Agent 修改，核心与首屏迁移票 blocked。

### 3. API 横切面

- `api/http` 提供：
  - `json(status, body, headers?)`：统一 `Content-Type: application/json; charset=utf-8`。
  - `readJson(request)`：返回 `ok` / `empty` / `invalid-json`，不把坏编码当缺参。
  - `createRateLimiter({ max, windowMs, keyPrefix, now? })`：返回 `check(key)`，结果含 `allowed` 与 `retryAfterSeconds`。
  - `getClientAddress(request)`：`cf-connecting-ip` → `x-real-ip` → `x-forwarded-for` 第一段 → `unknown`。
- 错误契约：
  - 限流统一 `429`，body `{ error: "rate_limited", code: "rate_limited", retryAfter }`，并带 `Retry-After` 头。
  - 坏 JSON `400` + `{ error: "invalid_json" }`；缺参 `400` + `{ error: "missing_<field>" }`。
  - 上游失败 `502` + `{ error: "upstream_error", upstreamStatus, message }`；body 的 `code` 不再复用上游状态码。
  - 同一类「生产不可写」使用同一状态与错误码；不同条件（未配置 vs 禁止写）保留区分并在 spec 注记。
- 不做一个 `withApi` 万能入口；SSE 透传、multipart、上游白名单、对象 key 推导留在路由。
- Supabase Auth、owner 身份体系、HMAC 删除 token 的语义不变（ADR-0008 / 上一轮 token 设计）。

### 4. ArticleIndex

- 构建期 `ArticleIndex` 提供 `list(query?)` 与 `collection(slug)`；`list` 返回已排序、已带摘要/字数/分钟/日期/pinKind/heat 的 `ArticleCard`。
- 纯核心与 Astro 加载器分离：`buildArticleCards(posts)` 与 `rankArticles(cards, mode)` 可在 node 中测试；`loadArticleIndex()` 只负责 `getCollection("posts")`。
- 打分核心一个，模式三个：`list`（置顶/有效时间/热度）、`search`（关键词/主题/新鲜度）、`ask`（站点元信息/最近/关键词）；权重集中，允许搜索结果小幅变化。
- 草稿可见性、effective time、合集解析、摘要截断各自只保留一个函数；旧 `getSortedPosts` / `getSortedPostsList` 保留为薄适配器，迁移期间调用方不用全改。
- 未知合集 slug 或缺父夹抛错；合集总览不再静默少卡。
- `allPostMeta` 不再自己算 `topicHeat`，改由索引提供。

### 5. 评论运行时

- `comment-runtime` 管理单实例与页面生命周期：`mount(channel, root)`、`dispose()`；重复 mount 幂等，dispose 后可以再次 mount。
- 两个 adapter：Giscus 与 Waline。Dynamic 内联评论继续由 React effect 管理，本轮不迁。
- Waline 的三个启动器收成一个 `bootWalineFromShell` 入口；编辑器镜像与上传层本轮不拆，另开 effort。
- 贴纸建议的策略顺序（L1 → writeback → agent → allowlist）移入 `lib/sticker-suggest`；路由只做 HTTP 翻译。该部分被 WIP 挡住，票 blocked。
- 评论图存储、token、magic-byte 的接口不变；本轮只统一响应与限流。

### 6. 桌宠动画器

- `petAnimator` 注入 `now / raf / cancelRaf / timeout / clearTimeout / reducedMotion / pace`；帧表仍由 `petAnimation` 提供。
- 接口：`play(state, loops, priority)` 返回是否接受、`setGaze(dir)`、`pause()`、`resume()`、`dispose()`；出口 `onFrame({ frame, phase })`、`onIdle`。
- 测试在 node + 假时钟：优先级抢占、dispose 后零 rAF、reduced-motion 只画首帧、pause 期间不推进。
- SpritePet 接入 animator：帧时钟与状态优先级移出组件，组件保留渲染与放置；清理未登记 timeout 与重复 swup hook。
- props 至少去掉布局旋钮；最终保留的 5 个在接入后按真实调用点定。Profile 与桌宠的 DOM 边界票 blocked。

### 7. 交付与边界

- 只改干净文件；`setting-utils`、`Layout`、`Profile`、`GlyphTitleEffects` 相关票 blocked。
- 每票本地 commit；不 push、不部署。
- 每票先写行为测试（TDD），再实现；最后跑 `check:behavior`、`type-check`、相关门禁。
- 浏览器验证优先用本地 dev；无法验证时在票里明确写「未验证」。

## Testing Decisions

- 好测试只穿过 module 的 interface：给定输入、观察返回值/回调，不读内部变量、不 mock 私有函数。
- 新行为测试：
  - 页面生命周期：扩展 `test-page-lifecycle.mts`，覆盖 `onPageView`、重复 `page:view`、epoch 过期、清理不误杀。
  - API：新增 `test-api-http.mts`，覆盖 `readJson` 的 ok/empty/invalid、限流窗口与 `Retry-After`、IP 顺序。
  - ArticleIndex：新增 `test-article-index.mts`，用 fixture 覆盖排序、置顶、草稿、合集、三种模式打分。
  - 评论运行时：新增 `test-comment-runtime.mts`，用假 adapter 覆盖 mount/dispose/重复 mount/切页。
  - 桌宠：新增 `test-pet-animator.mts`，用假时钟覆盖优先级、dispose、reduced-motion、pause。
- 现有测试保持绿：`test-page-lifecycle`、`test-comment-image-policy`、`test-ask-retrieval`、`test-settings-storage`、`test-simple-toggles`。
- 静态门禁：死事件清完后，在 `check:gates` 里禁止 `swup:contentReplaced` 重新出现；API 迁移后禁止在 `api/http` 之外手写限流窗口（先人工审查，稳定后再加）。
- 浏览器验证：生命周期票在 dev 连续两次软导航后检查目标组件；评论票在文章页与 Dynamic 页各切一次；桌宠票检查动画、拖拽、停靠。无法跑浏览器时明确记录。
- 测试面优先放在最高 seam：能测 module 就不测路由，能测纯核心就不测 DOM。

## Out of Scope

- 更换 Giscus / Waline / Supabase Auth / 托管平台（ADR-0006 / 0008 / 0009）。
- Dynamic 内联评论运行时迁移（React effect 已能清理）。
- Waline 编辑器镜像与上传层的拆分。
- public/scripts 经典脚本的 window 级生命周期桥。
- 贴纸建议的视觉/交互改版（只做 API 契约与策略位置）。
- 视觉改版、内容迁移、push、部署。
- 其他 Agent 未提交文件上的任何修改。

## Further Notes

- WIP 矩阵（2026-10-25）：`setting-utils`、`Layout`、`Profile`、`GlyphTitleEffects` 有未提交改动；`simple-toggles`、sticker-suggest 组件与 lib 也有。死事件涉及的 6 个组件、API 路由、内容工具层、评论核心、SpritePet 与 pets lib 干净。
- 上一轮结果：生命周期 seam 落地 4 个消费者；simple-toggles 落地但只有一个消费者；评论图存储、检索纯核心、CI 行为门禁落地；5 个行为测试本地全绿。
- 票的依赖顺序见 `map.md` 与 `issues/`；frontier 先做 01、02、03、07、12、14，再做它们的消费方。
- 本 effort 不使用 GitHub Issues；全部状态在本地 `.scratch/architecture-deepening-2/`。
