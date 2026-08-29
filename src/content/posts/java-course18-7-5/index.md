---
title: "实现回复弹窗及回复列表展示功能"
published: 2026-08-25
description: "ts"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-7-5
pinned: false
comment: true
---

### 实现回复弹窗功能


```ts
const replyModalRef = ref<HTMLDivElement | null>(null);
const replyContentRef = ref<HTMLTextAreaElement | null>(null);
const replyToCommentResponseDto = ref<CommentResponseDto>(new CommentResponseDto());

// ...为节约篇幅，此处省略非核心内容

// 回复评论
function handleReplyComment(comment: CommentResponseDto) { 
  // 显示回复框
  showReplyModal(comment)

  // 设置当前回复的评论
  replyToCommentResponseDto.value = comment
}

// 显示回复框
function showReplyModal(comment: CommentResponseDto) { 
  if (replyModalRef.value) {
    replyModalRef.value.classList.add('show')
    replyModalRef.value.style.display = 'block'

    // 防止背景滚动
    document.body.classList.add('modal-open')

    // 自动聚焦到数框
    setTimeout(() => {
      replyContentRef.value?.focus()
    }, 100)
  }
}

// ...为节约篇幅，此处省略非核心内容

<!-- 回复评论按钮 -->
<button class="reply-btn" @click="handleReplyComment(comment)">
 <i class="fa fa-comment-o"></i>
</button>

// ...为节约篇幅，此处省略非核心内容

  <!-- 回复弹窗 -->
  <div class="modal" id="replyModal" tabindex="-1" aria-labelledby="replyModalLabel" ref="replyModalRef" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="replyModalLabel">回复 <span id="replyToUsername">{{ replyToCommentResponseDto.username }}</span></h5>
        </div>
        <div class="modal-body">
          <div class="reply-to-content"></div>
          <textarea class="form-control" id="replyContent" rows="3" placeholder="写下你的回复..." ref="replyContentRef"></textarea>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light close-model" data-bs-dismiss="modal" @click="hideReplyModal">取消</button>
          <button type="button" class="btn btn-danger" id="submitReply" @click="submitReply">提交回复</button>
        </div>
      </div>
    </div>
  </div>
```

当点击回复评论按钮时，会显示回复弹窗。效果如下图7-4所示。

![图7-4 发布评论后评论列表界面效果](./images/7-4.png)


### 实现回复评论功能

在回复弹窗上当点击“提交回复”，则会将回复提交到后端接口，而后关闭窗口；点击“取消”则直接关闭窗口。代码逻辑如下：

```ts
// 隐藏回复框
function hideReplyModal() { 
  if (replyModalRef.value && replyContentRef.value) {
    replyModalRef.value.classList.remove('show')
    replyModalRef.value.style.display = 'none'

    // 恢复背景滚动
    document.body.classList.remove('modal-open')

    // 清空输入框
    replyContentRef.value.value = ''
  }

  replyToCommentResponseDto.value = new CommentResponseDto()
}

// 提交回复
const submitReply = async () => { 
  const replyContent = replyContentRef.value

  if (!replyContent) {
    return
  }

  try { 
    const parentCommentId = replyToCommentResponseDto.value.commentId

    const response = await axios.post(`/api/comment/${noteId.value}/reply/${parentCommentId}`,
      // 传递文本内容
      replyContentRef.value?.value.trim(),
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    )

    // TODO: 回复添加到父级评论的回复列表中

    // 关闭回复框
    hideReplyModal()
  } catch (error) { 
    console.error('提交回复失败：' + error)
  }
}
```


### 实现回复列表展示功能

回复列表是存在于评论对象的replies属性中，因此，当回复成功之后，将回复对象添加到评论对象的replies属性中，代码逻辑如下：

```ts
// 提交回复
const submitReply = async () => {
  const replyContent = replyContentRef.value

  if (!replyContent) {
    return
  }

  try {
    const parentCommentId = replyToCommentResponseDto.value.commentId

    const response = await axios.post(`/api/comment/${noteId.value}/reply/${parentCommentId}`,
      // 传递文本内容
      replyContentRef.value?.value.trim(),
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    )

    // 回复添加到父级评论的回复列表中
    const commentIndex = commentResponseDtoArray.value.findIndex(item => item.commentId === parentCommentId)
    if (commentIndex !== -1) { 
      if (!commentResponseDtoArray.value[commentIndex].replies) { 
        commentResponseDtoArray.value[commentIndex].replies = []
      }
      commentResponseDtoArray.value[commentIndex].replies.unshift(response.data)
    }

    // 关闭回复框
    hideReplyModal()
  } catch (error) {
    console.error('提交回复失败：' + error)
  }
}
```


展示回复列表，代码如下：


```html
<!-- 回复列表 -->
<div class="reply-list" v-for="reply in comment.replies" :key="reply.commentId">
    <div class="reply-item">
    <div class="reply-header">
        <!-- 点击用户名跳转到用户详情页 -->
        <a :href="`/user/profile/${reply.userId}`">
        <span class="reply-username">{{ reply.username }}</span>
        </a>
        <span class="reply-to">»</span>
        <span class="reply-target">{{ reply.parentCommentUsername ? reply.parentCommentUsername : '评论作者'
        }}</span>
        <span class="reply-time">{{ formatDate(reply.createAt) }}</span>
    </div>
    <div class="reply-content">{{ reply.content }}</div>
    <!-- 回复回复的按钮-->
    <button class="reply-btn" @click="handleReplyComment(reply)">
        <i class="fa fa-comment-o"></i>
    </button>
    <!-- 删除回复的按钮-->
    <button class="delete-comment" v-if="me.username === reply.username"
        @click="deleteReply(reply.commentId)">
        <i class="fa fa-trash-o"></i>
    </button>
    </div>
</div>
```
