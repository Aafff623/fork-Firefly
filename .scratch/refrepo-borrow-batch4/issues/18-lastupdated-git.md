# 18: lastUpdated git 化（暂缓票）

**What to build:** 文章「最后更新」时间从 git 历史派生（一次 git log 流式解析全量页面）。**本票暂缓，暂缓原因（三份报告两份倾向不搬）**：① 与本站「发布时间=发布动作时间」口径冲突（CONTEXT.md 方案 A），cascade 回写口径待园主定；② `deploy-cf.yml` checkout 无 fetch-depth（浅克隆）会全错；③ `.git` 实测 2.88GB，全量拉取成本不可接受；④ `updated` 现在纯手写且 new-post.js 不生成。

**Blocked by:** None（暂缓，待园主定文章时间口径后再评估）

**Status:** open（暂缓/观望型）

- [ ] 园主对「文章时间口径」的决策记录（git 派生 vs 手写 vs 混合）
- [ ] 若做：CI fetch-depth 方案 + .git 体积问题解法（如 API 按需取）
- [ ] 若做：cascade 回写口径明确
- [ ] 实现与验证（解封后）

**参考**：`temp/reports/batch4/vitepress-arch-perf.md`（建议抄但列了三坑：fetch-depth:0、草稿箱无 git 历史回落 published、cascade 口径待定）vs `vitepress-borrow.md` 第 4 条（最大风险：.git 2.88GB 不建议全量拉）vs `vitepress-features.md`（建议不搬：与发布动作时间口径冲突且 CI 浅克隆失真）。上游 `temp/repos/vitepress/`（getGitTimestamp.ts:109-137 思想）。
