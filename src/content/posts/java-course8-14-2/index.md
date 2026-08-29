---
title: "评论功能的数据库设计"
published: 2026-08-25
description: "首先需要添加评论相关的实体和关系"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-14-2
pinned: false
comment: true
---

首先需要添加评论相关的实体和关系：

```java
package com.example.rednote.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Comment 评论实体
 *
 * @version 2025/08/22
 **/
@Entity
@Table(name = "t_comment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long commentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    private Note note;

    @Column(updatable = false)
    private LocalDateTime createAt = LocalDateTime.now();

    /**
     * 父级评论，用于回复功能
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;

    /**
     * 子级评论，也就是回复
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> replies = new ArrayList<>();
}
```

在Note实体中添加反向关联：

```java
@Entity
@Table(name = "t_note")
@Data // @Data集合了 @ToString， @EqualsAndHashCode，所有字段的 @Getter和所有非final字段的 @Setter, @RequiredArgsConstructor
@NoArgsConstructor // 无参构造器
@AllArgsConstructor // 包含所有参数的构造器
public class Note {
    
    // ...为节约篇幅，此处省略非核心内容

    @OneToMany(mappedBy = "note", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
    
    // 计算评论数的Transient字段
    @Transient
    public long getCommentCount() {
        return comments.size();
    }
}
```
