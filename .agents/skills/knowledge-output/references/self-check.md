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

对照 [`heading-anti-ai.md`](heading-anti-ai.md) + [`../../_shared/post-redlines.md`](../../_shared/post-redlines.md)。不要先炼金句。

- **title**：完整、一看就知道讲什么。园主给了素材题/方向就先对齐。禁止感想句（「没废 / 带歪了」）。
- **H2**：每篇必须有多节 `##`，不能只有一级（frontmatter title / 文内 `#`）。`###` 按需。侧栏目录读 H2。先定职能（现象 / 根因 / 解法 / 选择 / 安装 / 附件）再取名。侧栏窄，宜短。禁止空对象（「揭秘两阶段」「内置的和社区的」）。「园丁 / 园主」可用，不要每节硬塞。
- **主语**：成帖句子要有主语。禁止大段无主语句。谁掉分、谁装、谁交给 Agent，写清楚。
- 仍禁课件腔：全面解析、深度剖析、XX 清单、核心要点、一句话收束、综上所述、写在最后、Overview、Best Practices。
- emoji / 颜文字：禁止写入 `title`（列表卡 `title-mood` 自己挂）。

TTA 的 50 分自评不当放行条件。

## 2b. 开篇与 Markdown

- 经验稿开篇听 tta-tone `canon.md`：时间线和现场先于报告骨架。发布日 ≠ 写作日（例：V4-Pro-0813 是 8 月 13 日，8 月 15 日不能写「今天上了」）。
- 该强调时用加粗 / 引用 / 行内代码，不要为凑格式硬塞。数字该分色再用 `.metric`，禁止满篇黄 `<mark>`。
- 粘贴的问题说明、数字表、插件清单优先留结构。
- 园主已调完的句子原样留，不要重写成另一张嘴。

## 3. 配图

封面 / 列表卡：必须有已存在的合规本地素材或已上传的 R2 图片；不在发布流程中调用模型生图。
正文插图：优先园主截图 / 官方图，其次使用合规检索素材；没有合适素材时标记待补，不虚构图片。GIF 仅用户当场要。
Mermaid：禁止灰/单色；多色节点、分区、深浅色都能看。

- 正文大图必须是 `https://img.threetwoa.live/...`（桶 `firefly-comment`）。禁止只留微信外链。
- 比例：每个主要 H2 附近至少一张能说明该节的图；禁止零图；禁止堆无关科技库存。
- 点名本站角色（DeepSeek 猫娘）必须优先使用 `SpritePet` / `public/pets/maid-deepseek-whale` 的真实素材，禁止凭空绘制。见 [`../knowledge-extract/references/images.md`](../knowledge-extract/references/images.md)。
- 已是 R2 URL 的不要再 `place_post` 拷进 git。本地 `./assets/` 残留才 webify 后上 R2。

## 4. 合集缓存

```bash
python .cursor/skills/knowledge-output/scripts/sync_collection_model.py
```

`drifted: true` → `--apply` 再读 [`collection-model.md`](collection-model.md)。只按一二级 `route:` 挂 slug；对不上就提案，不私开配置。
