# 21: 剩余内容消费方接入 ArticleIndex

**What to build:** `getRelatedPosts`、`getHotPosts`、`getTagList`、`getCategoryList` 与 `ask-index.json` 的草稿过滤改用 ArticleIndex，不再各自读 collection 或复制可见性/热度规则。相关文章与热文保留各自排序语义，但数据来源统一。

**Blocked by:** None（08 已完成）

**Status:** resolved（2026-10-25）

- [x] `getRelatedPosts` / `getHotPosts` 从索引取卡片，保留现有排序语义
- [x] `getTagList` / `getCategoryList` 不再自己 `getCollection`
- [x] `ask-index.json` 的草稿过滤走 `isArticleVisible`
- [x] 首页、标签、分类、相关推荐、热文数据不回归
- [x] 页面冒烟

## Result

- 四个内容消费方全部改吃 ArticleIndex 卡片；`ask-index.json` 的草稿规则复用 `isArticleVisible`。
- `getRelatedPosts` / `getHotPosts` 的公式保留，热度改用 `card.heat`，不再各自统计 tag corpus。
- dev 冒烟：首页热笺、文章页相关推荐、标签页、分类页均无 Astro 错误覆盖。
- 行为差异：标签/分类统计不再包含主题 demo 帖（索引本来就不收），属于口径统一。
