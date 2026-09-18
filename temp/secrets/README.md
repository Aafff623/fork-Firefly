# secrets/ — 本地敏感配置与密钥备份

只记录**分类、用途、存放位置、轮换信息**；任何 Secret 值（Token / Secret Key / 密码）不得写进本文件。

## 铁规：当轮落盘（persist on receipt）

（tta-init 2026-09-15 立规，起因见文末历史教训）

- 任何凭据在本会话出现，**同一轮内**落盘到本目录；绝不留会话、记忆或回滚缓冲。
- 索取任何凭据**之前**先搜本目录；园主在任何地方给过的即视为已提供，绝不二次索要。
- 不拿密钥敏感性当话题；本目录被 Git 忽略，就是独立开发者的安全边界，界内以方便为先。
  仅两条硬线：**不进 Git 追踪的文件、不离本机**。
- 不可恢复的凭据（一次性显示、只写存储）丢失时，停止翻找，直接请园主重签一份，当轮落盘。

## 约定

- 文件直接放在本目录（历史文件为平铺命名，保留原名；新文件用 `<用途>.<日期>.<ext>`）。
- 有脚本按文件名引用（`temp/scripts/cf-deploy-check.py`、`r2-s3-verify.mjs`、`cf-zone-archive-redirect.py` 等），**改名或移动前先改脚本**。
- 轮换后更新本文件的「当前登记」与轮换日期，旧文件删除或改名归档。

## 当前登记

| 文件 | 服务 | 内容 | 最近更新 |
|---|---|---|---|
| `cf-account-id.txt` | Cloudflare | 账号 ID | 2026-09-13 |
| `cf-api-token.txt` | Cloudflare | API Token（DNS/部署等，早期发放） | 2026-09-13 |
| `cf-r2-api-token.txt` | Cloudflare R2 | R2 S3 兼容 API Token（09-15 新签，S3 五值验证通过） | 2026-09-15 |
| `cf-worker-secrets.json` | Cloudflare Workers | worker secrets bulk 快照（14 键：R2/COS/DeepSeek/StepFun/GitHub OAuth/Owner Session/Supabase） | 2026-09-14 |
| `r2-worker-secrets.json` | Cloudflare Workers | R2 五值 bulk（R2_ACCOUNT_ID / ACCESS / SECRET / BUCKET / PUBLIC_BASE_URL，已 live） | 2026-09-15 |
| `google-oauth-client.2026-09-16.json` | Google Cloud OAuth | Google OAuth Client 全量快照（client_id + client_secret + redirect_uris + JS origins；Dashboard 下载原文件，项目 firefly-auth-508811，Web 应用） | 2026-09-16 |
| `supabase-access-token.2026-09-18.txt` | Supabase | Personal Access Token「Firefly Login」（Management API `api.supabase.com`，account 级全项目；**2026-12-17 到期**，到期需重签换本文件首行） | 2026-09-18 |
| `vercel-env-production.txt` | Vercel | 生产环境变量快照（导出产物，无 Supabase 值） | 2026-09-14 |

### 待更新（2026-09-16 标注）

- ~~`cf-worker-secrets.json` 中 Supabase 三值属死值~~ → **09-16 晚项目已 Resume**（ref `smhkhsffkdwdiitllctw` 不变，实测 key 有效），三值重新有效、无需替换；部署新代码时同步核对 CF secrets 与 Vercel env（Vercel 目前缺 `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_PUBLISHABLE_KEY`）。
- ~~同文件里的 `GITHUB_OAUTH_CLIENT_ID/SECRET` 是旧手写 OAuth 链的凭据；若旧 GitHub OAuth App 仍在，可复用（改 callback 指向新 Supabase 项目），凭据无需重签。~~
  → **09-18 旧链已退役**（`9a9e8597` 删除 owner-auth.ts / github/start / github/callback 三文件）；**09-18 晚 CF secrets 已实际 prune**：`GITHUB_OAUTH_CLIENT_ID/SECRET`、`OWNER_DEV_BYPASS`、`OWNER_SESSION_SECRET` 四键从 worker 删除（19→15，删后线上 session/comment-image 实测正常）。`cf-worker-secrets.json` 作为历史快照仍保留旧值，不再对应线上实际配置。
- 旧链退役时（`OWNER_SESSION_SECRET`、`GITHUB_OAUTH_*` 从代码删除）同步清理此快照。→ **09-18 已执行**（代码侧 + CF 侧双侧完成，见上条）。
- **GitHub 侧备注**：旧链 OAuth App「firefly owner auth」在 GitHub 仍存在（现已无引用，可留可删）；「Firefly Supabase Login」的 client secret **本地无明文备份**（只存于 Supabase 配置与 GitHub 两侧），如未来需重填 provider，须在 GitHub → Developer settings 重置 client secret 后再粘入 Supabase。

### 未登记但有出处

- `.env.local`（仓根，gitignore）：站点的本地运行配置，含 Supabase 三值（09-16 项目恢复后重新有效）、StepFun / DeepSeek / R2 / COS 等；变更时同步备份到本目录。

## 历史教训

2026-08 曾发生 R2 图床配置丢失且无备份、回收站已清空的事故，排查成本极高。规则：**密钥在初始配置时就地沉淀一份到本目录**，之后每次变更同步更新。
