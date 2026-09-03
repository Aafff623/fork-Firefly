# 合集期刊共通（早报 / 热榜）

`ai-morning-brief` 与 `github-weekly-hot` 共用本文件。源、版权、筛选词表仍在各自 skill。

## 落盘分流

| 用户口令 | 路径 | `draft` | git / 级联 |
|---|---|---|---|
| 没说发 / 草稿 / 先本地 | `src/content/posts/_draftbox/<slug>/` | `true` | **禁止** `git add` 箱内正文；**禁止** `--emit-dynamic` |
| 「发 / 从草稿箱出来 / 可以发了」 | `src/content/posts/<slug>/` | `false` | `validate_post` → `cascade 收尾 --emit-dynamic --blurb "…"`；确认后才 commit/push |

成帖红线与 lint：[`post-redlines.md`](post-redlines.md)。  
`published` = 源期号日；`updated` = 落盘当下（含时分）。`title` 无 emoji / 颜文字。正文无 H1。

## 同号碰撞

先扫 `posts/<slug>/` 与 `_draftbox/<slug>/`。

| 情况 | 动作 |
|---|---|
| `posts/` 已有该期正式帖 | **禁止覆盖**。跳过。用户要补漏：仅当用户点名才用 `-b` 后缀 |
| 仅 `_draftbox/` 有该期 | 默认**更新**该草稿（仍 `draft: true`），除非用户说跳过 |
| 两边都没有 | 按上表落盘 |
| 源没有更新 | 停手汇报，不要拿别的源冒充下一期 |

## 配图与 R2

- 每条至少一张**相关**图。优先官方 OG / 产品页 / README 演示帧 / 公告截图。不要空洞装饰图。
- 只使用已有的官方或合规素材；没有合适素材时标记待补，不调用外部图片生成。
- 正文大图不进 git。上传 Cloudflare R2 后写公网 URL。
- 桶：**`firefly-comment`**。公网：**`https://img.threetwoa.live`**。不要写到 `threetwoa-blog-assets`（无 `img.` 域）。
- object key：`posts/<slug>/<ascii-name>.jpg`
- Web 化：转 JPG；过宽压到约 1200–1600px；RGBA 先贴深色底。本地缓存 `.scratch/` 或 `%TEMP%`（已 gitignore）。
- 合集小封面（若 `public/assets/collections/<id>.jpg` 存在）可拷为该帖 `cover.jpg` 留 git。
- 上传后必须 `GET` 公网 URL，确认 **HTTP 200** 再写入 markdown。失败就汇报卡点，禁止假装已上 R2。

```bash
python .cursor/skills/_shared/scripts/upload_r2.py \
  --file <local.jpg> \
  --key posts/<slug>/foo.jpg \
  --verify
```

密钥只读本机 env / `.env`（`R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`），不入库、不打印。备选：Cloudflare API `PUT .../r2/buckets/firefly-comment/objects/{key}`，或 `npx wrangler r2 object put`。`user-cloudflare-bindings` **没有** object put。

正文写法：

```markdown
![说明](https://img.threetwoa.live/posts/<slug>/foo.jpg)

*图：一句话说明。来源：[原页](https://example.com)（抓取日）。*
```

## 校验与收尾

```bash
python .cursor/skills/_shared/scripts/validate_post.py src/content/posts/_draftbox/<slug>/index.md
```

正式发把路径换成 `src/content/posts/<slug>/index.md`，再：

```bash
python .agents/skills/post-publish/scripts/cascade_check.py \
  --slug <slug> --emit-dynamic --blurb "口语短批注"
```

草稿箱不跑 `--emit-dynamic`。已有「新笔记」动态的 slug 不要重复 emit。未获准不 `git commit` / `push`。

## 工作区根是上一级 `blog/` 时

仓内真源是 `Firefly/.cursor/skills/<本 skill>/`。按 `AGENTS.md` 建 **junction**，不要物理复制正文。
