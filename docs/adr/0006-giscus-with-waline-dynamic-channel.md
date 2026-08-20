# ADR-0006 · 主评论恢复 Giscus，动态回复保留 Waline

- Status: accepted
- Date: 2026-08-20
- Supersedes: ADR-0001（仅主评论选择；Waline 动态通道与图床能力继续保留）

## Context

用户要求博客回到基于 GitHub 的评论体系。仓库 `Aafff623/fork-Firefly` 的 Discussions、repo ID 与 Announcements category ID 仍有效，历史讨论无需迁移。

Firefly 的动态时间线不是普通文章评论：父页直接读取 Waline API，写作框通过 `/dynamic/comments/?path=...` iframe 提交，并与 agent 身份、折叠回复和发布后刷新联动。把全局评论类型简单切成 Giscus 会破坏这条链。

旧 Giscus 实现还叠加了跨域自定义 CSS、园主徽章注入、导航登录态轮询和重复 Swup 挂载。它们不是恢复 GitHub 评论的必要条件。

## Decision

- 通用评论默认使用 Giscus，映射规则保持 `pathname`。
- `Comment` 组件支持页面级 `service` 覆盖；动态评论 iframe 固定使用 Waline。
- Giscus 使用官方 `https://giscus.app/client.js`，接近视口或浏览器空闲时挂载。
- Giscus runtime 必须具备幂等挂载、主题同步、超时提示和 Swup 换页清理。
- 不恢复旧导航 GitHub 登录轮询、data URL 主题 CSS 和 iframe 内园主样式注入。
- Layout 只为当前页面实际使用的评论服务预连接；首页不因评论配置产生 Giscus/Waline 连接。

## Consequences

### 正面

- 文章讨论回到 GitHub 身份、通知、审核和历史 Discussions。
- 不新增评论后端、数据库或 OAuth 维护面。
- 动态页已有回复体验不退化。
- 评论第三方资源退出首页关键路径。

### 负面与风险

- GitHub 不可达或没有 GitHub 账号的访客无法评论，页面必须显示明确失败提示和 Discussions 直达链接。
- 同站存在两个讨论通道，需要通过组件 override 和文档保持边界清楚。
- Waline 表情、GIF 和自定义图片上传不再出现在普通文章评论中，但动态回复仍保留。

## Rollback

紧急回退只需把 `commentConfig.type` 改回 `waline`。不要移除动态页的显式 Waline override，除非同时回滚动态评论实现。
