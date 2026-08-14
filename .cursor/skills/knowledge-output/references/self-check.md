# output 自检（Fail-closed）

成帖前必过。过不了就补，禁止带病写入 `posts/`。机器 lint 另跑 `validate_post.py`，不能替代本表。

合集期刊（早报 / 热榜）不走本技能。

## 0. 缺口补提

笔记像没经过 extract：无 YAML `source`、无判断只有摘抄、渠道 3 式空题目、图全是微信外链或零图。

按 `knowledge-extract` 补一轮（清洗 / 广搜 / 配图），再回到本表。不要假装「output 只管拷文件」。

## 1. 详细度

过：每节有能带走的判断或步骤；关键数字有出处或标待核实；不是目录空壳。  
不过：只有小标题没有肉；调研无链接；把 `source/` 原文当主体交差。

## 2. 标题（title + H2/H3）

对照 [`heading-anti-ai.md`](heading-anti-ai.md) + `humanizer-tta`（口头禅 / 成篇去痕）。  
**frontmatter `title` 和所有 H2/H3 都要改到像人起的路牌**，不要课件目录。

禁（命中就改名）：全面解析、深度剖析、XX 清单、XX 实录、核心要点、一句话收束、综上所述、写在最后、Overview、Best Practices。  
emoji / 颜文字：禁止写入 `title`（列表卡 `title-mood` 自己挂）。

读出声：像跟同事说话才过。TTA 的 50 分自评不当放行条件。

## 3. 配图

优先级：原图 / 官方图 → 检索场景素材 → 仍空才 MiniMax（`check_quota.py`）→ GIF 仅用户当场要。

- 正文大图必须是 `https://img.threetwoa.live/...`（桶 `firefly-comment`）。禁止只留微信外链。
- 比例：每个主要 H2 附近至少一张能说明该节的图；禁止零图；禁止堆无关科技库存。
- 已是 R2 URL 的不要再 `place_post` 拷进 git。本地 `./assets/` 残留才 webify 后上 R2。
- 细则：[`../knowledge-extract/references/images.md`](../knowledge-extract/references/images.md)

## 4. 合集缓存

```bash
python .cursor/skills/knowledge-output/scripts/sync_collection_model.py
```

`drifted: true` → `--apply` 再读 [`collection-model.md`](collection-model.md)。只按一二级 `route:` 挂 slug；对不上就提案，不私开配置。
