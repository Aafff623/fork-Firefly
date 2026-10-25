# 12: 评论运行时 mount / dispose

**What to build:** 一个 `comment-runtime` 管理单实例与页面生命周期：`mount(channel, root)` / `dispose()`；Giscus 与 Waline 作为两个 adapter 填入同一个槽。重复 mount 幂等，dispose 后可再次 mount，软导航后不重复挂载。

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `comment-runtime` 负责单实例、页面就绪、清理
- [ ] Giscus 与 Waline 各有一个 adapter，接口一致
- [ ] Waline 的三个启动器收成一个入口；死兜底路径删除
- [ ] 行为测试：重复 mount、dispose、再次 mount、切页
- [ ] 浏览器：文章页与 Dynamic 页各软导航一次，评论正常挂载/销毁
