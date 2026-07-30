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
- 配置含义查阅 `../Firefly_docs/`，勿臆造开关语义。
