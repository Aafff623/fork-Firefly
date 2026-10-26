# 07: site_verification 站长验证 meta

**What to build:** siteConfig 加 verification 段（google/baidu/bing 等），Layout head 按配置输出对应 meta 标签；缺省不输出。

**Blocked by:** None

**Status:** open

**WIP 注意：** 改 `src/layouts/Layout.astro`，实施前查 git status（该文件曾在他人在制品中）。

- [ ] siteConfig.verification 配置域
- [ ] Layout meta 输出（至少 google/baidu）
- [ ] 本地构建验证 meta 出现/缺失符合开关
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/butterfly-borrow.md` 第 2 条（百度收录前置）。上游 `temp/repos/hexo-theme-butterfly/`（思想迁移）。
