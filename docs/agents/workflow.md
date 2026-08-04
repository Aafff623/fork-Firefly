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
  → site-cascade（动态 / 统计 / 分类标签 / 热力图）
  → 本地预览 →（你确认后）commit / push → 核线上
```

- Skill：`.cursor/skills/ob2blog/`、`.cursor/skills/site-cascade/`
- 笔记↔帖映射：`.ob2blog/manifest.json`

### 乙 · 会话/调研 → Knowledge → 帖

```text
会话 / 调研结论
  → knowledge-extract（→ D:\OneDrive\Desktop\Knowledge\{日期_主题}\）
  → knowledge-output（→ src/content/posts/<slug>）
  → site-cascade
  → 本地预览 →（你确认后）commit / push → 核线上
```

- Skill：`.cursor/skills/knowledge-extract/`、`.cursor/skills/knowledge-output/`、`.cursor/skills/site-cascade/`
- 与甲互补：素材未进 Obsidian 时走乙；已进 vault 需双边同步时再走甲

### 正文配图 / 索引帖信息图（MiniMax）

索引帖、教程目录帖的「章节小长条 / 信息图」与卡片封面不同：要按章节主题拆元素与指向关系，不是吉祥物换姿势。操作细节与 checklist 见 `.cursor/skills/firefly-minimax-media/`；成帖侧 Web 化 / 质检见 `knowledge-output`「配图规范」。

| 项 | 规范 |
|---|---|
| 方向（已认可） | 水彩信息图 + 主题元素；比「同款吉祥物换姿势」优先。长工程可先落稿，多轮后再优化，**不默认返工整组图**。 |
| 元素尺度 | 附属图标（平台/渠道/Node/电脑等）须够大、对比够、一眼可辨；禁止缩成难辨色点。吉祥物可作主体，但不能只剩主体。 |
| 留白 | 允许适度留白；主体（吉祥物 + 关键元素 + 信息）须占画面主体，忌大面积空镜。 |
| 字图布局 | 中文胶囊/标题与插画分区；控制字号与元素尺度，禁止文字与图标空间相交。 |
| 图内文案 | **勿复读章节名/H2**（如「00 导读」模块图不要再写「00 导读」）；写要点或元素说明。 |
| 参照物 | **必须**找官网模板/素材库，下载后作 reference / subject-ref / 构图参考；禁止仅靠模型记忆空捏。 |
| 布局 | 按章节主题动态拆分元素与箭头/层级关系，不是换姿势。 |
| 网图例外 | 非强相关、不必定制主题信息图的模块，可下载免广告、合规网图直接用（沿用项目既有署名习惯）。 |
| 中文可读 | 模型烧中文易糊/乱码时：底图无字 + 后期叠清晰中文；叠字须纳入排版规划，勿挡元素。 |
| 生图入口 | `firefly-minimax-media`（额度门禁 → MCP/`mmx` → `fetch_media.py` 落盘 → 接线正文） |

**已知坑（简记）**

| 坑 | 处理 |
|---|---|
| Astro content `data-store` 缓存 | 改图后预览仍像旧稿 → 确认磁盘真源 / 清缓存或硬刷新，勿只信浏览器 |
| OneDrive 同步延迟 | 落盘路径以本机绝对路径核对后再预览 |
| `image-01` 中文不稳 | 优先无字底图 + 后期叠字 |
| Windows 下 mmx prompt 编码 | 避免管道吞编码；prompt 用文件或确认 UTF-8 传入 |