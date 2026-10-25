# 04: /ask 接入统一契约

**What to build:** `/ask` 复用 `api/http` 的限流与响应；超限统一返回 429（带 `code` 与 `Retry-After`），上游失败统一返回 502（body 不再把上游 401 当成自己的 code）。SSE 透传与上游白名单保持不变。

**Blocked by:** 03（API 响应与限流 module）

**Status:** resolved（2026-10-25，`07fec9d3`；search/ai 移到 19）

- [x] `/ask` 使用 limiter 工厂，超限返回 429 + `Retry-After`
- [x] `/ask` 上游失败返回 `{ error: "upstream_error", upstreamStatus, message }`
- [x] SSE 流式分支与上游白名单不变
- [x] 行为测试覆盖 429/502 的 module 契约
- [ ] 本地 dev 用 curl 验证一次超限与一次上游失败（未跑，留 19 统一做）

## Result

- `/ask` 的 session / retrieve / chat 共用 20 次/10 分钟 limiter；上游失败统一 502，body 不再复用上游状态码。
- `search/ai` 不在本票范围，移到 19 票，与 ArticleIndex 的 09 一起接。
