# 03: License 版权块激活（死代码复活）

**What to build:** 在文章正文末尾挂载已存在的 License 组件：`src/components/layout/PostPage.astro` 正文后按 `licenseConfig.enable` 条件渲染 `src/components/misc/License.astro`（我们版本比上游多 author/sourceLink/licenseName/licenseUrl props）；确认 i18n key（author/publishedAt/license）在 `src/i18n/` 存在；动态页是否挂载单独小决定（默认先只文章页）。

**Blocked by:** None

**Status:** resolved（2026-10-27）

- [x] `PostPage.astro` 正文末尾条件渲染 License（参考上游 `src/pages/posts/[...slug].astro:109` 一行挂载）
- [x] i18n key 齐全（四语言）
- [x] 本地 dev 看一篇文章：署名块显示标题/URL/作者/日期/CC 链接
- [x] `licenseConfig.enable: false` 时全站不出现（开关有效）
- [x] `pnpm check && pnpm type-check` 绿

**实现记录（2026-10-27）**

- 挂载点纠正：本仓 `src/components/layout/PostPage.astro` 是**文章列表**组件（`PostCard` 循环，被首页/合集页复用），文章正文由 `src/pages/posts/[...slug].astro` 渲染。挂到列表组件会让每张卡都出一块 License，故实际改动落在 `src/pages/posts/[...slug].astro`：在正文/分享条/相关推荐所在的卡片 `#post-container` 末尾、`licenseConfig.enable` 为真时渲染 `<License>`，普通文章与加密文章（解锁后）共用一处挂载，不重复 markdown 分支。
- 传参：`title=entry.data.title`、`id=entry.id`、`pubDate=entry.data.published`、`author=profileConfig.name`、`sourceLink=new URL(getPostUrlBySlug(entry.id), Astro.site ?? Astro.url).href`（文章绝对 URL）、`licenseName/licenseUrl` 取 `licenseConfig.name/url`、`class="mb-6 rounded-xl license-container onload-animation"`。
- i18n：`author` / `publishedAt` / `license` 在 `en/ja/ko/ru/zh_CN/zh_TW` 六个语言文件里都已存在，未改 i18n。
- 验证（dev + curl `/posts/java-course0/`）：渲染出标题、`https://www.threetwoa.live/posts/java-course0/`、作者 `threetwoa`、`2026-09-18`、CC 链接 `https://creativecommons.org/licenses/by-nc-sa/4.0/` 与 CC 图标，位于文章卡片末尾。开关：`licenseConfig.enable` 为 false 时该块整体不输出（条件渲染，非 CSS 隐藏）。构建产物 `dist/client/posts/java-course0/index.html` 同样含 `license-container` 块。
- 动态页仍未挂载（按票里的默认决定）。

**参考**：`temp/reports/batch1/fuwari-borrow.md` 第 1 条；组件与配置已在仓内（`src/components/misc/License.astro`、`src/config/licenseConfig.ts`），纯激活、无许可风险。属全站一致变动，建议随一次发版一起上。
