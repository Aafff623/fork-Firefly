# PRD：文章原子跳转与园主在线维护（approved）

> 状态：approved（2026-08-20，继承用户“新分支大胆做、分阶段调试回归”的授权）  
> 分支：`perf/atomic-article-navigation`  
> 研究：`docs/outputs/report/article-transition-performance/2026-08-20-2x-current-research.md`、`docs/outputs/report/owner-auth-editor/2026-08-20-lvy010-admin-editor-research.md`

## Goal

在保留 Astro 静态文章、现有视觉与 Giscus 社区体系的前提下，完成两条主线：

1. 文章卡片点击后，旧列表保持原位，目标文章准备完成后一次提交 URL、文章 DOM 与顶部位置；热路径达到可感知的毫秒级，冷路径不出现“旧页先回顶再等待”。
2. 增加 GitHub 登录与园主在线维护入口；`Aafff623` 通过不可变 GitHub numeric user id 被识别为 owner，本地开发仅在 DEV 环境拥有受控管理员会话；文章正文、frontmatter 和图片通过服务端原子 Git 变更写回。

同时完成用户指定的小型体验修正：时钟次要数字降权、暗色 Grok 头像分离、Footer 五栏降亮、桌宠动作与寻路升级、标签球略加速、导航旁增加登录入口。

## Non-goals

- 不迁移到 Vue、Vuetify、SvelteKit 或 Next.js。
- 不把全站 Markdown 打进一个客户端大 bundle。
- 不复制 2x.nz 的 AGPL 代码、lvy 站生产 chunk、文案或视觉资产。
- 不在浏览器读取、缓存或签发 GitHub App PEM / installation token。
- 不同时建设邮箱 magic-link、密码注册、完整论坛、公告后台或个人中心数据库。
- 不用客户端 `localStorage`、用户名字符串、隐藏按钮或 URL 参数授予 owner。
- 不发布 GitHub Release；生产 OAuth、secret、部署与外部写入必须另行确认。

## Context

- 内置浏览器实点：本地首页首卡点击约 `3.09s`；从 `scrollY≈2600` 点击文章约 `3.10s`；返回首页约 `10.03s`。这些是当前本地开发环境的交互样本，不冒充公网 p75。
- 2x.nz 现网的关键优势不是每次冷点击都毫秒级，而是目标未就绪前旧列表不动；冷样本约 `916ms`，同文章热命中约 `20ms`，隔离冷样本也可能超过 `5s`。
- Firefly 当前导航 WIP 已把文章回顶延到 `content:replace`，但 review 发现：URL 仍可能先提交、popstate 文章位置会被强制归零、非关键 UI 未让路、门禁只做源码字符串检查。
- Firefly 已有 Giscus + Discussions 社区层；评论 reaction 继续由 GitHub/Giscus 承载。
- lvy 站值得学习 Markdown、图片哈希和 Git tree/commit/ref 原子写入；其浏览器 PEM 认证违反 GitHub App 私钥安全边界，禁止迁移。

## Acceptance criteria

### A. 文章导航

1. 首页在任意非零滚动位置点击文章，目标内容未准备好前，旧 DOM 与滚动位置保持不变。
2. 新文章 DOM 提交后立即处于顶部；不出现平滑回顶拖动、旧页回顶或中间空白。
3. 浏览器返回/前进恢复历史滚动位置；hash 导航不被文章回顶逻辑覆盖。
4. 导航失败保留旧页面、原滚动位置和可操作状态，并提供非阻塞错误反馈。
5. `pointerenter`、`focus`、`touchstart` 只预取目标文章；并发最多 2，`Save-Data`、2G、后台页签退避。
6. 从 pointerdown 到文章首屏稳定，首页宠物、标签球、壁纸动效、非目标图片解码和非关键 observer 进入 navigation pause，提交后恢复。
7. 本地最终构建：热点击中位数 ≤150ms，冷点击 P90 ≤800ms；若网络/机器无法达标，必须报告分段瓶颈，不得用动画掩盖。
8. 20 跳覆盖首页→文章、文章→文章、返回、前进、hash、失败；错误 0、重复 ID 0、监听/observer/iframe 不增长。

### B. 视觉与桌宠

1. `SurpriseClock` 主数字保持清晰；相邻数字增加轻微 blur、降低 opacity/saturation，暗色与亮色均可辨但不抢主视觉。
2. 暗色 Grok Bot 的 SVG 不再是黑对黑；轮廓、底板和边框满足清晰分离。
3. Footer 五栏默认文字与图标降亮，hover/focus 恢复可读对比；键盘焦点不被弱化。
4. 标签球 idle 速度小幅增加，reduced-motion 仍静止或显著降速，空闲 CPU 不明显回退。
5. 桌宠使用稳定时间基准，帧只在索引变化时更新；动作 clip 完整结束再切换；路径按距离、近期访问、指针、视口边缘、滚动方向和停留权重选择，导航期间暂停。

### C. GitHub owner 与在线维护

1. 导航主题按钮旁有明确 GitHub 登录/账户入口；访客、普通 GitHub 用户、owner 状态文案不同。
2. OAuth callback 在服务端验证 state + PKCE，调用 `GET /user` 后用 numeric `OWNER_GITHUB_ID=182515127` 授权；UI 可显示 `Aafff623`，授权不依赖用户名。
3. 会话使用短期 HttpOnly、Secure（生产）、SameSite cookie；浏览器存储和公开 bundle 中没有 OAuth token、PEM、installation token 或服务端 secret。
4. 本地管理员默认只在 `import.meta.env.DEV` 且 loopback 生效，并有醒目标识；生产不能通过客户端开关启用。
5. 所有 mutation API 统一做 owner、Origin/CSRF、速率、路径 allowlist、schema、体积和 MIME/file signature 校验。
6. 编辑器使用 Markdown 源码 + 同渲染链预览；支持 heading/bold/italic/code/quote/link/image、键盘工具栏和选区右键菜单；触控与键盘有等价入口。
7. 图片粘贴/拖放使用 SHA-256 内容寻址和去重；SVG 默认拒绝，失败不丢正文。
8. 正文、frontmatter、图片和索引在一次 Git commit 中成功或失败；保存携带 base SHA，冲突不得静默覆盖。
9. 删除默认软删除/归档并可恢复；真正远程删除必须二次确认并走单独分支/PR。
10. Giscus 登录、评论和 reaction 保持 GitHub 原生边界；本站 OAuth 不伪装成 Giscus 登录，也不制造虚假计数。

## Constraints

- 只改 Firefly；`ReferenceRepo` 保持只读。
- 使用现有 Astro adapter 与静态内容 schema，不改变生产入口。
- 生产仍从 `master`；功能分支验证后再讨论合并。
- 保留现有 Giscus/Waline 双通道和 `/community/`。
- 所有 secret 仅以变量名进入 `.env.example`，不得读取、输出或提交真实 `.env` 内容。
- 工作区存在其他历史 WIP 时只收编与本目标直接相关的改动。

## Allowed actions

- 在当前功能分支修改源码、测试、文档和本地 mock。
- 使用 Codex 内置浏览器做桌面/移动、亮/暗色、交互与性能验收。
- 使用本地 mock 验证 OAuth/session/Git 写入协议，不创建真实 OAuth App、不上传 secret、不触发生产提交。
- 产出 commit 拆分建议；执行 commit/push 前遵循工作区全局批准门。

## Phases

### Phase 0：研究与基线

- 完成 2x.nz 最新文章、现网 bundle、公开仓库和 Firefly 跳转链路对比。
- 完成 lvy010 公开仓库、线上编辑产物、安全与许可证核验。
- 用内置浏览器记录目标站与本地站实际点击顺序和本地基线。

### Phase 1：导航正确性与优先通道

- 先补行为级回归：非零滚动点击、popstate、hash、失败保页。
- 修正文章访问谓词和 Swup history/scroll contract。
- 删除旧页阶段的布局/回顶工作；新 DOM 提交后一次布局与即时定位。
- 引入统一 `firefly:navigation-priority` 状态，暂停/恢复非关键模块。
- 将目标文章意图预取收敛为并发 1–2 的去重队列。

### Phase 2：小型视觉与桌宠

- 时钟、Grok、Footer、标签球分别做最小 CSS/常量改动。
- 桌宠先为时序和路径评分补测试，再改播放与寻路。
- 每个模块单独回归 reduced-motion、移动端与重复软导航。

### Phase 3：认证入口与 owner 会话

- 新增登录/账户 UI、`/api/auth/github/start`、callback、session、logout。
- 先用 mock provider 跑完整 state/PKCE/owner/普通用户/过期会话测试。
- 统一替换可伪造的 `admin-auth.ts` 客户端授权；旧 localStorage 仅作为迁移清理对象，不能参与授权。

### Phase 4：Markdown 编辑与 Git 原子写入

- 新增 owner-only 编辑路由、schema 表单、预览和 selection transform。
- 新增图片哈希上传、草稿恢复、保存前 diff。
- 服务端 Git provider 先 mock，覆盖 base SHA 冲突、原子 commit、失败回滚。
- 生产 provider 只接收 server-only credential；默认开分支/PR。

### Phase 5：删除、右键与评论边界

- 软删除/恢复；远程硬删除保持确认门。
- 右键菜单复用 selection transform；补触控/键盘路径。
- 验收 Giscus comment/reaction 未被本站会话破坏。

### Phase 6：全量回归与治理

- `pnpm check`、`pnpm type-check`、目标平台 build、现有门禁与新增行为测试。
- 桌面/移动、亮/暗、reduced-motion、20 跳、慢网/失败、无 JS 基线。
- 清理本任务临时资产，更新 README/CONTEXT/ADR/运维文档与 handoff。
- 给出原子 commit 计划；获批后 commit/push，生产与 secret 仍单独确认。

## Verification matrix

| 层级 | 方法 | 完成定义 |
|---|---|---|
| 单元 | Vitest/现有脚本 | 导航谓词、预取队列、宠物 clip/路径、session/CSRF/schema/Git provider 全绿 |
| 行为 | 内置浏览器 CUA + DOM 断言 | 四阶段时刻、滚动恢复、失败保页、视觉/交互均可复现 |
| 性能 | 本地最终构建 20 跳，冷/热分组 | 报中位、P90、最大值和网络命中；不拿 dev 单次代替最终结论 |
| 安全 | 静态 secret 扫描 + mock 攻击用例 | 客户端伪造、路径穿越、超限图片、过期/普通会话均被拒绝 |
| 构建 | Astro check、type-check、Vercel/EdgeOne 链 | 分阶段记录；OneDrive symlink EPERM 与代码编译结果分开 |
| 线上 | 仅在用户批准后 | Production=`master`、云构建、DNS/SSL、公开域名和真实 OAuth 逐层验收 |

## Risks and rollback

| 风险 | 控制 | 回滚 |
|---|---|---|
| Swup 私有时序与插件升级变化 | 行为测试锁定用户可见合同，不锁源码字符串 | 回退导航 commit，保留研究和测试 |
| 暂停动效后未恢复 | 引用计数 + timeout fail-safe + 20 跳检查 | 关闭 priority pause，保留原子滚动 |
| OAuth 配置缺失 | 登录入口明确“未配置”，DEV mock 独立 | 关闭 feature flag，不影响阅读 |
| Git 写入冲突或部署失败 | base SHA、默认 PR、失败保留草稿 | 不更新 ref；撤销 PR/commit |
| 在线编辑扩大攻击面 | server-only token、owner/CSRF/Origin/限流/校验 | 关闭 mutation feature flag，静态站继续运行 |
| 桌宠升级增加 CPU | 帧索引去重、可见性/导航暂停、reduced-motion | 回退 pet commit，不影响导航 |

## Commit plan（仅建议，未获批不执行）

1. `docs(architecture): define navigation and owner workflow`
2. `test(navigation): cover atomic scroll and history behavior`
3. `perf(navigation): prioritize article transitions`
4. `style(ui): tune clock profile footer and tag sphere`
5. `perf(pet): improve animation timing and roaming`
6. `feat(auth): add GitHub owner sessions`
7. `feat(editor): add atomic Markdown publishing`
8. `test(regression): verify navigation auth and editor`
9. `docs(ops): update owner publishing operations`

## Implementation status（2026-08-21）

| 范围 | 状态 | 证据与边界 |
|---|---|---|
| 2x.nz / Firefly 点击链路研究 | 完成 | 热命中约 20ms、常规冷样本约 916ms；结论落在配套研究报告 |
| 文章原子换页与即时回顶 | 完成，最终产物行为验证 | 1.5 秒强制慢网下旧页保持 `scrollY=879`；URL、文章 DOM、`scrollY=0` 在同一 rAF（`2368.0ms`）提交；Back/Forward 分别恢复 `879px` / `900px`；专项门禁 18/18 |
| 时钟 / Grok / Footer / 标签球 / 桌宠 | 完成 | UI motion 门禁 9/9，桌面浏览器完成暗色头像、Footer 与桌宠抽样 |
| GitHub owner session | 本地完成 | numeric id、state + PKCE、HttpOnly session、CSRF/Origin/限流测试通过 |
| Markdown / 图片 / 软归档 | DEV provider 完成 | base SHA 冲突、图片 signature、SVG 拒绝和编辑器页面契约通过 |
| 生产 GitHub 原子发布 | 未启用 | 缺 server-only GitHub App 配置与部署批准；当前明确 503 fail closed |
| 真实 OAuth / 公网验收 | 未执行 | 创建 OAuth App、secret、commit/push、部署均需要用户单独批准 |

### Fresh-context failure evidence

- 内置浏览器普通冷点击样本：旧首页保持原位，目标 URL、文章 DOM 与 `scrollY=0` 同时出现，点击到提交约 `781ms`（本地单样本，不冒充公网 p75）。
- 最终产物 1.5 秒请求延迟注入：等待期 URL/首页 DOM/`scrollY=879` 均不变，提交时三项在同一可绘制帧 `2368.0ms` 出现；无旧 DOM + 新 URL 的中间帧。
- 最终产物历史回归：Back 恢复首页 `879px`，Forward 恢复文章 `900px`，history index 在 `1 ↔ 2` 间正确切换且不重复压栈。
- 停止本地服务后点击未缓存文章：`2.3s` 后 URL 仍为 `/`、旧首页 DOM 存在、滚动位置从 `≈740px` 保持不变，并出现非阻塞失败提示。
- 返回/前进与 hash 继续排除文章强制回顶；导航优先状态在 success、abort、fetch error 与 15 秒 fail-safe 均恢复。
