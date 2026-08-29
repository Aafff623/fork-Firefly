---
title: "实现LikeRepository处理点赞数据的存储"
published: 2026-08-25
description: "java"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-13-3
pinned: false
comment: true
---

```java
package com.example.rednote.repository;

import com.example.rednote.entity.Like;
import org.springframework.data.repository.Repository;

import java.util.Optional;

/**
 * LikeRepository 点赞资源库
 *
 * @version 2025/08/21
 **/
public interface LikeRepository extends Repository<Like, Long> {

    Like save(Like like);

    void delete(Like like);

    Optional<Like> findByUserUserIdAndNoteNoteId(Long userId, Long noteId);

    long countByNoteNoteId(Long noteId);
}
```
