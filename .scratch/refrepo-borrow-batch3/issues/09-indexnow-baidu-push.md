# 09: IndexNow / 百度主动推送

**What to build:** 构建后主动推送脚本：新文章 URL 推送 IndexNow（Bing/Yandex）与百度；**遵守批 2 票 13 纪律**：超时、失败降级不阻断构建、敏感信息扫描；凭证走环境变量。

**Blocked by:** None

**Status:** open

- [ ] 推送脚本（IndexNow + 百度两条通道，凭证环境变量）
- [ ] 失败降级：网络失败/限流不阻断构建，日志清晰
- [ ] 只推新文章（与上次推送记录 diff，快照记录已推 URL）
- [ ] 本地验证一次推送行为（可 dry-run）
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/butterfly-borrow.md` 第 4 条（构建期外网风险，参照批 2 票 13）。上游 `temp/repos/hexo-theme-butterfly/`（思想迁移）。
