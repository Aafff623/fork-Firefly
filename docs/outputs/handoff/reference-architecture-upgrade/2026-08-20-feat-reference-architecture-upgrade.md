# Handoff：参考站架构借鉴与社区评论升级

> 日期：2026-08-20
> 分支：`feat/reference-architecture-upgrade` → `master`
> 状态：已完成 6 个原子提交，经 `70c948eb` 合并并推送 `master`；Vercel Production 与公开域名验收通过

## 交付内容

1. 深读指定 Cursor session、6 个子任务、ReferenceRepo/fuwari、6 份参考报告，以及 2x.nz 现网、迁移文章与公开仓库。
2. 拒绝无收益的 Astro→SvelteKit/Next 重写，采用“静态阅读站 + 成熟身份评论 + 独立社区边界”的架构。
3. 文章与留言板默认 Giscus；Dynamic 内联回复显式保留 Waline。
4. 新增 GitHub Discussions 社区页、公告/交流/问答/想法分区和 GitHub 个人中心入口。
5. Giscus 延迟挂载并清理 Swup 生命周期；Waline 样式只在 Dynamic 评论页运行时加载。
6. 同步 ADR、README、CONTEXT、配置/组件说明、知识库存量文档和专项门禁。

## 本地验收

| 层 | 结果 |
|---|---|
| Astro check | 0 error，12 个既有 hint |
| TypeScript | 通过 |
| Biome（16 个触达代码文件） | 通过 |
| 评论/社区专项 | 9/9 |
| 既有 V4.1 门禁 | 29/29 |
| 预渲染 | 85 HTML、250 图片完成 |
| Pagefind | 28 页、8127 词、14 文件同步 |
| 文章资源 | Giscus 1、Waline 脚本/CSS 0 |
| Dynamic mock | Waline shell/panel/style 1、Giscus 0；没有提交数据 |
| 20-hop Swup | 20/20；0 错误、0 重复 ID、Giscus 最大 1、0 Waline 泄漏 |
| 软跳 | 中位 291ms、P90 414ms、最大 505ms（本地无节流） |
| 文章直达 | LCP 1.346s、CLS 0.00（本地无节流） |
| 社区移动 Lighthouse | Accessibility 100、SEO 100、Agentic Browsing 100；Best Practices 81 仅因 HTTP |

## 生产验收

| 层 | 结果 |
|---|---|
| Vercel Preview | `76eee43f`，7 分钟完成，`Ready` |
| Vercel Production | deployment `dpl_CRSR2NSbwtWTW8e6HuA74nLshdih`，6 分钟构建完成，`Ready` |
| 域名与 HTTPS | `http://threetwoa.live/` 308 到 `https://www.threetwoa.live/`；HTTPS 200 |
| 首页资源 | Giscus 0、Waline 0 |
| 社区页 | HTTPS 200；四个 Discussions 分区正确；移动主内容横向溢出 0；评论资源 0 |
| 文章页 | Giscus host/frame 1；官方 `client.js`；Waline shell/style 0；暗色切亮色后 iframe 仍为 1 |
| Dynamic mock | Waline shell/panel/style 1；Giscus 0；重复 ID 0；没有提交数据 |
| 公网 10-hop | 10/10 路径正确；重复 ID 0；Giscus 最大 1；控制台 error/warn 0 |
| 公网软跳 | 8 次 `swup:page:view` 中位 298ms、P90 561ms、最大 561ms |
| 公网文章直达 | LCP 2.345s、CLS 0.00、TTFB 742ms（桌面、无节流、单次实验室观测；无 CrUX） |

## 提交与工作区边界

- 原子提交：`f94305fc`、`57b57e78`、`7d3ab840`、`265905ff`、`25e20058`、`76eee43f`；合并提交：`70c948eb`。
- `ReferenceRepo/fuwari` 始终只读且保持干净。
- `fork-Firefly.wiki` 中 13 个既有修改与 1 个未跟踪文件不属于本任务，未覆盖、未清理、未提交。
- 本任务生成的临时参考克隆已移入回收站；本地预览进程与 4321/4322 监听已停止。

## 已知边界

- `pnpm build` 的 Astro/Vite、路由、图片均完成；`@astrojs/vercel` 最后复制依赖时在 OneDrive 软链接命中 Windows `EPERM`。这不是页面编译失败，也不能据此声称云部署成功。
- Computer Use 因无法在 Windows 上高置信确认 Chrome URL 而主动中止；最终 UI 验收由 URL 可确认的 Chrome DevTools 完成。
- 本轮没有自建账号密码、OAuth、邮件订阅、实时论坛或 Release；这些能力必须作为独立社区应用重新做安全、隐私、SEO 和运维评审。
- 参考站新仓库为 AGPL-3.0；本轮只采用公开架构结论，没有复制其代码。

## 回滚

优先按原子 commit 回滚。紧急情况下把 `commentConfig.type` 改回 `waline` 即可恢复旧主评论；Dynamic 本身一直保留 Waline。社区页可通过 `siteConfig.pages.community` 和导航项关闭，不影响文章发布链。
