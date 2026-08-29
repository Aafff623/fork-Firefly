---
title: "控制器来处理笔记详情查询请求"
published: 2026-08-25
description: "在原有的NoteController基础上，增加方法以实现相关功能。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-9-3
pinned: false
comment: true
---

在原有的NoteController基础上，增加方法以实现相关功能。


### 控制器处理用户笔记详情展示

新增方法如下。


```java
import com.example.rednote.exception.NoteNotFoundException;
import java.util.Optional;

// ...为节约篇幅，此处省略非核心内容


@Controller
@RequestMapping("/note")
public class NoteController {
    @Autowired
    private NoteService noteService;

    // ...为节约篇幅，此处省略非核心内容

    /**
     * 显示笔记详情页面
     */
    @GetMapping("/{noteId}")
    public String showNoteDetail(@PathVariable Long noteId, Model model) {
        // 查询指定noteId的笔记
        Optional<Note>  optionalNote = noteService.findNoteById(noteId);

        // 判定笔记是否存在，不存在则抛出异常
        if (!optionalNote.isPresent()) {
            throw new NoteNotFoundException("");
        }

        Note note = optionalNote.get();
        model.addAttribute("note", note);

        return "note-detail";
    }
}    
```


上述代码

* 通过`@PathVariable`传递参数，获取到所需要查询的笔记的ID。
* 当访问`/note/{noteId}`路径时，如果正常处理，会返回note-detail.html模板页面。
* 如果传入的noteId不存在，则会抛出NoteNotFoundException异常。


### NoteNotFoundException异常


新增NoteNotFoundException用于表示用户不存在异常：


```java
package com.example.rednote.exception;

/**
 * NoteNotFoundException 笔记不存在异常
 *
 * @version 2025/06/11
 **/
public class NoteNotFoundException extends ValidationException {
    public NoteNotFoundException(String message) {
        super("笔记不存在异常. " + message);
    }

    public NoteNotFoundException(String message, Throwable cause) {
        super("笔记不存在异常. " + message, cause);
    }
}
```
