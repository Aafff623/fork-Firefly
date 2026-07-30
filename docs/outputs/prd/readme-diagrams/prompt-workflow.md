# Workflow — 反推 Prompt

一条主路径；决策点明确；颜色 4–6。

## 系统指令

```text
Professional product workflow diagram for GitHub README.
Single primary path (left→right or top→bottom). Clear decision diamonds if needed.
≤2 secondary branches, visually lighter. Flat icons or standard flowchart shapes.
≤6 colors. Uniform line weight. No spider-web.
Nodes = user-visible or demo-visible stages with short labels.
```

## § sipoc（标杆：`workflow/sipoc-lanes.png`）

```text
[系统指令]
SIPOC / swimlane style: 4–5 vertical pastel columns (Suppliers → Inputs → Process → Outputs → Customers)
OR adapt columns to project: [e.g. Contributor → Plan → Risk → Approve → Wallet].
White cards inside lanes; thin black arrows; center Process as numbered steps.
Map:
[...]
```

## § stage-decision（标杆：`workflow/stage-decision-sales.png`）

```text
[系统指令]
Multi-stage workflow with STAGE 1..N columns.
Rectangles = actions; diamonds = decisions; check/x outcomes.
Solid = happy path; dashed = reject/alt path.
Dark OR light theme — pick one. Keep grid-aligned.
Project stages:
[...]
Decisions:
[...]
```

## § flowchart（标杆：`workflow/flowchart-standard.png`）

```text
[系统指令]
Standard flowchart: green start/end capsules, white process boxes, yellow decision diamond.
Vertical primary flow; one loop-back max if needed.
Steps:
[...]
```

## § linear-bytebytego（轻量，无特殊标杆时）

```text
Left-to-right numbered steps 1..N with flat icons and short labels.
Happy path only unless user requires a blocked branch (e.g. Bob blocked).
```
