---
title: "从首页跳转到笔记详情页"
published: 2026-08-25
description: "类似于用户详情页的笔记列表的做法，从首页跳转到笔记详情页，只需要在原有的笔记封面<img上套一层<a即可。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-12-4
pinned: false
comment: true
---

类似于用户详情页的笔记列表的做法，从首页跳转到笔记详情页，只需要在原有的笔记封面`<img>`上套一层`<a>`即可。


```js
// 创建笔记卡片元素
function createNoteElement(note) {
    const noteElement = document.createElement("div");
    noteElement.className = "masonry-item";
    noteElement.innerHTML = `
        <div class="note-image-container">
            <!-- 点击跳转到笔记详情页 -->
            <a href="/note/${note.noteId}">
                <img class="note-image" src="${note.cover}" alt="${note.title}">
            </a>
        </div>
        <div class="note-content">
            <div class="note-title">${note.title}</div>
            <div class="note-author-stats">
                <div class="note-author">
                    <img class="author-avatar" src="${note.avatar ? note.avatar : '/images/rn_avatar.png'}" alt="${note.username}">
                    <span class="author-name">${note.username}</span>
                </div>
                <div class="note-stats">
                    <div class="stat-item">
                        <i class="fa fa-heart-o">${numberFormat(1024)}</i>
                    </div>
                </div>
            </div>
        </div>
    `;

    return noteElement;
}
```


点击笔记封面，就能跳转到笔记详情页了。
