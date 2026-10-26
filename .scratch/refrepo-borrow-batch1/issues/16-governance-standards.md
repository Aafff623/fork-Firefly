# 16: 配置与测试立项治理标准

**What to build:** 两条立项标准写入本仓治理文档（`docs/agents/` 或 AGENTS.md 的工程流程段，按主对话决定落点），不做大重构：

1. **新配置项标准**：新功能优先并入现有 `src/config/` 文件的一个字段，不新建「config 文件 + 设置注册表条目 + test-settings-* 脚本」三件套；确需新文件时在 spec 里说明理由。
2. **新 test 脚本标准**：新增 `test:*` 脚本前先回答「它守哪条发布红线」，守不住的不加。

**Blocked by:** None

**Status:** resolved（2026-10-26）

- [x] 两条标准写入治理文档（AGENTS.md 硬约束 7/8，引用本票）
- [x] 不动现有 config 文件结构、不合并既有配置（明确不做）
- [x] 若落点在 AGENTS.md，改动最小化（两行）

## Result

- 新配置项标准写入 `AGENTS.md` 硬约束 7；新 test 脚本标准写入硬约束 8，均引用本票。
- 未改任何既有 config 文件结构，未合并配置，未触碰设置注册表。

**参考**：`temp/reports/batch1/fuwari-borrow.md` 第 5、6 条（fuwari 单文件 90 行 config vs 我们 40+ config 文件 + displaySettings 十几个「开关的开关」；其 10 条 scripts 无测试 vs 我们 40+ 条含门禁测试——结论是博客模板不需要测试、生产站+多 agent 需要，只立标准不抄对方）。触碰设置注册表与其门禁测试的重构明确不做（`scripts/test-settings-registry.mts` 等会拦截）。
