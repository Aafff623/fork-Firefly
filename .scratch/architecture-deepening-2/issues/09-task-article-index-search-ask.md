# 09: 搜索 / 问答接入统一打分核心

**What to build:** 站内搜索与问答检索使用 ArticleIndex 的 `rankArticles`；三种模式（list / search / ask）共用一套打分结构、不同权重。允许搜索/问答排序小幅变化，但同分规则与截断口径必须一致。

**Blocked by:** 07（ArticleIndex 纯核心与构建期加载器）、08（列表 / 合集 / 元数据接入 ArticleIndex）

**Status:** ready-for-agent

- [ ] `post-search` 与 `ask-retrieve` 调统一打分核心，不再各写一套
- [ ] `list / search / ask` 权重集中在一处
- [ ] 排序变化有测试快照或断言说明
- [ ] `test-ask-retrieval` 保持绿；新增搜索模式测试
- [ ] 不在 API 层重复打分
