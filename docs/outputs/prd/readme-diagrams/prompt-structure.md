# Structure — 反推 Prompt

**默认不出图**：README 用 Markdown / `<details>` 目录树更专业。

仅当用户明确要求 `structure.png` 时使用下列模板。

## 系统指令

```text
Clean repository directory tree diagram for GitHub README.
White background. Orthogonal L-shaped connectors. Rounded boxes for folders.
Color by depth (darker root → lighter children). Files as plain text or lighter nodes.
ONLY real top-level paths from the project. ≤4 colors + neutrals.
NO: fake folders, spaghetti lines, decorative icons on every file.
```

## § folder-tree（标杆：`structure/folder-tree-quarters.png`）

```text
[系统指令]
Hierarchical folder tree. Root: "[REPO_ROOT]".
Level-1 folders (exact names): [...]
Show 1–2 levels of important children under each; omit noise (node_modules, .git).
Uniform stroke; even spacing; README-readable at 1000px width.
```

## § org-tree（标杆：`structure/tree-org-chart.png`）

```text
[系统指令]
Org-chart style tree: root "Project" → Phase/Area boxes → key path leaves.
Use only for high-level repo map (docs / app / frontend / assets), not every file.
```
