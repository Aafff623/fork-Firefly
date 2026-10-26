# 11: RSS contentMode 开关（full | summary）

**What to build:** `src/pages/rss.xml.ts` 支持内容模式：`siteConfig` feed 段加 `contentMode: "full" | "summary"`（默认 full 保持现状），summary 模式只输出摘要+链接；sanitize 与 MDX 渲染行为不变。

**Blocked by:** None

**Status:** resolved（2026-10-26；两种模式 dev 实测 + XML 解析通过）

- [x] 配置项上线（默认 full，行为不变）
- [x] summary 模式输出摘要，本地构建两种模式各验证一次 — dev 路由各取一次并比对
- [x] RSS 阅读器抽查（或 XML 结构断言）无回归 — 用 XML 解析 + 元素计数断言
- [x] `npx tsc --noEmit --isolatedDeclarations` + `npx astro check` 绿（本轮按指示不用 pnpm）

**参考**：上游 `src/config/siteConfig.ts:353-358` + `src/pages/rss.xml.ts`（公网同路径）；`temp/reports/batch1/cuteleaf-firefly-borrow.md` 第 10 条。纯产品取舍，无技术风险；133 篇全文 feed 体积大是切 summary 的动机。

## 实现记录（2026-10-26）

- `src/config/siteConfig.ts` 新增 `feed` 段，`contentMode: "full"`（默认 = 现状）。`SiteConfig` 类型里没有 feed 段，本轮边界不动 `src/types/siteConfig.ts`，所以在配置文件顶部用 `SiteConfig & { feed?: { contentMode… } }` 就地扩了四行；后续并进类型文件后删掉即可。
- `src/pages/rss.xml.ts` 按模式分支：summary 直接输出 `title / description / link / pubDate`，连 MDX 渲染器和 Astro 容器都不初始化；full 分支保持原样（`render` → `stripInvalidXmlChars` → `sanitizeHtml`，密码文章仍给提示文案），没有改 sanitize 白名单或 XML 清洗。

实测（dev `http://127.0.0.1:4333/rss.xml`，站点 128 篇进 feed）：

| 模式 | 条目 | `content:encoded` | 体积 |
|---|---|---|---|
| full | 128 | 128 | 17,552,422 B |
| summary | 128 | 0 | 57,098 B |
| full（改回再取） | 128 | 128 | 17,552,422 B（与第一次逐字节同大小） |

两份输出都用 Python `ElementTree` 解析通过（`128 items`），summary 每项都有 `<description>` 与 `<link>`，`<guid isPermaLink="true">` 保留。

未验证：

- 真实 RSS 阅读器没有抽查（只有 XML 结构断言）。
- 没跑整站 `astro build`：RSS 是同一段代码在 dev 的按需渲染，生产侧未单独验证；要更稳可以在发布前补一次构建。
