# 08: 列表 / 合集 / 元数据接入 ArticleIndex

**What to build:** 首页、归档、合集、日历元数据统一消费 ArticleIndex；旧的 `getSortedPosts` / `getSortedPostsList` 保留为薄适配器，迁移期间调用方不用全改。`allPostMeta` 不再自己算 topicHeat，合集缺父夹直接报错。

**Blocked by:** 07（ArticleIndex 纯核心与构建期加载器）

**Status:** ready-for-agent

- [ ] 列表排序/置顶/草稿规则只由索引提供
- [ ] `allPostMeta` 的热度来自索引，不再复制一套 topicHeat
- [ ] 未知合集 slug 或缺父夹抛错，不再静默少卡
- [ ] 首页、归档、合集总览、日历数据不回归
- [ ] 行为测试覆盖排序、草稿、合集完整性
