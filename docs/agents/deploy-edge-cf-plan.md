# Plan · 站点边缘架构（EdgeOne + Cloudflare + Vercel）

> **版本**：2026-08-12 · v1.1  
> **状态**：Phase 1 ✅；Phase CF ✅（评论 R2 + `img`）；Phase ICP 后续优化（同学侧已可打开，含大陆后置）  
> **产品**：threetwoa's blog（仓库 `fork-Firefly`）  
> **相关**：[权益与成本](./architecture-cost-optimized.md) · [CF 能力表](./cloudflare-services-map.md) · [操作清单](./edgeone-domain-runbook.md) · [ICP 后续](./edgeone-mainland-icp-plan.md)

---

## 1. 目标与成功标准

### 1.1 核心诉求（不变）

| # | 诉求 | 成功样子 |
|---|---|---|
| 1 | 自定义域名 | `https://www.threetwoa.live`（及 apex）可访问、有 HTTPS |
| 2 | 国内向加速 / 能打开 | 国内同学不再依赖被污染的 `*.vercel.app`；主站经 EdgeOne |
| 3 | 图床、防攻击等边缘能力 | 尽量用 **Cloudflare 免费档**；主站安全用满 **已购 EdgeOne 个人版** |

### 1.2 非目标（本 Plan 不做）

- 未备案强行开启 EdgeOne「含中国大陆」节点  
- 把整站迁到 Cloudflare Pages / 放弃 Vercel 构建  
- 为「安心」升 EdgeOne 基础版/标准版或购买 CF Pro  
- 主站再套一层 CF 橙云形成双 CDN（除非日后单独评审）

### 1.3 完成定义（按阶段）

| 阶段 | Done 当且仅当 |
|---|---|
| **Phase 1** | `www` + apex 经 EO HTTPS 200；推广可用 `.live` |
| **Phase CF** | `img.threetwoa.live` + R2 可读；新图上传不泄密钥；主站仍 EO；CF 账单 ≈ $0 |
| **Phase ICP** | 独立文档启动条件勾齐后再开；本 Plan 只挂链 |

---

## 2. 原则

1. **已付钱的用满**：EdgeOne 个人版按月续费 → 主站 CDN + 基础安全全走 EO。  
2. **缺口用 CF 免费补**：图床（R2 免出站）、`img` 子域防护。  
3. **不重复购买**：主站不买第二份 CDN/WAF；结账页不勾无关搭配。  
4. **大图不吃 EO 配额**：评论/外置大图走 R2，保护个人版 50GB/300 万次。  
5. **少跳数**：主站路径保持 `访客 → EO → Vercel`。

---

## 3. 目标架构

```text
                         threetwoa.live
                                │
           ┌────────────────────┴────────────────────┐
           ▼                                         ▼
    主站 www / apex                            图床 img.
    EdgeOne 个人版（月付）                      Cloudflare Free（橙云）
    · CDN（不含大陆）                           · R2 对象存储（免出站）
    · 免费证书 + 基础 DDoS/管控                  · Free WAF / Bot
           │                                         │
           ▼                                         ▼
      Vercel Hobby                               R2 Bucket
      （唯一构建 / 源站）                         （图床数据）

备用直链（不推广）：https://fork-firefly.vercel.app
后续优化：ICP 后同一 EO 套餐改「含大陆」加速区
```

| 流量类型 | 路径 | 费用归属 |
|---|---|---|
| HTML / 站内资源 | EO → Vercel | EdgeOne 月费 |
| 评论图 / 外置大图 | CF → R2 | $0（额度内） |
| 海外应急 | Vercel 直链 | $0 |

---

## 4. 当前权益（决策输入）

### 4.1 已购 · 现金

| 项 | 状态 | 注意 |
|---|---|---|
| **EdgeOne 个人版** | ✅ 已开通并承接 `threetwoa.live` | **按月续费**。体验价曾 ¥9.9；官价常见 ¥29.9。以控制台下期扣费为准；核对自动续费开关 |
| Vercel Hobby | ✅ | $0 |
| Name.com `.live` | ✅ 学生包 | 建议关自动续费 |
| 腾讯云 COS | 可能已有评论图 | Phase CF 后新图改 R2，降量 |

### 4.2 EdgeOne 个人版 · 应用满

| 能力 | 大约额度/范围 | 本站用法 |
|---|---|---|
| 安全加速流量 | 50 GB/月 | 主站页面与站内资源 |
| 安全加速请求 | 300 万次/月 | 博客量级够用 |
| 站点 / 子域 | 1 站 · 约 200 子域 | 已用 www + apex；**img 不接 EO** |
| HTTPS | 免费证书 | 已部署 |
| 基础安全 | 平台 DDoS、基础管控/CC/漏洞规则集等 | **主站防攻击靠此** |
| 加速区 | 现「全球不含中国大陆」 | 含大陆 → Phase ICP |

### 4.3 Cloudflare · 计划白嫖

| 能力 | 免费档（近似） | 用法 |
|---|---|---|
| R2 | ~10GB；读写高额度；**Egress $0** | 图床 |
| Free WAF/DDoS | 基础 | 仅 `img.` |
| Workers | 日请求额度 | 可选上传签名 |
| DNS | 免费 | 可选；解析仍指 EO |

> 「大善人」对本站 = **R2 免出站 + 免费防护工具箱**；**不是**大陆 CDN。国内打开靠 EO。

---

## 5. 阶段计划

### Phase 1 · 主站上线（✅ 已完成）

| 项 | 结果 |
|---|---|
| 域名 | `threetwoa.live`（Name.com） |
| Vercel | `www` + apex Valid |
| EdgeOne | 个人版；加速区不含大陆；源站 `03b69627c02e1d2b.vercel-dns-017.com` |
| DNS | `www` CNAME → EO；apex ANAME → EO |
| HTTPS | www / apex 证书已部署 |
| 验收 | `https://www.threetwoa.live` 200，响应含 `EO-*`；推广用 **www** |

仓库：`site_url` 已改为 `https://www.threetwoa.live` 并随 master 上线。

### Phase CF · 吃满 CF 免费档（✅ 主路径通）

| 步 | 动作 | 花费 | 产出 |
|---|---|---|---|
| **CF-0** | 控制台核对 EO 下期续费金额与自动续费 | 0 | 账单可预期 |
| **CF-1** | Cloudflare 添加站点 `threetwoa.live`（可先灰云） | $0 | 面板就位 |
| **CF-2** | 创建 R2 桶；绑定 `img.threetwoa.live` **橙云** + HTTPS | $0 | 图床域名 |
| **CF-3** | Free WAF/Bot 作用在 `img` | $0 | 图床防护 |
| **CF-4** | 站内：新评论大图/外链图写 R2；COS 只读旧链或渐进迁 | 降 COS | 省 EO 流量 |
| **CF-5** | （可选）Workers 预签名上传，密钥不进前端仓 | $0 | 安全上传 |
| **CF-6** | （可选）NS 迁 CF；`www`/`@` **仍 CNAME/ANAME → EO** | $0 | DNS 统一 |

**明确不做（本阶段）：** 主站 www 进 CF 橙云；购 CF Pro；Workers 地理调度作为主路径。

**Phase CF 验收：**

- [x] `https://img.threetwoa.live/...` 可公网读图（HTTPS active；空桶根路径 404 正常）  
- [x] 上传链路无密钥入库（Vercel `R2_*`）  
- [x] 主站仍 EO 200（`EO-*`）  
- [x] CF 月费 ≈ $0；无新增无必要腾讯叠加包  
- [x] `GET /api/comment-image/` → `backend:"r2"`  
- [ ] 评论区实传小图（换令牌后建议再验）  
- [x] 更新 CONTEXT / runbook / 本 Plan 现状行  

### Phase ICP · 大陆节点（📋 后续优化）

不阻塞当前。同学侧已可打开后，含大陆作为质量升级。完整门槛与步骤：[`edgeone-mainland-icp-plan.md`](./edgeone-mainland-icp-plan.md)。

要点：约 60 日域名转出锁（估 2026-10-10）；需 ICP；`.live` 可否备案待系统确认；通过后**同一 EO 个人版**改加速区即可。

---

## 6. 月费与纪律

| 项 | 策略 | 估月费 |
|---|---|---|
| EdgeOne 个人版 | **保留续费**（刚需） | ¥9.9 或 ¥29.9（以控制台为准） |
| Vercel / Name.com 学生包 / CF Free / R2 额度内 | 保留 | $0 |
| COS | 降量 | ↓ |
| CF Pro / EO 升档 / 腾讯 CDN 包 | **默认不买** | — |

**现金刚需 ≈ EdgeOne 个人版月费。**  
超额风险：大图误走 EO、未关自动续费意外升档——用用量面板 + CF-0 核对防范。

---

## 7. 风险与回滚

| 风险 | 缓解 |
|---|---|
| EO 续费从 9.9 变 29.9 | CF-0 先核对；接受或到期评估是否降配（无免费档替代国内打开时需慎重） |
| R2/EO 配额打满 | 大图走 R2；监控两边用量 |
| CF 橙云误指 www | DNS 变更前截图；www 保持 EO CNAME |
| apex ANAME 与 EO「缺 CNAME」误报 | 以实测 `EO-*` 为准；不反复删记录 |
| 双 CDN / 回源环 | 主站不经 CF；img 不回源到 www |

**主站回滚：** Name.com 将 `www` CNAME 改回 `03b69627c02e1d2b.vercel-dns-017.com`。  
**备用链接：** `https://fork-firefly.vercel.app`（国内可能仍污染）。

---

## 8. 文档与仓库落点

| 文档 | 职责 |
|---|---|
| **本文** | 完整 Plan（目标 / 架构 / 阶段 / 验收） |
| `architecture-cost-optimized.md` | 权益与省钱细则（可与本文同步演进） |
| `edgeone-domain-runbook.md` | 控制台逐步操作 |
| `cloudflare-services-map.md` | CF 产品能力与「大善人」释义 |
| `edgeone-mainland-icp-plan.md` | ICP 后续优化 |
| `CONTEXT.md` | 部署事实摘要 |

`siteConfig.site_url` → `https://www.threetwoa.live` 已上线。

---

## 9. 决策记录

| 日期 | 决策 |
|---|---|
| 2026-08-11~12 | 放弃 EdgeOne Pages 托管；Vercel 唯一构建 |
| 2026-08-12 | Phase 1：EO CDN + `.live` 主站打通 |
| 2026-08-12 | ICP/含大陆 → 后续优化，不挡上线 |
| 2026-08-12 | CF 定位从「调度中枢」改为「图床 + 免费防护」；调度可选 |
| 2026-08-12 | 对照 EO 个人版月费权益：主站用满 EO，大图 R2，不重复购防护 |
| 2026-08-12 | Phase CF 主路径验收通过（`backend:"r2"` + `EO-*`） |

---

## 10. 收官后待办（非阻塞）

1. 换掉会话中曾暴露的 R2 API 令牌，只更新 Vercel 环境变量  
2. 评论区实传一张图做端到端确认  
3. Phase ICP：满条件前只维护 [`edgeone-mainland-icp-plan.md`](./edgeone-mainland-icp-plan.md)  
4. 另开任务：内容分类/合集治理；卡片封面迁 R2（正文插图后置）  

---

*本 Plan 为部署架构单一叙事入口；操作细节以 runbook 为准，权益数字以各云控制台为准。*
