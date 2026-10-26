# 06: 贴纸建议 API 的 429 契约

**What to build:** 贴纸建议 API 在限流时返回 429（与「没匹配到」的 200 空结果可区分）；客户端按 429 退避。该功能当前 `enabled:false`，改动不得让休眠功能回归。

**Blocked by:** 03（API 响应与限流 module）；external：sticker-suggest 组件与 lib 的未提交 WIP 必须先落地

**Status:** resolved（2026-10-26；纯核心测试通过，休眠功能未做浏览器验证）

- [x] API 超限返回 429 + `code` + `Retry-After`；无匹配仍为 200 空结果
- [x] agent 限流与「查询太长」不再共用 200 空结果语义
- [x] 客户端识别 429 并退避；不弹错误 Toast
- [x] 休眠开关下无网络请求、无行为变化
- [x] 行为测试覆盖 429 与「无匹配」两种结果
