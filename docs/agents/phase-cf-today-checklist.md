# Phase CF · 今日收尾操作清单（控制台）

> 配合 Plan：`deploy-edge-cf-plan.md`  
> **危险点**：迁 NS 后，`www` / `@` 必须在 Cloudflare 里保持 **DNS only（灰云）**，记录仍指向 EdgeOne。橙云会拆掉 EO 主链。

## CF-0 · EdgeOne 续费（1 分钟）

腾讯云 → EdgeOne → 套餐 / 续费：记下下期金额（9.9 或 29.9）与自动续费开关。

## CF-1 · 加站点到 Cloudflare

1. 打开 https://dash.cloudflare.com → **Add a site** → `threetwoa.live`  
2. 选 **Free**  
3. Cloudflare 扫描 DNS 后，**手动核对**并补齐（全部 **灰云 DNS only**，除非另有说明）：

| 类型 | 名称 | 内容 | 代理 |
|---|---|---|---|
| CNAME | `www` | `www.threetwoa.live.eo.dnse2.com` | **关（灰）** |
| A 或 ANAME | `@` | 与现网一致：ANAME→`threetwoa.live.eo.dnse2.com`；若 CF 无 ANAME，用 A → `43.159.98.112` 与/或 `43.159.99.107` | **关（灰）** |
| TXT | `edgeonereclaim` | 原验证值（可留） | — |

4. Cloudflare 给出两台 NS（如 `xxx.ns.cloudflare.com`）→ 到 **Name.com → Manage Nameservers** 改成 CF 的 NS（去掉 Name.com 默认 NS）  
5. 等 Active（常 5–30 分钟）。期间用 `www` 测站，应仍 200。

## CF-2 · R2 + `img`

1. 左侧 **R2** → Create bucket，名如 `firefly-comment`  
2. **Manage R2 API Tokens** → Create：权限 Object Read & Write（限该桶更佳）→ 记下 **Access Key ID / Secret**  
3. R2 概览右侧复制 **Account ID**  
4. Bucket → Settings → **Custom Domains** → Connect `img.threetwoa.live`  
5. 按提示确认 DNS（通常 CF 自动加 CNAME，**img 可以为橙云**）  
6. 等 HTTPS 就绪  

若自定义域当天来不及：可临时启用 **r2.dev 公网域**（仅过渡），`R2_PUBLIC_BASE_URL` 填该 URL；次日再切 `img`。

## CF-3 · 防护（可选今日）

Security → Settings：对 `img` 保持基础 Free 防护即可；主站 www **不要**开橙云。

## 环境变量（Vercel + 本地 `.env`）

```text
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=firefly-comment
R2_PUBLIC_BASE_URL=https://img.threetwoa.live
```

配好后 Redeploy。仓库已支持：有 R2 用 R2，否则回退 COS。

## 验收

- [ ] `https://www.threetwoa.live` 仍 200，头里有 `EO-*`  
- [ ] `https://img.threetwoa.live/` 或测一张上传图可开  
- [ ] `GET /api/comment-image/` → `{"enabled":true,"backend":"r2"}`  
- [ ] 评论区上传一张小图成功  
