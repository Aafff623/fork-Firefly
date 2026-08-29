---
title: "解决首页跳转到笔记详情页不显示图片的问题"
published: 2026-08-25
description: "修改src\\views\\Explore.vue的跳转到笔记详情页方式如下"
image: ''
tags: [AI, 实战, 融合]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course23-3-6
pinned: false
comment: true
---

修改`src\views\Explore.vue`的跳转到笔记详情页方式如下：

```html
<!-- 点击跳转到笔记详情页 -->

<a :href="`/note/${note.noteId}`"> 
<!--<a href="#" @click="goNoteDetail(note.noteId)">  -->
  <img class="masonry-note-image" :src="note.cover" :alt="note.title">
</a>
```
