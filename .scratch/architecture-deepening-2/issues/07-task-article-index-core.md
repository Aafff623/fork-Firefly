# 07: ArticleIndex 纯核心与构建期加载器

**What to build:** 构建期文章索引：`list(query?)` 返回已排序、已带摘要/字数/分钟/日期/pinKind/heat 的文章卡片；`collection(slug)` 返回合集文章。纯核心与 Astro 加载器分离，node 里能用 fixture 测试排序与打分。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] 定义 `ArticleCard`、`ArticleQuery`、`ArticleIndex` 与三种打分模式
- [ ] 纯核心 `buildArticleCards(posts)` / `rankArticles(cards, mode)` 可在 node 运行
- [ ] 构建期加载器只负责读取 content collection
- [ ] 草稿可见性、effective time、摘要截断各自只有一个函数
- [ ] fixture 测试覆盖：排序、置顶、草稿、模式差异
