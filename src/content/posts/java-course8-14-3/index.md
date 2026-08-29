---
title: "实现评论CommentRepository用于保存、查询评论数据"
published: 2026-08-25
description: "Java"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-14-3
pinned: false
comment: true
---

```Java
package com.example.rednote.repository;

import com.example.rednote.entity.Comment;
import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

/**
 * CommentRepository 评论资源库
 *
 * @version 2025/08/22
 **/
public interface CommentRepository extends Repository<Comment, Long> {
    Comment save(Comment comment);

    Optional<Comment> findByCommentId(Long commentId);

    void delete(Comment comment);

    /**
     * 查找根评论
     *
     * @param noteId
     * @return
     */
    List<Comment> findByParentIsNullAndNoteNoteIdOrderByCreateAtDesc(Long noteId);

    /**
     * 根据父评论ID获取它的子评论
     *
     * @param parentCommentId
     * @return
     */
    List<Comment> findByParentCommentId(Long parentCommentId);

}
```
