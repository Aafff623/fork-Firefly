---
title: "针对内容领域微服务的数据库配置"
published: 2026-08-25
description: "创建名为“rednotecontentdomain”新的数据库"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-6-1
pinned: false
comment: true
---

### 初始化数据库和表

创建名为“rednote_content_domain”新的数据库：

```sql
CREATE DATABASE rednote_content_domain;
```

Seata 的 AT 模式需要通过 undo_log 表来实现分布式事务的回滚功能。因此，需要手动创建 undo_log 表。

```sql
CREATE TABLE `undo_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `branch_id` bigint(20) NOT NULL,
  `xid` varchar(100) NOT NULL,
  `context` varchar(128) NOT NULL,
  `rollback_info` longblob NOT NULL,
  `log_status` int(11) NOT NULL,
  `log_created` datetime NOT NULL,
  `log_modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
```


### 修改数据库配置


rednote改为rednote_content_domain

```
spring.datasource.url=jdbc:mysql://localhost:3306/rednote_content_domain
```


### 修改实体

修改实体Note：

```java
/*@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
private User author;*/
private Long userId;

// 判断当前用户是否已点赞
/*@Transient
public boolean isLikedByUser(Long userId) {
    if (userId == null) {
        return false;
    }
    return likes.stream().anyMatch(like -> like.getUser().getUserId().equals(userId));
}*/
@Transient
public boolean isLikedByUser(Long userId) {
    if (userId == null) {
        return false;
    }
    return likes.stream().anyMatch(like -> like.getUserId().equals(userId));
}
```

修改实体Like：

```java
/*@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;*/
private Long userId;
```

修改实体Comment：

```java
/*@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;*/
private Long userId;
```


### 修改NoteDetailDto


```java
/*public static NoteDetailDto toNoteDetailDto(Note note, User user) {
    NoteDetailDto dto = new NoteDetailDto();
    dto.noteId = note.getNoteId();
    dto.title = note.getTitle();
    dto.content = note.getContent();
    dto.images = note.getImages();
    dto.category = note.getCategory();
    dto.topics = note.getTopics();
    dto.username = note.getAuthor().getUsername();
    dto.avatar = note.getAuthor().getAvatar();
    dto.userId = note.getAuthor().getUserId();
    dto.likeCount = note.getLikeCount();
    dto.isLiked = note.isLikedByUser(user.getUserId());

    return dto;
}*/
public static NoteDetailDto toNoteDetailDto(Note note, UserDto user) {
    NoteDetailDto dto = new NoteDetailDto();
    dto.noteId = note.getNoteId();
    dto.title = note.getTitle();
    dto.content = note.getContent();
    dto.images = note.getImages();
    dto.category = note.getCategory();
    dto.topics = note.getTopics();
    dto.username = user.getUsername();
    dto.avatar = user.getAvatar();
    dto.userId = user.getUserId();
    dto.likeCount = note.getLikeCount();
    dto.isLiked = note.isLikedByUser(user.getUserId());

    return dto;
}
```


### 修改仓库

修改NoteRepository


```java
/**
  * 根据作者的用户ID分页查询笔记
  *
  * @param userId
  * @param pageable
  * @return
  */
/*Page<Note> findByAuthorUserId(Long userId, Pageable pageable);*/
Page<Note> findByUserId(Long userId, Pageable pageable);
```


引用上述接口的地方一并更改，比如NoteServiceImpl。


修改LikeRepository


```java
/*Optional<Like> findByUserUserIdAndNoteNoteId(Long userId, Long noteId);*/
Optional<Like> findByUserIdAndNoteNoteId(Long userId, Long noteId);
```


引用上述接口的地方一并更改，比如LikeServiceImpl。
