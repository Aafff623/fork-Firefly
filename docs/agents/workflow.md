# 任务流（workflow）

```text
Issue(.scratch/<feature>/)
  → docs/outputs/report/{theme}/     # 可选调研
  → docs/outputs/prd/{theme}/prd.md  # draft → 你批准
  → docs/outputs/handoff/{theme}/YYYY-MM-DD-{branch}-{task}.md
  → 实施 → awaiting-review【停】
  → 通过 → commit + docs/outputs/commit-history/{branch}/YYYY-MM-DD.md
  → archive
```

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

## Obsidian 发文（内容向，轻量）

与功能 PRD 流并行的一条**内容流水线**（可不建 PRD）：

```text
Obsidian 笔记（固定 vault，见 CONTEXT.md）
  → /ob2blog（图文→ src/content/posts/<slug>）
  → site-cascade（动态 / 统计 / 分类标签 / 热力图）
  → 本地预览 →（你确认后）commit / push → 核线上
```

- Skill 正文：`.cursor/skills/ob2blog/`、`.cursor/skills/site-cascade/`
- 笔记↔帖映射：`.ob2blog/manifest.json`
- 工作区根若为 `blog/`：skills/rules 经 junction 暴露到 `blog/.cursor/`（见 `AGENTS.md`）
