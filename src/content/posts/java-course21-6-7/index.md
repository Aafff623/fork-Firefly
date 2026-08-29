---
title: "重构CommentResponseDto中的toCommentResponseDto"
published: 2026-08-25
description: "CommentResponseDto中的toCommentResponseDto需要重构"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-6-7
pinned: false
comment: true
---

CommentResponseDto中的toCommentResponseDto需要重构：

```java
public static CommentResponseDto toCommentResponseDto(Comment comment) {
    if (comment == null) {
        return null;
    }

    CommentResponseDto dto = new CommentResponseDto();
    dto.commentId = comment.getCommentId();
    dto.content = comment.getContent();
    dto.noteId = comment.getNote().getNoteId();
    dto.createdAt = comment.getCreatedAt();

    Comment parentComment = comment.getParent();
    if (parentComment != null) {
        dto.parentCommentId = parentComment.getCommentId();
        dto.parentCommentUsername = parentComment.getUser().getUsername();
    }

    List<Comment> replyList = comment.getReplies();
    if (replyList != null && !replyList.isEmpty()) {
        dto.replies = replyList.stream().map(c -> CommentResponseDto.toCommentResponseDto(c))
                .collect(Collectors.toList());
    }

    User user = comment.getUser();
    dto.username = user.getUsername();
    dto.avatar = user.getAvatar();
    dto.userId = user.getUserId();

    return dto;
}
```


因为依赖了User实体，改为服务的方法。


### 改造Comment实体

Comment实体冗余多一个字段username，以便将用户的名称保存下来，避免调用用户领域微服务来查询：

```java
private String username;
```


CommentServiceImpl修改：

```java
public Comment createComment(Note note, UserDto user, String content) {
    // ...为节约篇幅，此处省略非核心内容

    // 冗余username
    comment.setUsername(user.getUsername());

    return commentRepository.save(comment);
}

public Comment replyToComment(Note note, Comment parentComment, UserDto user, String content) {
    // ...为节约篇幅，此处省略非核心内容

    // 冗余username
    reply.setUsername(user.getUsername());
    parentComment.getReplies().add(reply);

    return commentRepository.save(reply);
}
```


### 将toCommentResponseDto移到到CommentService并调用用户领域微服务

CommentService新增如下接口：


```java
/**
 * 转为DTO
 * @param comment
 * @return
 */
CommentResponseDto toCommentResponseDto(Comment comment);
```

CommentServiceImpl新增如下方法：

```java
@Override
public CommentResponseDto toCommentResponseDto(Comment comment) {
    if (comment == null) {
        return null;
    }

    CommentResponseDto dto = new CommentResponseDto();
    dto.setCommentId(comment.getCommentId());
    dto.setContent(comment.getContent());
    dto.setNoteId(comment.getNote().getNoteId());
    dto.setCreatedAt(comment.getCreatedAt());

    Comment parentComment = comment.getParent();
    if (parentComment != null) {
        dto.setParentCommentId(parentComment.getCommentId());
        dto.setParentCommentUsername(parentComment.getUsername());
    }

    List<Comment> replyList = comment.getReplies();
    if (replyList != null && !replyList.isEmpty()) {
        dto.setReplies(replyList.stream().map(c -> toCommentResponseDto(c))
                .collect(Collectors.toList()));
    }

    UserDto userDto = (UserDto)userServiceClient.findByUserId(comment.getUserId()).getBody();
    dto.setUsername(userDto.getUsername());
    dto.setAvatar(userDto.getAvatar());
    dto.setUserId(userDto.getUserId());

    return dto;
}
```


### 修改评论控制器


将原先调用CommentResponseDto.toCommentResponseDto的地方全部改为commentService.toCommentResponseDto：

```java
@PostMapping("/{noteId}")
public ResponseEntity<?> createComment(
        @PathVariable Long noteId,
        @RequestBody String content) {
    // ...为节约篇幅，此处省略非核心内容

    // 转为DTO
    /*CommentResponseDto commentResponseDto = CommentResponseDto.toCommentResponseDto(comment);*/
    CommentResponseDto commentResponseDto = commentService.toCommentResponseDto(comment);

    return ResponseEntity.ok(commentResponseDto);
}

@GetMapping("/{noteId}")
public ResponseEntity<?> getComments(@PathVariable Long noteId) {
    // ...为节约篇幅，此处省略非核心内容

    // 转为DTO
    /*List<CommentResponseDto> commentResponseDtoList = comments.stream().map(c -> CommentResponseDto.toCommentResponseDto(c))
              .collect(Collectors.toList());*/
    List<CommentResponseDto> commentResponseDtoList = comments.stream().map(c -> commentService.toCommentResponseDto(c))
            .collect(Collectors.toList());

    return ResponseEntity.ok(commentResponseDtoList);
}

@PostMapping("/{noteId}/reply/{parentId}")
public ResponseEntity<?> replyToComment(
        @PathVariable Long noteId,
        @PathVariable Long parentId,
        @RequestBody String content) {

    // ...为节约篇幅，此处省略非核心内容

    // 转为DTO
    /*CommentResponseDto commentResponseDto = CommentResponseDto.toCommentResponseDto(reply);*/
    CommentResponseDto commentResponseDto = commentService.toCommentResponseDto(reply);

    return ResponseEntity.ok(commentResponseDto);
}
```
