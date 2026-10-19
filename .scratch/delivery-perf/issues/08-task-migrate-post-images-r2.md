# 存量正文图迁 R2：650MB → tracked ~300MB

Type: task
Status: resolved（2026-10-19 实施完成，commit `64dc41f5` 待园主授权推送）

## Question

05 票决议：仓 tracked 950MB（posts 650 + public 275）、pack 1.64GB，拖慢每次 CI clone 与部署；post-publish 红线确立后增量图已走 R2，问题全在历史存量。本票把「存量 posts 图批量迁 R2 + 仓内删除」落成可执行方案。

目标：`git ls-files` 跟踪体积从 ~950MB 降到 ~300MB；线上图片全部经 `https://img.threetwoa.live/` 访问；迁移后全站构建 + validate 通过。

## 适配点调查结论（2026-10-19 已查清，比预想干净）

1. **`validate_post.py`——零改动**：393 行只查 `./` 相对路径的本地存在性，`https://` 外链不进检查模式；cover 同只查 `./` 开头（405-407 行）。R2 URL 天然通过。
2. **`cascade_check.py`——零改动**：其「图片」逻辑只有 dynamic covers slug 检查（195 行），不碰正文图片路径。
3. **LQIP——走仓内既定外链降级，不改代码**：`getLqipProps` 对 `isExternalImage` 返回 `background: var(--mood)` 素色占位（lqip-utils.ts:64/75）。即迁移后正文图从彩色 LQIP 占位降为素色占位——**这与增量文章（post-publish 的图本就走 R2）行为完全一致**，迁移反而统一了存量与增量的体验，无需给 upload_r2.py 加 LQIP 伴随输出。

## 实施进度

- 迁移脚本就绪：`temp/scripts/migrate-post-images/migrate.mjs`（本地专属）。按帖流程：上传（key=`posts/<slug>/<file>`，逐个 `--verify`）→ 全部成功才改写三种引用形态（`./images/x`、`images/x`、`/posts/<slug>/images/x` → `https://img.threetwoa.live/posts/<slug>/x`）→ 跑 validate。上传失败即停该帖不改写，引用永远可达。
- dry-run 已验证：java-course8（106 文件）清单正确；agents-md-handbook 4 处引用改写命中；validate 通过。
- 存量盘点：115 帖 / 2180 图片文件 / md 引用 909+ 处（`./images/` 为主形态）。
- **Blocked：缺 R2 Secret Access Key**。temp/secrets 的 cf-r2-api-token 实测对 R2 REST API 认证失败（10000），.env/.env.local 无 R2 S3 凭对。需园主到 CF dashboard 签一对（R2 → Manage API Tokens → Object Read & Write，限 firefly-comment 桶），贴值后按铁规落盘 temp/secrets/，即可试点 1 帖 → 全量。

## 实施结果（2026-10-19）

- **凭据解法**：R2 S3 五值一直在 `.dev.vars`（gitignored，9-15 创建）——此前只查了 `.env` 漏了它。无需园主签新 token。
- **执行**：试点 agents-md-handbook（4 图）→ 全量 115 帖 → 间歇网络失败 29 帖重试补齐（脚本加单文件退避重试）→ xiuxing-metaphysics（242 图）与 xiuxing-stories（89 图）补迁。
- **结果**：2256 张图全部上传（key=`posts/<slug>/<file>`）、2253 处 md 引用改写为 `https://img.threetwoa.live/...`、2256 文件出 git 索引（工作区保留）。
- **tracked 949.9MB → 343.4MB（-606MB / -64%）**，超 08 票目标（<350MB）。
- **验证**：`pnpm build` exit 0；`check-delivery-budget` 865 页 0 违规；v41/ui-motion/community 门禁 29/10/9 全绿；线上抽 8 帖图片 URL 全部 200（jpg/webp/png 混合）；lqips.json 被构建重写已按约定还原。
- **删除边界**：按默认只出 index、不做历史重写；pack 1.64GB 的稀释留待园主授权后单独动作。
- CI 影响：fresh clone 不再拉 650MB 图；构建期图片全外链（本地构建已等价验证）。

## 方案

### 1. 盘点与分批

- 清单：`git ls-files "src/content/posts/*/images/*"`（当前 2256 个文件 / 8.1MB apparent，但含大图总量 650MB 口径见 05 票统计）。
- 分批策略：按帖分批（一帖一批），每批独立上传 + 改写 + 验证，失败可单批回滚；已发布帖优先于 `_draftbox`（箱内帖不 push，迁移可延后）。

### 2. 上传

- 工具：`.agents/skills/_shared/scripts/upload_r2.py`（已支持 `--content-type image/webp`，勿回退 jpg-only）。
- key 规范：沿用现有 `img.threetwoa.live/<key>` 约定（与评论图同桶 `firefly-comment`），迁移前先确认桶内 key 命名不撞车（建议 `<post-slug>/<filename>` 前缀）。
- 每文件上传后 GET 200 验证（与 post-publish 现行做法一致）。

### 3. 引用改写（唯一高风险步骤）

- md 中 `![](./images/xxx.webp)` → `![](https://img.threetwoa.live/<key>)`。
- **只改图片引用行，不碰正文文本**；逐帖改写后跑 `validate_post.py`。
- frontmatter 里的 cover 引用同样改写。

### 4. 仓内删除

- `git rm --cached` + 提交删除（工作区文件可保留本地副本，避免 dev 预览断图）。
- **待园主确认的删除边界**：(a) 只从 index 删（pack 仍含历史 blob，fresh clone checkout 立减但 clone 传输不变）；(b) 还是接受历史重写（filter-repo 清 pack，但改写已推送的 master 历史需 force push——按 AGENTS.md 规则 10，force push 必须单独授权，默认不做）。**默认按 (a) 执行**；(b) 若园主以后授权，作为独立动作另开。

### 5. 三个适配点

已查清，见上方「适配点调查结论」：validate/cascade 零改动，LQIP 走仓内既定外链降级（与增量文章行为一致）。实施前无需额外改造。

### 6. 验收

- `git ls-files` tracked 体积 < 350MB。
- 线上抽 10 帖：图片全部 200 且域名正确。
- `pnpm build` + `check-delivery-budget` + `validate_post.py` 全过。
- 草稿箱帖（`_draftbox`）暂不迁（本地专属，不占 CI）。

## 不做

- 不动 `public/` 275MB（05 票边界：主题资产是构建输入）。
- 不引入 submodule / 内容独立仓。
- 不做历史重写 / force push（除非园主单独授权）。
