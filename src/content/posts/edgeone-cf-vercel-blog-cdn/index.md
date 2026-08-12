---
title: 博客上了 .live：EdgeOne 扛主站，Cloudflare 白嫖图床
published: 2026-08-12
description: 个人博客边缘三件套：Vercel 只构建，EdgeOne 个人版扛主站 CDN，Cloudflare 免费档专管 R2 图床。灰云指 EO、橙云只给 img，现金刚需基本是那个月费。
image: ./cover.jpg
tags: [EdgeOne, Cloudflare, R2, Vercel, CDN, 自定义域名, 图床]
category: 指南
draft: false
lang: ''
slug: edgeone-cf-vercel-blog-cdn
pinned: false
comment: true
---

国内打开 `*.vercel.app` 经常抽风，自定义域名又想少花钱。这一轮把个人博客的边缘架构定成了三件套：**Vercel 只负责构建，EdgeOne 个人版扛主站 CDN，Cloudflare 免费档只干图床和防护**。现金刚需基本就是 EdgeOne 那个月费。

![等轴微缩：主站走边缘加速，图床走对象存储](./images/fig-arch-overview.jpg)

## 一开始想解决什么

三件事，成功标准也很硬：

| 诉求 | 成功样子 |
|---|---|
| 自定义域名 | `https://www.threetwoa.live`（及 apex）可访问、有 HTTPS |
| 国内向能打开 | 不再把推广链接押在被污染的 `*.vercel.app` 上；主站走 EdgeOne |
| 图床 / 防攻击 | 尽量吃 Cloudflare 免费档；主站安全用满已购的 EdgeOne 个人版 |

刻意不做的：未备案硬开「含中国大陆」节点；整站迁 Cloudflare Pages；为了安心去升 EdgeOne 基础版或买 CF Pro；主站再套一层 CF 橙云变成双 CDN。

## 定稿架构：为什么这么拆

```text
访客
  ├─ www / @  → EdgeOne 个人版（灰云 DNS）→ Vercel 源站
  └─ img.     → Cloudflare 橙云 → R2（免出站）
```

原则就几条：

1. **已付钱的用满**：EdgeOne 个人版按月续费 → 主站 CDN + 基础安全全走它。
2. **缺口用 CF 免费补**：R2 免出站流量最香；`img` 子域挂 Free WAF/Bot。
3. **不重复买防护**：主站不买第二份 CDN/WAF。
4. **大图不吃 EO 配额**：评论图走 R2，护住个人版大约 50GB / 300 万次。
5. **少跳数**：主站保持 `访客 → EO → Vercel`，别再绕一圈 CF。

「Cloudflare 大善人」在本站语境里 = **R2 免出站 + 免费防护工具箱**，不是大陆 CDN。国内打开靠的是 EdgeOne。

![灰云只解析，橙云会拦流量：主站必须走左边](./images/fig-gray-vs-orange.jpg)

## Phase 1：主站先通

### 踩过的坑

- **EdgeOne Pages 托管**：构建直接 OOM，放弃。Vercel 仍是唯一构建源。
- **apex 解析**：Name.com 用 ANAME 指 EO 的 `threetwoa.live.eo.dnse2.com`；旧 A 记录（指向 Vercel IP）要删干净，否则 apex 还走老路。
- **「缺 CNAME」误报**：控制台有时抱怨 apex，以实测响应头 `EO-*` 为准，别反复删记录。

### 实际落地

| 项 | 结果 |
|---|---|
| 域名 | Name.com 学生包 `threetwoa.live` |
| Vercel | `www` + apex 绑定 Valid |
| EdgeOne | 个人版；加速区「全球不含中国大陆」；源站用 Vercel 给的 `*.vercel-dns-017.com` |
| DNS（迁 CF 前） | `www` CNAME → `www.threetwoa.live.eo.dnse2.com`；apex ANAME → EO |
| HTTPS | EO 免费证书已部署 |
| 验收 | `www` / apex 200，带头 `EO-*`；对外推广优先 **www** |

仓库侧站点 URL 已切到 `https://www.threetwoa.live`（确认后再 push）。

## Phase CF：吃满免费档

目标：`img.threetwoa.live` 读图 + 新评论图写 R2；主站仍 EO；CF 账单 ≈ $0。

| 步 | 做什么 | 注意 |
|---|---|---|
| CF-0 | 核对 EO 下期续费（体验价还是官价）与自动续费 | 账单可预期 |
| CF-1 | CF 加站 Free；导入 DNS；注册商 NS 改成 CF | **www/@ 必须灰云** |
| CF-2 | R2 桶 + API Token；自定义域 `img`（可橙云） | 密钥只进 Vercel 环境变量 |
| CF-3 | Free 防护作用在 `img` | 别给 www 开橙云 |
| CF-4 | 站内上传优先 R2，COS 回退旧图 | 代码侧已接好 |
| CF-5/6 | Workers 预签名、DNS 面板统一到 CF | 可选；NS 传播中 |

**最危险的一脚**：迁 NS 之后，若把 `www` 点成橙云，流量会被 CF 代理吃掉，已付费的 EdgeOne 主链等于白买。控制台那句「代理 DNS 记录」对主站就是坑。

写稿时 Cloudflare 还在检查 nameserver。传播完之前主站仍应 200；Active 后再开 R2 自定义域最稳。

![控制台实拍：NS 还在校验，先别乱动橙云开关](./images/fig-ns-waiting.jpg)

环境变量（Vercel + 本地）大概长这样：

```text
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=firefly-comment
R2_PUBLIC_BASE_URL=https://img.threetwoa.live
```

收尾验收：`img` 可读；评论上传接口回报 R2 后端；评论区传一张小图；`www` 响应头里仍能看到 `EO-*`。

![评论图进金属盒：R2 管存取，密钥不进前端仓](./images/fig-r2-storage.jpg)

## 钱怎么算

| 项 | 策略 | 估月费 |
|---|---|---|
| EdgeOne 个人版 | 保留续费（刚需） | ¥9.9 或 ¥29.9（以控制台为准） |
| Vercel Hobby / 域名学生包 / CF Free / R2 额度内 | 保留 | $0 |
| 腾讯云 COS | 新图改 R2，降量 | ↓ |
| CF Pro / EO 升档 / 额外 CDN 包 | 默认不买 | — |

超额常见原因：大图误走 EO；结账页顺手勾了搭配包；自动续费涨到官价没注意。

![现金刚需只留那枚 EO 月费，其余额度内白嫖](./images/fig-monthly-cost.jpg)

## 含大陆节点：先挂着

不挡当前上线。门槛大致是域名转出锁、能否备案、ICP 流程本身。通过后**同一套 EdgeOne 个人版**改加速区即可，不必另买一条 CDN。本轮只当后续优化。

## 炸了怎么退

- 主站 DNS 炸了：把 `www` CNAME 改回 Vercel 的 `*.vercel-dns-017.com`。
- 应急直链：原来的 `*.vercel.app`（国内仍可能污染，不推广）。
- 双 CDN / 回源环：主站不经 CF；`img` 不回源到 www。

## 适合谁看

自己买了 EdgeOne 个人版、又想白嫖 Cloudflare R2 的个人站长。若你主站已经全押 CF 橙云，路径不一样，别照搬「灰云指 EO」这句。

## 现场备忘

| 日期 | 决策 |
|---|---|
| 2026-08-11~12 | 放弃 EO Pages；Vercel 唯一构建 |
| 2026-08-12 | Phase 1：EO + `.live` 主站打通 |
| 2026-08-12 | ICP / 含大陆后置 |
| 2026-08-12 | CF 定位：图床 + 免费防护，不是主站调度中枢 |
| 2026-08-12 | 对照 EO 月费权益：主站用满 EO，大图 R2，不重复购防护 |

思路定了就不来回改架构；剩下的是等 NS Active，把 R2 和 `img` 接上，再 Redeploy 一轮环境变量。
