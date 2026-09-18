# ADR-0008 · 认证迁移 Supabase Auth（GitHub / Google / 邮箱）

- Status: accepted（取代 [ADR-0007](0007-owner-oauth-and-local-editor.md)）
- Date: 2026-09-18

## Context

ADR-0007 的自研方案（服务端 GitHub OAuth + HMAC 会话 + OWNER_DEV_BYPASS 本地旁路）只有单一登录方式，且需自行维护 OAuth 事务、会话签名与密钥轮换；无法覆盖邮箱与 Google 登录。Supabase Auth（托管 GoTrue）提供 GitHub / Google / 邮箱三 provider、PKCE 与托管会话，项目 `smhkhsffkdwdiitllctw` 自 2026-09-04 起接入开发。

## Decision

- 以 Supabase Auth 为唯一认证源：`@supabase/ssr` + PKCE，服务端 HttpOnly cookie；不使用 middleware，每个路由自建 server client（`src/lib/supabase-auth.ts`）。
- 路由：`/api/auth/{login,callback,password,logout,session}/`；独立登录页 `/login/`；session 响应形状保持 `{authenticated, role, viewer}` 以兼容三消费者（OwnerAccount / OwnerEditor / PostPinAdmin）。
- owner 判定保持服务端常量：GitHub numeric id `182515127` 比对 session identities；其余账号一律 user 角色。不建 profiles 表。
- 旧链（`lib/owner-auth.ts`、`api/auth/github/*`、自研 HMAC 会话、`OWNER_DEV_BYPASS`、旧 check:owner 门禁、GitHub OAuth 专用测试脚本）在新链本地 + 生产验证通过后一次性退役（2026-09-18：`94b6dbd3`、`9a9e8597`）。
- 平台侧配置经 Supabase Management API 维护（PAT 存 `temp/secrets/`，2026-12-17 到期）；`firefly-supabase-keepalive` Worker（6h cron）防免费版 7 天低活跃暂停。
- 邮箱链路当前关闭 Confirm email（面向真实用户的发信依赖自配 SMTP，后置决策）。
- mutation 边界保持：Origin 校验 + 速率限制 + SameSite=Lax；Giscus 评论登录态与本站会话互不读取。

## Consequences

### 正面

- 三种登录方式开箱即用；会话签发/刷新/撤销交托管，自研 OAuth 与 HMAC 代码整体删除。
- 安全细节（PKCE、token 轮换、cookie 策略）由成熟实现承担，本地代码面收敛到薄封装。

### 代价与边界

- 外部依赖：免费版 7 天低活跃暂停（keep-alive 兜底）；auth 自定义域为付费功能，回调经 `<ref>.supabase.co` 域。
- GitHub provider 的 client secret 仅存于 Supabase 配置与 GitHub 侧，本地无明文备份（如需重配须在 GitHub 重置 client secret）。
- 邮箱确认信送达质量取决于 SMTP 配置，未配 SMTP 前不面向真实用户开放注册确认流。
