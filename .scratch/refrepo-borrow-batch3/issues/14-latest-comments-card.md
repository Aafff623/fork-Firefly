# 14: 最新评论侧栏卡

**What to build:** 侧栏「最新评论」卡：复用批 1 票 08 的构建期 fetch + token 模式打 Giscus API（Discussions），取最近 N 条评论（作者/摘要/文章链接/时间）；失败回退隐藏卡片；按 sidebar 开关体系接入。

**Blocked by:** None（与批 1 票 08 的 GitHub 卡模式相同，可并行或等其模式落地后照抄）

**Status:** open

- [ ] 构建期取评论脚本（Giscus/Discussions API，token 环境变量）
- [ ] 侧栏卡片组件 + 开关
- [ ] 失败降级（隐藏卡片，不白屏）
- [ ] 本地构建验证卡片内容
- [ ] `pnpm check && pnpm type-check` 绿

**参考**：`temp/reports/batch3/butterfly-borrow.md` 第 6 条（复用批 1 #08 构建期 fetch+token 模式）。上游 `temp/repos/hexo-theme-butterfly/`（思想迁移）。
