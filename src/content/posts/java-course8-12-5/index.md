---
title: "从首页跳转到作者详情页"
published: 2026-08-25
description: "点击笔记的作者头像时，我们希望就能跳转到该作者的详情页。实现方式，只需要在作者信息的<div上套一层<a即可。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-12-5
pinned: false
comment: true
---

### 前端修改


点击笔记的作者头像时，我们希望就能跳转到该作者的详情页。实现方式，只需要在作者信息的`<div>`上套一层`<a>`即可。


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
                <!-- 点击跳转到用户详情页 -->
                <a href="/user/profile/${note.userId}">
                    <div class="note-author">
                        <img class="author-avatar" src="${note.avatar ? note.avatar : '/images/rn_avatar.png'}" alt="${note.username}">
                        <span class="author-name">${note.username}</span>
                    </div>
                </a>
                
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


跳转到`/user/profile`页面需要传递用户ID，显然当前的note对象DTO里面并没有这个属性，因此需要做进一步的扩展。


### 扩展NoteExploreDto


```java
/**
 * 作者用户ID
 */
private Long userId;

public static NoteExploreDto toExploreDto(Note note) {
    NoteExploreDto noteExploreDto = new NoteExploreDto();
    noteExploreDto.setNoteId(note.getNoteId());
    noteExploreDto.setTitle(note.getTitle());
    noteExploreDto.setCover(note.getImages().get(0));
    noteExploreDto.setUsername(note.getAuthor().getUsername());
    noteExploreDto.setAvatar(note.getAuthor().getAvatar());
    noteExploreDto.setUserId(note.getAuthor().getUserId());

    return noteExploreDto;
}
```


### 运行调测


运行应用，效果如下图12-3所示，跳转逻辑没有问题，只是用户名下面有条下划线不是太美观。


![图12-3 用户名下面有条下划线](./images/12-3.png)


去除`<a>`标签的下划线，只需要加个CSS样式：

```html
<style>
/* 去掉下划线 */
a {
    text-decoration: none;
}
</style>
```


去除用户名下面下划线的效果如下图12-4所示。


![图12-4 去除用户名下面下划线的效果](./images/12-4.png)
