# PRD：站点资源导航页（藏经阁 · implemented）

> 状态：implemented（2026-08-28 园主放行后当日实施完成，本地实测通过，待园主验收；展示名按推荐默认「藏经阁」，挂载于「链接」组首项，均为纯配置可改）。
> **2026-08-29 追加**：极光导航化视觉（chips 移除、居中大搜索、淡底卡片）+ **方案二架构落地**——层级分类 + 独立路由侧边栏：`/nav/` 总览枢纽 + 5 内容模块 + 园内藏品共 7 个路由页，`NavSideNav` 侧栏（URL 驱动激活态、二级子类锚点平滑滚动、移动端汉堡抽屉），骨架设计见同目录 `structure-scheme2.md`，治理红线写进 `navModulesConfig` 注释。
> 需求来源：2026-08-28 对话两轮——
> ① 导航栏新增「资源网站索引」模块，点进为独立页面，参照「万有导航」范例，进入该页时隐藏两侧栏、主区撑满；
> ② 交互升级：点击站点小卡片默认弹出**站点预览卡**——左窄栏播放该网站 UI 截图轮播（带左右切换按钮），右栏为详细介绍文字（卡片式、带上下滚动条）；跳转走卡片右上角的跳转图标（点击直接外链），点卡片本体开预览。

## Goal

在 Firefly 博客新增一个配置驱动的静态资源导航页：分类化的站点索引卡片网格，带搜索与分类锚点；进入该页时左右侧栏隐藏、主内容区扩展为全宽。点击卡片弹出站点预览卡（左侧 UI 截图轮播 + 右侧滚动详情），卡片右上角图标承担直达外链。数据全部落在 `src/config/` + `public/` 截图资产，不改后台、不加运行时依赖。

## Non-goals

- 不做在线编辑 / 后台管理（增删站点 = 改 `navSitesConfig.ts` 重新构建）。
- 不引第三方 favicon / 网页截图在线服务（国内可用性不稳、向第三方泄访客 IP）；站点图标用仓内已装 iconify 集（`simple-icons` / `fa7-brands` / `mingcute`）+ 首字母方块回退；UI 截图由园主手动截取，按「新图纪律」走 R2 图床（`img.threetwoa.live`），不进 git。
- 不做收藏同步、账号体系、点击统计。
- 不动全站布局内核；只顺着现有机制扩展，不重构 `MainGridLayout` / `Layout.astro` 的既有逻辑。
- 不新增客户端框架依赖；弹层照 `NoteCardPreview` 的自绘 modal 模式，轮播用已装的 `@fancyapps/ui` Carousel。

## Context（现状与可行性证据）

### 本仓已具备的机制（本轮代码核对）

| 机制 | 位置 | 与本需求的关系 |
|---|---|---|
| `applySingleColLayout()` | `src/layouts/Layout.astro:2002` | 现成的「单列化」函数：grid 切 `grid-cols-1`、清多列定位类——「中间直接扩大」的现成实现 |
| 文章页隐藏侧栏 | `Layout.astro:2015-2040` + `data-hide-sidebar-on-post` | 按页面类型隐藏侧栏 + 单列化的完整先例，本需求复刻同款判断 |
| widget 按页隐藏 | `.widget-hide-on-dynamic` 等（`Layout.astro:2085-2100`） | 已有按 URL 隐藏 widget 的先例，扩展同类 class 即可 |
| swup 容器约束 | `MainGridLayout.astro:814-899` | `#left-sidebar-dynamic` / `#right-sidebar-dynamic` 所有页面**必须渲染**（可隐藏，不可省略） |
| grid 类双份维护 | SSR `gridCols`（MainGridLayout）+ 客户端 JS 三档硬编码 | 改布局时两处必须同步，已在任务中列为显式检查项 |
| 页面骨架模板 | `src/pages/friends.astro` | 数据驱动 + 搜索过滤 custom element + 卡片网格 + 暗色适配，全套同构 |
| 页面开关模式 | `siteConfig.pages.*` + `LinkPresets` + `pageKey` | 新页接入导航的标准三件套 |
| 自绘 modal 先例 | `src/components/features/NoteCardPreview.astro` | 「点卡片弹预览」的同构骨架：overlay + panel（header/body）+ JS 填充，直接照抄结构 |
| 轮播能力 | `@fancyapps/ui` v6（已装）+ `FancyboxManager.astro:194` 的 `Carousel` 配置节 | 截图轮播零新依赖；弹层内可用 Fancybox Carousel 或自写极简切换 |

### 外部参考（2026-08-28 检索）

- 范例图：万有导航（左侧分类栏 + 分类下子标签 chips + favicon 卡片网格）。
- [WebStackPage/WebStackPage.github.io](https://github.com/WebStackPage/WebStackPage.github.io)：该流派鼻祖，纯静态、左分类 + 右卡片；另有 [WebStack-Hugo](https://github.com/shenweiyan/WebStack-Hugo) 可参考其数据组织（TOML/MD 每站点一节）。
- Fuwari 社区友链页教程（[AULyPc](https://aulypc1.github.io/posts/website/add_friendspage_in_fuwari/) 等）：数据文件 + 类型扩展 + 卡片网格的通用范式，与本站 `friends.astro` 一致。
- **结论：上游与社区均无现成「资源导航页」可直接搬运**；本页以 `friends.astro` 为骨架自建，交互范式抄万有导航。

## 方案

### 1. 命名（待园主拍板，默认按推荐值实施）

| 层 | 推荐 | 备选 |
|---|---|---|
| 路由 | `/nav/` | `/links/`、`/sites/`（均已核对无冲突） |
| 展示名 | 藏经阁（贴站内修行合集气质） | 星图（贴 Firefly 萤火意象）／导航（最稳） |
| 代码命名 | `navSitesConfig.ts` / `NavCategory` / `NavSite` / `siteConfig.pages.navSites` / `LinkPresets.NavSites` / i18n key `navSites` | 刻意避开 `navBarConfig` 撞名 |
| 挂载位置 | 「链接」分组首项（GitHub、Digital Garden 后移） | 高频后升顶层独立按钮（`lucide:compass`） |

### 2. 布局：进页全宽（本需求核心）

给 `MainGridLayout` 加可选 prop `wide?: boolean`，`src/pages/nav.astro` 声明式传入：

1. **SSR 侧**：`wide` 时 `gridCols` 直接输出单列类；侧栏 wrapper 保持渲染（满足 swup 容器约束）但带 `hidden`；`#main-grid` 追加 `data-grid-force-single="true"`。
2. **客户端侧**：`updateMainGridCols()`（`Layout.astro:2010`）开头增加判断——读到 `data-grid-force-single="true"` 即走 `applySingleColLayout()` 并 return，优先级高于现有文章页判断。
3. **同步检查**：SSR `gridCols` 与客户端 `GRID_COL_CLASSES` 三档硬编码双份维护，改动各处需对拍（实施时 diff 验证，验收项 2 覆盖）。
4. swup 往返（首页 ↔ `/nav/`）时 `astro:page-load` 已有重跑点（`Layout.astro:2201/2209`），无需新增事件。

### 3. 页面设计（拆解范例图 → 落到 Firefly 视觉体系）

```
┌──────────────────────────────────────────────────┐
│ 搜索框 ─────────────────────── 分类 chips 横排    │ ← sticky 顶条（页内自绘）
├──────────────────────────────────────────────────┤
│ ◆ 常用（pinned 行，可选）                          │
│   [卡片] [卡片] [卡片] ...                         │
│ ◆ AI 工具与中转 (12)                              │ ← 节头 = 图标+名+计数，id=锚点
│   [卡片] [卡片] [卡片] [卡片]                      │
│ ◆ Agent 工程 (8)                                  │
│   ...                                             │
└──────────────────────────────────────────────────┘
卡片 = icon(3rem 圆角块) + 名称 + 一行描述 + hover 外链箭头
网格 = repeat(auto-fill, minmax(min(100%, 16.5rem), 1fr))（与 friends-grid 一致）
```

- 分类 chips 即锚点跳转（`scroll-behavior: smooth`），不建页内左侧抽屉——博客页宽度有限，范例的左栏职能由 sticky chips 承担，移动端天然可用。
- 视觉照抄 `friends.astro`：`card-base` 底、中性灰 + 紫点缀、暗色 `:global(html.dark)`（注意 `friends-title` 踩过的 `var(--deep-text)` 未定义坑，直接用其 fallback 写法）。
- 过滤交互复刻 `friend-filter` custom element：搜索匹配 name/desc/tags， chips 联动分类显隐；空态复用其样式。
- **卡片双区交互**（本轮需求升级）：卡片主体点击 → 打开站点预览卡；右上角跳转图标（`lucide:arrow-up-right`，与 friend-card-ext 同款悬停显形）点击 → `stopPropagation` + 直链新开。无详情/截图的站点可配 `preview: false` 退化为整卡直链。
- 不挂评论区；banner 行为与现有独立页一致（`MainGridLayout` 默认）。

### 3.5 站点预览卡（弹层，本轮需求升级核心）

结构照 `NoteCardPreview` 的自绘 modal 模式（overlay + panel + JS 填充），布局对应园主描述：

```
┌────────────────────────────────────────────────────┐
│ 站点名  [favicon]                        [直达] [×] │ ← header
├──────────────┬─────────────────────────────────────┤
│              │  详细介绍（detail，prose 排版）       │
│  UI 截图轮播  │  ……                                 │
│  (左窄栏      │  ……                                 │
│  ≈ 38-40%)   │  overflow-y: auto 上下滚动           │
│  ‹  ● ○ ○ ›  │                                     │
└──────────────┴─────────────────────────────────────┘
```

- 左栏：截图轮播，图片来自 `screenshots[]`（R2 图床 URL）；底部圆点指示 + 左右切换按钮（园主明确要求可点击）；单图时隐藏箭头与圆点。
- 右栏：`detail` 文字（Markdown 子集或纯文本 + 简单段落），`overflow-y: auto`，卡片式内衬底色。
- 轮播实现：`@fancyapps/ui` Carousel（已装、`FancyboxManager` 已在配置使用）；弹层关闭即销毁实例，防泄漏。
- 移动端：左右栏改上下堆叠（截图轮播在上、详情在下），弹层全屏化。
- 可访问性：`Esc` / 点遮罩关闭，焦点困在弹层内（`<dialog>` 或手动 focus trap，实施时二选一，倾向原生 `<dialog>.showModal()`——Top layer 免 z-index 纠纷，与桌宠层不打架）。
- swup 兼容：弹层节点挂 `document.body` 级单例，`astro:page-load` 时重绑、路由离开时强制关闭（照 `FancyboxManager` 的 unbind/rebind 纪律）。

### 4. 数据模型（`src/config/navSitesConfig.ts` + `src/types/navSitesConfig.ts`）

```ts
export interface NavSite {
	title: string;
	url: string;
	desc?: string;          // 卡片上的一行简介
	detail?: string;        // 预览卡右侧的长介绍（段落文本）
	screenshots?: string[]; // UI 轮播图 URL（R2 图床，img.threetwoa.live）
	icon?: string;          // iconify 名，如 "simple-icons:github"；缺省走首字母方块
	tags?: string[];
	pinned?: boolean;       // 进顶部「常用」行
	preview?: boolean;      // 默认 true；false 时整卡直链不弹预览
	enabled?: boolean;      // 默认 true
}
export interface NavCategory {
	name: string;
	icon?: string;
	weight: number;     // 降序
	enabled?: boolean;
	sites: NavSite[];
}
```

起步分类骨架（占位，等园主给名单或授权按站内内容拟种子稿）：AI 工具与中转 / Agent 工程 / 前后端文档 / 设计灵感 / 学习课程 / 效率工具 / 社区论坛。

### 5. 接线

- `siteConfig.pages` 增 `navSites: true`；`nav.astro` 开头 `if (!siteConfig.pages.navSites) return Astro.redirect("/404/")`（与 gallery/friends 同款）。
- `navBarConfig.ts` 增 `LinkPresets.NavSites`（`pageKey: "navSites"`，icon `lucide:library-big` 或 `lucide:compass`），插入「链接」组首项。
- i18n：`I18nKey` 增 `navSites` / `navSitesDescription` / `searchNavSites`，六语言文件（zh_CN / zh_TW / en / ja / ko / ru）同步补齐。

## Acceptance criteria

1. 桌面端进入 `/nav/`：左右侧栏不占位，主区单列全宽；离开（swup 或直跳）后首页恢复双侧栏，无布局残留。
2. 首页 ↔ `/nav/` swup 往返各一次：无闪烁、无错位、侧栏状态正确（双份 grid 类对拍的验证动作）。
3. 搜索框输入关键字，卡片按 name/desc/tags 过滤；清空恢复；分类 chips 点击平滑滚动到对应节且可再过滤。
4. 移动端：chips 横向可滚、卡片单列、触控目标 ≥ 44px。
5. 暗色模式全页无低对比文本（对照 friends 暗色规则逐类检查）。
6. `siteConfig.pages.navSites = false` 时：`/nav/` 404 redirect、导航无入口。
7. **站点预览卡**：点卡片本体弹出，左栏截图轮播左右按钮与圆点可切换、单图时隐藏切换控件；右栏详情可上下滚动；`Esc`/遮罩/关闭钮三种方式可关；关闭后焦点还原、Fancybox Carousel 实例销毁（连开关 10 次无 DOM/实例残留）。
8. **双区交互**：右上角跳转图标点击直达外链（新标签、`noopener noreferrer`）且不触发弹层；`preview: false` 的站点整卡直链。
9. **弹层移动端**：上下堆叠全屏化，轮播与滚动互不抢占手势。
10. `pnpm check`、`pnpm type-check`、`pnpm build` 全过；改动未涉加载策略，但按纪律跑 `check-v41-gates.mjs` 确认 29 项不回退。
11. 全页无新增第三方请求（icon 走本地 iconify 集；截图仅 `img.threetwoa.live` R2 域）。

## 任务分解（每步可独立验证）

| # | 任务 | 产出 / 验证 |
|---|---|---|
| T1 | 类型 + 数据配置 `navSitesConfig.ts`（含种子分类骨架与 ≥3 个示例站，含 screenshots/detail 样例） | `tsc` 过；barrel `@/config` 导出 |
| T2 | `MainGridLayout` 加 `wide` prop（SSR 单列 + wrapper hidden + data attr） | 本地直开 `/nav/` 全宽；首页不受影响 |
| T3 | `Layout.astro` `updateMainGridCols` 增加 force-single 判断 | swup 首页↔nav 往返布局正确（验收 1/2） |
| T4 | `nav.astro` 页面：节头 + 卡片网格（双区交互）+ pinned 行 + 暗色样式 | 视觉过目 + 暗色检查 |
| T5 | 搜索/分类过滤 custom element + 锚点 chips | 验收 3/4 演示 |
| T6 | 站点预览卡弹层：modal 骨架 + Carousel 轮播 + 滚动详情 + 移动端堆叠 + 开关生命周期 | 验收 7/8/9 演示 |
| T7 | 导航接线 + i18n 六语言 + 开关 404 测试 | 验收 6；`pnpm check` / `type-check` / `build` / v41 门禁 |

## 风险

- grid 类双份维护（SSR 与客户端 JS）：T2/T3 显式对拍，验收 2 兜底。
- 侧栏隐藏后 `#main-grid` transform 与桌宠 z-30 层的历史问题（`MainGridLayout.astro:920` 注释）：本页弹层若用原生 `<dialog>` 走 Top layer，天然不受 z-index 影响，恰好绕开该坑；chips sticky 仅在主列内部。
- Fancybox Carousel 在弹层内的生命周期：关弹层必须 `destroy()`，否则多次开关累积实例（验收 7 的连开 10 次即为此设）。
- 截图素材是人力瓶颈：R2 需逐站手动截图；`preview: false` + `screenshots` 缺省兜底保证「先上线后补图」，不阻塞发布。
- 性能：纯静态页 + 本地图标集、零新依赖；弹层 JS 仅在该页激活，预计不动 V7 基线；仍跑 v41 门禁确认。
- 命名与内容输入依赖园主：T1 可先用种子数据开工，改名是纯配置操作，不阻塞。

## Open questions（等拍板）

1. 展示名：藏经阁 / 星图 / 导航？（URL 均为 `/nav/`，不受影响）
2. 分类清单与站点名单：园主直接给，或授权按站内内容重心拟种子稿再改？
3. 截图素材：首期就配齐，还是先上线（部分站点 `preview: false`）后补图？R2 上传走 `upload_r2.py` 既有通道。
4. 预览卡右栏 `detail` 用纯文本还是 Markdown 子集？（默认纯文本 + 自动换段，够用且免渲染依赖）
5. 挂载位置确认：「链接」组首项，还是直接顶层按钮？
6. 是否要「常用置顶」行？（默认做，`pinned` 字段已留）
