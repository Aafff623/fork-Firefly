# 用语进库（发布岗做，tta-tone 只读）

园主在 Obsidian 把笔记调到理想之后，才调用 output。落盘校验通过后，**默认**从这篇理想稿抽出用语，写入 tta-tone 的 `references/voice/`。tta-tone 成稿只读 `lexicon.md`。

词表真源：`D:\OneDrive\Desktop\tta\tta-tone\skills\tta-tone\references\voice\`

## 何时走

| 情况 | 做不做 |
| --- | --- |
| 落盘 + `validate_post.py` 通过（含草稿箱预览） | 默认做 |
| 用户说「只提取第三节 / 这几个词」 | 只抽指定范围 |
| 用户说「这轮不要进库」 | 跳过 |
| 早报 / 热榜 / 别人的文章 | 不做 |
| 台账里已有同一指针 | 不加行；词表只补新词 |

## 步骤

1. 正文以园主调完的那份为准：优先 `origin_path`（vault），否则用成帖正文。不要为了进库再改写一篇。
2. 台账：

```bash
python .cursor/skills/knowledge-output/scripts/voice_ingest.py \
  --pointer "<vault 或 posts/slug 路径>" \
  --date 2026-08-15
```

用户点名范围时加 `--scope "第三节"` 或 `--scope "猛蹬,名册过肥"`。

3. 打开 `lexicon.md`。默认抽出 3–8 个新词（字面 / 在园主笔下的意思 / 什么场合用）和最多 3 条联想。点名则只处理指定部分。已有的不重复。通稿词（赋能、抓手、说人话版本）不收。
4. 汇报进了哪些词。不要把全文糊进词表。
