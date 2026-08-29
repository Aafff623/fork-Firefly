---
title: "点赞服务的核心设计要领"
published: 2026-08-25
description: "java"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-13-4
pinned: false
comment: true
---

### 点赞服务接口
```java
package com.example.rednote.service;

import com.example.rednote.entity.User;

/**
 * LikeService 点赞服务
 *
 * @version 2025/08/21
 **/
public interface LikeService {
    /**
     * 点赞\取消点赞
     *
     * @param noteId
     * @param user
     * @return
     */
    boolean toggleLike(Long noteId, User user);

    /**
     * 获取笔记的点赞数
     *
     * @param noteId
     * @return
     */
    long getLikeCount(Long noteId);
}
```

### 点赞服务实现

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
import org.springframework.beans.factory.annotation.Autowired;
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

    @Override
    public boolean toggleLike(Long noteId, User user) {
        // 判断笔记是否存在
        Optional<Note> optionalNote = noteService.findNoteById(noteId);
        if (!optionalNote.isPresent()) {
            throw new NoteNotFoundException("");
        }

        // 查询用户是否已点赞
        Optional<Like> optionalLike = likeRepository.findByUserUserIdAndNoteNoteId(user.getUserId(), noteId);
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
        }
    }

    @Override
    public long getLikeCount(Long noteId) {
        return likeRepository.countByNoteNoteId(noteId);
    }
}
```
