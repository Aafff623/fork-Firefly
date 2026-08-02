# 一致性维护 + 加速管线

## 真源约定

| 侧 | 职责 |
|----|------|
| **Obsidian 笔记** | 正文与配图的**内容真源**（你日常写作处） |
| **博客 posts** | 发布形态：Firefly frontmatter、卡片摘要、`::github`、站内互链等**站点装饰**可多不可少改语义 |
| **manifest** | `.ob2blog/manifest.json`：笔记路径 ↔ `slug` ↔ 资源映射 ↔ `noteSha256` |

允许差异（不算漂移）：`description` / `draft` / `pinned` / `comment` / 导语句 / GitHub 卡片 / ASCII 资源改名。  
算漂移：章节增删、段落改写、配图增删、列表结构明显变化、**笔记改名后 manifest 仍指旧路径**、**博客 `title` 与 vault 文件名（或声明标题）不一致**。

### 笔记改名 / 标题变更

| 现象 | 动作 |
|------|------|
| 只改 vault 文件名 | `prep_convert.py --note <新路径> --slug <原 slug> --apply`；更新 `title` + 动态链接文案 |
| 用户说「标题以本地为准」 | 同上；勿保留旧营销标题 |
| 用户要改 URL | 新 slug + 迁移目录；旧 `/posts/<old>/` 是否留跳转先问 |
| `sync_check` → `obsidian note missing` | 先核对 vault 是否改名，再修映射；勿当「笔记删了」直接删帖 |

## 时刻检查（怎么「一直对着」）

硬规则：Agent 跑 ob2blog **前**先 `sync_check`；用户说「检查一下笔记同步」时也跑。

```bash
# 全量
python .cursor/skills/ob2blog/scripts/sync_check.py

# 单篇
python .cursor/skills/ob2blog/scripts/sync_check.py --slug ai-coding-save-money

# 盯梢（秒）—— 本地改 OB 时开着
python .cursor/skills/ob2blog/scripts/sync_check.py --watch 5

# CI / Agent 机器读
python .cursor/skills/ob2blog/scripts/sync_check.py --json
```

| 退出码 | 含义 |
|--------|------|
| 0 | 指纹一致 |
| 1 | drift / 缺文件 |
| 2 | manifest 缺失或参数错 |

漂移后动作：

1. **OB 更新、博客旧** → `prep_convert.py --apply` 再 Agent review 差异  
2. **博客改了正文、OB 未改** → 汇报冲突，**默认不回写 vault**（除非用户明确「同步回 Obsidian」）  
3. 更新 manifest `noteSha256`（prep --apply 会写）

指纹算法见 `ob2blog_lib.normalize_for_fingerprint`：从首个 `##` 起算；图按出现序 `⟦IMG:n⟧`；忽略 `::github`；并剥离列表符 / `<url>` 自动链 / 缩进空行等**格式噪音**（避免 prep 美化造成假漂移）。

## 加速管线（为何第一次慢、怎么快）

第一次慢，是因为 Agent 同时在：读 vault、猜映射、写 FM、改语法、拷图、开预览——全挤在对话轮次里。

**分流：脚本做机械，Agent 只审差异。**

```
A  prep_convert.py     ← 秒级：解析 ![[ ]]、拷附件、 staging 草稿 + report.json
B  sync_check / diff   ← 对照原文与草稿指纹、列 missing embeds
C  Agent review        ← 只改 report 警告项 + FM 润色 + validate_post
D  pnpm dev 抽查       ← 仅首发或有媒体坑时
```

```bash
python .cursor/skills/ob2blog/scripts/prep_convert.py \
  --note "D:/.../Notes/.../某笔记.md" \
  --slug my-slug \
  --category "Agentic Coding" \
  --tags "AI,Cursor" \
  --apply
```

未加 `--apply` 时只写 `.ob2blog/staging/<slug>/`（gitignore），确认后再 apply。

### 比「先清洗再人工对照」更好的点子（已采纳 / 可选）

| 点子 | 作用 | 状态 |
|------|------|------|
| **prep 脚本出 staging+report** | 机械步骤 0 token | ✅ 已做 |
| **manifest + 内容指纹** | 未改笔记直接 skip，不重跑转换 | ✅ sync_check |
| **资源 content-hash 增量拷贝** | 大图不重复 copy | 可后续加到 prep |
| **`--watch` 漂移告警** | 「时刻检查」不靠人记 | ✅ sync_check --watch |
| **只把 report.warnings 丢给 Agent** | review 上下文极短 | ✅ 流程约定 |
| 浏览器渲染 HTML diff | 重、慢 | ❌ 默认不做；有坑再截图 |
| 双向自动回写 Obsidian | 易覆盖你本地笔记 | ❌ 需用户显式授权 |

## Agent 检查清单（加速版）

1. `sync_check.py`（有映射则）  
2. 新文或 drift → `prep_convert.py --apply`  
3. 读 `staging/.../report.json`（或 apply 后的 report）— **只处理 missing/warnings**  
4. 润色 FM / 导语 / github 卡（若需要）  
5. `validate_post.py`  
6. 需要时再 `pnpm dev`；未改动则 skip 预览  
7. **收尾必做** → `site-cascade`（`cascade_check.py`；公开帖按需 `--emit-dynamic`）  
