# Map · 架构深化 第二轮

## Destination

把 2026-10-25 第二轮评审的六个候选落成 `spec.md` + 实现票，并按 frontier 实现未被其他 Agent WIP 挡住的部分；被 WIP 挡住的票保持 open，等对应文件提交后继续。

## Notes

- 流程：Matt `issue → scratch → spec → ticket → implement`；本地 markdown tracker，一票一文件。
- 实现顺序：先 prefactor / 干净区域，再消费方；每票 TDD，最后 `code-review`。
- 不 push；本地 commit 按票切分。其他 Agent 的在制品不碰。
- 相关 ADR：0006（Giscus + Waline 双通道）、0008（Supabase Auth）、0009（Cloudflare 单平台）。本 effort 不改变这些决定。

## Decisions so far

- **设置登记表**（2026-10-25）：重开上一轮「只收布尔开关」的边界，做全量登记表；落地等 `setting-utils` / `Layout` WIP 清掉。
- **API 错误契约**（2026-10-25）：限流统一显式 429（`code` + `Retry-After`）；坏编码与缺参分开；502 不把上游状态码当自己的 code。
- **ArticleIndex 打分**（2026-10-25）：一个打分核心，按 `list` / `search` / `ask` 模式给不同权重；允许搜索/问答排序小幅变化。
- **WIP 边界**（2026-10-25）：只做干净文件；`setting-utils`、`Layout`、`Profile`、`GlyphTitleEffects` 相关票 blocked。
- **评论范围**（2026-10-25）：本轮统一 Giscus + Waline 两个 adapter；Dynamic 内联评论由 React effect 管理，暂不迁；贴纸策略票 blocked。
- **桌宠范围**（2026-10-25）：先抽 animator 并接 SpritePet；Profile 与桌宠的 DOM 边界票 blocked。
- **01 死事件**（2026-10-25，`41d32211`）：6 个组件改 `swup:page:view`，干净文件死监听清掉；WIP 文件保留，浏览器复验待做。
- **02 onPageView**（2026-10-25，`3203bf2e`）：seam 补 `onPageView` / epoch；Waline 懒启动与 agent 头像接入；测试改动待共享 WIP 提交。
- **14 桌宠 animator**（2026-10-25）：核心与假时钟测试落地；未接 SpritePet，15 待做。
- **进行中**：03/04/05（API）、07/08/09（ArticleIndex）、12（评论运行时）由三条实现线推进。

## Not yet specified

- 设置登记表的序列化初始态格式（等 Layout WIP 落地后再定）。
- 贴纸建议客户端对 429 的退避文案与重试节奏（等 sticker-suggest WIP 落地）。
- 桌宠 props 最终保留哪 5 个（等 animator 接入后按真实调用点定）。
- Profile 轮播与桌宠的显式位置/模式接口（等 Profile WIP 落地）。

## Out of scope

- 更换 Giscus / Waline / Supabase Auth / 托管平台。
- Waline 编辑器镜像与上传层的拆分（本轮只做生命周期；另开 effort）。
- Dynamic 内联评论的运行时迁移（React effect 已能清理）。
- public/scripts 经典脚本的 window 级生命周期桥（seam 目前 import 不到；另开 effort）。
- 视觉改版、内容迁移、push / 部署。
- 其他 Agent 未提交文件上的任何修改。
