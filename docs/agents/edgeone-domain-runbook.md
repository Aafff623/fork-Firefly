# EdgeOne + 国内域名 + Cloudflare 操作清单

> **策略**：见完整 Plan → [`deploy-edge-cf-plan.md`](./deploy-edge-cf-plan.md)  
> **策略摘要（2026-08-12）**：核心诉求 = 自定义域名 + EdgeOne 国内向加速 + **尽量吃满 Cloudflare 免费档**（图床 R2 / 防护）。  
> 少花钱/权益 → [`architecture-cost-optimized.md`](./architecture-cost-optimized.md)  
> **Phase 1**：**已通** — 主站 EdgeOne「不含大陆」→ Vercel。  
> **Phase CF（当前）**：R2 + `img` 橙云；主站不强制进 CF。  
> **Phase ICP（后续优化）**：→ `edgeone-mainland-icp-plan.md`。  
> 推广：`https://www.threetwoa.live`。

## 本质诉求（对齐）

| # | 诉求 | 承担方 | 状态 |
|---|---|---|---|
| 1 | 自定义域名 | Name.com + 绑 Vercel/EdgeOne | ✅ |
| 2 | 国内向加速 | EdgeOne CDN | ✅ Phase 1（含大陆 → Phase ICP） |
| 3 | 图床、防攻击等 CF 能力 | Cloudflare（R2 / WAF 等） | ⬜ Phase CF |

早先把 CF 只写成「地理调度」，**范围偏窄**；调度只是可选增强。

## 终局架构

```text
主站页面
  www / @ → EdgeOne → Vercel

图床 / 大图（Phase CF）
  img.threetwoa.live → Cloudflare（R2 / Images）

防护
  · 主站：EdgeOne 安全 和/或 主链改经 CF 橙云（二选一，见下）
  · 图床子域：天然经 CF，可开 WAF

Phase ICP 后：仅升级 EdgeOne 加速区，不推翻上面分工
```

| 层 | 职责 | 现状 |
|---|---|---|
| **Vercel** | 构建 + 源站 | ✅ |
| **EdgeOne** | 主站 CDN（不含大陆） | ✅ |
| **Cloudflare** | 图床 / 防护 /（可选）DNS·调度 | ⬜ |
| **ICP 含大陆** | 后续优化 | 📋 |
| **`site_url`** | `https://www.threetwoa.live` | 🔄 待确认 push |

---

## Phase 1 · 快照（已完成）

### DNS（Name.com）

| TYPE | HOST | ANSWER |
|---|---|---|
| ANAME | `@` | `threetwoa.live.eo.dnse2.com` |
| CNAME | `www` | `www.threetwoa.live.eo.dnse2.com` |
| TXT | `edgeonereclaim` | 可留 |

### EdgeOne

个人版 · 不含大陆 · `www` + apex · 源站 `03b69627c02e1d2b.vercel-dns-017.com` · HTTPS 已部署。

---

## Phase CF · Cloudflare 服务层

### 结构事实（必读）

访客现在是 `浏览器 → EdgeOne → Vercel`。  
**CF 不在主站链路上** → 只注册 CF 账号，主站不会自动获得 CF 防攻击。  
WAF/DDoS 要对某主机名生效，该名必须 **橙云代理**（或至少流量经 CF）。

图床可以**旁路**：`img.` 只走 CF，**主站继续 EdgeOne**，互不拆台。← 最贴「图床 + 国内加速」双诉求。

### 推荐路径（先服务、后调度）

| 子阶段 | 做什么 | 对应诉求 |
|---|---|---|
| **CF-A** | CF 加站点；DNS 可先灰云或不迁 NS | 面板就位 |
| **CF-B** | R2（或 Images）+ `img.threetwoa.live` 橙云 | **图床** |
| **CF-C** | 防护范围：先护 `img`；主站是否改经 CF 另拍板 | **防攻击** |
| **CF-D** | （可选）Workers 地理调度 | 非本质 |

### 主站防护两种选法

| 选法 | 含义 |
|---|---|
| **保守（推荐先做）** | 主站仍 EdgeOne；CF 负责图床 + 护 `img`；主站靠 EdgeOne 安全 |
| **激进** | `www` 也橙云：CF → 回源 EdgeOne 或 Vercel；CF WAF 护主站，国内可能多一跳 |

### 明确不做

- 为上 CF 拆掉已通的 EdgeOne 主链  
- 未设计回源就全站橙云死代理 Vercel  
- 把 ICP 和 CF 绑死  

---

## Phase ICP · 后续优化

→ [`edgeone-mainland-icp-plan.md`](./edgeone-mainland-icp-plan.md)

---

## 回滚（Phase 1）

- `www` CNAME → `03b69627c02e1d2b.vercel-dns-017.com`
- 备用：`https://fork-firefly.vercel.app`
