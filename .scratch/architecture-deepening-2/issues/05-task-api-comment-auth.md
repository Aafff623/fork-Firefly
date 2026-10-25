# 05: 评论图与 auth 端点接入统一契约

**What to build:** 评论图、登录、改密、登出与 Supabase mutation 复用 `api/http`；坏 JSON 与缺参分开，超限统一 429；owner/admin 的「生产不可写」错误码统一，但保留「未配置」与「禁止写」的语义区分。

**Blocked by:** 03（API 响应与限流 module）

**Status:** resolved（2026-10-25，`07fec9d3`）

- [x] 评论图 DELETE 坏 JSON 返回 `invalid_json`，不再伪装成 `Missing url`
- [x] 评论图 / auth/password / Supabase mutation 使用同一个 limiter 工厂
- [x] 超限统一 429 + `Retry-After`；不再出现静默 200
- [x] owner/admin 的「禁止写」与「provider 未配置」保持区分
- [x] 行为测试覆盖坏 JSON、缺参、429；现有 comment-image 测试保持绿

## Result

- 评论图、auth/login、auth/logout、auth/password、auth/session、owner/post、owner/image、admin/pin 统一走 `api/http` 的 `json` / `readJson` / `rateLimited`。
- 区分条件：`admin/pin` 生产禁止写 = 403 `prod_write_disabled`；`owner/*` Git provider 未配置 = 503 `production_git_provider_unconfigured`；Supabase 未配置 = 503 `supabase_unconfigured`。
- 删除已无调用方的 `checkMutationRate`；`requireOwnerUser` 直接返回 `retryAfterSeconds`，路由用 `rateLimited` 输出。
- `test-api-http` / `test-comment-image-policy` / `test-ask-retrieval` 通过；Biome 通过。
