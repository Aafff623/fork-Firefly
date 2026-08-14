# 进料四渠（extract 入口）

extract 是写稿**唯一进料口**。开跑先判定渠道，再挂 Theme/facet（[`theme-taxonomy.md`](theme-taxonomy.md)）。  
用户不必说「走 ob2blog / 走乙路」——看输入。

YAML `source` 只写四值：`obsidian` | `paste` | `research` | `rss`。

---

## 索引 A · 四渠

| 渠 | `source` | 典型输入 | extract 动作 | 专章 |
|----|----------|----------|--------------|------|
| 1 | `obsidian` | vault 内 `.md` 路径 | `extract_vault.py` 消解 `![[…]]`；用附件图；已映射先 `sync_check` | [`vault/obsidian-vault.md`](vault/obsidian-vault.md) |
| 2 | `paste` | 粘贴正文+图、链接、会话、Grok/公众号/网页/BibiGPT | **统一当图文原料**清洗分类；有图用原图 | 下文「粘贴深度」；公众号另见 [`wechat-mp.md`](wechat-mp.md) |
| 3 | `research` | 只有题目 / 「帮我调研」 | 并发广搜 + **必须检索配图** | [`research-intake.md`](research-intake.md) |
| 4 | `rss` | 早报、热榜口令 | 交接合集 skill，不写 Knowledge | `ai-morning-brief` / `github-weekly-hot`；[`../../_shared/periodical.md`](../../_shared/periodical.md) |

渠道 1、2、4 通常**自带**正文和配图；渠道 3 **没有**，要自己搜文搜图。

### 判定顺序（不要先鉴定品牌）

1. 早报 / 橘鸦 / 热榜 / GitHub 每周 / IT咖啡馆 → **4**
2. 路径存在且向上有 `.obsidian/` → **1**
3. 用户给了可清洗的正文、导出 MD、或「把这段整理成笔记」→ **2**（Grok、公众号、网页、BibiGPT、会话**同一渠**）
4. 只有主题、没有正文和路径 → **3**

禁止：先问「这是公众号还是 Grok」再开跑。品牌只影响渠道 2 的**工序深度**（要不要 `source/`、要不要搜证），不影响入口。

可选字段（渠道 2 / 4，不参与分流）：

```yaml
source: paste          # 或 obsidian / research / rss
paste_kind: wechat     # 可选：wechat | bibigpt | grok | web | session
rss_kind: morning-brief  # 仅 source=rss：morning-brief | github-weekly-hot
origin_path: ""        # 渠道 1：vault 笔记绝对路径
origin_url: ""
```

旧 YAML `session` / `paste-md` / `wechat` / `bibigpt` / `mixed` → 视为 `paste`；output 仍可凭 `paste_kind` 或旧 `source` 把公众号/BibiGPT 送进草稿箱。

---

## 索引 B · 分类（Theme → facet）

完整词表：[`theme-taxonomy.md`](theme-taxonomy.md)。

```text
todo/{Theme}/{facet}/{YYYY-MM-DD}_{短题}/
```

开跑顺序：**渠道 → theme → facet → 落盘**。未定 Theme 不得写进 `misc/inbox` 以外；`misc` 仅临时。

---

## 粘贴深度（渠道 2 内部，不是新入口）

### `paste_kind: bibigpt`

BibiGPT 负责高保真翻译/结构化原料，不负责定论。extract 先**工具搜证**再提炼。

计费：网页会员总结吃 Plus；**不要**默认 MCP/API 烧 credits。

流程：定 Theme → 收下原料（可存 `source.bibigpt.md`）→ 列出待核查断言 → WebSearch / 官方 docs / GitHub → 提炼六步 → 落盘。默认交接 output 进草稿箱。

保证据：口水可删；带时间戳的原话、数字、待核实要留。时间戳用全角冒号 `13：06`。

搜证最低清单：原片 URL / UP；点名的仓库与 Skill；模型版本与额度（写核对日）；「官方承认」无链接则降温为「作者称」。

配图：原片封面 / 官方 README / 合规网图；再走 [`images.md`](images.md)。

### `paste_kind: wechat`

完整四岗 → [`wechat-mp.md`](wechat-mp.md)。  
一句：原文与配图进 `source/` 求全；主体求薄并过 TTA；近 7 日撞题去重。

### 其它粘贴（Grok / 网页 / 会话）

清洗、分类、写成合格笔记。原图拷进 `assets/` 再按 [`images.md`](images.md) 上 R2。不要为了「像调研」再去广搜覆盖用户已给的正文。

---

## 渠道 4 交接

| 口令 | 读并执行 |
|------|----------|
| 早报 / 橘鸦 / juya | `.cursor/skills/ai-morning-brief/SKILL.md` |
| 热榜 / GitHub 每周 / IT咖啡馆 | `.cursor/skills/github-weekly-hot/SKILL.md` |

不要在 extract 里重写筛稿、R2、草稿箱规则。YAML 若仍想记账：`source: rss` + `rss_kind`。

---

## 反例

- 看到 vault 路径就去找已删除的 `ob2blog` skill
- 渠道 2 先鉴定「这是不是公众号」才肯提炼
- 渠道 3 只搜一页 Google 式结果、不配图
- 渠道 4 把 RSS 正文搬进 Knowledge 再 output（合集有自己的落盘）
- 把 BibiGPT 默认摘要当终稿
- 用 MCP 烧 API「图省事」（会员网页额度未用完时）
