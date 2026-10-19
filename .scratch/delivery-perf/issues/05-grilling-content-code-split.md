# 内容与代码分仓：做不做、做到什么程度

Type: grilling
Status: resolved（2026-10-19；做存量图迁 R2，public 不动；依据见下）

## Question

参考站把它当架构主线之一：博客正文与图片放在**独立仓库**，主仓只做代理/本地副本，理由是「100 多篇博文、1000 多张图片，资源加起来 300 MB，每次部署 CI/CD 都沉在来回 300 MB 的流量里」。

Firefly 现状：`public/` 共 **144 MB**（assets 93M / gallery 25M / pets 14M / anime 6.8M），全部在同一个 git 仓库里。

要决定：
- 要不要把内容/大资产移出主仓？
- 如果做，边界在哪：只移 `public/` 大资产？还是连 `src/content/posts/` 一起？
- 代价评估：现有 `post-publish` 发文流水线（vault → 成帖 → validate → cascade）会受什么影响？图片上 R2 的现有做法能否承接？
- 不做的理由也要写下来（如果决定不做，这是给未来探索者的一条边界）。

## Answer

### 决议：做「存量正文图迁 R2」，`public/` 不动；不引入子仓/独立仓

### 事实（2026-10-19 实测，git ls-files 全量统计）

| 范围 | 跟踪体积 | 文件数 |
|---|---|---|
| `src/content/posts/` | **649.6 MB** | 2533 |
| `public/` | 274.9 MB | 466 |
| 全仓合计 | **949.9 MB** | 3839 |
| `.git` pack | 1.64 GiB | — |

参考站「300MB 拖 CI」的理由对 Firefly **成立且更严重**：本仓 pack 1.64GB，每次 CI clone 全历史的代价远超参考站；部署从 3 分钟涨到 11.5 分钟也有它一份。

### 关键边界：增量已治理，问题全在存量

`post-publish` 的现行红线（SKILL.md L158）：**「大图走 R2（img.threetwoa.live），禁止大 jpg/png/webp commit 进 posts/ 或 public/」**——新增文章的图已经全部上 R2 不进仓。仓里 650MB 全是红线确立前的历史积累。

### 分两步

**第一步：存量 posts 图迁 R2（本 effort 的边界，实施另开 task 票）**

- 手段：`upload_r2.py` 已支持 `--content-type image/webp`（勿回退 jpg-only），对 `src/content/posts/*/images/` 的存量图批量上 R2 → 改写 md 引用为 `https://img.threetwoa.live/<key>` → 从 git 删除二进制（`git rm --cached` + 提交删除）。
- 收益：tracked 从 950MB 降到 ~300MB，pack 随历史增长逐步稀释（历史 blob 仍在 pack 里直到 GC/rebase，但 fresh clone 的 checkout 体积立降）。
- 代价与适配点：`validate_post.py` 的图片检查、`lqips.json` 生成（构建期对本地图）、`cascade_check.py` 都假设本地文件存在——迁移前需逐个确认对 R2 URL 的处理路径；封面选图流程同理。**这是实施票要先解决的三个适配点**，不是阻塞决策的问题。
- **不要动 `src/content/posts/**/*.md` 正文文本**——只改图片引用行，且逐帖 validate 复跑。

**第二步（暂缓，记录不做的理由）**

- **`public/` 275MB 不分仓**：banner/pets/atmosphere/gallery 是站点主题资产，构建期图像管线（6757 变体）的直接输入，分仓 = 每次构建先拉 275MB 资产仓，省下的 clone 时间又还回去；且它们是「站点皮肤」不是「内容增长」，不会持续膨胀。
- **不引入 git submodule / 独立仓 + 代理**：多 agent 共享工作树的协作模型下，submodule 的版本钉住与更新流程会显著增加协同成本；R2 已是现成的「外置资产层」，没必要再造一层 git 级别的间接。

### 什么情况下重估

- tracked 体积再涨一个量级（>1.5GB）或 CI clone 成为主要瓶颈（第二步：评估 CI 的 `--depth` 与稀疏检出，而不是分仓）。
- 若未来出现「内容团队多人并行大规模供稿」（当前是园主 + agent 单线生产），再考虑内容独立仓。
