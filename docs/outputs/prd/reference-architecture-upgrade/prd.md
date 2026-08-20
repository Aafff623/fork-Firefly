# PRD：参考站体系借鉴与社区评论升级（approved）

> 状态：**approved**（2026-08-20，用户授权“新分支大胆做、分阶段调试回归、最终 merge/push”）
> 分支：`feat/reference-architecture-upgrade`
> 研究：`docs/outputs/report/reference-architecture-upgrade/2026-08-20-deep-audit.md`

> 实施状态：Phase 0–3 已在功能分支完成并通过本地验收；Phase 4 明确保留为独立候选，不属于本轮上线范围。生产状态以合并 `master` 后的云构建和公开域名复验为准。

## Goal

在不迁移 Firefly 技术栈、不破坏动态时间线的前提下，恢复 GitHub 评论体系，补齐社区/公告/身份入口，并验证文章软跳与评论生命周期。

## Non-goals

- 不把 Astro 迁成 SvelteKit、Next 或 React Router。
- 不复制 AGPL-3.0 参考源码。
- 不在博客仓库里自建账号密码、OAuth、邮件订阅、审核后台或实时论坛。
- 不顺手重构全站 CSS、多渲染器、所有 Swup 监听或部署拓扑。
- 不发布 GitHub Release。

## Context

- 旧 ADR-0001 为了表情/GIF 体验把主评论从 Giscus 切到 Waline，但用户现在明确要求切回 GitHub 评论。
- GitHub Discussions 与历史 repo/category ID 仍有效。
- 动态时间线的评论列表、composer 和 agent 身份直接依赖 Waline，必须保留独立通道。
- 2x.nz 的最新公开演进证明：阅读、论坛、工具最终应按部署和故障域拆分，而不是继续扩大一个前端巨石。

## Acceptance criteria

1. 文章、留言板、友链、赞助等通用评论默认使用 Giscus。
2. `/dynamic/` 的逐条回复继续使用 Waline，列表与发布入口不退化。
3. Giscus 在首次加载、亮暗主题切换、Swup 软导航和 `?path=` 指定讨论路径下正确工作。
4. 首页不请求 Giscus；Giscus iframe 在评论区接近视口或浏览器空闲时再挂载，并有无脚本/超时提示。
5. 新增 `/community/`，包含公告、交流、问答、想法、GitHub 身份和未来独立论坛边界说明。
6. 导航“社交”菜单增加社区入口，原友链和留言仍可达。
7. 更新 ADR、配置文档和交接记录，使治理资产与实现一致。
8. `pnpm check`、`pnpm type-check`、`pnpm build`、现有门禁通过；桌面/移动、亮/暗色和多跳无新增本站错误。

## Constraints

- 只改 Firefly；`ReferenceRepo` 保持只读。
- 使用已有 `Comment` 槽位和 GitHub Discussions，不引入新评论依赖。
- 不恢复旧 Giscus 导航轮询、跨域 data CSS、园主徽章注入等重实现。
- 外部 OAuth/安装/权限改动不做；当前 Discussions 已启用，无需外部写操作。
- 生产只从 `master`，功能分支验证完再合入。

## Allowed actions

- 新分支内修改源码、文档和测试门禁。
- 本地 mock、浏览器/Computer Use、Chrome DevTools trace。
- 按任务拆 commit，push 功能分支，合入并 push `master`。
- 等待并核验云构建与公网；不创建 Release。

## Phases

### Phase 0：基线与决策

- 产出深挖报告、PRD、新 ADR。
- 记录现网基线与证据边界。

### Phase 1：评论双通道

- `commentConfig.type = "giscus"`，恢复已验证 repo/category 配置。
- 给通用 `Comment` 增加显式 service override。
- 动态评论页显式固定 `waline`。
- Giscus 采用轻量 client.js 挂载、延迟加载、主题同步、错误状态和幂等清理。
- Layout 按实际服务预连接，不为未使用的评论后端建连接。

### Phase 2：社区产品层

- 新增 `communityConfig` 和 `/community/` 静态页。
- 导航“社交”增加社区。
- 四类 GitHub Discussions 分别映射公告、交流、问答、想法。
- 明确 GitHub 身份边界和完整论坛的未来拆分条件。

### Phase 3：性能与回归

- 首屏/文章 trace，对比 Giscus 是否离开首页关键路径。
- 主页→文章→文章→返回软跳测试。
- 动态回复路径、留言板、外链与 404 回归。
- 亮/暗色、桌面/移动、reduced-motion 检查。

### Phase 4：后续独立候选，不随本轮上线

- 文章编辑/反馈 CTA。
- `ai_level` schema 与展示。
- spoiler 与 URL card 插件。
- Git revision timeline。
- 独立社区应用：账号、资料、订阅、审核、SEO 补偿与 SSE。

## Verification

| 层级 | 方法 | 完成定义 |
|---|---|---|
| 静态 | `pnpm check`、`pnpm type-check`、门禁 | 0 error；现有断言不退化 |
| 构建 | `pnpm build` | 产物完成；若仅命中已知 OneDrive/Vercel symlink EPERM，分开记录 |
| 浏览器 | DevTools + Computer Use | 评论、社区、导航、主题、移动均可操作 |
| 跳转 | 至少 20-hop 软导航 | URL/DOM/重复 id/控制台错误均无新增 |
| 线上 | 功能分支及 `master` 云状态、公开域名 HTTP(S) | 逐层报告，不把本地 build 写成部署完成 |

## Risks

| 风险 | 控制 |
|---|---|
| GitHub/Giscus 在部分网络不可达 | 明确依赖与错误提示；不删除 Waline 配置，便于回退 |
| 旧文章路径映射产生新 Discussion | 继续使用 `pathname` 和 strict=0，保持历史规则 |
| 动态页被全局 Giscus 影响 | 显式 service override + 动态专项回归 |
| Swup 重挂载重复 iframe/observer | 单 runtime guard、AbortController/cleanup、跨跳计数回归 |
| 社区功能被误认为完整论坛 | 页面明确第一阶段边界；完整论坛留独立 PRD |
| AGPL 许可证污染 | 只采用架构结论，代码从 Firefly 现有实现重写 |

## Rollback

按原子 commit 回滚：文档/ADR、评论双通道、社区页与导航、性能修正分别独立。紧急回退只需把主评论改回 Waline；动态通道本来就继续运行。
