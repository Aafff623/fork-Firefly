---
title: "掌握评论回复及多级评论的实现技巧"
published: 2026-08-25
description: "评论下面可能会有回复（也就是子评论），回复下面还可以继续回复。因此，如何处理多级嵌套的评论，是本节要处理的核心。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-14-10
pinned: false
comment: true
---

评论下面可能会有回复（也就是子评论），回复下面还可以继续回复。因此，如何处理多级嵌套的评论，是本节要处理的核心。

处理子评论下再有子评论（即多层级嵌套评论）需要从后端API、前端渲染几个层面进行调整。


以下是完整的解决方案。


### 后端API调整

修改评论服务CommentServiceImpl，支持递归获取所有层级的评论：

```java
@Override
public List<Comment> getCommentsByNoteId(Long noteId) {
    /*return commentRepository.findByParentIsNullAndNoteNoteIdOrderByCreateAtDesc(noteId);*/
    List<Comment> rootComments = commentRepository.findByParentIsNullAndNoteNoteIdOrderByCreateAtDesc(noteId);

    // 递归加载所有的回复及其子回复到根评论上
    rootComments.forEach(rootComment -> {
        // 构建一个能包含回复及其子回复的列表，从1到N层的所有回复
        List<Comment> allReplies = new ArrayList<>();

        // 第一层的回复直接放到allReplies列表中
        List<Comment> firstLevelReplies = rootComment.getReplies();
        allReplies.addAll(firstLevelReplies);

        // 第二层及其后续的回复，就递归而后添加到allReplies列表中
        loadRepliesRecursively(firstLevelReplies, allReplies);

        // allReplies列表按照创建时间倒序排序
        rootComment.setReplies(allReplies.stream().sorted(Comparator.comparing(Comment::getCreateAt).reversed()).toList());
    });

    return rootComments;
}

// 递归加载回复
private void loadRepliesRecursively(List<Comment> replies, List<Comment> allReplies) {
    replies.forEach(reply -> {
        List<Comment> sonReplies = reply.getReplies();
        allReplies.addAll(sonReplies);

        loadRepliesRecursively(sonReplies, allReplies);
    });
}
```

整体上将评论内容分为了两层

* 根评论
* 子评论（子评论下层的子评论也会递归汇总到子评论上）

### 前端渲染实现

在createCommentElement函数内增加回复列表：


```javascript
// 创建一个评论项元素
function createCommentElement(comment) {

    // ...为节约篇幅，此处省略非核心内容

    commentElement.innerHTML = `
        <div class="comment-header">

            <!-- ...为节约篇幅，此处省略非核心内容 -->

        </div>

        <div class="comment-content">${comment.content}</div>

        <!-- 回复列表 -->
        <div class="reply-list">
            ${renderReplies(comment.replies)}
        </div>
    `;

    return commentElement;
}
```


通过renderReplies函数来渲染回复列表：

```js
// 渲染回复列表
function renderReplies(replies) {
    // 判定回复列表是否为空
    if (replies.length === 0) {
        return '';
    }

    return replies.map(reply => {
        const date = new Date(reply.createAt);
        const formattedDate = date.toLocaleString();

        return `
        <div class="reply-item">
            <div class="reply-header">
                <span class="reply-username">${reply.username}</span>
                <span class="reply-to">»</span>
                <span class="reply-target">${reply.parentCommentUsername ? reply.parentCommentUsername : '评论作者'}</span>
                <span class="reply-time">${formattedDate}</span>
            </div>
            <div class="reply-content">${reply.content}</div>

            <!-- 回复回复的按钮-->
            <button class="reply-btn">
                <i class="fa fa-comment-o"></i>
            </button>
            <!-- 删除回复的按钮-->
            <button class="delete-comment" ${isCurrentUser(reply.userId) ? '' : 'style="display:none"'}>
                <i class="fa fa-trash-o"></i>
            </button>
        </div>
        `;
    }).join('');
}
```
