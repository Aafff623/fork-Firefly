---
name: ob2blog
description: >-
  Converts an Obsidian vault note (Markdown + wiki embeds + Assets) into a
  Firefly-compatible blog post under src/content/posts/ for this fork-Firefly /
  threetwoa's blog, and keeps Obsidian ↔ blog posts in sync via manifest +
  sync_check. Use whenever the user wants Obsidian→blog, OB 笔记发文, "ob2blog",
  sync/检查笔记一致性, import a local .md from an Obsidian vault, or says
  "加一篇文章" / "渲染成博客" / "导入 md" while the source lives in Obsidian.
  After a post lands, finish with site-cascade (dynamics/stats/tags/heatmap).
compatibility: Requires the Firefly project root (package.json with pnpm new-post). Windows PowerShell OK. Source may be outside the repo (Obsidian vault). Python 3 stdlib scripts under scripts/.
---

# ob2blog — Obsidian → Blog

把「Obsidian 笔记 + 附件」变成可渲染 Firefly 文章，并**持续核对** vault 与博客正文是否漂移。

**角色定位：** Obsidian vault → 本仓 posts 的转换 + 双边一致性维护（不是泛用 MD 编辑器）。

**详略原则：** 主文只写常用路径；同步/加速细节见 [sync-and-speed.md](references/sync-and-speed.md)。

## 按需阅读

| 何时打开 | 文件 |
|----------|------|
| **一致性检查、加速管线、manifest** | [sync-and-speed.md](references/sync-and-speed.md) |
| Vault 路径、`![[…]]` 解析、附件目录 | [obsidian-vault.md](references/obsidian-vault.md) |
| 字段、脏 yaml、要不要加密 | [frontmatter.md](references/frontmatter.md) |
| 提醒框 / 代码 / GitHub 卡 / MDX | [syntax-cookbook.md](references/syntax-cookbook.md) |
| 图、GIF、B 站/YT、音频 | [media-rules.md](references/media-rules.md) |
| 乱码、危险链、script、结构极端 | [safety.md](references/safety.md) |
| 官方文档入口 | [official-docs.md](references/official-docs.md) |
| 复制骨架 | [assets/templates/](assets/templates/) |

## 硬规则（常用）

1. 在 `Firefly/` 根目录落盘；UTF-8；正文从 `##` 起，不造卡片/TOC HTML。  
2. 默认 `.md`；要 Icon/JSX 才 `.mdx`。Callout 只出 github 五类。  
3. **重建** frontmatter；禁 `prev*`/`next*`；禁 `image: api`。  
4. 导入未声明时默认 `draft: false`（直接发布）；仅当用户明确要求草稿、或安全规则触发（如口令帖）才设 `draft: true`。勿改站点壁纸嵌视频。  
5. **必须解析 Obsidian 附件**；`![[…]]` 不得留在正文。  
6. **一致性：** 已映射文章每次动手前跑 `sync_check.py`；漂移先处理再改。  
7. **本地改名必跟：** vault 改文件名/标题 → 同步博客 `title` + manifest 路径 + 动态锚文本（见下节）；默认保留 slug。  
8. **加速：** 新文/重转优先 `prep_convert.py`，Agent 只审 `report.json` 警告项，勿从零手搓拷图。  
9. 跑 `validate_post.py`；未获准不 commit/push。

## 真源与一致性（摘要）

- **Obsidian = 真源**（文件名/标题 + 正文 + 附件）；博客可多站点装饰（导语、`description`、`::github`、部分 FM 开关）。  
- 映射表：`.ob2blog/manifest.json`（`obsidianNote` ↔ `slug` ↔ `assetMap` ↔ `noteSha256`）。  
- 检查：`python .cursor/skills/ob2blog/scripts/sync_check.py`（可加 `--slug` / `--watch 5` / `--json`）。  
- **默认不回写 Obsidian**；博客改正文导致冲突时停下来问用户。  

### 本地改名 / 改标题（必跟）

vault 笔记**改文件名**或用户声明标题以本地为准时，博客必须跟着维护，不能只留旧卡面：

1. `sync_check` 若报 `obsidian note missing` → 用**新绝对路径**重跑 `prep_convert.py --apply`（同一 `slug` 除非用户要改 URL）。  
2. 博客 `title` = 笔记文件名去 `.md`（或用户指定 `--title`）；同步更新指向该帖的「新笔记」动态文案。  
3. **默认保留 slug**（避免外链断裂）；仅当用户明确要求改 URL 才换 slug 并处理旧路径。  
4. 附件 wiki 名可仍是旧资源名——以 vault `Assets` 解析为准，不必因笔记改名强改附件文件名。  

详表与退出码 → [sync-and-speed.md](references/sync-and-speed.md)。

## 加速工作流（默认）

```
0 sync_check（已有映射）
→ 1 prep_convert.py（机械清洗+拷图+staging/apply）
→ 2 读 report.json，只修 missing/warnings
→ 3 FM/导语/github 润色（可选）
→ 4 validate_post.py
→ 5 需要时 pnpm dev；指纹未变可 skip 预览
→ 6 【收尾·必做】site-cascade 级联索引（见下）
```

本仓默认 vault（固定，见 `CONTEXT.md`）：`D:\OneDrive\Desktop\Notes\threetwoa_ob`（附件 `Assets/picture`）。

```bash
# 机械预转换（秒级）
python .cursor/skills/ob2blog/scripts/prep_convert.py \
  --note "D:/OneDrive/Desktop/Notes/threetwoa_ob/.../note.md" \
  --slug my-slug \
  --category "Agentic Coding" \
  --tags "AI,Cursor" \
  --apply

# 一致性
python .cursor/skills/ob2blog/scripts/sync_check.py --slug my-slug

# 发布前校验
python .cursor/skills/ob2blog/scripts/validate_post.py src/content/posts/<slug>/index.md
```

未加 `--apply` 时产物在 `.ob2blog/staging/<slug>/`（已 gitignore）。

### 旧慢路径（避免）

整篇靠 Agent 边读边猜边拷图边写——仅当 prep 失败或极脏源时回退。

## 布局

```
src/content/posts/<slug>/
├── index.md(x)
├── cover.*
└── images/
public/posts/<slug>/          # GIF / 本地音视频
.ob2blog/manifest.json        # 同步映射
.ob2blog/staging/<slug>/      # prep 草稿（不提交）
```

## 资源与正文转换

见 [obsidian-vault.md](references/obsidian-vault.md) / [media-rules.md](references/media-rules.md)。要点：

- 文首 `![[cover]]` → FM `image`，正文删除  
- 文内图 → `![alt](./images/…)`（禁相对路径 raw `<img>`）  
- 列表间插图须缩进，避免拆 `ol`  
- Tab → 空格；callout 映射；站外笔记 `[[…]]` 勿假装本仓 slug  

## 收尾：调用 site-cascade（必做）

帖子落盘并通过 `validate_post` 后，**默认级联**站点表面索引（最新动态 / 统计 / 分类标签 / 热力图）：

1. 读 `.cursor/skills/site-cascade/SKILL.md`  
2. 执行：

```bash
python .cursor/skills/site-cascade/scripts/cascade_check.py --slug <slug>
# 公开帖且尚无「新笔记」动态时：
python .cursor/skills/site-cascade/scripts/cascade_check.py --slug <slug> --emit-dynamic
```

3. 将 cascade 摘要写入本 skill 的最终汇报（动态是否 emit、分类/标签是否进索引、热力日期是否计入）。

MDC 提醒：`.cursor/rules/site-cascade-after-content.mdc`。  
分工：本 skill = Obsidian→帖；**site-cascade** = 发文后首页/侧栏级联。

## 汇报

源笔记、vault 附件根、slug、staging/apply 路径、`sync_check` 结果、report 警告、**site-cascade 结果**、假设与待确认。

## 旧名

原名 `firefly-md-to-post`；现统一 **ob2blog**。
