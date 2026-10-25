# 07: ArticleIndex 纯核心与构建期加载器

**What to build:** 构建期文章索引：`list(query?)` 返回已排序、已带摘要/字数/分钟/日期/pinKind/heat 的文章卡片；`collection(slug)` 返回合集文章。纯核心与 Astro 加载器分离，node 里能用 fixture 测试排序与打分。

**Blocked by:** None (can start immediately)

**Status:** resolved（2026-10-25）

- [x] 定义 `ArticleCard`、`ArticleQuery`、`ArticleIndex` 与三种打分模式
- [x] 纯核心 `rankArticles(cards, mode)` 可在 node 运行
- [x] 构建期加载器只负责读取 content collection
- [x] 草稿可见性、effective time、摘要截断各自只有一个函数
- [x] fixture 测试覆盖：排序、置顶、草稿、模式差异

## Result

- 纯核心 `article-index.ts` 只保留类型、排序、打分、合集；新增 `article-index-builder.ts` 承载需要 reading-time 的卡片构造，避免客户端 `post-search` 把构建期摘要逻辑带进 bundle。
- 构建期 `article-index-loader.ts` 读 collection 并注入合集层级；PROD 只读一次，DEV 1 秒短缓存。
- `scripts/test-article-index.mts` 覆盖 effective time、草稿、置顶、热度、摘要、合集报错、list/search/ask；`tsc` 与 Biome 通过。
