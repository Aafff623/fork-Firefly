# 09: 搜索 / 问答接入统一打分核心

**What to build:** 站内搜索与问答检索使用 ArticleIndex 的 `rankArticles`；三种模式（list / search / ask）共用一套打分结构、不同权重。允许搜索/问答排序小幅变化，但同分规则与截断口径必须一致。

**Blocked by:** 07（ArticleIndex 纯核心与构建期加载器）、08（列表 / 合集 / 元数据接入 ArticleIndex）

**Status:** resolved（2026-10-25）

- [x] `post-search` 与 `ask-retrieve` 调统一打分核心，不再各写一套
- [x] `list / search / ask` 权重集中在一处
- [x] 排序变化有测试断言说明
- [x] `test-ask-retrieval` 保持绿；新增搜索模式测试
- [x] 不在 API 层重复打分

## Result

- `post-search` 只调 `rankArticles(..., "search", focus)`；`ask-retrieve` 的 keyword/site-meta 走 `rankArticles(..., "ask")`；`/api/search/ai` 的候选排序改走同一核心，路由内 `scoreCandidate` 删除。
- 排序变化：search 同分改按有效时间 + id；ask 的站点文档、泛词、正文降权口径保留；`test-ask-retrieval` 全绿。
- `/api/search/ai` 的限流/错误契约在 19 票接入 `api/http`。
