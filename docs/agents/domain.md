# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root, or
- **`GLOSSARY-MAP.md`** at the repo root if it exists: it points at one `GLOSSARY.md` per context. Read each one relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. In multi-context repos, also check `src/<context>/docs/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## 本仓现状（2026-10-19 记录）

- `GLOSSARY.md` **尚不存在** —— 按上面规则，等第一次真正敲定术语时由 `/domain-modeling` 惰性创建。
- **`docs/adr/` 已存在**，10 份（ADR-0000 ~ 0009）。其中有已取代关系，读之前先看 superseded 标注：
  0001→0006（评论双通道）、0003→0004→0005（Bot 几何自研与视觉重制）、0007→0008（认证迁 Supabase）。
  ADR-0009 把托管收敛到 Cloudflare 单平台。
- 本仓另有一份 **`CONTEXT.md`**，它不是 Matt 的词表，而是本仓自有的「领域事实单一来源」
  （技术栈 / 配置驱动模型 / 内容模型 / 分类词表 / 合集口径 / 部署事实 / 术语摘录）。
  Matt 的 skill 不会自动读它；需要领域事实时按 `AGENTS.md` 的指引手动读。
  两者不要混用：`GLOSSARY.md` 只管术语，`CONTEXT.md` 管事实与约束。

## File structure

Single-context repo (most repos):

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `GLOSSARY-MAP.md` at the root):

```
/
├── GLOSSARY-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── GLOSSARY.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── GLOSSARY.md
        └── docs/adr/
```

本仓是 **single-context**：无 `pnpm-workspace.yaml`、`package.json` 无 `workspaces`、无 `packages/*`。

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
