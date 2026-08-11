# EdgeOne + 国内域名 操作清单

> 仓库侧适配（`EDGEONE=1` / `edgeone.json` / pagefind sync）已完成。  
> **域名决策（2026-08-11）：** 不续 `threetwoa.me`；国内主入口用 **`threetwoa.live`**（Name.com 学生包）。Cloudflare 本阶段不做。

## 1 · Name.com · `threetwoa.live`（已完成）

- 已注册；WHOIS Privacy = Private。
- 面板若显示 **AUTO-RENEWS**：点进域名 → 关闭自动续费（免费年后再决定是否续）。

## 2 · 腾讯云 EdgeOne Pages 部署（当前步）

1. 腾讯云实名 → EdgeOne / Makers → 导入 GitHub 仓库 `Aafff623/fork-Firefly`。
2. 生产分支：与 Vercel Production **相同**分支。
3. 加速区选 **全球可用区（不含中国大陆）**（免 ICP，可绑自定义域名）。
4. 构建以仓库根 `edgeone.json` 为准（`EDGEONE=1 pnpm run build:edgeone`，Node 22.17+）。  
   该脚本跳过 LQIP 重算与字体子集（用仓库已提交产物），并在 `astro.config` 里把 `build.concurrency` 设为 `1`，避免 CI `exit 137` OOM。
5. 环境变量（从 Vercel / 本地 `.env` 抄，勿入库）：
   - `COS_SECRET_ID` / `COS_SECRET_KEY` / `COS_BUCKET` / `COS_REGION` / `COS_PUBLIC_BASE_URL`（评论大图）
   - 可选：`DEEPSEEK_*`、`MAXKB_*`
6. 部署成功后用控制台「预览」自测（大陆预览链约 3 小时有效）。

**验收：** 首页 / 文章 / 搜索（pagefind）在预览中可开。评论/Ask 失败不阻断。

## 3 · 绑定 `threetwoa.live`

1. EdgeOne 项目 → 域名管理 → 添加 `threetwoa.live`（可选 `www`）。
2. Name.com DNS：按控制台加归属验证记录 + CNAME（apex 按其文档 ALIAS / 扁平化 CNAME，勿乱写 A）。
3. 申请免费 SSL，等到 `https://threetwoa.live` 可打开。
4. **再**让 Agent 改 `src/config/siteConfig.ts` 的 `site_url` → `https://threetwoa.live`，并更新 RSS fallback；两边重建。
5. 把 `https://threetwoa.live` 发给同学验收。

**关于 `threetwoa.me`：** 不续费；对外推广改发 `.live`。

**回滚：** 删除指向 EdgeOne 的 CNAME；同学临时仍用 `https://fork-firefly.vercel.app`。

## 后置（本清单不做）

Cloudflare 总调度、ICP 备案切大陆节点、迁 Waline、买 `.com`、续费 Namecheap `.me`。
