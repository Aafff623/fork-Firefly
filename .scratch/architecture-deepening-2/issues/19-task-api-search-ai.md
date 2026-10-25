# 19: /api/search/ai 接入统一契约

**What to build:** AI 搜索复用 `api/http` 的限流与响应，并消费 ArticleIndex 的候选来源；超限 429 + `Retry-After`，上游失败 502 不再把上游状态码写进自己的 `code`。响应形状与现有前端调用保持兼容。

**Blocked by:** 03（API 响应与限流 module）、09（搜索 / 问答接入统一打分核心）

**Status:** resolved（2026-10-25；端点级 curl 未跑）

- [x] 限流改用 `createRateLimiter`，超限 429 + `Retry-After`
- [x] 上游失败统一 `{ error: "upstream_error", upstreamStatus, message }`
- [x] 候选来源改为 ArticleIndex，不重复打分
- [x] 成功响应形状保持，前端新增 429 文案映射
- [ ] 行为测试或本地 curl 覆盖 429/502（module 级测试覆盖，端点级未跑）

## Result

- `search/ai` 接入 `api/http`：429 用 `rateLimited`，坏体用 `readJson`，上游失败用 `upstreamError`；索引故障保留 `index_unavailable` 502。
- `post-search` 的 AI 分支识别 429 并给出「请求过于频繁」文案；成功响应形状不变。
- 该文件的候选排序已在 09 接入 ArticleIndex。
