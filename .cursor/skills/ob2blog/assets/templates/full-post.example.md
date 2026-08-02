---
title: 示例：ob2blog 文章骨架
published: 2026-08-01
description: Obsidian→博客模板示例（draft）。复制结构到 src/content/posts/<slug>/index.md。
image: ../placeholders/cover-placeholder.svg
tags: [Firefly, Obsidian]
category: 指南
draft: false
slug: skill-full-post-example
pinned: false
comment: true
---

开场摘要（来自 Obsidian 笔记时可改写一句 description）。

## 内容从二级开始

主题会渲染标题与日期，此处不要重复元信息。Obsidian 的 `![[cover.png]]` 应落到 FM `image`，不要再贴进正文。

> [!NOTE] 提醒框
> 仅使用 NOTE / TIP / IMPORTANT / WARNING / CAUTION。

1. 列表项里的截图要缩进，避免拆断有序列表

   ![示例截图](./images/example.png)

2. 下一列表项

```js title="hello.js"
console.log("ready for ob2blog");
```

仓库卡片：

::github{repo="CuteLeaf/Firefly"}
