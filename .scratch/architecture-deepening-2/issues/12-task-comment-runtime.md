# 12: 评论运行时 mount / dispose

**What to build:** 一个 `comment-runtime` 管理单实例与页面生命周期：`mount(channel, root)` / `dispose()`；Giscus 与 Waline 作为两个 adapter 填入同一个槽。重复 mount 幂等，dispose 后可再次 mount，软导航后不重复挂载。

**Blocked by:** None (can start immediately)

**Status:** resolved（2026-10-25；浏览器未验证）

- [x] `comment-runtime` 负责单实例、页面就绪、清理
- [x] Giscus 与 Waline 各有一个 adapter，接口一致
- [x] Waline 的三个启动器收成一个入口；死兜底路径删除
- [x] 行为测试：重复 mount、dispose、再次 mount、切页
- [ ] 浏览器：文章页与 Dynamic 页各软导航一次，评论正常挂载/销毁（未验证）

## Result

- 新增 `comment-runtime`：`mount / dispose / register`，单例用 `Symbol.for` 防多 chunk；清理走 `registerPageCleanup`，切页重挂走 `onPageView`。
- Giscus、Waline 各收敛成一个 adapter；Waline 的三个启动路径合并，`waline-boot` 只保留 `bootWalineFromShell` / `disposeWaline`。
- 社区评论门禁从旧字符串断言改为检查 runtime 的 mount/dispose 路径；v41 的 Waline 门禁同步更新。`test-comment-runtime`、`test-page-lifecycle`、社区 9/9、v41 全绿。
- 行为差异：Waline 切页后改为重新走 200px 懒加载（旧路径 page:view 后立即 boot），更省请求但待浏览器复验。
- Giscus 从内联脚本变为打包模块，首次评论页多一个 chunk；需关注交付预算。
