# 03: API 响应与限流 module

**What to build:** 一个 server-only 的 `api/http` module，提供 `json`、`readJson`、`createRateLimiter`、`getClientAddress`；窗口数学、IP 顺序、`Retry-After` 只写一遍。此票不改变任何端点行为，只建立可测试的横切接口。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `json(status, body, headers?)` 统一 JSON content-type / charset
- [ ] `readJson(request)` 区分 `ok` / `empty` / `invalid-json`
- [ ] `createRateLimiter({ max, windowMs, keyPrefix, now? })` 返回 `allowed` 与 `retryAfterSeconds`
- [ ] `getClientAddress(request)` 顺序固定：`cf-connecting-ip` → `x-real-ip` → `x-forwarded-for` → `unknown`
- [ ] 新增行为测试：窗口、过期、键隔离、`Retry-After`、IP 顺序
