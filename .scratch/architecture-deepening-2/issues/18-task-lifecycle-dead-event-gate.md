# 18: 死事件静态门禁

**What to build:** 全部死事件监听清完后，在 `check:gates` 里禁止 `swup:contentReplaced` 重新出现；门禁不带 allowlist，失败信息直接指出文件。

**Blocked by:** 01（修复死事件，恢复软导航后的组件初始化）、17（Profile / GlyphTitle 迁移到生命周期 seam）

**Status:** resolved（2026-10-26）

- [x] 门禁扫描 `src`，出现 `swup:contentReplaced` 即失败
- [x] 失败输出包含文件与行号
- [x] 接进 `check:gates` 与 CI
- [x] 门禁本身有反例测试（`--self-test`）

## Result

- 新增 `scripts/check-lifecycle-events.mjs`：递归扫 `src`，输出 `file:line`；`--self-test` 覆盖正/反例。
- 已接进 `check:gates`（`--self-test` + 正式扫描）。
- 全仓已无 `swup:contentReplaced`。
