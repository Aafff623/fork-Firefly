# 01: 分环境 noindex + robots 门控

**What to build:** 分环境收录门控：显式环境变量（构建期常量）判定 preview/production；非生产环境全站输出 `<meta name="robots" content="noindex,nofollow">`，robots.txt 同步输出 Disallow；生产环境行为不变。**必须本地 + CI 双环境验证，防误伤生产。**

**Blocked by:** None

**Status:** open

- [ ] 环境判定机制（显式变量，默认值安全——拿不准时偏向 noindex 还是 index 需在 spec 定，建议默认生产）
- [ ] 非生产：全站 noindex meta + robots.txt Disallow
- [ ] 生产：无 noindex、robots 正常（双环境各验证一次并记录）
- [ ] CI 加一条环境行为断言（构建产物含/不含 noindex）
- [ ] `pnpm check && pnpm type-check && pnpm check:gates` 绿

**参考**：`temp/reports/batch3/papermod-borrow.md` 第 1 条（最高优先）；已亲证 `grep -rn "noindex" src/` 0 命中。背景：Cloudflare Workers 预览 URL 有重复收录风险。上游 `temp/repos/hugo-PaperMod/`（思想迁移）。
