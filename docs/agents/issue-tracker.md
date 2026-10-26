# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

园主决定（2026-10-19）：本仓用本地 markdown tracker。远端是 GitHub（`Aafff623/fork-Firefly`），
但**不使用 GitHub Issues** —— 单人维护，本地文件比远端 issue 少一层往返。若日后要换成
GitHub/GitLab，重跑 `/setup-matt-pocock-skills` 换适配器即可。

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a single combined tickets file
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

`.scratch/` **不受 `.gitignore` 管辖**：issue 文件是持久的工作状态，应当入库。
它也不是 `temp/` 的一部分 —— `temp/` 整个目录是本地专属（见 `AGENTS.md`）。

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `.scratch/<effort>/map.md` (the Notes / Decisions-so-far / Fog body).
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body. A `Type:` line records the ticket type (`research`/`prototype`/`grilling`/`task`); a `Status:` line records `claimed`/`resolved`.
- **Blocking**: a `Blocked by: NN, NN` line near the top. A ticket is unblocked when every file it lists is `resolved`.
- **Frontier**: scan `.scratch/<effort>/issues/` for files that are open, unblocked, and unclaimed; first by number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `Status: resolved`, then append a context pointer (gist + link) to the map's Decisions-so-far in `map.md`.

## 现存 effort

- `.scratch/delivery-perf/` —— 交付性能改造（决策地图 + 8 张票；01–06、08 已解，07 open）。
  产出的实现已合入 `master`，与 `origin/master` 同步。
- `.scratch/architecture-deepening/` —— 2026-10-21 首轮架构深化（生命周期 / 设置 facade / 评论图 / 检索 seam / CI 门禁；P6 等 blocked）。
- `.scratch/architecture-deepening-2/` —— 2026-10-25 第二轮（issue / spec / map + 23 张票）。
  22 张实现票已解；23 是深度 review 残留（上传配额 / Supabase 抖动 / ArticleCard 适配器等），`ready-for-human`。
- `.scratch/refrepo-borrow-batch1/` —— 2026-10-26 参考仓库借鉴第一批（issue / spec + 16 张票）。
  01/03/04/05/06/07/08/10/11/12/13/16 已完成并本地验证；02（takumi 许可/构建耗时）、09/14/15（i18n WIP）为 needs-info；未 push。
- `.scratch/refrepo-borrow-batch2/` … `batch5/` —— 2026-10-26 参考仓库借鉴第二至五批，共 70 张票。
  本波已完成 batch2-01/02/03、batch3-11、batch5-01/11/12；其余按 spec 依赖与 WIP 状态保持 open / needs-info。
- 两个 architecture effort 的实现均已完成本地 commit；第二轮已推送，后续 review 修复按新提交处理。
