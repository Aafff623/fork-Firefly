---
title: "修改用户控制器支持调用内容领域微服务"
published: 2026-08-25
description: "在用户领域微服务的Spring Boot启动类上添加@EnableFeignClients注解，并指定 Feign 客户端所在的包路径："
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-5-1
pinned: false
comment: true
---

### 启用Feign


在用户领域微服务的Spring Boot启动类上添加`@EnableFeignClients`注解，并指定 Feign 客户端所在的包路径：：

```java
package com.example.rednote.usermicroservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = "com.example.rednote")
@EnableDiscoveryClient
@EnableFeignClients(basePackages = {"com.example.rednote.common.interfaces.client"})
public class RednoteApplication {

	public static void main(String[] args) {
		SpringApplication.run(RednoteApplication.class, args);
	}

}
```

同时，为了能够确保所有相关模块的组件、服务和配置都能被Spring容器正确加载，将scanBasePackages设置为顶层包“com.example.rednote”。


### 配置Feign客户端实现熔断降级


在公共模块下新建`src/main/java/com/example/rednote/common/interfaces/client/ContentServiceClient.java`，使用fallback实现熔断降级：


```java
package com.example.rednote.common.interfaces.client;

import com.example.rednote.common.dto.NotesWithUserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * ContentServiceClient ContentService Feign Client
 *
 * @version 2025/07/21
 **/
@FeignClient(
        name = "rednote-content-microservice",
        fallback = ContentServiceClientFallback.class // 指定降级实现类
)
public interface ContentServiceClient {
    @GetMapping("/note/user/{userId}")
    ResponseEntity<NotesWithUserDto> getNotesWithUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size);
```


在公共模块下新建`src/main/java/com/example/rednote/common/interfaces/client/ContentServiceClientFallback.java`：


```java
package com.example.rednote.common.interfaces.client;

import com.example.rednote.common.dto.NotesWithUserDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * ContentServiceClientFallback ContentServiceClient Fallback
 *
 * @version 2025/07/21
 **/
// 降级实现类
@Component
public class ContentServiceClientFallback implements ContentServiceClient {

    @Override
    public ResponseEntity<NotesWithUserDto> getNotesWithUser(Long userId, int page, int size) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }
}
```

### 创建NotesWithUserDto类


在公共模块下新建`src/main/java/com/example/rednote/common/dto/NotesWithUserDto.java`：


```java
package com.example.rednote.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * NotesWithUserDto NotesWithUser DTO
 *
 * @version 2025/07/29
 **/
@Getter
@Setter
@AllArgsConstructor
public class NotesWithUserDto {

    private UserDto user;
    private List<NoteExploreDto> noteList;
    private int currentPage;
    private int totalPages;

}
```

由于NotesWithUserDto依赖了NoteExploreDto，因此内容领域微服务模块的NoteExploreDto.java文件也要移到公共模块`src/main/java/com/example/rednote/common/dto/`下。


已过去之后，由于NoteExploreDto静态方法toExploreDto依赖了Note，因此会报错：

```java
public static NoteExploreDto toExploreDto(Note note, UserDto user) {
    NoteExploreDto dto = new NoteExploreDto();
    dto.noteId = note.getNoteId();
    dto.title = note.getTitle();
    dto.cover = note.getImages().get(0);
    dto.username = user.getUsername();
    dto.avatar = user.getAvatar();
    dto.userId = user.getUserId();
    dto.likeCount = note.getLikeCount();
    dto.isLiked = note.isLikedByUser(user.getUserId());

    return dto;
}
```

需要将上述方法进行重构，移动到NoteService中，代码如下：


```java
/**
 * 转为DTO
 *
 * @param note
 * @param user
 * @return
 */
NoteExploreDto toExploreDto(Note note, UserDto user);
```

NoteServiceImpl实现上述接口代码如下：


```java
@Override
public NoteExploreDto toExploreDto(Note note, UserDto user) {
    NoteExploreDto dto = new NoteExploreDto();
    dto.setNoteId(note.getNoteId());
    dto.setTitle(note.getTitle());
    dto.setCover(note.getImages().get(0));
    dto.setUsername(user.getUsername());
    dto.setAvatar(user.getAvatar());
    dto.setUserId(user.getUserId());
    dto.setLikeCount(note.getLikeCount());
    dto.setLiked(note.isLikedByUser(user.getUserId()));

    return dto;
}
```


涉及上述接口的相关类也要调整，比如ExploreController：

```java
@GetMapping("/note")
public ResponseEntity<NoteResponseDto> getNotesByCategory(
                                                            @RequestParam(defaultValue = "1") int page,
                                                            @RequestParam(required = false) String category,
                                                            @RequestParam(required = false) String query) {
    // ...为节约篇幅，此处省略非核心内容

    // 处理序列化问题
    List<NoteExploreDto> noteExploreDtoList = new ArrayList<>();
    for (Note note : notes.getContent()) {
        /*noteExploreDtoList.add(NoteExploreDto.toExploreDto(note, currentUser));*/
        noteExploreDtoList.add(noteService.toExploreDto(note, currentUser));
    }
    notesResponseDto.setNotes(noteExploreDtoList);

    return ResponseEntity.ok(notesResponseDto);
}
```


### 在Controller调用Feign客户端


修改UserController，在原调用NoteService地方改为用ContentServiceClient：


```java
@Autowired
//private NoteService noteService;
private ContentServiceClient contentServiceClient;

@GetMapping("/profile/{userId}")
public ResponseEntity<?> profileWithNotes(
        @PathVariable Long userId,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "12") int size) {

    Optional<User> userOptional = userService.findByUserId(userId);

    if (!userOptional.isPresent()) {
        throw new UserNotFoundException("");
    }

    /*
    User user = userOptional.get();

    // 获取用户笔记列表（分页）
    Page<Note> notePage = noteService.getNotesByUser(userId, page - 1, size);

    // 转换为 DTO
    List<NoteExploreDto> noteExploreDtoList = notePage.map(note -> NoteExploreDto.toExploreDto(note, user)).getContent();

    Map<String, Object> map = new HashMap<>();
    map.put("user", user);
    map.put("noteList", noteExploreDtoList);
    map.put("currentPage", page);
    map.put("totalPages", notePage.getTotalPages());
    return ResponseEntity.ok(map);
    */

    ResponseEntity<NotesWithUserDto> notesWithUser = contentServiceClient.getNotesWithUser(userId, page, size);
    NotesWithUserDto notesWithUserDto = notesWithUser.getBody();
    return ResponseEntity.ok(notesWithUserDto);
}
```


### 在NoteController新增getNotesWithUser接口


```java
@Autowired
//private UserService userService;
private UserServiceClient userServiceClient;

@GetMapping("/user/{userId}")
public ResponseEntity<?> getNotesWithUser(
        @PathVariable Long userId,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "12") int size) {
    ResponseEntity<UserDto> response = userServiceClient.findByUserId(userId);
    UserDto user = response.getBody();

    // 获取用户笔记列表（分页）
    Page<Note> notePage = noteService.getNotesByUser(userId, page - 1, size);

    // 转换为 DTO
    List<NoteExploreDto> noteExploreDtoList = notePage.map(note -> noteService.toExploreDto(note, user)).getContent();

    NotesWithUserDto dto = new NotesWithUserDto(user, noteExploreDtoList, page, notePage.getTotalPages());
    ResponseEntity<NotesWithUserDto> responseEntity = ResponseEntity.ok()
            .body(dto);
    return responseEntity;
}
```


### 新增用户领域微服务Feign客户端


在公共模块下新建`src/main/java/com/example/rednote/common/interfaces/client/UserServiceClient.java`，使用fallback实现熔断降级：


```java
package com.example.rednote.common.interfaces.client;

import com.example.rednote.common.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * UserServiceClient UserService Feign Client
 *
 * @version 2025/07/21
 **/
@FeignClient(
        name = "rednote-user-microservice",
        fallback = UserServiceClientFallback.class // 指定降级实现类
)
public interface UserServiceClient {
    @GetMapping("/user/{userId}")
    ResponseEntity<UserDto> findByUserId(@PathVariable Long userId);
}
```


在公共模块下新建`src/main/java/com/example/rednote/common/interfaces/client/UserServiceClientFallback.java`：


```java
package com.example.rednote.common.interfaces.client;

import com.example.rednote.common.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * UserServiceClientFallback UserServiceClient Fallback
 *
 * @version 2025/07/21
 **/
// 降级实现类
@Component
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public ResponseEntity<UserDto> findByUserId(Long userId) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }
}
```


### 在UserController新增findByUserId接口


```java
@GetMapping("/{userId}")
public ResponseEntity<UserDto> findByUserId(@PathVariable Long userId) {
    Optional<User> userOptional = userService.findByUserId(userId);

    if (!userOptional.isPresent()) {
        throw new UserNotFoundException("");
    }

    User user = userOptional.get();

    UserDto dto = new UserDto();
    dto.setUserId(user.getUserId());
    dto.setUsername(user.getUsername());
    dto.setPhone(user.getPhone());
    dto.setAvatar(user.getAvatar());
    dto.setBio(user.getBio());
    dto.setRole(user.getRole());

    // 返回响应
    return ResponseEntity.ok(dto);
}
```

在公共模块下新增`src/main/java/com/example/rednote/common/dto/UserDto.java`如下：


```java
package com.example.rednote.common.dto;

import com.example.rednote.common.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

/**
 * UserDto User DTO 
 * @version 2025/07/21
**/
@Getter
@Setter
public class UserDto {
    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 简介
     */
    private String bio;

    /**
     * 角色， 默认值设置为USER
     */
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

}
```
