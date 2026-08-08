# 草稿箱（draftbox）

本地 WIP 博文目录。**正文与资源不入库、不 push**；仅本 README 可提交，用来钉死目录约定。

## 定义

| 项 | 约定 |
|---|---|
| 路径 | `src/content/posts/_draftbox/<slug>/` |
| Git | `.gitignore` 忽略箱内除本 README 外的一切 |
| 远端 / Vercel | 不存在这些文件 → 线上首页与生产构建无此文 |
| 本地预览 | `pnpm dev` 可读；`draft: true`；进首页列表；按 `updated`/`published` 可抢默认置顶大卡；URL `/posts/<slug>/`（剥 `_draftbox/`） |
| 主题 demo | 根下 `posts/draft.md`（`draft: true` 且已跟踪）**不是**草稿箱，勿混用 |

## 进箱

用户说「草稿 / 草稿箱 / 先本地调试」时：

1. 落盘到 `_draftbox/<slug>/`（通常 `index.md` + 可选封面/配图）
2. frontmatter：`draft: true`，并写好 `slug`
3. **禁止** `git add` 箱内正文；**禁止** push 草稿
4. 不跑公开级联 emit（无「新笔记」动态）

## 出箱（试发）

用户明确说「从草稿箱出来 / 可以发了 / 出箱」时：

1. 整目录迁到 `src/content/posts/<slug>/`（移出 `_draftbox`）
2. 按需改 `draft: false`、补封面、校验
3. `site-cascade`（公开帖可 `--emit-dynamic`）
4. 再纳入 git → 用户确认后 commit / push → 核线上

进箱与出箱不得夹带其他 agent 的无关 WIP。
