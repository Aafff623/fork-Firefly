# 04: /ask 与 /api/search/ai 接入统一契约

**What to build:** 问答与 AI 搜索复用 `api/http` 的限流与响应；超限统一返回 429（带 `code` 与 `Retry-After`），上游失败统一返回 502（body 不再把上游 401 当成自己的 code）。SSE 透传与上游白名单保持不变。

**Blocked by:** 03（API 响应与限流 module）

**Status:** ready-for-agent

- [ ] 两个端点使用同一个 limiter 工厂，超限返回 429 + `Retry-After`
- [ ] `/ask` 上游失败返回 `{ error: "upstream_error", upstreamStatus, message }`
- [ ] SSE 流式分支与上游白名单不变
- [ ] 行为测试覆盖 429 与 502 的 body/header
- [ ] 本地 dev 用 curl 验证一次超限与一次上游失败
