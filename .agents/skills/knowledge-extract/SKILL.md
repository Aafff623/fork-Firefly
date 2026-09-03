---
name: knowledge-extract
description: >-
  写稿唯一进料口：按输入自动分流，不要求用户点名渠道。
  即使用户说「发到博客 / 整理成文章」，只要还没有可在 Obsidian 里调的笔记，也先走本技能、不要直接写 posts。
  渠道 1 本地 Obsidian 笔记路径（含旧口令 ob2blog / firefly-md-to-post）；
  渠道 2 粘贴图文（Grok / 公众号 / 网页 / BibiGPT / 会话正文，统一当正文+配图，先不要鉴定来源品牌）；
  渠道 3 没有参考只要调研（强时效先 ask-grok 贴回渠道 2；否则并发广搜：网页、视频站、行业大佬、使用心得，并自动配图）；
  渠道 4 RSS 合集（早报 / GitHub 每周热点）——内部交接 ai-morning-brief / github-weekly-hot。
  触发词：写篇博客、发到 blog、知识提炼、整理成笔记、调研、帮我查、Obsidian、vault、
  ob2blog、早报、热榜、橘鸦、github weekly、BibiGPT、公众号、mp.weixin。
  extract 落盘 = vault。固定根 D:\OneDrive\Desktop\Notes\threetwoa_ob。
  禁止把「写到 Obsidian」理解成 Knowledge。Knowledge\todo 只读旧库存。
  不落 posts、不做封面、不抽用语。园主在 Obsidian 调完再交给 knowledge-output。
---

# knowledge-extract — 写稿进料（四渠）

本技能是**唯一进料口**。用户不必说「走哪条路」：看输入像什么，就进哪一渠。  
渠道 1–3 **一律写入** `D:\OneDrive\Desktop\Notes\threetwoa_ob`。**不**写 `src/content/posts/`，**不**写 `D:\OneDrive\Desktop\Knowledge`。渠道 4 内部交接合集 skill（它们自己进草稿箱）。

旧名 `ob2blog` / `firefly-md-to-post` 已并入渠道 1，禁止再当独立 skill 调用。

## 安装（两类，禁止复制正文）

| 范围 | 真源 / 挂载 |
|------|-------------|
| **项目** | `Firefly/.cursor/skills/knowledge-extract/`（正文只在这里改） |
| **全局 + 各 AI 工具** | 目录联接（junction）指向上面这一份，见 `AGENTS.md`「Skill 联接」 |

相对路径 `../_shared/` 依赖 extract 本身是 junction（解析到仓内 `_shared`）。禁止把 SKILL.md 拷到 `~/.codex` / OpenCode 当独立副本。

当前不在 Firefly 工作区时：渠道 1–3 仍落 `threetwoa_ob`，不要改落 Knowledge。R2 上传与渠道 4 先定位 `D:\code\Firefly`（脚本会沿 `package.json` name=firefly 找根）。

## 按需阅读

| 何时打开 | 文件 |
|----------|------|
| 四渠判定 + 粘贴深度（公众号 / BibiGPT） | [`source-modules.md`](references/source-modules.md) |
| 渠道 3 广搜 + 配图检索 | [`research-intake.md`](references/research-intake.md) |
| 各渠配图 / R2 / 缺图处理 | [`images.md`](references/images.md) |
| Theme × facet | [`theme-taxonomy.md`](references/theme-taxonomy.md) |
| 公众号保真分层（渠道 2 工序，不是入口） | [`wechat-mp.md`](references/wechat-mp.md) |
| Vault 附件 / `![[…]]` | [`vault/obsidian-vault.md`](references/vault/obsidian-vault.md) |
| 已映射帖一致性 | [`vault/sync-and-speed.md`](references/vault/sync-and-speed.md) |
| 三段分工（extract / 园主 / output） | [`intake-stages.md`](references/intake-stages.md) |
| 成帖语法（交接 output 才用） | [`../_shared/post-redlines.md`](../_shared/post-redlines.md) |

## 开跑：先分流，再 Theme

```text
看输入 → 渠道 1/2/3/4（用户不点名）
  1–3 → theme/facet → 求全写入 vault → 问现场 → 配图 → 停
  4   → 读并执行 ai-morning-brief 或 github-weekly-hot（不要在本技能里重写合集流水线）
```

三段分工见 [`intake-stages.md`](references/intake-stages.md)。本岗不发布、不做封面、不抽用语。

**落盘硬规则**：

```
extract 落盘 = vault。
固定根：D:\OneDrive\Desktop\Notes\threetwoa_ob
渠道 1：写回/更新该笔记所在目录（已有路径为准）。
渠道 2–3：写入 vault 内已有主题夹（优先 `Agentic Coding/` 或 theme-taxonomy 对得上的夹），不要新建空 Theme 除非园主点头。
禁止把「写到 Obsidian」理解成 Knowledge。
Knowledge\todo 只读旧库存，不再作为 extract 默认产出。
```

即使用户说「整理进 Knowledge / 落 Knowledge 目录」，也写入 vault。不要做整库搬迁。

与博客 `category` 不是同一套。YAML `source` 只准四值：`obsidian` | `paste` | `research` | `rss`。旧值 `session` / `wechat` / `bibigpt` 当作 `paste` 的别名。

## 四渠（判定启发式）

| 渠 | 输入长什么样 | 立刻做什么 |
|----|----------------|------------|
| **1 Obsidian** | 绝对/相对路径指向 `.md`，且向上能找到 `.obsidian/`；或用户说 vault / ob2blog | `extract_vault.py` 消解 wiki 图；有图用附件；已映射先 `sync_check.py` |
| **2 粘贴** | 对话里大段正文、导出 MD、链接+正文、会话结论；**含图则一并收下** | 当统一「正文+配图」清洗。不要先鉴定 Grok / 公众号 / 网页品牌 |
| **3 调研** | 只有题目或「帮我查 / 没有材料只要调研」 | 强时效（定价/订阅/当天新闻）先 `ask-grok`，贴回走渠道 2；否则**默认并发子代理**广搜（网页 + 视频站 + 大佬言论 + 使用心得）；**必须搜配图** |
| **4 RSS** | 早报 / 橘鸦 / 热榜 / GitHub 每周热点 / IT咖啡馆 | 交接对应合集 skill，本技能到此结束 |

两种同时出现：路径能认 vault → 1；否则有正文/图 → 2；都没有 → 3。早报口令优先 4。

渠道 2 内部若出现 `mp.weixin.qq.com` 或 BibiGPT 导出腔，再套 [`wechat-mp.md`](references/wechat-mp.md) / source-modules 里的 bibigpt **工序**（保真、搜证）——这不是第五个入口。

## 工作流（渠道 1–3）

```
0 分流 + Theme/facet
1 收材料   → 渠道 1：extract_vault.py；渠道 2：清洗粘贴（公众号见 wechat-mp）；渠道 3：并发广搜
2 求全写入 → 客观信息尽量收全。渠道 1–3 都写 vault（见上「落盘硬规则」）
3 问现场   → 经验稿核当时 / 例子 / 心得 / 货 / 原句；空了问，不准编
4 配图     → 见 images.md：有原图用原图；渠道 3 必须检索；上 R2；缺图标记待补，不调用模型生图
5 停       → 文件树 + section 表。提示园主在 Obsidian 调到理想，再调用 knowledge-output
```

本岗不做：发布、封面、用语进库、把园主已写正文重写成另一张嘴。闲聊和工具痕迹可删；粘贴的表 / 清单先留结构。

### 渠道 1 命令

固定 vault（见 `CONTEXT.md`）：`D:\OneDrive\Desktop\Notes\threetwoa_ob`。不得假定别的 vault 根。

`--out` 省略则写回该笔记所在目录。不要指向 Knowledge。

```bash
python .cursor/skills/knowledge-extract/scripts/extract_vault.py \
  --note "D:/OneDrive/Desktop/Notes/threetwoa_ob/Agentic Coding/某笔记.md"

# 显式写回同一目录（与省略 --out 相同）：
python .cursor/skills/knowledge-extract/scripts/extract_vault.py \
  --note "D:/OneDrive/Desktop/Notes/threetwoa_ob/Agentic Coding/某笔记.md" \
  --out "D:/OneDrive/Desktop/Notes/threetwoa_ob/Agentic Coding"

# 已在 .ob2blog/manifest.json 映射过的帖，动手前：
python .cursor/skills/_shared/scripts/sync_check.py --slug <slug>
```

`![[…]]` 不得留在笔记里。机械重转进 `posts/` 仅用于**已映射帖的紧急同步**（`prep_convert.py --apply`）。新稿写回 vault 该笔记所在目录。

### 渠道 3

打开 [`research-intake.md`](references/research-intake.md)。强时效现况先 `ask-grok`，贴回当渠道 2。其余题目：园主常先开 Cursor Multitask，父代理拆「网页 / 视频与口播要点 / 论坛心得 / 配图检索」并行，再汇总成一篇笔记。不要只靠一次通用网页搜索交差。

### 渠道 4

读并执行：

- 早报 → `.cursor/skills/ai-morning-brief/SKILL.md`
- 热榜 → `.cursor/skills/github-weekly-hot/SKILL.md`

合集落盘 / R2 / lint：`../_shared/periodical.md`。不要经 Knowledge，不调用外部图片生成。

## 提炼原则

1. 先求全。试探过程、命令日志、工具痕迹可删；不要为了「只留一句」把现场砍掉。
2. 粘贴的问题说明、数字表、插件清单优先保留结构，不要先改成通稿。
3. 每节能写结论就写；证据按需进表。没有要点就短写，不注水。
4. 公众号等重原料：`source/` 求全，主体求薄。

## 内容红线（笔记废稿线）

1. 不写「我调用了 curl / 脚本 / 子代理」。
2. 不贴工具脚本凑数；代码只在它本身是知识点时保留。
3. 禁样板客套。
4. 禁「一句话 X」标签；小节标题禁课件收尾腔。
5. 动词是观点，不是「我执行了」。

## 标题

完整、一看就知道讲什么。园主给了素材题/方向就先对齐，不要先写金句。禁止感想句（「没废 / 带歪了」）。  
列表卡 emoji 由站点 `title-mood` 挂，**不要**写进笔记标题。成帖 title / H2 / 开篇见 [`../_shared/post-redlines.md`](../_shared/post-redlines.md)。

## 落盘

固定根：`D:\OneDrive\Desktop\Notes\threetwoa_ob\`。沿用园主已有夹，不要发明 Knowledge 式 `todo/{Theme}` 树。

**渠道 1**：写回/更新该笔记所在目录（已有路径为准）。

**渠道 2–3**：写入 vault 内已有主题夹。优先 `Agentic Coding/`；对得上再用 `About Me` / `Competition` / `Explore` / `Inbox` / `素材处理区域`。对不上先问园主，不要新建空 Theme 夹。

需要附件或公众号原文时，在该主题夹下建篇目录（沿用现有「夹 + 单篇」习惯，不另造 Theme ID 目录）：

```
D:\OneDrive\Desktop\Notes\threetwoa_ob\{已有主题夹}\{YYYY-MM-DD}_{短题}\
├── {短题}.md
├── assets\          # 本地缓存；正文优先写 R2 URL
└── source\          # 公众号等重原料
```

轻量笔记也可直接写成 `{已有主题夹}\{短题}.md`（与 vault 里现有 Agentic Coding 单文件一致）。新建 Theme/facet 先问园主。

`D:\OneDrive\Desktop\Knowledge\todo` **只读旧库存**，不再作为 extract 默认产出。云端无盘：只输出 Markdown，仍声明 source/theme/facet，并写明本应落入的 vault 路径。

YAML 字段见 `theme-taxonomy.md`。

## 交付

1. 渠道 + `source` / `theme` / `facet` + **实际 vault 路径**。
2. 文件树。
3. section 表（标题 / 内容 / 形式）。
4. 配图：原图 / 检索 / 待补 / 未上 R2 的原因。
5. **停在这里。** 园主在 Obsidian 调完再走 knowledge-output（点名主题只发命中的；否则 output 优先读刚调完的 vault 笔记，旧库存才分批扫 `Knowledge/todo`）。`paste_kind` 为 wechat/bibigpt 时默认草稿箱。
