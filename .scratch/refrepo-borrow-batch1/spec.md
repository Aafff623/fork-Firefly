# 参考仓库借鉴第一批 · Spec

## Problem Statement

第一批参考仓库调研（CuteLeaf/Firefly + saicaca/fuwari，报告在 `temp/reports/batch1/`）定位出一批小块缺口与一个已核实缺陷。共性问题是：我们站点在「分享卡、版权声明、AI 可读性、构建链健壮性」四个面上有空白或半成品，而直系上游已有经过生产验证的实现；同时字体子集化脚本存在产物路径缺陷，当前靠配置巧合未触发。

## Solution

16 项独立小改动，按三组推进，每组可独立验收、独立发布：

1. **直接痛点组（01–04）**：og:image 静态兜底与 takumi 本地字体两档方案、License 死代码激活、llms.txt。
2. **工程化与缺陷组（05–08）**：内联脚本压缩、site-root 产物根解析（06 先行）、subset-fonts 路径修复（07 依赖 06）、GitHub 卡构建期静态数据。
3. **新功能与治理组（09–16）**：Series 连载、`?q=` 搜索参数、RSS contentMode、frontmatter.json、banner.credit、沉浸阅读、Projects 页、治理标准。

共用原则：优先复用现有配置体系与 pages 开关；每票先落 ticket 再实现；改构建链的票必须跑一次完整 `pnpm build` 验证产物路径；许可证 MIT 保留署名。

## User Stories

1. 作为读者，我把文章分享到社交平台时看到品牌封面图，而不是纯文字卡。
2. 作为读者，文章底部有清晰的 CC 署名块，转载时知道规矩。
3. 作为 Agent/LLM，访问 /llms.txt 能一站式拿到站点结构与最新文章清单。
4. 作为维护者，构建链不再依赖「dist 目录恰好长那样」的巧合，site-root 统一解析。
5. 作为维护者，将来给任何本地字体开子集化，不会写出不进部署包的文件、不会误删原字体。
6. 作为读者，在无 JS / 爬虫 / 分享截图场景下，GitHub 卡片显示真实仓库信息而非 "Waiting..."。
7. 作为读者，连载教程能按顺序上下篇导航，而不是靠翻列表。
8. 作为读者，搜索结果链接可以分享给他人直接打开。
9. 作为订阅读者，RSS 可以只要摘要，回源站看全文。
10. 作为维护者/Agent，VS Code 写 frontmatter 有字段补全，发文流水线有字段护栏。
11. 作为维护者，壁纸用了别人的图时有处署名。
12. 作为读者，长文可以进入沉浸阅读模式降噪。
13. 作为访客，能在 Projects 页看到园主的项目与状态。
14. 作为维护者，新配置项优先并入现有 config 文件、新 test 脚本先问守哪条红线——有明文标准可依。

## Implementation Decisions

- **OG 两档**：01 静态默认封面（public/ 一张 1200×630 + Layout 常驻 og:image）先行，零构建代价；02 takumi-js 全量文章卡后评估，前置条件是第三方许可确认 + 本地量一次构建耗时（133 篇）。
- **site-root 模式**：新增 `scripts/site-root.ts`，`dist/client` 存在则用之；`pagefind --site`、subset-fonts、strip-legacy-fonts 统一改吃它。抄上游时保留其注释里记录的事故背景（CF 上 pagefind 索引假路径致搜索 404）。
- **subset-fonts 修复**：DIST_DIR/OUTPUT_DIR 改从 site-root 取；URL 计算基准同步修正，使 `/_astro/...`、`/assets/...` 引用能匹配。是否顺势把 `--font-greatvibes` 接入 config 区域激活子集，单独小决定（它只在一个装饰组件用，51.7K 不大，默认不激活）。
- **内联脚本压缩**：esbuild `minifyWhitespace + minifySyntax`，`minifyIdentifiers` 必须保持 false（全局作用域脚本靠函数名互调）；压后检查 `</script` 防提前闭合。
- **Series**：schema 两字段 + `/series/` 索引 + 文章页 SeriesNav；`seriesOrder` 判断必须 `!== undefined`（0 会被误判）；发文流水线加维护提示。
- **llms.txt**：prerender 文本路由，按 pages 开关过滤关键页 + 最近 20 篇；输出带 UTF-8 BOM。
- **GitHub 卡**：构建期脚本写 `src/constants/github-card-data.json`（GITHUB_TOKEN 走环境变量、失败保留旧缓存）；stars/forks 运行时取一次写 localStorage 24h TTL。
- **治理标准（16）**：只写进 spec 与本票，不改现有 config 文件结构；触碰设置注册表的重构明确不做。

## 验收总则

- 每票：本地 `pnpm dev` 走关键路径 + `pnpm check && pnpm type-check`；改构建链的票加跑 `pnpm build` 并核对 dist 产物。
- 全组合并后：`pnpm check:gates` 全绿才可进入发布确认；push 仍需园主单独授权。
