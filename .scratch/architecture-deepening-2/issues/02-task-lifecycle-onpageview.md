# 02: 页面生命周期补 onPageView 与 epoch token

**What to build:** 页面就绪订阅和清理走同一个接口；异步回调能判断自己是否还属于当前页；Waline 懒启动与 agent-avatar 不再各自硬编码 `swup:page:view`。重复 `page:view` 只补 controller，不销毁刚挂好的清理。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `page-lifecycle` 新增 `onPageView(fn)` 与 epoch token / 当前页判断
- [ ] 清理登记仍由 `registerPageCleanup` 负责；重复 `page:view` 不误杀
- [ ] Waline 懒启动与 agent-avatar 迁移到 seam
- [ ] 测试覆盖：订阅、重复 `page:view`、异步回调过期、清理顺序
- [ ] 现有 `test-page-lifecycle` 保持绿
