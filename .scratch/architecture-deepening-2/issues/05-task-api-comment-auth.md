# 05: 评论图与 auth 端点接入统一契约

**What to build:** 评论图、登录、改密、登出与 Supabase mutation 复用 `api/http`；坏 JSON 与缺参分开，超限统一 429；owner/admin 的「生产不可写」错误码统一，但保留「未配置」与「禁止写」的语义区分。

**Blocked by:** 03（API 响应与限流 module）

**Status:** ready-for-agent

- [ ] 评论图 DELETE 坏 JSON 返回 `invalid_json`，不再伪装成 `Missing url`
- [ ] 评论图 / auth/password / Supabase mutation 使用同一个 limiter 工厂
- [ ] 超限统一 429 + `Retry-After`；不再出现静默 200
- [ ] owner/admin 同类失败使用同一状态与错误码，并在票里记录区分条件
- [ ] 行为测试覆盖坏 JSON、缺参、429；现有 comment-image 测试保持绿
