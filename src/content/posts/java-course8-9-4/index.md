---
title: "高效实现查询笔记详情的方法"
published: 2026-08-25
description: "修改NoteRepository，增加接口如下"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-9-4
pinned: false
comment: true
---

### 修改NoteRepository

修改NoteRepository，增加接口如下：


```java
public interface NoteRepository extends Repository<Note, Long> {

    // ...为节约篇幅，此处省略非核心内容

    /**
     * 根据笔记ID查询笔记
     *
     * @param noteId
     * @return
     */
    Optional<Note> findByNoteId(Long noteId);
}
```


### 修改服务接口

修改NoteService，增加接口如下：


```java
public interface NoteService {

    // ...为节约篇幅，此处省略非核心内容

    /**
     * 根据笔记ID查询笔记
     *
     * @param noteId
     * @return
     */
    Optional<Note> findByNoteId(Long noteId);
}
```

修改NoteServiceImpl，实现如下接口：


```java
@Service
public class NoteServiceImpl implements NoteService {

    // ...为节约篇幅，此处省略非核心内容

    @Override
    public Optional<Note> findByNoteId(Long noteId) {
        return noteRepository.findByNoteId(noteId);
    }
}
```
