---
title: "Spring MVC控制器来处理点赞请求及安全配置要点"
published: 2026-08-25
description: "java"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-13-5
pinned: false
comment: true
---

### 点赞控制器层

```java
package com.example.rednote.controller;

import com.example.rednote.dto.LikeResponseDto;
import com.example.rednote.entity.User;
import com.example.rednote.service.LikeService;
import com.example.rednote.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * LikeController 点赞控制器
 *
 * @version 2025/08/21
 **/
@Controller
@RequestMapping("/like")
public class LikeController {
    @Autowired
    private LikeService likeService;

    @Autowired
    private UserService userService;

    /**
     * 处理点赞、取消点赞请求
     *
     * @param noteId
     * @return
     */
    @PostMapping("/{noteId}")
    public ResponseEntity<LikeResponseDto> toggleLike(@PathVariable Long noteId) {
        User currentUser = userService.getCurrentUser();

        boolean isLiked = likeService.toggleLike(noteId, currentUser);
        long likeCount = likeService.getLikeCount(noteId);

        return ResponseEntity.ok(new LikeResponseDto(isLiked, likeCount));
    }
}
```

### DTO


```java
package com.example.rednote.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * LikeResponseDto 点赞响应对象
 *
 * @version 2025/08/21
 **/
@Getter
@Setter
@AllArgsConstructor
public class LikeResponseDto {
    /**
     * 是否点赞
     */
    private boolean isLiked;

    /**
     * 点赞数量
     */
    private long likeCount;
}
```


修改NoteExploreDto：

```java
/**
    * 是否（被当前用户）点赞
    */
private boolean isLiked;

/**
    * 点赞量
    */
private long likeCount;

/*public static NoteExploreDto toExploreDto(Note note) {
    NoteExploreDto dto = new NoteExploreDto();
    dto.noteId = note.getNoteId();
    dto.title = note.getTitle();
    dto.cover = note.getImages().get(0);
    dto.username = note.getAuthor().getUsername();
    dto.avatar = note.getAuthor().getAvatar();
    dto.userId = note.getAuthor().getUserId();

    return dto;
}*/

public static NoteExploreDto toExploreDto(Note note, User user) {
    NoteExploreDto dto = new NoteExploreDto();
    dto.noteId = note.getNoteId();
    dto.title = note.getTitle();
    dto.cover = note.getImages().get(0);
    dto.username = note.getAuthor().getUsername();
    dto.avatar = note.getAuthor().getAvatar();
    dto.userId = note.getAuthor().getUserId();
    dto.likeCount = note.getLikeCount();
    dto.isLiked = note.isLikedByUser(user.getUserId());

    return dto;
}
```

其中，toExploreDto() 方法增加了User对象。


### 修改ExploreController


```java
@Autowired
private UserService userService;

@GetMapping("/note")
public ResponseEntity<NoteResponseDto> getNotesByCategory(@RequestParam(defaultValue = "1") int page,
                                                              @RequestParam(required = false) String category,
                                                              @RequestParam(required = false) String query) {
        // 注意：把分类“推荐”当成null
        if (DEFAULT_CATEGORY.equals(category)) {
            category = null;
        }

        // 分页查询笔记
        Page<Note> notes = null;
        // 判定query是否为空
        if (query != null && query.trim().length() > 0) {
            notes = noteService.getNotesByPageAndQuery(page, PAGE_SIZE, category, query);
        } else {
            notes = noteService.getNotesByPage(page, PAGE_SIZE, category);
        }

        NoteResponseDto noteResponseDto = new NoteResponseDto();
        /*noteResponseDto.setNotes(notes.getContent());*/
        noteResponseDto.setHasMore(notes.hasNext());

        User user = userService.getCurrentUser();

        // 处理序列化问题
        List<NoteExploreDto> noteExploreDtoLst = new ArrayList<>();
        for (Note note : notes.getContent()) {
            /*noteExploreDtoLst.add(NoteExploreDto.toExploreDto(note));*/
            noteExploreDtoLst.add(NoteExploreDto.toExploreDto(note, user));
        }
        noteResponseDto.setNotes(noteExploreDtoLst);

        return ResponseEntity.ok(noteResponseDto);
    }
}
```

获取当前用户，并赋值给NoteExploreDto.toExploreDto() 方法。


### 安全配置


1. 在 Spring Security 配置类中，进一步细化点赞API的访问权限
2. 确保只有普通用户角色可以访问点赞API


修改WebSecurityConfig如下：


```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            // ...为节约篇幅，此处省略非核心内容    
            .authorizeHttpRequests(authorize -> authorize
                    // ...为节约篇幅，此处省略非核心内容

                    // 允许USER角色的用户访问 /like/** 的资源
                    .requestMatchers("/like/**").hasRole("USER")
                    // 其他请求需要认证
                    .anyRequest().authenticated()
            )

 
    ;

    return http.build();
}            
```


修改explore.html设置并获取 CSRF 令牌：

```html
<!-- 确保有一个meta标签来存储CSRF令牌 -->
<meta name="_csrf" th:content="${_csrf.token}"></meta>
```
