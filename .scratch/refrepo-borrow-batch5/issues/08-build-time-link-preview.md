# 08: 构建期链接预览卡

**What to build:** 动态/文章外链预览卡：构建期抓目标 URL 的 og:title/description/image，生成预览卡组件；**遵守批 2 票 13 纪律**：超时、失败降级（无卡直接链）、敏感信息不抓取；可配置开关。

**Blocked by:** None

**Status:** open

- [ ] 构建期抓取脚本（超时+并发限制+失败降级）
- [ ] 预览卡组件（标题/描述/图/域名）
- [ ] 缓存策略（同 URL 不重复抓）
- [ ] 本地验证一条外链卡
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch5/memos-borrow.md` M6（构建期链接预览卡）。上游 `temp/repos/memos/`（链接预览思想）。
