# 参考仓库借鉴第五批 · Spec

## Problem Statement

第五批调研（usememos/memos + antfu/antfu.me，报告在 `temp/reports/batch5/`）定位出 18 项增量，并核实一条我们自己代码里的休眠缺陷（memos-adapter 打已被移除的 API v1 路径）。核心议题：dynamic 的发布面与内容模型如何补薄，以及一批人格化细节补齐。

## Solution

18 项，两组推进：

1. **Memos/动态组（01–09）**：01 修 adapter 休眠缺陷（除雷，最高优先）；02 Memos 混合架构（手机摄入+构建期同步，高成本待托管决策）；03 内容派生属性；04 dynamic tags；05 dynamic 进热力图；06 治理三件套；07 编辑器草稿 autosave；08 构建期链接预览卡；09 小项打包（SSRF 清单/saved-filter/relation/reaction/export 格式）。
2. **antfu.me 组（10–18）**：10 文章页脚父级返回+comment on；11 草稿警示条；12 副标题排版约定；13 `?type=` 可分享筛选；14 Cross-post 声明块；15 JSON Feed+Atom；16 相册双视图；17 小项打包（年份描边标题/省年份/no-copyright/灯箱位移/Intl 徽章/frame=terminal 约定）；18 保留给实施中发现的同源小件。

共用原则：L1 除雷优先；L2 未定托管不开工；N 组纯增量不动设计系统；动效哲学只输入批 2 票 12。

## User Stories

1. 作为园主，打开 memos.enable 不会全站动态挂掉（adapter 与主干 API 对齐）。
2. 作为园主，手机上发表一条碎碎念，几分钟后出现在站点动态时间线。
3. 作为维护者，动态的「类型/是否系统动态」等派生属性写入时算一次，不每次实时反推。
4. 作为读者，动态能按标签检索。
5. 作为读者，热力图里能看到动态的活跃度（不只文章）。
6. 作为维护者，API 变更有 CHANGELOG、设计变更有 Amendments、schema 有版本日历。
7. 作为园主，发文流水线的编辑器草稿不丢（身份键+autosave 模式）。
8. 作为读者，动态/文章里的外链有预览卡。
9. 作为读者，文章页脚能返回父级列表、能去 Bluesky/Mastodon 评论。
10. 作为园主，草稿文章页有醒目警示条，防止误当正式文截屏分享。
11. 作为读者，`h2` 后第一段斜自动成为副标题样式。
12. 作为读者，anime/相册等页的筛选态可以分享（?type=）。
13. 作为园主，转载外部文章有标准声明块。
14. 作为读者，订阅源有 JSON Feed 和 Atom（不只 RSS2）。
15. 作为读者，相册能切 cover/contain 视图且选择被记住。
16. 作为读者，归档页有巨型描边年份分组（视觉决策后）。
17. 作为维护者，代码块写入成帖有 frame=terminal 约定。

## Implementation Decisions

- **01 adapter 修复**：路径 `/api/v1/memos`→`/api/memos`；pageSize 默认改 ≤1000（或分页拉取）；`parent` 改 CEL `creator==`；验证用本地 Memos 新桩或 mock（记录验证方式）；修完 enable 仍默认 false。
- **02 混合架构**：Memos 自托管（VPS/容器/Fly.io/NAS+Tunnel 之一，园主定）；webhook（HMAC 验签）→ CF Worker 端点 → repository_dispatch → CI 重建拉取动态写回仓库；dynamic 仍是静态产物，浏览器零运行时依赖。**不做**浏览器运行时拉取路线。
- **03 派生属性**：写入/构建时算一次（kind/是否系统动态等），落 dynamic frontmatter 或索引；替代 detectDynamicKind 实时反推。
- **04 tags**：dynamic schema 加 `tags: string[]`（可选，缺省空）；Pagefind/索引覆盖补动态检索。
- **05 热力图**：日历组件数据源扩展至 dynamic（现只吃 posts）。
- **06 治理三件套**：API CHANGELOG（docs/agents 或 api 文档）、设计 Amendments（docs/adr 机制已启）、schema 日历版本——低成本的纪律建设。
- **07 autosave**：dynamic-publish/new-dynamic 脚本加草稿身份键+autosave 模式（参考 Memos 编辑器草稿按 scope 自动存）。
- **08 链接预览**：构建期抓外链 meta（og:title/description/image）生成预览卡；超时+失败降级（参照批 2 票 13 纪律）。
- **09 小项包**：SSRF 网段清单（我们 comment-image 上传已有部分防护，补齐文档/断言）、saved-filter 表达式即数据（低）、relation/reaction（低，动态互引/表态）、export 防锁定格式（低）。
- **10 页脚**：`cd ..` 父级返回（按当前列表上下文）+ comment on Bluesky/Mastodon intent 链接（配置开关）。
- **11 草稿警示条**：文章页顶 draft 警示条（我们 draft 目前只是列表角标）；服务草稿箱防误截屏。
- **12 副标题约定**：一条 CSS（`h2 + p > em:first-child` 样式化）；写进成帖规范。
- **13 ?type= 筛选**：anime/相册等页筛选态 replaceState 同步 URL（抄 Search.svelte 先例，批 1 票 10 同模式）。
- **14 Cross-post 块**：frontmatter 或指令生成转载声明（来源+原文链接+作者）。
- **15 JSON Feed+Atom**：RSS 路由族扩展（jsonfeed 1.1 + atom）。
- **16 相册双视图**：cover/contain 切换 + localStorage 持久化。
- **17 小项包**：巨型描边年份标题（需园主视觉决策后做）、当年省年份、no-copyright per-post 开关、灯箱 50ms 位移检测（防误关）、Intl 货币徽章、frame=terminal 写入成帖规范（约定非代码）。
- **18 预留**：实施中发现的同源小件登记位。

## 验收总则

- 每票：本地 `pnpm dev` 关键路径 + `pnpm check && pnpm type-check`；01 加 Memos 通信验证；02 需端到端（手机发→CI 重建→线上出现）演练。
- 全组合并后 `pnpm check:gates` 全绿才进发布确认；push 仍需园主单独授权。
