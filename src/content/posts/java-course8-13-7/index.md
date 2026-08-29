---
title: "笔记详情页的点赞处理"
published: 2026-08-25
description: "修改note-detail.html中内容。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-13-7
pinned: false
comment: true
---

修改note-detail.html中内容。

### 添加点赞按钮样式

```css
/* 点赞按钮样式 */
.liked {
    color: #ff2442;
}
```


### 点赞按钮设置属性及点击

点赞按钮设置属性：

```html
<!-- 点赞 -->
<button class="btn btn-light btn-sm" >
    <i th:class="${note.isLikedByUser(#authentication.principal?.userId)} ? 'fa fa-heart liked' : 'fa fa-heart-o'"
        th:onclick="handleLike(this)"
        th:data-note-id="${note.noteId}">[[${note.likeCount}]]</i>
</button>
```


在按钮上设置数据属性data-note-id。点赞按钮的样式class，其值是根据是否点赞而动态设置。


设置点击事件handleLike。


`#authentication.principal?.userId`是为了在authentication.principal上获取userId，具体的实现方式会在后续课程介绍。


### 实现点赞交互

发送点赞请求，并根据响应结果更新UI显示。


```javascript
// 点赞按钮的点击事件处理
function handleLike(element) {
    // 从data属性里面获取笔记ID
    const noteId = element.dataset.noteId;

    // 禁用按钮放置重复点击
    element.disabled = true;

    // 发送请求
    fetch(`/like/${noteId}`, {
        method: 'POST',
        // 添加请求头, 用于Spring Security CSRF
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').getAttribute('content')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.liked) {
            // 设置按钮为点赞样式
            element.classList.remove('fa-heart-o');
            element.classList.add('fa-heart');
            element.classList.add('liked');
        } else {
            // 恢复按钮为未点赞样式
            element.classList.remove('fa-heart');
            element.classList.remove('liked');
            element.classList.add('fa-heart-o');
        }

        // 点赞量显示处理
        element.textContent = numberFormat(data.likeCount);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('点赞失败，请稍后再试');
    });

    // 启用按钮
    element.disabled = false;
}

// 数字格式化，自动转换为k、w单位
function numberFormat(num) {
    if (num > 100000) {
        return (num / 10000).toFixed(1) + 'w';
    } else if (num > 1000) {
        return (num / 1000).toFixed(1) + 'k';
    } else {
        return num;
    }
};
```
