# 09: CI 加 svelte-check + 字体字节预算门禁

**What to build:** 两个 CI 快赢：① workflow 加 svelte-check job（Svelte 5 类型检查，与现有 astro check/tsc 互补）；② 字体字节预算进门禁（构建后统计部署字体总字节，超预算失败；阈值初版按现状留余量定，写入 `check:budget` 或新脚本）。

**Blocked by:** None

**Status:** open

**WIP 注意：** `package.json` 与 `.github/workflows/` 若在制品中，实施前重新查 git status。

- [ ] CI 新增 svelte-check job，本地可通过 `pnpm svelte-check` 复现
- [ ] 字体预算脚本/门禁上线，超预算 CI 红；当前值记录在案
- [ ] `pnpm check:gates` 绿

**参考**：`temp/reports/batch2/shirone-arch-perf.md`（CI 5 job 含 svelte-check；字体预算进 CI）+ `shirone-borrow.md`。上游 workflow 见 `temp/repos/Shirone/.github/workflows/`（重实现，不整段拷）。
