# Map · 架构深化

## Destination

把 2026-10-21 架构评审里的五个候选按「小切片」落地；先做页面生命周期，其余候选保持独立，不捆绑。

## Decisions so far

- **01 页面生命周期**：先做基础层 + 一个消费者，不一次性迁移 28 个监听。
  - boot 在 `MainGridLayout`（`Layout.astro` 当前有其他 Agent 的未提交改动，暂不碰）。
  - 首屏 `page:view` 只认领 epoch，不销毁 boot 阶段登记的清理。
  - `TypewriterText` 用 `armPageCleanup` 每页重新武装，作为第一个消费者样板。
  - `PostPage` / `Profile` 暂不迁移：前者是 WIP，后者也在未提交改动里。
- **02 设置模块**：只收「一个键 + 一个布尔副作用」这一类，带结构的设置（主题色 / 壁纸模式 / overlay / 头像框 / 宠物）不进 facade。
- **票的分布**：01 / 02 有票；评论图、检索 seam、文档与 CI 门禁的实测记录在 `temp/reports/project-analysis/2026-10-21-执行复核与计划.md`，不再补票（一次性收口，后续改动会从那份文档长出新的票）。

## Open

- **P2 Waline 懒启动消费者迁移**：完成（监听守卫 + IO 走 `registerPageCleanup`）。
- **P3 评论图**：完成（magic-byte + DELETE HMAC token + 客户端 token Map + R2/COS 抽到 `comment-image-store.ts`）。
- **P4 站内检索 seam**：完成（`retrieveSiteHitsFromPosts` 纯核心 + URL 注入 + fixture 测试）。
- **P5 文档漂移 + CI 门禁**：完成（文档 7 处 + `check:behavior` 进 deploy + v41 dist 进 deploy）。
- **P6** Layout / Profile / PostPage 迁移（被其他 Agent 未提交改动阻塞）。
- **P6-s** 设置模块：完成（`boolean-storage` + `simple-toggles` facade，`DisplaySettingsIntegrated` 9 个开关全部迁移，测试 + 浏览器五项开关实测）。见 `issues/02-task-settings-simple-toggles-facade.md`。
- **P7** 完整 build + 多跳浏览器回归 + 最终审计：完成。
- **审查收口**：三线独立审查（代码 / 安全 / 静默失败）+ 与旧实现逐函数比对，无 Blocker；本次引入的边界缺陷已修并追加提交。残留已收口（token 有效期、索引故障 502、写失败回滚等），只剩上传鉴权 / 限流待园主决策。见 `issues/03-review-followups.md`。
- Pet 运行时：架构评审评级为 Worth exploring，风险最高、当前无用户可见故障；不并入本轮页面生命周期收尾，单独开 effort。

## Review / plan

本次复核与执行计划见 `temp/reports/project-analysis/2026-10-21-执行复核与计划.md`（本地专用）。

## Handoff

交给 Codex 的冷启动交接：`temp/handoff/2026-10-22-architecture-deepening-codex.md`（本地专用，含剩余任务、验收与已知坑）。
