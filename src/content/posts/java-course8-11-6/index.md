---
title: "提供分类分页查询笔记的服务"
published: 2026-08-25
description: "修改NoteRepository，增加如下接口"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-11-6
pinned: false
comment: true
---

### 修改NoteRepository


修改NoteRepository，增加如下接口：


```java
/**
  * 根据分类、分页查询笔记
  *
  * @param category
  * @param pageable
  * @return
  */
Page<Note> findByCategory(String category, Pageable pageable);

/**
  * 分页查询笔记
  *
  * @param pageable
  * @return
  */
Page<Note> findAll(Pageable pageable);
```


上述两个接口的区别是，如果不提供分类，实际上就是全查。

### 修改NoteService

修改NoteService，增加如下接口：


```java
/**
  * 分类分页查询笔记
  *
  * @param page
  * @param pageSize
  * @param category
  * @return
  */
Page<Note> getNotesByPage(int page, int pageSize, String category);
```

### 修改NoteServiceImpl

修改NoteServiceImpl，实现分类分页查询笔记的方法：


```java
@Override
public Page<Note> getNotesByPage(int page, int pageSize, String category) {
    // 构造Pageable对象，按照创建时间倒序排序
    Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by("createAt").descending());

    if (category != null && !category.isEmpty()) {
        return noteRepository.findByCategory(category, pageable);
    }

    return noteRepository.findAll(pageable);
}
```
