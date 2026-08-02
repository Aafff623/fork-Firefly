# docs/idea/

本目录是博客的 **灵感库**：收录样式 / 组件 / 视觉语言构想，供后续 session 提取后走调研 → PRD → 落地闭环。

**只存构想，不写实现代码。**

## 目录约定

```text
docs/idea/{theme}/
  └── *.md          # 该主题下的构想正文（可多篇）
```

| 项 | 规则 |
|---|---|
| `{theme}` | kebab-case，与后续 `docs/outputs/{report,prd,handoff}/{theme}/` 对齐 |
| 建夹时机 | **有构想再建模**，禁止空 theme 目录 |
| 文件名 | 可读短名即可，如 `mood.md` · `component-sketch.md` · `2026-08-02-notes.md` |
| 附件 | 截图 / 参考图可放同目录 `assets/`（有再加） |

## 与任务流的关系

```text
docs/idea/{theme}/          # 灵感沉淀（本目录）
  → 新 session 提取
  → docs/outputs/report/{theme}/   # 调研（可选）
  → docs/outputs/prd/{theme}/prd.md
  → handoff → 实施 → Review → commit-history
```

灵感阶段不触发 PRD 门禁；一旦开调研 / 写 PRD，仍遵守 `docs/agents/workflow.md`。

## 单篇构想建议结构

不必死板，够下一任 Agent 接手即可：

```markdown
# {一句话标题}

## 灵感来源
- 对话摘要 / 参考站 / 截图路径

## 想要的感觉
- 气质、交互、与现站的关系（对齐 / 故意冲突）

## 可能落点
- 页面 / 组件 / 配置键（猜即可，调研时再核）

## 开放问题
- 还没想清楚的点
```

## 索引

| theme | 说明 | 状态 |
|---|---|---|
| `hallmark-gsap-ui` | Hallmark×GSAP（+MiniMax）组件动效编排 skill 构想 | step-1 分析完成 |
