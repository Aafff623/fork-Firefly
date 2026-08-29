---
title: "掌握点评论服务设计的核心要点"
published: 2026-08-25
description: "java"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-14-4
pinned: false
comment: true
---

#### 1. 评论服务接口
```java
package com.example.rednote.service;

import com.example.rednote.entity.Comment;
import com.example.rednote.entity.Note;
import com.example.rednote.entity.User;

import java.util.List;
import java.util.Optional;

/**
 * CommentService 评论服务
 *
 * @version 2025/08/22
 **/
public interface CommentService {
    /**
     * 创建评论
     *
     * @param note
     * @param user
     * @param content
     * @return
     */
    Comment createComment(Note note, User user, String content);

    /**
     * 删除评论
     *
     * @param comment
     */
    void deleteComment(Comment comment);

    /**
     * 根据评论ID获取评论
     *
     * @param commentId
     * @return
     */
    Optional<Comment> findCommentById(Long commentId);

    /**
     * 根据笔记ID获取笔记的根评论
     *
     * @return
     */
    List<Comment> getCommentsByNoteId(Long noteId);

    /**
     * 回复评论
     *
     * @param note
     * @param parentComment
     * @param user
     * @param content
     * @return
     */
    Comment replyToComment(Note note, Comment parentComment, User user, String content);
}
```

#### 2. 评论服务实现

```java
package com.example.rednote.service.impl;

import com.example.rednote.entity.Comment;
import com.example.rednote.entity.Note;
import com.example.rednote.entity.User;
import com.example.rednote.repository.CommentRepository;
import com.example.rednote.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * CommentServiceImpl 评论服务
 *
 * @version 2025/08/22
 **/
@Service
public class CommentServiceImpl implements CommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Override
    public Comment createComment(Note note, User user, String content) {
        Comment comment = new Comment();
        comment.setNote(note);
        comment.setUser(user);
        comment.setContent(content);

        return commentRepository.save(comment);
    }

    @Override
    public void deleteComment(Comment comment) {
        commentRepository.delete(comment);
    }

    @Override
    public Optional<Comment> findCommentById(Long commentId) {
        return commentRepository.findByCommentId(commentId);
    }

    @Override
    public List<Comment> getCommentsByNoteId(Long noteId) {
        return commentRepository.findByParentIsNullAndNoteNoteIdOrderByCreateAtDesc(noteId);
    }

    @Override
    public Comment replyToComment(Note note, Comment parentComment, User user, String content) {
        Comment reply = new Comment();
        reply.setNote(note);
        reply.setUser(user);
        reply.setContent(content);
        reply.setParent(parentComment);

        parentComment.getReplies().add(reply);

        return commentRepository.save(reply);
    }
}
```
