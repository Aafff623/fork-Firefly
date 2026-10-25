# 19: /api/search/ai 接入统一契约

**What to build:** AI 搜索复用 `api/http` 的限流与响应，并消费 ArticleIndex 的候选来源；超限 429 + `Retry-After`，上游失败 502 不再把上游状态码写进自己的 `code`。响应形状与现有前端调用保持兼容。

**Blocked by:** 03（API 响应与限流 module）、09（搜索 / 问答接入统一打分核心）

**Status:** ready-for-agent

- [ ] 限流改用 `createRateLimiter`，超限 429 + `Retry-After`
- [ ] 上游失败统一 `{ error: "upstream_error", upstreamStatus, message }`
- [ ] 候选来源改为 ArticleIndex，不重复打分
- [ ] 保持现有响应形状，前端不需要同步改
- [ ] 行为测试或本地 curl 覆盖 429/502
