# 任务流（workflow）

```text
docs/idea/{theme}/                   # 可选：灵感库沉淀（本 session 可只写到这）
  → 新 session 提取
Issue(.scratch/<feature>/)
  → docs/outputs/report/{theme}/     # 可选调研
  → docs/outputs/prd/{theme}/prd.md  # draft → 你批准
  → docs/outputs/handoff/{theme}/YYYY-MM-DD-{branch}-{task}.md
  → 实施 → awaiting-review【停】
  → 通过 → commit + docs/outputs/commit-history/{branch}/YYYY-MM-DD.md
  → archive
```

灵感只进 `docs/idea/` 时不算开题；从 idea 开调研 / PRD 起才走门禁。

## Phase / 交付闭环（强制）

每个 project-init phase 或可部署改动完成后，按固定顺序验收，禁止跳步：

```text
1. 本地启动预览     → pnpm dev（或 pnpm build && pnpm preview）
2. 本地校验验收     → 目视关键页 + pnpm check（按改动范围）
3. 你确认无误后     → git commit（若需要）+ git push origin
4. 触发 CI/Vercel 部署 → 等 Ready
5. 打开线上公网     → https://fork-firefly.vercel.app 再核一遍
```

- **未完成本地预览与校验，不得 push。**
- **未看过线上结果，不得宣称 phase / 部署完成。**
- 仅改治理文档、不影响站点产物时：可省略浏览器预览，但仍需说明「无前端产物变更」。

## 门禁

- PRD 未批准：不写大规模功能代码（配置微调 / 文案 / 部署除外，需在对话声明）。
- Review 先于 commit（除非你明确要求提交）。
- handoff **覆盖式**更新：同一 task 旧文件直接删除后写新文件。

## 与 Firefly 主题开发的关系

- 改 `src/config` / 内容 / 样式：走 Issue → 小 handoff 即可。
- 改布局内核 / 插件管线：建议先 report 再 PRD。
- 配置含义查阅 `docs/official/`（路由：`docs/knowledge/official-docs.tree.json`），勿臆造开关语义。

## 内容流水线（轻量，可不建 PRD）

与功能 PRD 流并行；按**素材来源**走甲或乙，收尾都是 `site-cascade`。工作区根若为 `blog/`：skills/rules 经 junction 暴露到 `blog/.cursor/`（见 `AGENTS.md`）。

### 甲 · Obsidian vault → 帖

仅覆盖「笔记已在固定 vault」这一通道，**不是**全部内容入口。

```text
Obsidian 笔记（固定 vault，见 CONTEXT.md）
  → /ob2blog（图文→ src/content/posts/<slug>）
  → site-cascade（动态 / 统计 / 分类标签 / 热力图；笔记动态带 `>` 批注，可用 `--blurb`）
  → 本地预览 →（你确认后）commit / push → 核线上
```

- Skill：`.cursor/skills/ob2blog/`、`.cursor/skills/site-cascade/`
- 笔记↔帖映射：`.ob2blog/manifest.json`
- 列表卡标题情绪点缀（emoji/颜文字）：仅 `PostCard` 展示层 `src/utils/title-mood.ts`；**勿**写入 frontmatter `title`
- 笔记型动态：标题链 + Markdown `>` 作者批注（`--blurb` 或帖子 description）

### 乙 · 会话/调研 → Knowledge → 帖

```text
会话 / 调研结论
  → knowledge-extract（→ D:\OneDrive\Desktop\Knowledge\todo\{日期_主题}\）
  → knowledge-output（→ src/content/posts/<slug>；无参数=todo 全部，带主题=仅指定；成稿后强制过 humanizer-tta 去 AI 味，评分 ≥45 才发布）
  → site-cascade（同上；emit 须带批注）
  → 发布成功后素材移入 Knowledge\Archive\ 留档
  → 本地预览 →（你确认后）commit / push → 核线上
```

- Skill：`.cursor/skills/knowledge-extract/`、`.cursor/skills/knowledge-output/`、`.cursor/skills/site-cascade/`
- 与甲互补：素材未进 Obsidian 时走乙；已进 vault 需双边同步时再走甲
- 列表卡标题情绪点缀：同甲——仅 `title-mood` 展示层；**勿**写入 frontmatter `title`
- 笔记型动态批注约定：同甲

### 流程图/时序图用 Mermaid（别用文字代码块）

正文里的流程 / 时序 / 状态流转类图，用 Mermaid 代码块（站点 `merman` 构建渲染 SVG，浅/深主题自动切换，见 `mermaidConfig.ts`），**别用文字代码块**。类型按场景选：

| 场景 | Mermaid 类型 |
|---|---|
| 流程 / 步骤 | `flowchart` |
| 多对象交互 / 调用时序 | `sequenceDiagram` |
| 状态流转 | `stateDiagram-v2` |
| 数据表关系 | `erDiagram` |
| 项目时间线 / 排期 | `gantt` |
| 占比 / 分布 | `pie` |

### 配图素材来源分级（先扒现成，再生成）

正文插图 / 动图按三级取素材，**别一上来就生图**：

| 级 | 来源 | 示例 | 说明 |
|---|---|---|---|
| ① | 官方素材 | 官方 README 预览 gif、官方文档/截图 | 扒 GitHub raw / 文档图，带官方背书、最省事；**动图优先扒官方**（如 claude-mem 官方 README 的 `cm-preview.gif`，curl raw 直链即得） |
| ② | 网上相关素材 | 主题相关图、素材包、合规网图 | 搜主题关键词 + 站点限定；弱相关章可用免广告合规网图 |
| ③ | 生图 | 前两级确认都没有 | 按 style-taste 走 `firefly-minimax-media`（见下小节） |

只有确认官方 / 网图都没有，才动生图；动图尤甚——官方 README 的预览 gif 常是现成最优解。

### 正文配图 / 索引帖信息图（MiniMax）

索引帖、教程目录帖的「章节小长条 / 信息图」与卡片封面不同：要按章节主题拆元素与指向关系，不是吉祥物换姿势。**画风走 style-taste，不锁死单一材质**（曾误把「水彩」写成默认，已废止）。

操作细节与 checklist：`.cursor/skills/firefly-minimax-media/`（`SKILL.md` + `references/prompt-craft.md` 风格路由）；成帖 Web 化 / 质检：`knowledge-output`「配图规范」。样张：`public/media/minimax/style-taste/`。

| 项 | 规范 |
|---|---|
| 风格路由（强制） | 生图前按章/按帖选定 **style-taste ID**（见 `prompt-craft`：通用 03/05/06/08/09/10/16，特定 01/02/07/11/13/**17**）。风格服务内容：工具链/架构→08 等轴；系统设计→05 包豪斯；流程示意→08 或 03；教程科普→16 水粉（可选，非默认）；情绪随笔→09 胶片；综述多概念→10 剪纸；日历/合集吉祥物→**17 卡通人物**（勿用 01 场景像素凑）。**禁止**整帖/整批共用一个材质 prompt（含禁止默认水彩）。 |
| 同帖差异 | 封面与章节图、相邻章之间宜错开风格或至少错开色板/构图；并发子 Agent **不得**继承兄弟帖的风格模板，由父代理下发「本帖风格表」。 |
| 构图方向 | 信息图 + 主题元素；禁止「同款吉祥物只换姿势」。长工程可先落稿，多轮再优化，**不默认整组返工**。 |
| 元素尺度 | 附属图标（平台/渠道/Node/电脑等）须够大、对比够、一眼可辨；禁止缩成难辨色点。吉祥物可作主体，但不能只剩主体。 |
| 留白 / 字图 | 主体占画面主体，忌大面积空镜；中文胶囊与插画分区，禁止字图空间相交。 |
| 图内文案 | **勿复读章节名/H2**；写要点或元素说明。模型烧中文不稳时：底图无字 + 后期叠字（叠字纳入排版）。 |
| 参照物 | **必须**官网/素材库 reference（或合规网图）；禁止空捏。弱相关章可直接用免广告合规网图。 |
| 生图入口 | `firefly-minimax-media`（额度门禁 → 选定 style ID → MCP/`mmx` → `fetch_media.py` → 接线） |

**已知坑（简记）**

| 坑 | 处理 |
|---|---|
| 整批水彩/同款套图 | 未走 style-taste；回查本帖风格表，按章重选 ID 再画 |
| Astro `data-store` / OneDrive | 改图后对磁盘真源，硬刷新；勿只信浏览器 |
| `image-01` 中文不稳 | 无字底图 + 后期叠字 |
| Windows mmx prompt 编码 | prompt 用文件或确认 UTF-8；避免管道吞编码 |