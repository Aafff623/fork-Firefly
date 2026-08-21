# ADR-0007 · 园主身份使用服务端 GitHub OAuth，本地编辑器默认闭合

- Status: accepted
- Date: 2026-08-21

## Context

Firefly 原有 `admin-auth.ts` 把管理员状态放在浏览器存储中，只适合作为界面偏好，不能授权置顶、编辑、图片写入或删除。参考站的线上编辑器虽然展示了 Markdown 与 Git 写回能力，但把 GitHub App PEM 交给浏览器导入，扩大了私钥泄漏和仓库写权限风险。

本站已经使用 Giscus 承担文章评论、GitHub 登录和 reaction。园主在线维护需要独立的站点会话，但不能冒充 Giscus 会话，也不能重造评论点赞。

## Decision

- GitHub OAuth callback 仅在服务端交换 token，并通过 `GET /user` 返回的 numeric id `182515127` 判定 owner；用户名只用于展示。
- OAuth transaction 使用 state + PKCE；站点会话使用短期 HMAC 签名的 HttpOnly、SameSite=Lax cookie，生产 HTTPS 下增加 Secure。
- mutation 统一校验 owner session、Origin、CSRF、速率、路径、frontmatter、体积以及图片 MIME/file signature。
- 仅编译期 DEV、真实 loopback client/host 且显式 `OWNER_DEV_BYPASS=1` 时，服务端允许签发醒目标记的本地 owner 会话；它不能在生产启用。
- Markdown 编辑器和内容哈希图片先使用本地 DEV provider；保存带 base SHA，冲突返回 409，删除默认移动到可恢复归档。
- 生产 GitHub App provider 默认关闭，在服务端凭据、部署方案和用户批准齐备前返回 `production_git_provider_unconfigured`，不得退化为浏览器 token 或 PEM。
- Giscus `reactionsEnabled: "1"` 保持原生边界，本站 owner OAuth 不读取或伪造评论登录态、reaction 数量。

## Consequences

### 正面

- 浏览器无法通过修改 localStorage、用户名或隐藏按钮获得写权限。
- 阅读、评论和静态部署不依赖编辑后台是否配置。
- 本地可以完整验证身份、CSRF、冲突、图片校验和编辑交互，生产写权限保持 fail closed。

### 负面与待办

- 当前本地图片写入与正文保存是两个操作，不等同于“一次远程 Git commit”；生产 Git tree/commit/ref provider 尚未实现。
- 编辑器右栏是 GFM 快速预览，不等同于完整 Astro/MDX 渲染链；MDX、KaTeX、directive 与代码组必须回文章页复核。
- 真实 OAuth 仍需创建 GitHub OAuth App、设置 server-only secret 并在获批后部署验收。
- 本地 DEV provider 会修改工作区内容，验收写入必须使用专门测试文章或测试副本。

## Verification

- `pnpm check:owner`：静态安全边界、session/CSRF、slug/frontmatter/hash 与本地 API 攻击样本。
- `pnpm check:community`：Giscus 与 Dynamic Waline 双通道不回退。
- `pnpm check`、`pnpm type-check`、目标平台 build：框架、类型与 adapter 链回归。

## Rollback

移除导航 `OwnerAccount` 与 `/owner/editor` 入口即可关闭界面；服务端 mutation route 保持 fail closed。不要恢复 `admin-auth.ts` 的客户端授权。
