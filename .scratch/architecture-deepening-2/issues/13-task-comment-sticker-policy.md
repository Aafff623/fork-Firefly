# 13: 贴纸建议策略顺序移入 lib

**What to build:** L1 → writeback → agent → allowlist 的策略顺序由 `lib/sticker-suggest` 持有；路由只做 HTTP 翻译与限流。writeback 命中不再被标成 `source:"l1"`，长度阈值与默认结果数只有一处。

**Blocked by:** 06（贴纸建议 API 的 429 契约）；external：sticker-suggest 组件与 lib 的未提交 WIP 必须先落地

**Status:** resolved（2026-10-26；纯核心测试通过，休眠功能未做浏览器验证）

- [x] 策略顺序、8 字阈值、默认结果数集中在 lib
- [x] 路由只解析请求、调用 lib、映射 HTTP
- [x] writeback 命中使用独立 source 或明确标记
- [x] 行为测试覆盖四段顺序与空结果
- [x] 休眠开关下无网络请求
