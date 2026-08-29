---
title: "修改评论控制器支持调用用户领域微服务"
published: 2026-08-25
description: "修改CommentController，在原调用UserService地方改为用UserServiceClient"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-6-5
pinned: false
comment: true
---

### 在CommentController调用用户领域微服务Feign客户端


修改CommentController，在原调用UserService地方改为用UserServiceClient：


```java
@PostMapping("/{noteId}")
public ResponseEntity<?> createComment(
        @PathVariable Long noteId,
        @RequestBody String content) {

    // ...为节约篇幅，此处省略非核心内容

    /*User currentUser = userService.getCurrentUser();*/
    UserDto currentUser = userServiceClient.getCurrentUser().getBody();

    // ...为节约篇幅，此处省略非核心内容
}

@PostMapping("/{noteId}/reply/{parentId}")
public ResponseEntity<?> replyToComment(
        @PathVariable Long noteId,
        @PathVariable Long parentId,
        @RequestBody String content) {
    // ...为节约篇幅，此处省略非核心内容

    /*User currentUser = userService.getCurrentUser();*/
    UserDto currentUser = userServiceClient.getCurrentUser().getBody();

    // ...为节约篇幅，此处省略非核心内容
}

@DeleteMapping("/{commentId}")
public ResponseEntity<?> deleteComment(
        @PathVariable Long commentId) {
    // ...为节约篇幅，此处省略非核心内容

    /*User currentUser = userService.getCurrentUser();*/
    UserDto currentUser = userServiceClient.getCurrentUser().getBody();

    // 验证父评论属于指定笔记
    // 将用户对象改为了用户ID
    /*if (!comment.getUser().getUserId().equals(currentUser.getUserId())) {
        throw new CommentNotFoundException("无权删除此评论");
    }*/
    if (!comment.getUserId().equals(currentUser.getUserId())) {
        throw new CommentNotFoundException("无权删除此评论");
    }

    // ...为节约篇幅，此处省略非核心内容
}
```

### 修改评论服务


### 修改createComment

修改CommentService的createComment接口：


```java
/**
 * 创建评论
 *
 * @param note
 * @param user
 * @param content
 * @return
 */
/*Comment createComment(Note note, User user, String content);*/
Comment createComment(Note note, UserDto user, String content);
```


修改CommentServiceImpl的createComment方法：


```java
@Override
@Transactional
/*public Comment createComment(Note note, User user, String content) {
    // 递增
    redisTemplate.opsForValue().increment(COMMENT_COUNT_KEY);

    Comment comment = new Comment();
    comment.setContent(content);
    comment.setUser(user);
    comment.setNote(note);

    return commentRepository.save(comment);
}*/
public Comment createComment(Note note, UserDto user, String content) {
    // 递增
    redisTemplate.opsForValue().increment(COMMENT_COUNT_KEY);

    Comment comment = new Comment();
    comment.setContent(content);
    // 将用户对象改为用户ID
    comment.setUserId(user.getUserId());
    comment.setNote(note);

    return commentRepository.save(comment);
}
```


### 修改replyToComment

修改CommentService的replyToComment接口：


```java
/**
 * 回复评论
 *
 * @param note
 * @param parentComment
 * @param user
 * @param content
 * @return
 */
/*Comment replyToComment(Note note, Comment parentComment, User user, String content);*/
Comment replyToComment(Note note, Comment parentComment, UserDto user, String content);
```


修改CommentServiceImpl的replyToComment方法：


```java
@Override
@Transactional
/*public Comment replyToComment(Note note, Comment parentComment, User user, String content) {
    // 递增
    redisTemplate.opsForValue().increment(COMMENT_COUNT_KEY);

    Comment reply = new Comment();
    reply.setContent(content);
    reply.setUser(user);
    reply.setNote(note);
    reply.setParent(parentComment);

    parentComment.getReplies().add(reply);

    return commentRepository.save(reply);
}*/
public Comment replyToComment(Note note, Comment parentComment, UserDto user, String content) {
    // 递增
    redisTemplate.opsForValue().increment(COMMENT_COUNT_KEY);

    Comment reply = new Comment();
    reply.setContent(content);
    // 将用户对象改为用户ID
    reply.setUserId(user.getUserId());
    reply.setNote(note);
    reply.setParent(parentComment);

    parentComment.getReplies().add(reply);

    return commentRepository.save(reply);
}
```
