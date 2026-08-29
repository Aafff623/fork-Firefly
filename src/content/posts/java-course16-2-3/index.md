---
title: "实现用户点赞、评论等行为数据的高效记录与查询"
published: 2026-08-25
description: "将用户点赞、评论等高频互动数据存储在 Redis 中，可以显著提升系统性能。下面我将从数据模型设计、实现方案到性能优化，提供完整的解决方案。"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-2-3
pinned: false
comment: true
---

将用户点赞、评论等高频互动数据存储在 Redis 中，可以显著提升系统性能。下面我将从数据模型设计、实现方案到性能优化，提供完整的解决方案。


### 数据模型设计

#### 1. 点赞数据模型
使用 Redis 的 Set 数据结构 存储点赞关系，具有 O(1) 的插入/删除/查询效率：

```
// 用户点赞记录（Set结构，无序唯一）
KEY: "rednote:note:${noteId}:likes"
VALUE: [userId1, userId2, userId3, ...]


// 帖子点赞数（原子计数器）
KEY: "rednote:note:${noteId}:like_count"
VALUE: 点赞数量
```

#### 2. 评论数据模型

使用原子计数器存储评论总数：

```
// 评论总数（原子计数器）
KEY: "rednote:comment:comment_count"
VALUE: 点赞数量
```


### 实现方案

#### 1. 点赞功能实现

```java
package com.example.rednote.service.impl;

import com.example.rednote.entity.Like;
import com.example.rednote.entity.Note;
import com.example.rednote.entity.User;
import com.example.rednote.exception.NoteNotFoundException;
import com.example.rednote.repository.LikeRepository;
import com.example.rednote.repository.NoteRepository;
import com.example.rednote.service.LikeService;
import com.example.rednote.service.NoteService;
import com.example.rednote.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * LikeServiceImpl 点赞服务
 *
 * @version 2025/08/21
 **/
@Service
public class LikeServiceImpl implements LikeService {

    @Autowired
    private NoteService noteService;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    @Transactional
    public boolean toggleLike(Long noteId, User user) {
        // 判断笔记是否存在
        Optional<Note> optionalNote = noteService.findNoteById(noteId);
        if (!optionalNote.isPresent()) {
            throw new NoteNotFoundException("");
        }

        // 构建Redis的Key
        String noteLikesKey = "rednote:note:" + noteId + ":likes";
        String likeCountKey = "rednote:note:" + noteId + ":like_count";

        // 从Redis中获取用户点赞记录
        Long userId = user.getUserId();
        boolean hasLikedFromRedis = redisTemplate.opsForSet().isMember(noteLikesKey, userId.toString());

        // 判定Redis是否命中
        boolean hasLiked = false;
        if (hasLikedFromRedis) {
            // 命中，直接返回
            hasLiked = hasLikedFromRedis;
        } else {
            // 未命中，从数据库中查询是否已经点赞
            hasLiked = likeRepository.findByUserUserIdAndNoteNoteId(userId, noteId).isPresent();
        }

        if (hasLiked) {
            // 已点赞，取消点赞
            // 删除Redis中的记录，使用事务保证原子性
            redisTemplate.execute(new SessionCallback<Object>() {
                @Override
                public <K, V> Object execute(RedisOperations<K, V> operations) throws DataAccessException {
                    operations.multi();
                    operations.opsForSet().remove((K) noteLikesKey, (V) userId.toString());
                    operations.opsForValue().decrement((K) likeCountKey);
                    return operations.exec();
                }
            });

            // 删除数据库中的记录
            Optional<Like> optionalLike = likeRepository.findByUserUserIdAndNoteNoteId(userId, noteId);
            likeRepository.delete(optionalLike.get());
            return false;
        } else {
            // 未点赞，添加点赞
            // 增加Redis中的记录，使用事务保证原子性
            redisTemplate.execute(new SessionCallback<Object>() {
                @Override
                public <K, V> Object execute(RedisOperations<K, V> operations) throws DataAccessException {
                    operations.multi();
                    operations.opsForSet().add((K) noteLikesKey, (V) userId.toString());
                    operations.opsForValue().increment((K) likeCountKey);
                    return operations.exec();
                }
            });

            // 添加数据库中的记录
            Like like = new Like();
            like.setUser(user);
            like.setNote(optionalNote.get());

            likeRepository.save(like);
            return true;
        }

        // 查询用户是否已点赞
        /*Optional<Like> optionalLike = likeRepository.findByUserUserIdAndNoteNoteId(user.getUserId(), noteId);
        if (optionalLike.isPresent()) {
            // 已点赞，取消点赞
            likeRepository.delete(optionalLike.get());
            return false;
        } else {
            // 未点赞，添加点赞
            Like like = new Like();
            like.setUser(user);
            like.setNote(optionalNote.get());

            likeRepository.save(like);
            return true;
        }*/
    }

    @Override
    public long getLikeCount(Long noteId) {
        // 从Redis中获取点赞数
        String likeCountKey = "rednote:note:" + noteId + ":like_count";
        String likeCountFromRedis = redisTemplate.opsForValue().get(likeCountKey);

        // 判定Redis是否命中
        if (likeCountFromRedis != null) {
            // 命中，直接返回
            return Long.parseLong(likeCountFromRedis);
        } else {
            // 未命中，从数据库中查询，再存储到Redis
            long likeCountFromDb = likeRepository.countByNoteNoteId(noteId);
            redisTemplate.opsForSet().add(likeCountKey, String.valueOf(noteId));

            return likeCountFromDb;
        }

        /*return likeRepository.countByNoteNoteId(noteId);*/
    }
}
```

#### 2. 评论功能实现

```java
import org.springframework.data.redis.core.RedisTemplate;

// ...为节约篇幅，此处省略非核心内容

@Service
public class CommentServiceImpl implements CommentService {

    private static final String COMMENT_COUNT_KEY = "rednote:comment:comment_count";

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    @Transactional
    public Comment createComment(Note note, User user, String content) {
        // 在Redis递增评论数
        redisTemplate.opsForValue().increment(COMMENT_COUNT_KEY);

        Comment comment = new Comment();
        comment.setNote(note);
        comment.setUser(user);
        comment.setContent(content);

        return commentRepository.save(comment);
    }

    @Override
    @Transactional
    public Comment replyToComment(Note note, Comment parentComment, User user, String content) {
        // 在Redis递增评论数
        redisTemplate.opsForValue().increment(COMMENT_COUNT_KEY);

        Comment reply = new Comment();
        reply.setNote(note);
        reply.setUser(user);
        reply.setContent(content);
        reply.setParent(parentComment);

        parentComment.getReplies().add(reply);

        return commentRepository.save(reply);
    }

    @Override
    @Transactional
    public void deleteComment(Comment comment) {
        // 在Redis递减评论数
        redisTemplate.opsForValue().decrement(COMMENT_COUNT_KEY);

        commentRepository.delete(comment);
    }

    @Override
    public long countComments() {
        // 从Redis中获取评论数
        String countFromRedis =redisTemplate.opsForValue().get(COMMENT_COUNT_KEY);
        // 判断Redis是否命中
        if (countFromRedis != null) {
            // 命中，直接返回
            return Long.parseLong(countFromRedis);
        } else {
            // 未命中，从数据库中查询，再存储到Redis
            long countFromDb = commentRepository.count();
            redisTemplate.opsForValue().set(COMMENT_COUNT_KEY, String.valueOf(countFromDb));

            return countFromDb;
        }
        /*return commentRepository.count();*/
    }

    
    // ...为节约篇幅，此处省略非核心内容

}
```

通过以上方案，你可以高效地记录和查询用户点赞、评论等互动数据，同时保障系统性能和数据一致性。根据业务规模和访问量，可以进一步调整 Redis 集群规模和数据同步策略。
