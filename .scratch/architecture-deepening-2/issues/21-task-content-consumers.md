# 21: 剩余内容消费方接入 ArticleIndex

**What to build:** `getRelatedPosts`、`getHotPosts`、`getTagList`、`getCategoryList` 与 `ask-index.json` 的草稿过滤改用 ArticleIndex，不再各自读 collection 或复制可见性/热度规则。相关文章与热文保留各自排序语义，但数据来源统一。

**Blocked by:** None（08 已完成）

**Status:** ready-for-agent

- [ ] `getRelatedPosts` / `getHotPosts` 从索引取卡片，保留现有排序语义
- [ ] `getTagList` / `getCategoryList` 不再自己 `getCollection`
- [ ] `ask-index.json` 的草稿过滤走 `isArticleVisible`
- [ ] 首页、标签、分类、相关推荐、热文数据不回归
- [ ] 行为测试或页面冒烟
