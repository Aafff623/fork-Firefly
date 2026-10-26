# 参考仓库借鉴第二批 · Spec

## Problem Statement

第二批调研（astro-paper + Shirone，报告在 `temp/reports/batch2/`）定位出 16 项新增量。共性：我们在「SEO/a11y 元数据、定时发布、浏览器级测试、工程化门禁」四个面有已核实的空白；Shirone 展示了一套 2026 年的工程方法学（测试左移、配置 schema 化、动效原语化、关闭零负担），有借鉴价值但源码成熟度不足、且存在许可证溯源陷阱。

## Solution

16 项独立小改动，两组推进：

1. **SEO/a11y 元数据组（01–06）**：canonical、skip link + 全局 focus-visible、article meta + JSON-LD 补全、每标签静态分页 URL、页面小件打包、tag slug 坍缩防护。
2. **工程化组（07–16）**：定时发布、Playwright 浏览器测试、CI svelte-check + 字体预算、关闭零负担扫描、LQIP 内容哈希、动效原语库、番剧快照 CLI、配置 JSON Schema、Markdown 按需加载、相册目录扫描。

共用原则：Shirone 代码一律重实现；改 Layout/package.json 的票先查 WIP；F1 先产品决策后实现；测试类票先立关键路径再扩面。

## User Stories

1. 作为读者，用键盘 Tab 能直接跳到正文，焦点圈清晰可见。
2. 作为读者，转载我文章的地方 canonical 指向原文，搜索权重不分散。
3. 作为订阅读者/爬虫，JSON-LD 里有准确的发布/修改时间与封面图。
4. 作为读者，某个标签的文章列表有可直接分享的 URL。
5. 作为读者，长文有阅读进度，筛选态知道自己在哪。
6. 作为园主，文章写好设未来日期，到点才上榜（定时发布）。
7. 作为维护者，CI 里有浏览器级回归：a11y 违规、CLS 回归、动效降级会被拦住。
8. 作为维护者，新增 island 前先过「零 island 检查」，能不做就不做。
9. 作为维护者，关掉评论/音乐等功能后构建产物里不留残余 CSS/JS。
10. 作为维护者，换了封面图，LQIP 不会静默用旧占位。
11. 作为维护者，站内动效走统一原语（WAAPI），reduce-motion 一键全站降级。
12. 作为维护者，番剧数据构建失败时有上次快照兜底，不白屏。
13. 作为维护者/Agent，VS Code 改配置有 schema 补全与校验。
14. 作为读者，首页不加载全站 Markdown 才用到的 CSS。
15. 作为园主，相册目录里放图 + info.json 即上架，不用手工登记。

## Implementation Decisions

- **01/02/03 都改 Layout.astro**：合并实施或串行，视 WIP 情况定；focus-visible 全局层放基础样式文件，组件级散规则保留。
- **04 每标签静态分页**：新增 `/tags/[tag]/[...page]` 静态路由，与现有交互式标签页并存（交互页保留，静态路由补 SEO/可分享）。
- **07 定时发布**：先扫存量未来日期文章数量再定行为；默认建议「DEV 显示、生产隐藏未到点文章」，阈值可配（scheduledPostMargin）；与每篇 timezone 覆盖合并设计。
- **08 Playwright**：先 4 条关键路径（首页 a11y axe、文章页 CLS、软导航动效降级、评论区加载）；依赖加入注意 package.json WIP；不追求对方 64 spec 的全量。
- **09 CI**：workflow 加 svelte-check job；字体字节预算并入现有 check:budget 或新建门禁。
- **10 关闭零负担**：先构建扫描现状（关评论/音乐后产物残留），再决定是否引入 L3 隔离；Astro CSS hoist 陷阱要有回归断言。
- **11 LQIP**：哈希源改内容哈希（或内容+路径混合），构建期判新鲜。
- **12 动效原语**：新建 `src/utils/motion.ts`（WAAPI collapse/FLIP + reduce-motion 统一降级）；存量动效不强制迁移，新动效先入原语库；framer-motion 两处记录在案，不主动扩用。
- **13 番剧快照**：构建期 fetch 改「快照 CLI + 构建期读快照」，keepLastValid/原子写/敏感扫描三件套。
- **14 配置 Schema**：从 TS 类型生成 JSON Schema（或手写同步），落 `schemas/` 或 config 目录；VS Code yaml.schemas 关联。
- **15 Markdown 按需加载**：按语法命中拆 CSS 包；先量首页 CSS 构成再定拆分粒度；成本中高，可降级为「重语法组件异步化」。
- **16 相册目录扫描**：`public/images/albums/<name>/info.json` + hidden/external 模式，与现有手动登记制并存（新相册走扫描）。

## 验收总则

- 每票：本地 `pnpm dev` 关键路径 + `pnpm check && pnpm type-check`；测试/CI 票跑 `pnpm check:gates`；改构建链的票跑 `pnpm build` 核对产物。
- 全组合并后 `pnpm check:gates` 全绿才进发布确认；push 仍需园主单独授权。
