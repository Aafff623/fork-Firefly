# 10: 搜索页支持 ?q= URL 参数

**What to build:** `src/components/controls/Search.svelte` onMount 读 `new URLSearchParams(location.href).get("q")` 作为初始关键词并触发首次搜索；搜索时 `pushState` 同步 URL（与 Swup 路由集成时替换历史状态而非堆栈）；ask 页同样受益（查询可带进页面）。结果可分享、可外部直达。

**Blocked by:** None

**Status:** resolved（2026-10-26；`?q=` 直达与 URL 同步已浏览器验证，见实现记录）

- [x] Search.svelte 初始化读取 `?q=` 并执行搜索
- [x] 搜索输入同步 `pushState`（Swup 下不堆历史）— 落地用 `replaceState`，理由见实现记录
- [x] 带 `?q=xxx` 链接直接打开显示结果
- [x] ask 页验证查询可经 URL 带入 — 核查结论：ask 不消费 `?q=`，本票不改 ask 组件（详见实现记录）
- [x] `npx tsc --noEmit --isolatedDeclarations` + `npx astro check` 绿（本轮按指示不用 pnpm）

**参考**：上游 `src/components/pages/AdvancedSearch.svelte`（浅克隆 `temp/repos/Firefly/`）；`temp/reports/batch1/cuteleaf-firefly-borrow.md` 第 9 条。上游含 dev mock 结果（Pagefind 仅生产构建可用），我们可按需参考。

## 实现记录（2026-10-26）

改动只在 `src/components/controls/Search.svelte`：

- `onMount` 读 `?q=`，按当前视口（`min-width: 1024px`）写入桌面或移动输入框，桌面端同时展开输入条；首搜仍交给既有的 `initializePagefind()`，不另起一套初始化。`/search/` 页跳过接管 —— 那里 `AdvancedSearch.svelte` 已经自己读 `?q=`，两个搜索框抢同一个参数会互相覆盖。
- 关键词写回地址栏用 `history.replaceState`（带上原 `history.state`）。没有用 `pushState`：Swup 把历史索引记在 `history.state`（`Layout.astro` 的 `currentHistoryIndex`/scroll 快照靠它），外部硬 push 会让前进后退错位；`replaceState` 原地改 query，不新增历史条目。清空关键词、Esc 收起、点外部收起时删掉 `?q=`。
- 先清 URL 再跳转的顺序单独验证过：`replaceState` → `swup.navigate()` 能正常落地。

验收（ego lite + dev `http://127.0.0.1:4333`，页面 1364px 宽）：

| 步骤 | 结果 |
|---|---|
| 打开 `/?q=Agent` | 输入框回填 `Agent`、输入条 `is-open`、面板打开并列出 6 条结果 |
| 输入 "Astro" | URL 变 `?q=Astro`，`history.length` 3 → 3（未堆历史） |
| 按 Esc | URL 回到 `/`，`history.length` 仍为 3，面板收起 |
| 清 q 后 `swup.navigate('/posts/java-course0/')` | 落地 `/posts/java-course0/`，标题正常，URL 无残留 q |

未验证 / 限制：

- `Search.svelte` 是 `client:idle` island。本机 dev 期间水合会间歇性不触发（同页 8 个 island 中 3 个长期停在 `ssr` 状态，`readyState=complete`、`requestIdleCallback` 能触发也一样），导致部分复跑拿不到面板。改动全在 `onMount` 内，水合不发生就不会执行，与本次逻辑无关；干净一轮（水合成功的首次运行）的结论即上表。
- 结果点击后的真实导航只在「清 q + `swup.navigate`」这一层复现过，没有在面板里再走一遍完整点击（受上面水合问题阻断）。基线导航（首页点文章卡）单独验证过，Swup 无问题。
- ask 页：`src/components/ask/AskChat.tsx` 没有 `?q=` 或初始提问入口，ask 是问答页、不是搜索结果页。本票边界不动 ask 组件，所以「查询带进 ask」目前不成立，要做得另开票。
