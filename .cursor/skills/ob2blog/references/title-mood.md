# 列表标题情绪点缀（展示层）

## 原则

- **只挂列表卡**（`PostCard`），正文 H1 / RSS / OG / frontmatter `title` **一律不改**。
- **偶发**：命中常见情绪词才装饰；中立标题原文。
- **交替**：同帖用 post id 哈希，在 emoji 与颜文字之间二选一，避免邻帖全是同一种。
- **已有表情**：标题里已有 emoji / 颜文字则不再叠。

## 实现

`Firefly/src/utils/title-mood.ts` → `decorateListTitle(title, entry.id)`

扩词表改该文件的 `MOOD_PACKS` 即可。

## Agent 成帖（ob2blog）

从 vault 导入时：`title` 跟笔记文件名（或用户指定）即可；**禁止**为列表效果往 FM `title` 塞 emoji / 颜文字。展示点缀由站点层自动挂。
