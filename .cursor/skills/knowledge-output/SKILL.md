---
name: knowledge-output
description: >-
  把 Knowledge/todo 素材发布成 Firefly 博客文章（发布岗，不是拷文件）。
  无主题 / 无 extract 口令 → 分批扫全部 todo；有主题 → 只干命中的。
  每篇：缺口补提 → 自检（详细度 / 标题 / 配图）→ 合集心智模型路由 → 落盘。
  触发词：发布笔记、把知识笔记发到博客、knowledge output、素材转博客、提取完发出去、
  扫 todo、把 Knowledge 发了。
  早报 / GitHub 热榜不走本技能（走对应合集 skill）。
  Obsidian 进料也走本技能（extract 渠道 1 已写入 Knowledge）；正式发收尾 site-cascade。
compatibility: 需在 Firefly 项目根执行；Python 3；select_todo.py / place_post.py /
  archive_todo.py / sync_collection_model.py；模板 assets/templates/frontmatter.yaml；
  校验 ../_shared/scripts/validate_post.py。
---

# knowledge-output — Knowledge 素材 → 成帖（发布岗）

进料一律先经过 `knowledge-extract`（含 vault 路径）。旧 `ob2blog` 入口已删除。  
合集期刊（早报 / 热榜）**不走本技能**。

本技能不是「把 md 拷进 `posts/`」。过不了自检禁止落盘。

| 真源 | 路径 |
|---|---|
| 成帖红线（机器） | [`../_shared/post-redlines.md`](../_shared/post-redlines.md) → `validate_post.py` |
| 自检（人） | [`references/self-check.md`](references/self-check.md) |
| 合集一二级缓存 | [`references/collection-model.md`](references/collection-model.md) |
| Theme / category 对照 | `knowledge-extract/references/theme-taxonomy.md` + `CONTEXT.md` 词表 |
| FM 骨架 | [`assets/templates/frontmatter.yaml`](assets/templates/frontmatter.yaml) |

四层不要混：

| 层 | 干什么 |
|---|---|
| Knowledge theme/facet | todo 文件夹 |
| `category` | 每帖一个；对照 CONTEXT 词表自动建议 |
| `tags` | 标签云，自动 |
| `collections` | 策展树，自动，可多挂 |

## 调用

```bash
# 无主题：全量 todo，默认每批 3 篇
python .cursor/skills/knowledge-output/scripts/select_todo.py
python .cursor/skills/knowledge-output/scripts/select_todo.py --offset 3

# 有主题 / 短题：只干命中的（同样按批）
python .cursor/skills/knowledge-output/scripts/select_todo.py claude-code
python .cursor/skills/knowledge-output/scripts/select_todo.py --all   # 只列清单，本回合仍按批处理
```

无 extract 口令、用户只说「发布 / output / 把 Knowledge 发了」→ **默认扫全部 `Knowledge/todo`**，每回合最多 3 篇；失败隔离，不一次 emit 十几条动态，不 `git add` / `push`。

## 每回合开工

```
0 合集缓存  → python .cursor/skills/knowledge-output/scripts/sync_collection_model.py
              drifted → --apply，再读 collection-model.md（只记 L1/L2）
1 选材      → select_todo.py（无参=本批；有 query=命中后本批）
2 每篇      → 缺口补提 → 自检三关 → 重建 FM（含 tags / collections）
3 落盘      → posts/{slug}/ 或 _draftbox/{slug}/
              正文已是 img.threetwoa.live 则不要 place_post 拷进 git
4 校验      → validate_post.py
5 收尾      → 正式发才 site-cascade --emit-dynamic --blurb
              草稿箱：validate，不 emit、不 Archive
6 归档      → 仅正式发布成功：archive_todo.py --todo "<piece-dir>"
7 汇报      → 本批 slug → category / collections；剩余 offset；FAIL 原文
```

## 单篇工序

### 1. 缺口补提

笔记像没走 extract：无 YAML `source`、只有摘抄没有判断、渠道 3 式空题目、图仍是微信外链或零图。  
先按 `knowledge-extract` 补一轮，再自检。不要假装 output 只管拷贝。

### 2. 自检

打开 [`self-check.md`](references/self-check.md)。完成标准：详细度、标题、配图三关都过，合集缓存已 diff。过不了就补完再检，再写入 `posts/`。

### 3. 重建 frontmatter

对照 [`frontmatter.yaml`](assets/templates/frontmatter.yaml)：

- slug 英文 kebab；公开帖 `pinned: false`；`updated` 带时分（当天尤其）。
- **category**：按 Theme 表自动建议，**禁止默填 Agentic Coding**。批次汇报表一次性过目，不要每篇单独问。
- **tags**：3–8 个，读者会搜的词，不要把 Theme ID 原样堆进去。
- **collections**：读 [`collection-model.md`](references/collection-model.md) 的 `route:`。只挂一二级 slug（极客时间课表等 L3 `leaves`：仅当正文就是那一课才挂叶，不要挂完叶再挂父、更不要记课表正文）。
- 双挂：跨树才写两个 slug（例 `tool-claude-code` + `agentic-workflow`）。已挂二级则**不要**再挂它的一级父夹（一级页会滚子夹）。
- 对不上现有夹：提案新 L1/L2，园主点头再改 `collectionsConfig.ts`；禁止私开空壳。新封面 MiniMax 也要先问。
- 不沿用素材临时字段；`source` / theme / facet 可写进描述或 `@blog`。

### 4. 落盘

```bash
python .cursor/skills/knowledge-output/scripts/place_post.py \
  --post src/content/posts/{slug}/index.md \
  --from-assets "<todo>/assets"
```

脚本默认：正文/封面已是 `https://img.threetwoa.live/...` 则跳过把 assets 拷进 git。本地 `./images/` 残留才 webify。真要强制拷：`--force-copy`。

`python .cursor/skills/_shared/scripts/validate_post.py <index.md>`

`source=obsidian` 且有 `origin_path`：更新 `.ob2blog/manifest.json`（已映射帖先 `sync_check`；不要用 `prep_convert --apply` 把大图拷回 git）。

笔记型动态须含 `>` 批注。用户要另发碎碎念 → `dynamic-post`。

## 草稿箱

| 动作 | 落盘 | Git / 级联 / Archive |
|---|---|---|
| 用户说草稿；或 `paste_kind` / 旧 source 为 wechat / bibigpt | `_draftbox/<slug>/`，`draft: true` | 禁止 add 正文；不 emit；不迁 Archive |
| 用户说出箱 / 可以发了 | `posts/<slug>/`，通常 `draft: false` | validate → cascade → 确认后 push → 再 Archive |
| 主题 demo | 已跟踪的 `posts/draft.md` 一类 | 与草稿箱无关 |

## 链接

1. 站内已有帖：对得上 `src/content/posts/` 再加 URL，不猜 slug。
2. Knowledge 里已发布的主题链到帖；仍在 todo 的标「待发布」，不编 URL。
3. 成上下篇的互相加相关阅读。

## 硬规则

1. 默认正式发 `draft: false` 落 `posts/<slug>/`。用户要草稿、含敏感/口令、或 wechat/bibigpt → `_draftbox/`。
2. 只写本批帖 + 正式发时的级联；不改布局、不顺手改别人的在制品。
3. 无参 = 分批全量，不是一次做完、也不是拒绝开工。
4. 不 `git add` / `push`，除非用户这轮明确要提交。
5. 汇报：本批 `slug → category / collections`、validate 全文、是否 cascade / 归档、下一批 `--offset`。把 lint FAIL 贴出来。
