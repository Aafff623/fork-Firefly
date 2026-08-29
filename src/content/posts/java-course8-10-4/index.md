---
title: "实现笔记编辑数据的保存方法"
published: 2026-08-25
description: "修改NoteService，增加如下接口"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-10-4
pinned: false
comment: true
---

修改NoteService，增加如下接口：


```java
public interface NoteService {
 

    /**
     * 更新笔记
     *
     * @param note
     * @param noteEditDto
     */
    void updateNote(Note note, NoteEditDto noteEditDto);
}
```

修改 NoteServiceImpl，实现笔记编辑数据的保存方法：


```java
import com.example.rednote.dto.NoteEditDto;

// ...为节约篇幅，此处省略非核心内容

@Service
public class NoteServiceImpl implements NoteService {

    // ...为节约篇幅，此处省略非核心内容

    @Override
    public void updateNote(Note note, NoteEditDto noteEditDto) {
        // 更新基本信息
        note.setTitle(noteEditDto.getTitle());
        note.setContent(noteEditDto.getContent());
        note.setCategory(noteEditDto.getCategory());

        // 字符串转为List
        note.setTopics(StringUtil.splitToList(noteEditDto.getTopics()," "));

        // 保存更新
        noteRepository.save(note);
    }
}  
```

需要注意是的，前端传入的NoteEditDto的topics是字符串类型，在赋值到Note时，需要通过StringUtil.splitToList()工具做转换。
