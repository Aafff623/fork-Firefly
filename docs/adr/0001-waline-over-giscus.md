# ADR-0001 · 评论系统采用 Waline，停用 Giscus

- Status: accepted
- Date: 2026-08-02

## Context

个人站需要在评论区提供**表情选项卡**与 **GIF 搜索插入**（类似 QQ/微博体验）。曾评估三条路径：

1. **Giscus + 父页插图助手**：评论框在跨域 iframe 内，父页无法把贴纸直接写入输入框；第三方图床试通失败后搁置。
2. **Giscus + 父页贴纸面板（仅复制 Markdown）**：身份仍走 GitHub，但插入需手动粘贴，体验差。
3. **Waline（自建 serverURL + Neon/PostgreSQL）**：客户端自带 `emoji` 预设与默认 Giphy `search`，与产品目标一致。Firefly 主题已具备 [`Waline.astro`](../../src/components/comment/Waline.astro) 与配置槽位。

同期已落地的 Giscus 自定义主题、`GiscusAuthStatus` 导航登录态、`public/giscus/*` 等资产，在切换后成为死代码与维护负担。

## Decision

- 站点评论 **`commentConfig.type = "waline"`**，`serverURL` 指向自建 Vercel 服务（Neon 存库）。
- **停用 Giscus 作为线上评论方案**；GitHub Discussions 中的历史评论保留在仓库侧，博客页不再展示。
- **清理本站为 Giscus 定制的脏资产**：导航鉴权组件、自定义主题 CSS、过重的 client 脚本；`Giscus.astro` 仅保留主题多后端所需的精简挂载，且默认不被加载。
- 动图优先走 Waline **表情预设 + Giphy 搜索**。
- 评论框「插图」按钮：Waline 默认 Base64 硬限制 **128KB**；本站用自定义 `imageUploader` + `/api/comment-image`（**腾讯云 COS** 服务端代理，≤5MB）绕过。未配置 `COS_SECRET_ID` / `COS_SECRET_KEY` / `COS_BUCKET` 时大图上传不可用。
- 置顶管理等本地「园主」会话与评论系统解耦（`admin-auth` 新键名，兼容读取旧 `giscus-*` localStorage）。

## Consequences

### 正面

- 表情 / GIF 插入闭环可用，无需破解 Giscus iframe。
- 评论配置与主题 Waline 路径对齐，减少旁路代理与密钥运维。

### 负面 / 风险

- 访客身份从「GitHub OAuth（Giscus）」变为 Waline 登录模式（当前 `login: "enable"`，可匿名）；导航栏原 Giscus 头像/园主标记移除。
- 旧 Discussions 评论不会自动迁移到 Waline；若需迁移需另开任务。
- `serverURL` 须使用 **Production 稳定域名**；带随机 hash 的预览部署 URL 会变，且可能受 Vercel 访问控制影响。
- 主题类型联合里仍保留 `"giscus"` 槽位，避免二次开发分叉过大；**启用前须重新配置 `giscus` 字段并自测**。

### 清理清单（本决策执行时）

| 处理 | 路径 / 项 |
|---|---|
| 删除 | `src/components/controls/GiscusAuthStatus.svelte` |
| 删除 | `public/giscus/theme-*.css` |
| 精简 | `src/components/comment/Giscus.astro`（去掉园主徽章/自定义主题脚本） |
| 移除配置 | `commentConfig.giscus` 运行时配置块 |
| 解耦 | `src/utils/admin-auth.ts` 键名与注释 |

## Notes

- 官方表情 CDN：`@waline/emojis@1.4.0`（不必整仓克隆进博客）。
- Giphy：Waline 客户端默认集成；生产高流量时再替换自有 API Key（见 Waline Cookbook · search）。
- 评论大图：腾讯云 COS（`COS_SECRET_ID` / `COS_SECRET_KEY` / `COS_BUCKET` / `COS_REGION`，可选 `COS_PUBLIC_BASE_URL`）；Bucket 公共读、禁止匿名写；密钥仅服务端。
- 关联：`docs/outputs/commit-history/master/2026-08-02-ui-giscus-widgets.md` 记录的是切换前合入摘要，不作为现行架构依据。
