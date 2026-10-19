# 存量正文图迁 R2：650MB → tracked ~300MB

Type: task
Status: open（Blocked by: 05；实施方式待园主确认「删除边界」见下）

## Question

05 票决议：仓 tracked 950MB（posts 650 + public 275）、pack 1.64GB，拖慢每次 CI clone 与部署；post-publish 红线确立后增量图已走 R2，问题全在历史存量。本票把「存量 posts 图批量迁 R2 + 仓内删除」落成可执行方案。

目标：`git ls-files` 跟踪体积从 ~950MB 降到 ~300MB；线上图片全部经 `https://img.threetwoa.live/` 访问；迁移后全站构建 + validate 通过。

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

### 5. 三个适配点（实施前必须先解决，按序）

1. **`validate_post.py`**：图片检查假设本地文件存在（尺寸/格式/体积）。需确认它对 R2 URL 的行为——跳过还是误报。若误报，先修校验器（可加「外链图片跳过本地检查」分支）。
2. **`lqips.json` / LQIP 生成**：构建期对本地图生成 base64 占位。迁 R2 后正文图的 LQIP 从哪来？选项：(i) 上传时把 LQIP 一并写进某个 manifest；(ii) 构建期对 R2 URL 拉取生成（构建变慢）；(iii) 外链图不挂 LQIP（接受加载体验变化）。**建议 (i)，在 upload_r2.py 加 LQIP 输出**。
3. **`cascade_check.py`**：级联检查可能校验图片路径存在性，同 1 先确认。

### 6. 验收

- `git ls-files` tracked 体积 < 350MB。
- 线上抽 10 帖：图片全部 200 且域名正确。
- `pnpm build` + `check-delivery-budget` + `validate_post.py` 全过。
- 草稿箱帖（`_draftbox`）暂不迁（本地专属，不占 CI）。

## 不做

- 不动 `public/` 275MB（05 票边界：主题资产是构建输入）。
- 不引入 submodule / 内容独立仓。
- 不做历史重写 / force push（除非园主单独授权）。
