---
title: "修改后台管理界面控制器支持调用内容领域微服务"
published: 2026-08-25
description: "在公共模块下src/main/java/com/example/rednote/common/interfaces/client/ContentServiceClient.java下新增接口"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-7-2
pinned: false
comment: true
---

### 内容领域微服务Feign客户端新增接口


在公共模块下`src/main/java/com/example/rednote/common/interfaces/client/ContentServiceClient.java`下新增接口：


```java
public interface ContentServiceClient {
    // ...为节约篇幅，此处省略非核心内容

    @GetMapping("/log/dashboard")
    ResponseEntity<AdminDashboardDto> dashboard();
}
```

新增`src/main/java/com/example/rednote/common/dto/AdminDashboardDto.java`如下：


```java
package com.example.rednote.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * NotesWithUserDto NotesWithUser DTO
 *
 * @version 2025/07/29
 **/
@Getter
@Setter
@AllArgsConstructor
public class AdminDashboardDto {

    private long userCount;
    private long noteCount;
    private long commentCount;
    private List<NoteBrowseCountDto> noteBrowseCountDtoList;
    private List<NoteBrowseTimeDto> noteBrowseTimeDtoList;
}
```

AdminDashboardDto所依赖的NoteBrowseCountDto、NoteBrowseTimeDto一并移到公共模块下。


在公共模块下`src/main/java/com/example/rednote/common/interfaces/client/ContentServiceClientFallback.java`下新增接口实现：


```java
@Component
public class ContentServiceClientFallback implements ContentServiceClient {

    // ...为节约篇幅，此处省略非核心内容

    @Override
    public ResponseEntity<AdminDashboardDto> dashboard() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }
}
```


### 调用Feign客户端

AdminController调用Feign客户端：

```java
@GetMapping("/dashboard")
/*public ResponseEntity<?> dashboard() {
    // 统计数据
    long userCount = userService.countUsers();
    long noteCount = noteService.countNotes();
    long commentCount = commentService.countComments();
    List<NoteBrowseCountDto> noteBrowseCountDtoList =  noteService.getNoteByBrowseCount(1, 10);
    List<NoteBrowseTimeDto> noteBrowseTimeDtoList =  noteService.getNoteByBrowseTime(1, 10);

    Map<String, Object> map = new HashMap<>();
    map.put("userCount", userCount);
    map.put("noteCount", noteCount);
    map.put("commentCount", commentCount);
    map.put("noteBrowseCountDtoList", noteBrowseCountDtoList);
    map.put("noteBrowseTimeDtoList", noteBrowseTimeDtoList);

    return ResponseEntity.ok(map);
}*/
public ResponseEntity<?> dashboard() {
    ResponseEntity<AdminDashboardDto> responseEntity = contentServiceClient.dashboard();
    return ResponseEntity.ok(responseEntity.getBody());
}
```

### 在LogController新增接口


```java
@Autowired
private UserServiceClient userServiceClient;

@Autowired
private NoteService noteService;

@Autowired
private CommentService commentService;

@GetMapping("/dashboard")
public ResponseEntity<AdminDashboardDto> dashboard() {
    // 统计数据
    long userCount = userServiceClient.countUsers().getBody();

    long noteCount = noteService.countNotes();
    long commentCount = commentService.countComments();
    List<NoteBrowseCountDto> noteBrowseCountDtoList =  noteService.getNoteByBrowseCount(1, 10);
    List<NoteBrowseTimeDto> noteBrowseTimeDtoList =  noteService.getNoteByBrowseTime(1, 10);

    AdminDashboardDto adminDashboardDto =
            new AdminDashboardDto(userCount, noteCount, commentCount, noteBrowseCountDtoList, noteBrowseTimeDtoList);

    return ResponseEntity.ok(adminDashboardDto);
}
```
