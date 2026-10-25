# 08: 列表 / 合集 / 元数据接入 ArticleIndex

**What to build:** 首页、归档、合集、日历元数据统一消费 ArticleIndex；旧的 `getSortedPosts` / `getSortedPostsList` 保留为薄适配器，迁移期间调用方不用全改。`allPostMeta` 不再自己算 topicHeat，合集缺父夹直接报错。

**Blocked by:** 07（ArticleIndex 纯核心与构建期加载器）

**Status:** resolved（2026-10-25）

- [x] 列表排序/置顶/草稿规则只由索引提供
- [x] `allPostMeta` 的热度来自索引，不再复制一套 topicHeat
- [x] 未知合集 slug 或缺父夹抛错，不再静默少卡
- [x] 首页、归档、合集总览、日历数据不回归（真实 47 个合集配置已静态校验）
- [x] 行为测试覆盖排序、草稿、合集完整性

## Result

- `content-utils` 的 `getSortedPosts` / `getSortedPostsList` 变薄适配器；`collection-utils` 走 `index.collection`，缺父夹直接抛 `ArticleCollectionError`；`allPostMeta` 的 `topicHeat` 改取 `card.heat`。
- 真实 `collectionsConfig` 47 项无重复 slug、无缺失 parent，构建不会因新校验误伤。
- 残留：`getRelatedPosts` / `getHotPosts` / `getTagList` / `getCategoryList` 仍各自读 collection；`getSortedPosts` 仍写入 `prevSlug/nextSlug`；`ask-index.json` 的草稿过滤仍是旧内联写法。已拆成 21/22 票。
