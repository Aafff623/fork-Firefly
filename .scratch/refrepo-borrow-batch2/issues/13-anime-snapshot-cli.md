# 13: 番剧快照 CLI（keepLastValid/原子写/敏感扫描）

**What to build:** 追番数据从「构建期内联 fetch」改为「快照 CLI + 构建期读快照」：① CLI 拉取外部数据源（现有 anime 页数据源）写快照文件；② keepLastValid——fetch 失败保留上次有效快照，不白屏；③ 原子写（临时文件+rename）；④ 敏感扫描（快照内容不夹带 token/私域信息）；⑤ 构建期只读快照，fetch 失败走降级路径。

**Blocked by:** None

**Status:** open

- [ ] 快照 CLI 上线（含 keepLastValid/原子写/敏感扫描）
- [ ] 构建期改读快照；fetch 失败降级路径有测试
- [ ] 快照文件入库策略明确（是否 commit、放哪）
- [ ] `pnpm build` 验证 + `pnpm check:gates` 绿

**参考**：`temp/reports/batch2/shirone-borrow.md` 第 6 条（对方番剧快照 CLI 三件套；我们现在构建期内联 fetch 无快照无降级）。上游做法见 `temp/repos/Shirone/scripts/`（重实现）。
