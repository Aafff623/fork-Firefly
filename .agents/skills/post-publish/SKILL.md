---
name: post-publish
description: >-
  Firefly 博客发文唯一入口（取代 post-publish / post-publish /
  cascade 收尾）。一条链完成：识别输入 → 沉淀为 Obsidian 笔记（先沉淀再发）→
  压缩图片上 R2 → 成帖到 posts/ → 封面视觉选图 → validate 门禁 → cascade
  收尾。任何“写篇博客 / 整理成文章 / 把这段发了 / 总结那篇 / 发个笔记”都从这里进。
compatibility: Firefly 项目根。Python 3 stdlib + sharp(PIL 回退)。Windows OK。
---

# post-publish — 发布文章（唯一入口）

从「用户给了什么」到「文章上线在 www.threetwoa.live」的一条链。所有输入都归一：
本 skill 内置「识别 → 沉淀 → 成帖」三段，不要求用户点名渠道。

## 触发（只要用户有发文意图，且目标不是短动态，就进本 skill）

写篇博客 / 发到 blog / 整理成文章 / 知识提炼 / 把这段整理成笔记 / 总结那篇 / 调研 /
帮我查 / Obsidian 笔记 → 发 / 粘贴正文发 / 外部文章 URL → 沉淀 / vault / 对话历史提炼。
（短内容、碎碎念、配图心情 → 走 `dynamic-publish`；早报/热榜合集 → 也经本链的
RSS 分支或交接 `ai-morning-brief` / `github-weekly-hot`。）

## 工作流

### 0. 识别输入 + 分流

先判断用户给的是什么，再决定沉淀路径：

| 输入 | 判定 | 走法 |
|---|---|---|
| Obsidian 笔记路径 | 路径存在且向上有 `.obsidian/` | 读笔记 → 确认发它 |
| 对话历史 / 聊天结论 | 大段会话、提炼请求 | 归并成文 → 沉淀 |
| 外部文章 URL | 链接 + “总结/沉淀/发” | 抓正文 → 沉淀 |
| 粘贴图文 | 大段正文/公众号/导出 MD | 清洗 → 沉淀 |
| 只有题目 | “写篇关于 X / 调研 X” | 并发调研 → 沉淀 |
| RSS 合集口令 | 早报/热榜 | 交接合集 skill |

> **判据**：两种输入并存按上表优先级；品牌（公众号/BibiGPT/Grok）只影响工序深度，不影响入口。

### 1. 沉淀（内置·先沉淀再发）

把材料整理成 **Obsidian 笔记**（vault = `D:\OneDrive\Desktop\Notes\threetwoa_ob`），
vault 是长期真源。笔记 frontmatter 用**英文下划线命名**：

```yaml
---
author: 作者名            # 必填
url:                      # 可选；可多个（视频版/文字版/字幕来源）；由用户告知，不自造
  - https://…
create_time: 2026-09-03            # 创建时间
update_time: 2026-09-03T10:00:00   # 更新时间；总结类文章 = create_time
---
```

- **缺 author / create_time / update_time → 向用户询问**，并说明流程（为何要时间）。
- 落盘位置：已有主题夹优先（`Agentic Coding/` 等）；不新建空主题夹除非园主点头。
- 材料里有配图的：图存本地 `assets/`（vault 附件），正文用 `![alt](./assets/x)`。
- 求全写入，不发布、不做封面。沉淀完把 vault 笔记路径 + 文件树交给用户确认。

### 2. 成帖（发布岗）

**时间口径（方案 A，硬规则）**：站点 `published / updated` **一律按发布动作时间**
（当天），不映射笔记 `create_time / update_time`。笔记时间仅留 vault 参考。
理由：避免历史日期回填式增长；发布当天带时分可保证同日多篇顺序、自动置顶。

流程：

1. 读 vault 理想稿（用户点名的 / 刚沉淀的）。
2. 补缺口 + 自检三关：详细度 / 标题 / 配图。标题对齐用户给的素材方向。
3. 重建 frontmatter → 站点模型（**不是** vault 模型）：

```yaml
---
title: 完整标题（不写 emoji，展示层 title-mood 会挂）
published: 2026-09-03            # = 发布当天（方案 A）
updated: 2026-09-03T10:00:00     # 发布当天带时分（决定置顶顺序）
description: 一两句摘要（首页卡与 OG）
image: ./cover.webp              # 本地封面（见 §3）
tags: [3-8 个读者会搜的词]
category: 分类名                 # 对照 CONTEXT.md 词表，禁默填 Agentic Coding
collections: []                  # 只挂一二级 slug；跨树才双挂
draft: true               # 默认先进草稿箱；用户点头出箱时才改 false
author: <作者>                   # 笔记 author 同步
sourceLink: ""                   # 主来源 URL（用户告知才填）
slug: <kebab-case>
pinned: false
comment: true
---
```

4. 正文语法守 `_shared/post-redlines.md`（半角冒号、破折号、禁标题、H2 必须有等）。
   图片/媒体语法守 `_shared/periodical.md` 约定（封面只写 FM；静图 `./images/`；
   GIF 进 `public/posts/<slug>/`；B 站/YT iframe）。
5. **落盘一律先进草稿箱**（没有"直接发"这个选项）：`src/content/posts/_draftbox/<slug>/index.md`
   （+ `cover.webp` + `images/`），`draft: true`，**不 git add、不 push**。
   - 草稿箱 = 本地 `pnpm dev` 预览，出现在首页列表供你确认效果。
   - 你确认没问题、说「可以发了 / 出箱」→ 才迁到 `src/content/posts/<slug>/`、`draft: false`，
     → validate → 级联核对 → **push 仍要你点头**。

### 3. 图片处理（共享模块）

**大图不进 git**。统一走 `_shared/scripts/image_utils.py`：

```bash
python .agents/skills/_shared/scripts/image_utils.py --file <local> --role post --upload --key posts/<slug>/<name>.webp
```

- 角色尺寸：post 正文 1600 / cover 1200 / dynamic 1200；编码 webp q80（sharp），
  透明贴深色底；无 sharp 时 PIL 回退 jpg。
- 上传 R2（桶 firefly-comment → `https://img.threetwoa.live/<key>`），GET 200 验证；
  无凭据 → 降级本地 webp + 汇报待补。
- 正文插图引用写公网 URL；本地 `images/` 不保留大图副本。
- 工具：`upload_r2.py` 已支持 `--content-type image/webp`（勿回退 jpg-only）。

### 4. 封面（视觉模型介入）

| 情况 | 动作 |
|---|---|
| 有图且能匹配 | 用视觉模型分析，选最贴合场景情绪/风格的一张；等比例适配 + 视情况裁剪，为 cover 单独做（scale/crop，长边 ≤1200） |
| 思考后无匹配 | 用生图 skill（参考 oil-cover 的构图/质检思路）创建 |
| 非生图模型 / 无法创建 | **写清楚 prompt 呈现给用户**，用户生成后回传，再继续 |

- 封面 `image: ./cover.webp` 只写 FM。
- 点名本站角色（SpritePet / maid-deepseek-whale）→ 用其真实素材，不生成。

### 5. 校验（机器门禁）

```bash
# 草稿箱阶段（draft:true，validate 会对 _draftbox 强制校验）
python .agents/skills/_shared/scripts/validate_post.py src/content/posts/_draftbox/<slug>/index.md
```

- 输出 `FAIL`（拦）→ 修到过；`WARN` → 汇报必贴；`OK` → 过。
- 红线文档 = `_shared/post-redlines.md`（改规则两处同改：文档 + validate_post.py）。
- 本地 `pnpm check` 过；`pnpm dev` 本地预览确认渲染（草稿箱在首页列表可见）。

### 6. 收尾（cascade 并入）

出箱后（你点头「可以发了」、迁到 posts/ 并 draft:false 之后）：

1. 跑 `_shared/scripts/cascade_check.py --slug <slug>` 核对四表面：最新动态 / 站点统计 /
   分类标签 / 热力图。**不发“发布了新笔记”动态**（includeSystemNotes=false，脚本会拒）。
2. 可选：Agent 协作者评论（`pnpm agent-comment --agent <key> --comment "…" --path /posts/<slug>/`；
   语气「接梗→同频→人话」；Waline 限流 ~60s；密钥只本机不入库）。

### 7. 交付闭环（硬门禁）

```text
pnpm dev 本地预览 → pnpm check → 园主确认 → push → 等 Vercel Ready
→ 打开 https://www.threetwoa.live 核线上（备用 fork-firefly.vercel.app）
```

- 未本地验收不得 push；未看线上不得宣称部署完成。
- push 由园主发话；agent 不擅自 push。

## 红线（横向）

- 大图走 R2（img.threetwoa.live），禁止大 jpg/png/webp commit 进 posts/ 或 public/。
- 配图三级取材：官方素材 → 合规网图 → 标记待补；全链路禁模型生图（封面生图需园主点头）。
- URL（sourceLink / 来源 / 多 URL）一律用户告知，不自造。
- category 禁默填 Agentic Coding；对照 CONTEXT 词表。
- 时间一律发布口径（方案 A）。

## 参考与复用

- 红线文档：`_shared/post-redlines.md` · 机器校验：`validate_post.py`
- 图片：`_shared/scripts/image_utils.py` · R2：`upload_r2.py` · 级联：`cascade_check.py`
- vault helpers：`_shared/scripts/vault_lib.py`（resolve_vault_file / manifest）
- 分类词表：`CONTEXT.md` · 合集：`src/config/collectionsConfig.ts`
- 标题防 AI：`references/heading-anti-ai.md`（本 skill 同目录）
