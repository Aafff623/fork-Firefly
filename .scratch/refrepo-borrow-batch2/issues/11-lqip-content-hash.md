# 11: LQIP/缩略图内容哈希新鲜度

**What to build:** 图片占位图按内容判新鲜：现在 `scripts/generate-lqips.ts` 按路径增量，换图（同路径新内容）会静默用过期的 LQIP。改为内容哈希（或内容+路径混合）判定，源图变化即重新生成；顺带核对缩略图管线同问题。

**Blocked by:** None

**Status:** open

- [ ] 哈希键从路径改为内容哈希（或混合）
- [ ] 同路径换图后 LQIP 更新（构造用例验证）
- [ ] 构建耗时无显著回退（增量仍然有效）
- [ ] `pnpm build` 验证 + `pnpm check:gates` 绿

**参考**：`temp/reports/batch2/shirone-borrow.md` 第 9 条（对方缩略图 vite 插件用 hash 判新鲜，避开 CI mtime 陷阱）+ `shirone-arch-perf.md`。上游做法见 `temp/repos/Shirone/src/`（重实现）。
