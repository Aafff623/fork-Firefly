---
name: knowledge-extract
description: >-
  写稿唯一进料口：按输入自动分流，不要求用户点名渠道。
  即使用户说「发到博客 / 整理成文章」，只要还没有 Knowledge 笔记，也先走本技能、不要直接写 posts。
  渠道 1 本地 Obsidian 笔记路径（含旧口令 ob2blog / firefly-md-to-post）；
  渠道 2 粘贴图文（Grok / 公众号 / 网页 / BibiGPT / 会话正文，统一当正文+配图，先不要鉴定来源品牌）；
  渠道 3 没有参考只要调研（强时效先 ask-grok 贴回渠道 2；否则并发广搜：网页、视频站、行业大佬、使用心得，并自动配图）；
  渠道 4 RSS 合集（早报 / GitHub 每周热点）——内部交接 ai-morning-brief / github-weekly-hot。
  触发词：写篇博客、发到 blog、知识提炼、整理成笔记、调研、帮我查、Obsidian、vault、
  ob2blog、早报、热榜、橘鸦、github weekly、BibiGPT、公众号、mp.weixin。
  渠道 1–3 落盘 D:\OneDrive\Desktop\Knowledge\todo\{Theme}\{facet}\{日期_短题}\；
  不落 posts。发布交给 knowledge-output。
---

# knowledge-extract — 写稿进料（四渠）

本技能是**唯一进料口**。用户不必说「走哪条路」：看输入像什么，就进哪一渠。  
渠道 1–3 写成 Knowledge 笔记；**不**写 `src/content/posts/`。渠道 4 内部交接合集 skill（它们自己进草稿箱）。

旧名 `ob2blog` / `firefly-md-to-post` 已并入渠道 1，禁止再当独立 skill 调用。

## 安装（两类，禁止复制正文）

| 范围 | 真源 / 挂载 |
|------|-------------|
| **项目** | `Firefly/.cursor/skills/knowledge-extract/`（正文只在这里改） |
| **全局 + 各 AI 工具** | 目录联接（junction）指向上面这一份，见 `AGENTS.md`「Skill 联接」 |

相对路径 `../_shared/` 依赖 extract 本身是 junction（解析到仓内 `_shared`）。禁止把 SKILL.md 拷到 `~/.codex` / OpenCode 当独立副本。

当前不在 Firefly 工作区时：渠道 1–3 仍落 Knowledge；R2 上传与渠道 4 先定位 `D:\OneDrive\Desktop\blog\Firefly`（脚本会沿 `package.json` name=firefly 找根）。

## 按需阅读

| 何时打开 | 文件 |
|----------|------|
| 四渠判定 + 粘贴深度（公众号 / BibiGPT） | [`source-modules.md`](references/source-modules.md) |
| 渠道 3 广搜 + 配图检索 | [`research-intake.md`](references/research-intake.md) |
| 各渠配图 / R2 / MiniMax 兜底 | [`images.md`](references/images.md) |
| Theme × facet | [`theme-taxonomy.md`](references/theme-taxonomy.md) |
| 公众号保真分层（渠道 2 工序，不是入口） | [`wechat-mp.md`](references/wechat-mp.md) |
| Vault 附件 / `![[…]]` | [`vault/obsidian-vault.md`](references/vault/obsidian-vault.md) |
| 已映射帖一致性 | [`vault/sync-and-speed.md`](references/vault/sync-and-speed.md) |
| 成帖语法（交接 output 才用） | [`../_shared/post-redlines.md`](../_shared/post-redlines.md) |

## 开跑：先分流，再 Theme

```text
看输入 → 渠道 1/2/3/4（用户不点名）
  1–3 → theme/facet → 提炼/转换 → 配图（原图或检索）→ R2 → Knowledge
  4   → 读并执行 ai-morning-brief 或 github-weekly-hot（不要在本技能里重写合集流水线）
```

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
1 渠道 1：extract_vault.py；渠道 2：清洗粘贴（公众号则 Archive∥Classify）；渠道 3：并发广搜
2 提炼     → 结论、坑、可复用做法；删闲聊与工具痕迹（vault 成品笔记少改结构，重点消解图）
3 取舍     → 详略得当
4 结构     → 表格+短段落+必要 Mermaid
5 配图     → 见 images.md：有原图用原图；渠道 3 必须检索匹配；上传 R2；缺图才 MiniMax；GIF 仅当用户当场要
6 风格     → humanizer-tta
7 落盘     → todo/{Theme}/{facet}/{日期}_{短题}/ + 文首 YAML
8 交付     → 文件树 + section 表；提示交接 knowledge-output（无主题则分批扫 todo）
```

### 渠道 1 命令

固定 vault（见 `CONTEXT.md`）：`D:\OneDrive\Desktop\Notes\threetwoa_ob`。不得假定别的 vault 根。

```bash
python .cursor/skills/knowledge-extract/scripts/extract_vault.py \
  --note "D:/OneDrive/Desktop/Notes/threetwoa_ob/.../note.md" \
  --out "D:/OneDrive/Desktop/Knowledge/todo/{Theme}/{facet}/{YYYY-MM-DD}_{短题}"

# 已在 .ob2blog/manifest.json 映射过的帖，动手前：
python .cursor/skills/_shared/scripts/sync_check.py --slug <slug>
```

`![[…]]` 不得留在笔记里。机械重转进 `posts/` 仅用于**已映射帖的紧急同步**（`prep_convert.py --apply`），新稿默认只进 Knowledge。

### 渠道 3

打开 [`research-intake.md`](references/research-intake.md)。强时效现况先 `ask-grok`，贴回当渠道 2。其余题目：园主常先开 Cursor Multitask，父代理拆「网页 / 视频与口播要点 / 论坛心得 / 配图检索」并行，再汇总成一篇笔记。不要只靠一次通用网页搜索交差。

### 渠道 4

读并执行：

- 早报 → `.cursor/skills/ai-morning-brief/SKILL.md`
- 热榜 → `.cursor/skills/github-weekly-hot/SKILL.md`

合集落盘 / R2 / lint：`../_shared/periodical.md`。不要经 Knowledge，不要 MiniMax。

## 提炼原则

1. 一条知识只留读者能带走的那一句。试探过程、命令日志全删。
2. 每节先结论，证据按需进表。
3. 没有要点就短写，不注水。
4. 公众号等重原料：`source/` 求全，主体求薄。

## 内容红线（笔记废稿线）

1. 不写「我调用了 curl / 脚本 / 子代理」。
2. 不贴工具脚本凑数；代码只在它本身是知识点时保留。
3. 禁样板客套。
4. 禁「一句话 X」标签；小节标题禁课件收尾腔。
5. 动词是观点，不是「我执行了」。

## 标题

口语、有钩子。列表卡 emoji 由站点 `title-mood` 挂，**不要**写进笔记标题。

## 落盘

```
D:\OneDrive\Desktop\Knowledge\todo\{Theme}\{facet}\{YYYY-MM-DD}_{短题}\
├── {短题}.md
├── assets\          # 本地缓存；正文优先写 R2 URL
└── source\          # 公众号等重原料
```

新建 Theme/facet 先问园主。历史扁平 `todo/{日期}_{主题}/` 只读兼容。云端无盘：只输出 Markdown，仍声明 source/theme/facet。

YAML 字段见 `theme-taxonomy.md`。

## 交付

1. 渠道 + `source` / `theme` / `facet`。
2. 文件树。
3. section 表（标题 / 内容 / 形式）。
4. 配图：原图 / 检索 / MiniMax / 未上 R2 的原因。
5. **发布走 knowledge-output**（点名主题只发命中的；否则分批扫 todo）；`paste_kind` 为 wechat/bibigpt 时默认草稿箱。
