# 任务流（workflow）

```text
temp/research/idea/{theme}/          # 可选：灵感库沉淀
  → 新 session 提取
Issue(temp/research/<task-slug>/)
  → temp/reports/{theme}/  # 可选调研
  → docs/outputs/prd/{theme}/prd.md  # draft → 你批准
  → temp/handoff/{theme}/YYYY-MM-DD-{branch}-{task}.md
  → 实施 → awaiting-review【停】
  → 通过 → commit + docs/outputs/commit-history/{branch}/YYYY-MM-DD.md
  → archive
```

灵感只进 `temp/research/idea/` 时不算开题；从 idea 开调研 / PRD 起才走门禁。

## Phase / 交付闭环（强制）

每个 project-init phase 或可部署改动完成后，按固定顺序验收，禁止跳步：

```text
1. 本地启动预览     → pnpm dev（或 pnpm build && pnpm preview）→ http://127.0.0.1:4321/
   （若验 README 壳）→ 仓库根另起 python -m http.server 8090 → http://127.0.0.1:8090/preview-readme.html
2. 本地校验验收     → 目视关键页 + pnpm check（按改动范围）
3. 你确认无误后     → git commit（若需要）+ git push origin
4. 触发 CI/Vercel 部署 → 等 Ready；若改动含 EdgeOne 适配，同时核腾讯云 EdgeOne 构建
5. 打开线上公网     → https://www.threetwoa.live ；备用 https://fork-firefly.vercel.app
   （绑域清单见 docs/agents/edgeone-domain-runbook.md）
```

- **未完成本地预览与校验，不得 push。**
- **未看过线上结果，不得宣称 phase / 部署完成。**
- 仅改治理文档、不影响站点产物时：可省略浏览器预览，但仍需说明「无前端产物变更」。
- **`ERR_CONNECTION_REFUSED`**：该端口无进程（常见于重开 Cursor / 会话 aborted / 只起了其中一个）。双端口说明见 `CONTEXT.md` →「本地双端口预览」。

## 门禁

- PRD 未批准：不写大规模功能代码（配置微调 / 文案 / 部署除外，需在对话声明）。
- Review 先于 commit（除非你明确要求提交）。
- handoff **覆盖式**更新：同一 task 旧文件直接删除后写新文件。

## 与 Firefly 主题开发的关系

- 改 `src/config` / 内容 / 样式：走 Issue → 小 handoff 即可。
- 改布局内核 / 插件管线：建议先 report 再 PRD。
- 配置含义查阅 `docs/official/`（路由：`docs/knowledge/official-docs.tree.json`），勿臆造开关语义。

## 内容流水线（轻量，可不建 PRD）

与功能 PRD 流并行。**唯一进料口**是 `post-publish`（一条链：识别输入 → 沉淀 vault → 成帖 → 校验 → 级联收尾；用户不必点名渠道）。短动态 → `dynamic-publish`；早报/热榜 → `ai-morning-brief` / `github-weekly-hot`（合集，不经 vault）。skills 真源在 `.agents/skills/`，`.cursor/skills` 为 junction 桥接（见 `AGENTS.md`「Skill 联接」）。成帖红线：`.agents/skills/_shared/post-redlines.md`（`validate_post.py` 执行）。

```text
写篇博客 / 丢路径 / 粘贴 / 调研 / 早报
  → post-publish（识别输入 → 沉淀（先沉淀再发）→ 成帖 → 校验 → cascade 收尾）
       1 vault 路径     → 读笔记 → 确认发它 → 沉淀回原目录（附件图 → R2）
       2 粘贴图文       → 清洗分类 → 沉淀 vault 已有主题夹（优先 Agentic Coding/；有图用原图）
       3 无材料调研     → 并发广搜 + 检索配图 → 沉淀 vault 已有主题夹
       4 早报 / 热榜    → 交接 ai-morning-brief / github-weekly-hot（不经 vault）
  → 园主在 Obsidian 调到理想
  → 成帖发布：vault 理想稿 → posts/<slug>/（图片压缩上 R2、封面选图、validate 门禁）
  → 本地预览验收 → `_draftbox/`（未点头禁止出箱 / cascade / push）
  → 正式发：cascade_check 级联核对 → Agent 协作者评论
  → 发布成功：旧 Knowledge	odo 素材才迁 Archive；vault 新稿留在 vault
```

旧称甲/乙/丙 = 渠道 1 / 2–3 / 4。映射表仍是 `.ob2blog/manifest.json`（vault 路径 ↔ slug）。列表卡 emoji 仅 `title-mood` 展示层，**勿**写入 `title`。时间口径：站点 `published/updated` 按发布动作时间（方案 A）。

- Skill：`.agents/skills/post-publish/`（真源；`.cursor/skills` 为 junction）· `.agents/skills/dynamic-publish/`；合集细则 `_shared/periodical.md`
- 分流判定：`post-publish/SKILL.md` §0（obsidian / 对话 / URL / 粘贴 / 题目 / RSS）；成帖红线：`_shared/post-redlines.md`；图片/配图/R2：`post-publish/SKILL.md` §3-4 + `_shared/periodical.md`
- 粘贴进料若是公众号：并入 post-publish 渠道 2 清洗工序（Archive 求全 → Classify 去重 → Extract 求薄 → TTA 去课件腔）；BibiGPT 先搜证。二者默认草稿箱
- Theme/facet 管素材检索（≠ 博客 category，词表见 CONTEXT）
- **分类 / 合集**：对照 `CONTEXT.md` 词表自动建议 `category`；合集挂 `collections: [slug]` 按 `src/config/collectionsConfig.ts` 一二级（可双挂，不另存缓存）；批次汇报表过目。禁止默填 Agentic Coding；禁止私开合集空壳
- 沉淀不落 posts、不抽用语、不做封面。配图在沉淀阶段完成（原图或检索 → R2）；缺图标记待补，不在流程中调用模型生图。渠道 4 同样只使用已有素材

#### 公众号 Multi-Agent（渠道 2 清洗工序）

父 Agent 开 Multi-Task，四岗：`Archive`（原文+图无损）∥ `Classify`（Theme/facet + 去重）→ `Extract`（薄笔记）→ `TTA`（并入 post-publish 渠道 2）。

### Agent 协作者评论（发帖 / 发动态后必做）

当前发布工具用自己的 Waline 身份评一条，形成「内容 + 协作者视角」闭环。

| 项 | 约定 |
|---|---|
| 何时 | `post-publish` / 合集出箱 cascade 之后，或 `dynamic-publish` 落盘之后 |
| 谁 | 当前工具 key：`cursor` / `claude-code` / `pi` / `opencode` / `codex` |
| 命令 | `pnpm agent-comment --agent <key> --comment "…" --path "/dynamic/{entryId}/"`（发帖级联动态优先评动态 path；也可 `/posts/{slug}/`） |
| 语气 | **接梗 → 同频（损/共情）→ 人话**；钩原帖细节；禁金句说教。细则见 `dynamic-publish/SKILL.md` §5（接梗→同频→说人话）+ `agentPersonas` |
| 密钥 | 仅本机 Claude memory / 本地约定；**禁止写入仓库** |
| 环境 | `NODE_USE_ENV_PROXY=1`、`MSYS_NO_PATHCONV=1`；Waline 限流约 60s |

不在 CI 自动发评。

### 草稿箱（本地预览 · 不进远端）

园主定义的「草稿」：**本地能 `pnpm dev` 调试，但不进 git、不 push**。

```text
进箱：用户要草稿 / 先本地调试 / 园主说本地预览或验收
  → 落盘 src/content/posts/_draftbox/<slug>/（draft: true）
  → 校验可跑；禁止 git add 箱内正文；不 emit、不 cascade、不 push
  → 本地打开 /posts/<slug>/ 预览

出箱：用户说从草稿箱出来 / 可以发了
  → 迁到 src/content/posts/<slug>/
  → draft: false（除非仍要求草稿态 demo）
  → validate + cascade_check 级联核对（合集期刊可 --emit-dynamic，成帖禁 emit）
  → 纳入 git → 确认后 push → 核线上
```

| 对照 | 草稿箱 `_draftbox/` | FM `draft: true` 且已跟踪（如 `posts/draft.md`） |
|---|---|---|
| Git | 忽略正文 | 可 commit |
| 远端构建 | 无文件 | 有文件，生产列表过滤隐藏 |
| 用途 | WIP 真文、本地调试 | 主题 demo / 刻意入库的隐藏帖 |

箱内说明：`src/content/posts/_draftbox/README.md`。`.gitignore` 已忽略 `src/content/posts/_draftbox/**`，仅放行 `README.md`。

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

#### 版式：横版优先（硬约定）

博客正文里的 Mermaid **默认横版**（`flowchart LR` / `RL`；时序图本来就横向）。读者扫的是文章栏宽，竖长图（`TB`/`TD`）容易把版面撑成一条细带子，体验差。

| 优先级 | 做法 |
|---|---|
| 1 · 默认 | 先画横版：主轴左右（层 / 阶段 / 泳道从左到右） |
| 2 · 组内可竖 | 单个 subgraph **内部**可用 `direction TB` 叠条目，主轴仍保持 LR |
| 3 · 才允许整图竖 | 仅当横版节点链实在过长（经验：**主轴节点 / 阶段 ≥ 6～7**，或横拉后单行拥挤到标签互叠），先压缩文案 / 合并节点；仍不够再改 `TB`，并视作「横版延伸」——不是一上来就竖排 |

禁止：三层架构、三步流程这种短链直接 `flowchart TB` 上下堆。Agent 写帖 / 改图时默认按本条出图。

### 正文插图显示（站点渲染 · 密度友好）

成帖后默认**跟内容栏宽**；只压缩「竖、空、却撑满屏」的图。参考观感：`/posts/people-efficiency-four-layers/`（横/方信息图栏宽铺满 = OK）。

| 类型 | 判定（运行时） | 版面 |
|---|---|---|
| 横图 / 方图（信息密度常高） | `高/宽 ≤ 1.15` | `max-width: 100%`，**不限高** |
| 竖幅 | `高/宽 > 1.15` → `.md-img--tall` | 等比例 `max-height: min(62vh, 30rem)` |
| 典型竖海报（信息量常偏少） | 竖且 `宽≤900` 且 `高/宽≥1.28` → `.md-img--poster` | 再收：`max-height: min(52vh, 24rem)`、`max-width: min(100%, 22rem)` |
| 放大 / 关闭 | 单击 Fancybox；`Esc` 或点周围留白关闭（`FancyboxManager`） |
| 成帖侧 | 仍 Web 化落盘；**不要**为限高裁切原图；例外：`image-grid`、wiki 卡 |

实现：`src/styles/markdown.css` + `FancyboxManager.classifyContentImages`。质检时对照：信息图应接近栏宽；单人海报/立绘不应整屏只有一张图。

### 配图素材来源分级（先用现成素材）

正文插图 / 动图按三级取素材，**别一上来就生图**：

| 级 | 来源 | 示例 | 说明 |
|---|---|---|---|
| ① | 官方素材 | 官方 README 预览 gif、官方文档/截图 | 扒 GitHub raw / 文档图，带官方背书、最省事；**动图优先扒官方**（如 claude-mem 官方 README 的 `cm-preview.gif`，curl raw 直链即得） |
| ② | 网上相关素材 | 主题相关图、素材包、合规网图 | 搜主题关键词 + 站点限定；弱相关章可用免广告合规网图 |
| ③ | 待补 | 前两级确认都没有 | 在交接中标记缺口，不虚构、不调用模型生图 |

只有确认官方 / 网图都没有，才标记待补；动图尤甚——官方 README 的预览 gif 常是现成最优解。

### 大图落盘（R2，不进 git）

封面与正文大图优先走 Cloudflare R2（`img.` 子域，见 `CONTEXT.md` 部署事实 / `docs/agents/architecture-cost-optimized.md`）。**禁止**再把大 jpg/png/webp commit 进 `src/content/posts/**` 或 `public/` 撑 git pack。本地对照用的小图、LQIP、图标仍可入库。存量大图不在本条里搬迁，另开任务。

### 正文配图 / 索引帖信息图

索引帖、教程目录帖的章节图与卡片封面都只接入已经存在的本地、官方或合规素材。图片不足时保留缺口说明，不在发布流程中调用外部模型生成，也不把正文截图自动改成封面。
