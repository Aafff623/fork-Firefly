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
| 禁标题 | H2/H3 命中课件腔（一句话收束 / 核心要点 / 综上所述 / 写在最后 / Key Takeaways 等）→ FAIL。 |
| 正文标签 | 「一句话结论 / 一句话总结 / 一句话收束」这类标签句 → FAIL。 |
| title 表情 | frontmatter `title` 禁止 emoji / 颜文字（展示层 `title-mood` 会自己挂）。 |
| H1 | 正文从 `##` 起。 |
| 草稿箱 | 路径含 `_draftbox/` 时 `draft` 必须为 `true`。 |
| 今日公开帖 | `draft: false` 且 `published` 为今天：必须有带时分的 `updated: YYYY-MM-DDTHH:mm:ss`（避免同日撞时间戳、首页顶不上去）。 |

原有检查仍在：缺 title/published、slug 格式、`![[…]]`、`image: api`、缺本地图、危险 URL。

## 脚本 WARN（不挡落盘，汇报里必须写）

- 公开帖缺 `updated` 或只有日期（不是今天的仍建议补时分）
- `category` 空，或不在 `CONTEXT.md` 现行分类词表（新建分类须园主同意；脚本不禁新建，只提醒）
- 缺 `slug`

## 仍靠 Agent（脚本扫不了）

- 分类门禁：未获用户确认不得把 category 写死（对照 `CONTEXT.md`）
- 人味：过 `humanizer-tta`；**不要**用 50 分自评当放行条件，用本 lint 的 FAIL 项 + 禁标题命中结果贴进汇报
- 实录类：群聊/访谈保留原话精华，不用抽象总结替换
- 配图政策按来源（不要混用）：

| 来源 | 默认 |
|---|---|
| 合集（早报 / 热榜） | **禁止** MiniMax 付费生图；官方 OG / README / 公告图 → R2 |
| 公众号 | 先 `source/images/` 精选；禁止只留微信外链 |
| 会话 / 调研成帖 | 三级取材：官方 → 合规网图 → 才 `firefly-minimax-media` |
| Obsidian | 用 vault 附件；不要为列表效果往 title 塞表情 |

流程 / 时序图用 Mermaid，横版优先：`docs/agents/workflow.md`。
