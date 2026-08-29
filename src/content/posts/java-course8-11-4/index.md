---
title: "创建一个Spring MVC控制器类处理首页笔记探索请求"
published: 2026-08-25
description: "新建一个控制器ExploreController，用于处理首页笔记探索的请求。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-11-4
pinned: false
comment: true
---

新建一个控制器ExploreController，用于处理首页笔记探索的请求。

### 返回首页笔记探索页面


新增方法如下。

```java
package com.example.rednote.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * ExploreController 首页笔记探索
 *
 * @version 2025/08/20
 **/
@Controller
@RequestMapping("/explore")
public class ExploreController {

    /**
     * 显示笔记探索页面
     */
    @GetMapping
    public String showExplore() {
        return "explore";
    }
}
```

### 返回首页笔记探索页面的笔记数据

新增方法如下。


```java
private static final int PAGE_SIZE = 20;
private static final String DEFAULT_CATEGORY = "推荐";

@Autowired
private NoteService noteService;

/**
  * 返回首页笔记探索页面的笔记数据
  */
@GetMapping("/note")
public ResponseEntity<NoteResponseDto> getNotesByCategory(
                                                          @RequestParam(defaultValue = "1") int page,
                                                          @RequestParam(required = false) String category) {
    // 把“推荐”当成空
    if (DEFAULT_CATEGORY.equals(category)) {
        category = null;
    }

    Page<Note> notes = noteService.getNotesByPage(page, PAGE_SIZE, category);

    NoteResponseDto notesResponseDto = new NoteResponseDto();
    notesResponseDto.setHasMore(notes.hasNext());
    notesResponseDto.setNotes(notes.getContent());

    return ResponseEntity.ok(notesResponseDto);
}
```


上述接口，可以根据分类进行分页查询，并将查询结果通过NoteResponseDto数据结构返回给前端。

如果分类是“推荐”，实际上就是不需要分类，直接赋值为null即可。


### 探索笔记的响应对象DTO

新增NoteResponseDto如下。


```java
package com.example.rednote.dto;

import com.example.rednote.entity.Note;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * NoteResponseDto 探索笔记的响应对象
 *
 * @version 2025/08/20
 **/
@Getter
@Setter
public class NoteResponseDto {
    /**
     * 笔记列表
     */
    private List<Note> notes;

    /**
     * 是否还有更多
     */
    private boolean hasMore;
}
```

### 首页重定向


首页重定向到首页笔记探索页面：

```java
package com.example.rednote.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * IndexController 首页控制器
 *
 * @version 2025/08/20
 **/
@Controller
@RequestMapping("/")
public class IndexController {
    @GetMapping
    public String index() {
        // 重定向到首页笔记探索页面
        return "redirect:/explore";
    }
}
```
