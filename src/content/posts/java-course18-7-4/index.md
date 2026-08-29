---
title: "实战无刷新删除评论功能"
published: 2026-08-25
description: "删除请求发送成功后，执行无刷新删除评论。"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-7-4
pinned: false
comment: true
---

### 处理删除评论的事件

删除请求发送成功后，执行无刷新删除评论。

```ts
// 删除评论
const deleteComment = async (commentId: number) => { 
  if (!confirm('确定要删除这条评论吗？')) {
    return
  }

  try {
    await axios.delete(`/api/comment/${commentId}`)
    
    // 删除成功后，将该评论从列表中删除
    commentResponseDtoArray.value = 
      commentResponseDtoArray.value.filter(comment => comment.commentId !== commentId)
  } catch (error) {
    console.error('删除评论错误：', error)
  }
}
```

### 编写模板内容


```html
<!-- 删除评论按钮 -->
<button class="delete-comment" v-if="me.username === comment.username" 
  @click="deleteComment(comment.commentId)">
  <i class="fa fa-trash-o"></i>
</button>
```

确保是笔记的作者自己，才能看到删除评论的按钮。
