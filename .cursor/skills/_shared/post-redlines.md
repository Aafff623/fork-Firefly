# 成帖红线（真源）

落盘进 `src/content/posts/`（含 `_draftbox/`）的稿，统一守本文件。  
各 skill 禁止再复述清单；改规则只改这里 + `_shared/scripts/validate_post.py`。

机器门禁（必跑，失败不准宣称成帖）：

```bash
python .cursor/skills/_shared/scripts/validate_post.py <path-to-index.md>
```

小节标题范例（禁/赞对照，人工起名时打开）：[`../knowledge-output/references/heading-anti-ai.md`](../knowledge-output/references/heading-anti-ai.md)  
列表卡 emoji / 颜文字：只挂展示层，见 [`title-mood.md`](title-mood.md)

## 脚本已拦（ERROR）

| 项 | 规则 |
|---|---|
| 半角冒号 | 正文里 `:` 后面紧贴非空白会被 `remark-directive` 吃成标签（`13:06` → `<06></06>`）。改全角「：」。排除：`https://` 等 URL、`::github` / `::note` 叶指令、`:spoiler[…]`、盘符 `C:\`。代码围栏内不检。 |
| 英文破折号 | 单用 `—`（U+2014）或 `–`（U+2013）禁止。中文双破折号「——」允许。 |
| 禁标题 | H2/H3 命中课件腔（一句话收束 / 核心要点 / 综上所述 / 写在最后 / Key Takeaways 等）或空对象（揭秘两阶段 / 内置的和社区的）→ FAIL。 |
| 正文标签 | 「一句话结论 / 一句话总结 / 一句话收束」这类标签句 → FAIL。 |
| title 表情 | frontmatter `title` 禁止 emoji / 颜文字（展示层 `title-mood` 会自己挂）。 |
| title 感想 | frontmatter `title` 命中「没废 / 带歪了」→ FAIL。 |
| H1 | 正文禁止用 `#` 当节标题。 |
| H2 | 每篇必须有 `##`。不能只有 frontmatter title。`###` 按需。侧栏目录读 H2。 |
| 草稿箱 | 路径含 `_draftbox/` 时 `draft` 必须为 `true`。 |
| 今日公开帖 | `draft: false` 且 `published` 为今天：必须有带时分的 `updated: YYYY-MM-DDTHH:mm:ss`（避免同日撞时间戳、首页顶不上去）。 |

原有检查仍在：缺 title/published、slug 格式、`![[…]]`、`image: api`、缺本地图、危险 URL。

## 脚本 WARN（不挡落盘，汇报里必须写）

- 公开帖缺 `updated` 或只有日期（不是今天的仍建议补时分）
- `category` 空，或不在 `CONTEXT.md` 现行分类词表（新建分类须园主同意；脚本不禁新建，只提醒）
- 缺 `slug`
- 正文完全没有加粗、引用或行内代码（缺哪种报哪种；不是每篇必须三种堆满）
- `<mark>` 过多且几乎没有 `.metric`（数字该分色再用，不要满篇黄）

## 仍靠 Agent（脚本扫不了）

- 分类门禁：未获用户确认不得把 category 写死（对照 `CONTEXT.md`）
- 人味：园主已调完的理想稿不过 `humanizer-tta`。通稿去壳才过。**不要**用 50 分自评当放行条件，用本 lint 的 FAIL 项 + 禁标题命中结果贴进汇报
- 实录类：群聊/访谈保留原话精华，不用抽象总结替换
- 成帖形态（以验收过的 `v4-pro-first-round-catalog` 为准，翻车反写；命中就改）：

| 项 | 硬规则 |
|---|---|
| 大标题 | 完整、一看就知道讲什么。园主给了素材题/方向就先对齐，不要先写金句。禁止感想句（「没废 / 带歪了」）。 |
| H2 | 每篇必须有多节 `##`，不能只有一级（frontmatter title / 文内 `#`）。`###` 按需。侧栏目录读 H2。先想这节在干什么（现象 / 根因 / 解法 / 选择 / 安装 / 附件）再取名。侧栏窄，宜短。禁止空对象（「揭秘两阶段」「内置的和社区的」）。读者是「园丁」、园主是「园主」，可用，不要每节硬塞。 |
| 主语 | 成帖句子要有主语。禁止大段无主语句（省略「我 / V4 Pro / DSH / 社区 / 园丁」拧成说明书）。谁掉分、谁装、谁交给 Agent，写清楚。 |
| 开篇 | 经验稿听 tta-tone `canon.md`：时间线和现场先于报告骨架。日期必须对：发布日 ≠ 写作日（例：V4-Pro-0813 是 8 月 13 日，8 月 15 日不能写「今天上了」）。 |
| Markdown | 该强调时用加粗 / 引用 / 行内代码。关键数字该分色再用 `.metric`。禁止满篇黄 `<mark>`。 |
| 封面 | `image:` / 列表卡背景必须 MiniMax 自生成（先 `check_quota.py`）。禁止园主配图、禁止检索素材当封面。默认二次元人物，把主题元素编进画面；或场景图。正文插图可用园主截图。点名本站角色先搜 `SpritePet` / `maid-deepseek-whale`，禁止自造鲸背杂志风。prompt 不在本文件重写。 |
| Mermaid | 禁止单调灰/单色。多色节点、分区、可读对比；站点深浅色都能看。横版优先见 `docs/agents/workflow.md`。 |
| 验收 | 园主说本地预览 / 验收 → 先 `_draftbox/`，`draft: true`。禁止未点头出箱 / cascade / push。 |
| 素材 | 粘贴的问题说明、数字表、插件清单优先保留结构，不要先改成通稿。 |

- 配图政策按来源（不要混用）：

| 来源 | 默认 |
|---|---|
| 合集（早报 / 热榜） | **禁止** MiniMax 付费生图；官方 OG / README / 公告图 → R2 |
| 公众号 | 先 `source/images/` 精选；禁止只留微信外链 |
| 会话 / 调研成帖 | **封面**必须 MiniMax（默认人物）；**正文**可用园主截图 / 官方 → 合规网图 → 才生图 |
| Obsidian | 用 vault 附件；不要为列表效果往 title 塞表情 |

流程 / 时序图用 Mermaid，横版优先：`docs/agents/workflow.md`。配色守上表，不要灰块。
