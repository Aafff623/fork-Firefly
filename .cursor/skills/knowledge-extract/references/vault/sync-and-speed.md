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

硬规则：已映射帖在 extract 渠道 1 / output 动手前先 `sync_check`；用户说「检查一下笔记同步」时也跑。

```bash
python .cursor/skills/_shared/scripts/sync_check.py
python .cursor/skills/_shared/scripts/sync_check.py --slug ai-coding-save-money
python .cursor/skills/_shared/scripts/sync_check.py --watch 5
python .cursor/skills/_shared/scripts/sync_check.py --json
```

| 退出码 | 含义 |
|--------|------|
| 0 | 指纹一致 |
| 1 | drift / 缺文件 |
| 2 | manifest 缺失或参数错 |

漂移后动作：

1. **OB 更新、博客旧** → 先 `extract_vault.py` 进 Knowledge 再 output；紧急才 `prep_convert.py --apply`（会把图拷进 git，与 R2 策略冲突，需用户同意）  
2. **博客改了正文、OB 未改** → 汇报冲突，**默认不回写 vault**（除非用户明确「同步回 Obsidian」）  
3. 更新 manifest `noteSha256`（prep --apply 会写）

指纹算法见 `vault_lib.normalize_for_fingerprint`：从首个 `##` 起算；图按出现序 `⟦IMG:n⟧`；忽略 `::github`；并剥离列表符 / `<url>` 自动链 / 缩进空行等**格式噪音**（避免 prep 美化造成假漂移）。

## 加速管线（为何第一次慢、怎么快）

第一次慢，是因为 Agent 同时在：读 vault、猜映射、写 FM、改语法、拷图、开预览——全挤在对话轮次里。

**分流：脚本做机械，Agent 只审差异。**

**新稿默认走 extract 渠道 1**（`extract_vault.py` → Knowledge → output）。下面 `prep_convert.py --apply` 只留给**已映射帖**且用户同意把文件写进 `posts/` 的紧急重转。

```
A  extract_vault.py    ← 消解 ![[ ]]、拷附件进 Knowledge/assets
B  sync_check          ← 已映射帖对照指纹
C  Agent review        ← 只改 report 警告项 + 上 R2 + 提炼
D  knowledge-output    ← 成帖；validate_post + site-cascade
```

```bash
python .cursor/skills/knowledge-extract/scripts/extract_vault.py \
  --note "D:/.../Notes/.../某笔记.md" \
  --out "D:/OneDrive/Desktop/Knowledge/todo/{Theme}/{facet}/{YYYY-MM-DD}_{短题}"

# 紧急：机械写进 posts/（旧路径，会拷图进 git）
python .cursor/skills/_shared/scripts/prep_convert.py \
  --note "D:/.../Notes/.../某笔记.md" \
  --slug my-slug \
  --category "指南" \
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
2. 新文 → `extract_vault.py`；已映射 drift 且用户同意进 git → 才 `prep_convert.py --apply`  
3. 读 `extract_vault_report.json` / `staging/.../report.json` — **只处理 missing/warnings**  
4. 上 R2；润色 FM / 导语（若需要）  
5. `knowledge-output` + `validate_post.py`  
6. 需要时再 `pnpm dev`  
7. **收尾必做** → `site-cascade`
