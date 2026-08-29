---
name: site-cascade
description: >-
  Cascades homepage/sidebar site indices after new blog content: latest
  dynamics (including "published a new note"), site stats, category/tag bars,
  and calendar heatmap. Use after knowledge-output, collection skills, or any
  new/updated post under src/content/posts/ (including hand-written posts),
  when the user mentions 最新动态 / 站点统计 / 分类标签 / 热力图 / 级联索引, or
  when the site-cascade MDC rule fires.
compatibility: Firefly project root. Python 3 stdlib. Windows PowerShell OK.
---

# site-cascade — 发文后站点级联索引

新博客内容入库后，像级联一样核对并维护首页/侧栏会读到的四类信息：

1. **最新动态**（含用户碎碎念 +「发布了新笔记」）  
2. **站点统计**（文章数、分类数、标签数、字数、最后活动）  
3. **分类与标签**（首页 CategoryBar + 侧栏列表的数据与组件位置）  
4. **热力图**（日历组件年度投稿热力）

## 先搞清：自动 vs 要动手

| 表面 | 数据从哪来 | Agent 要做什么 |
|------|------------|----------------|
| 站点统计 | `getSortedPosts` 等，构建/dev 时聚合 | 保证帖子 FM 正确、`draft` 符合预期；跑 `cascade_check.py` 验收数字 |
| 分类 / 标签条 | 各帖 `category` / `tags` | 新帖必须写清晰分类与标签；核对侧栏 `categories`/`tags` 仍 enable |
| 热力图 | `/api/allPostMeta.json` ← 各帖 `published` | 保证 `published: YYYY-MM-DD`；非 draft（生产）才计入 |
| 最新动态 | `src/content/dynamic/*.md` + `/api/dynamic.json` | 只保留真实动态（园主手写 / Agent 发布）；发文级联 emit 已关闭（见下 §3） |

**不要**为了「刷新统计」去改布局内核或手写假数字。配置位在 `src/config/sidebarConfig.ts`。

## 触发

- **默认：** 任意帖子 `src/content/posts/**` 新增/实质更新且准备收尾时（上游可为 `knowledge-output`、合集 skill 或手写 posts）。  
- **MDC：** `.cursor/rules/site-cascade-after-content.mdc`（编辑 posts/dynamic 时提醒）。  
- **口令：** 「更新最新动态 / 刷一下统计 / 热力图 / 级联索引」。

## 工作流

```
1 确认触发帖（slug）→ 2 cascade_check.py
→ 3 （发文级联动态已关闭，跳过 emit；除非园主显式开回 includeSystemNotes）
→ 4 核对侧栏组件位置（只读/必要时修 enable）
→ 5 Agent 协作者评论（评在园主相关真实动态或文章页；语气 humanizer-tta）
→ 6 汇报四表面验收项 + 评论是否发出
```

步骤 5 细则见 `dynamic-post` skill「Agent 协作者评论」与 `docs/agents/workflow.md` 同名小节。密钥不入库；代理 / 限流失败时在汇报里写明，勿假装已评。

### 1–2. 索引检查

在 `Firefly/` 根目录：

```bash
python .cursor/skills/site-cascade/scripts/cascade_check.py
python .cursor/skills/site-cascade/scripts/cascade_check.py --slug ai-coding-save-money
```

脚本输出：文章/分类/标签/字数、热力日期分布、侧栏组件 enable 位、某 slug 是否已有关联动态。

### 3. 最新动态（新笔记）

**已关闭（园主 2026-08-29 拍板）**：发文不再级联生成「发布了新笔记」动态。`dynamicConfig.includeSystemNotes` 非 `true` 时 `--emit-dynamic` 会被脚本拒绝，也不要手写该类动态文件。动态只允许园主手写（`pnpm new-dynamic`）或 Agent 以本人身份发布；历史级联条目已由配置过滤不出站。以下流程仅当园主显式把 `includeSystemNotes` 改回 `true` 时恢复：

对 **已出箱且 `draft: false`** 的新帖（或用户明确要求），若尚无指向该帖的动态，则创建。  
**草稿箱**（`posts/_draftbox/`）本地 WIP：**不要** `--emit-dynamic`，也不要为进箱动作改侧栏/假统计。

```bash
# 默认带批注（写入 Markdown blockquote；口语短句，像发推/L 站随口评，忌产品白皮书腔）
python .cursor/skills/site-cascade/scripts/cascade_check.py \
  --slug <slug> --emit-dynamic --blurb "Luna 写码真香，画图额度咬得也狠。"
```

草稿箱与 `draft: true`：脚本会拒绝 emit，不要绕过。

生成 `src/content/dynamic/YYYY-MM-DD-HHMMSS.md`，形态为：

```markdown
发布了新笔记：[标题](/posts/<slug>/)

> 作者批注一两句
```

未传 `--blurb` 时：用帖子完整 `description`（仅折叠空白）；再无则用「写完挂上了，点进去看。」  
批注语气：第一人称口语（「属实」「真香」「别踩坑」），禁止「本文旨在」「综上所述」。  
旧条目无批注或需重写截断批注可跑：`python .cursor/skills/site-cascade/scripts/backfill_note_blurbs.py`（`--force` 覆盖已有 `>`）。  

用户手写碎碎念继续用 `pnpm new-dynamic "..."`；本 skill **不删**既有动态。

### 4. 分类 / 标签「位置」

「位置」= 侧栏组件是否启用、顺序是否仍在 `sidebarConfig` 预期槽位（左：categories→tags；右：dynamic→stats→calendar…）。  
`cascade_check.py` 会读配置并 WARN 若被关掉。  
**排序**由主题按名称/计数聚合，无需手维数组；若用户要固定某分类置顶，再改配置（少见，先问）。

### 5. 热力图

依赖帖子 `published` 进入 `allPostMeta`。检查：

- 日期合法；公开帖非 draft（生产环境 draft 不计入）  
- `sidebarConfig` 里 `calendar.specificConfig.calendar.showHeatmap === true`

改完后本地打开首页看日历热力格是否亮到对应月周即可（dev 即生效）。

## 硬规则

1. 级联在 **内容落盘之后** 跑；未获准不 commit。  
2. 统计数字以脚本/站点聚合为准，禁止硬编码进组件。  
3. 动态文案简短；链到本站帖用 `/posts/<slug>/`；**笔记型动态须带 `>` 批注**（人工 / description / 兜底）。  
4. 与上游分工：`knowledge-output`（Knowledge→帖，含 vault 进料）/ 合集 skill / 手写 posts 负责正文落盘；**本 skill 负责发文后的站点表面**。  
5. 侧栏大改（挪组件顺序）需用户确认，默认只修误关的 enable。

## 汇报模板

- 触发 slug / draft / **category（须已确认）**  
- cascade_check 摘要（帖数、分类、标签、字数）  
- 动态：级联 emit 已关闭；除非园主显式开回 `includeSystemNotes`，不产生新系统动态  
- **协作者评论**：agent key / path / 成功或限流·代理失败原因  
- 侧栏 / 热力 WARN  
- 建议用户刷新的页面：`/` 、`/dynamic/`

## 参考

- 侧栏：`src/config/sidebarConfig.ts`  
- 动态配置：`src/config/dynamicConfig.ts`  
- API：`src/pages/api/allPostMeta.json.ts`、`dynamic.json.ts`  
- 联用：上游可为 `knowledge-output` **或** 合集 skill **或** 手写 posts；任一路径落盘后收尾必须引用本 skill  

