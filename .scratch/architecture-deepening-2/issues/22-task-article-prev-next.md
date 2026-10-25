# 22: 停止改写共享文章 entry 的 prev/next

**What to build:** `getSortedPosts` 现在在排序过程中直接写 `post.data.prevSlug` / `nextSlug` / `prevTitle` / `nextTitle`，会污染同一构建里其他消费者看到的 entry。把上一篇/下一篇改为返回值或独立视图，调用方不再依赖共享对象上的副作用。

**Blocked by:** None（08 已完成）

**Status:** ready-for-agent

- [ ] 找出所有读取 prev/next 的调用方
- [ ] 排序函数不再修改共享 entry
- [ ] 上一篇/下一篇由显式返回值或独立视图提供
- [ ] 文章页上一篇/下一篇不回归
- [ ] 类型检查与页面冒烟
