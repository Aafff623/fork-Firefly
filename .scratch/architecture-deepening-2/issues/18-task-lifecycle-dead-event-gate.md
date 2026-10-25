# 18: 死事件静态门禁

**What to build:** 全部死事件监听清完后，在 `check:gates` 里禁止 `swup:contentReplaced` 重新出现；门禁不带 allowlist，失败信息直接指出文件。

**Blocked by:** 01（修复死事件，恢复软导航后的组件初始化）、17（Profile / GlyphTitle 迁移到生命周期 seam）

**Status:** ready-for-agent

- [ ] 门禁扫描 `src`，出现 `swup:contentReplaced` 即失败
- [ ] 失败输出包含文件与行号
- [ ] 接进 `check:gates` 与 CI
- [ ] 门禁本身有反例测试（临时 fixture 或脚本自测）
