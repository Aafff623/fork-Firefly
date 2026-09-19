# secrets/ — 本地敏感配置与密钥备份

只记录**分类、用途、存放位置、轮换信息**；任何 Secret 值（Token / Secret Key / 密码）不得写进本文件。

## ⚠️ 2026-09-19 事件：temp/ 整目录丢失后重建

09-19 中午发现整个 `temp/` 目录（含本目录全部密钥文件）从磁盘消失（原因未明，非重启所能造成；回收站为空）。**线上服务不受影响**：CF Worker 的 15 个 secrets 已部署在跑、Supabase 三键仍在 `.env.local`、Vercel env 未动。已重建本目录，**可从记忆/上下文恢复的只有账号与 zone 两个 ID**，其余凭据需按需到对应平台重签（各平台入口见下表）。

## 当前登记（09-19 重建版）

| 文件 | 服务 | 内容 | 状态 |
|---|---|---|---|
| `cf-account-id.txt` | Cloudflare | 账号 ID（acbc3856…） | ✅ 已从记忆恢复 |
| `cf-zone-id.txt` | Cloudflare | threetwoa.live 的 zone ID（aa9084…） | ✅ 已从记忆恢复 |
| ~~`cf-api-token.txt`~~ | Cloudflare | API Token（Workers 部署/DNS 读改/AI 搜索） | ❌ 丢失，**需重建**：Dashboard → My Profile → API Tokens → Create（权限：Workers 部署 + Zone DNS Edit + Zone Rulesets Edit）|
| ~~`cf-r2-api-token.txt`~~ | Cloudflare R2 | R2 S3 API Token（图片上传/删除用） | ❌ 丢失，**下次用到 R2 写操作时重建**：Dashboard → R2 → 管理 API 令牌（对象读和写、限 firefly-comment） |
| ~~`supabase-access-token.2026-09-18.txt`~~ | Supabase | Personal Access Token「Firefly Login」（原 2026-12-17 到期） | ❌ 丢失，**下次改 auth 配置时重建**：supabase.com/dashboard/account/tokens → Generate |
| ~~`google-oauth-client.2026-09-16.json`~~ | Google | OAuth Client 全量快照（firefly-auth-508811） | ❌ 丢失；client_id 已知（…fng 结尾），secret 只存于 Supabase 配置与 Google 侧——**重配 provider 时须在 Google 控制台重置 secret** |
| ~~`cf-worker-secrets.json`~~ | CF Workers | 15 键快照（R2/COS/DeepSeek/StepFun/Supabase 三键等） | ❌ 丢失；**键值仍 live 在 worker 上不受影响**，需要明文时逐键 `wrangler secret list` 对照平台重签 |
| ~~`r2-worker-secrets.json`~~ | CF Workers | R2 五值 bulk 快照 | ❌ 丢失；五值 live 在 worker 上 |
| ~~`vercel-env-production.txt`~~ | Vercel | 生产 env 导出（过渡存档，Vercel 待退役） | ❌ 丢失，不影响（Vercel 退役中） |
| `.env.local`（仓根） | 站点本地 | Supabase 三键（PUBLIC_URL / PUBLISHABLE / SECRET）+ STEPFUN | ✅ 完好（独立文件未受损） |

## 铁规：当轮落盘（persist on receipt）

- 任何凭据在本会话出现，**同一轮内**落盘到本目录；绝不留会话、记忆或回滚缓冲。
- 索取任何凭据**之前**先搜本目录；园主在任何地方给过的即视为已提供，绝不二次索要。
- 不拿密钥敏感性当话题；本目录被 Git 忽略，就是独立开发者的安全边界，界内以方便为先。
  仅两条硬线：**不进 Git 追踪的文件、不离本机**。
- 不可恢复的凭据（一次性显示、只写存储）丢失时，停止翻找，直接请园主重签一份，当轮落盘。
- **09-19 新增教训：本目录丢失 ≠ 服务受损（secrets 已部署在跑），但会堵住后续运维 API 操作——各平台重建入口已列上表，用时按表走。**

## 历史教训

2026-08 R2 图床配置丢失无备份（起因）；09-11 temp 曾被清空一次（supabase-github-oauth secret 等随之丢失）；**09-19 再丢整目录**——同一目录反复丢失，除重建外应考虑：重要凭据在 gitignore 的仓外路径（如盘根或其他盘）留一份冷备。
