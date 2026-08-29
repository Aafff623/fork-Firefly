---
title: "修改笔记控制器支持调用用户领域微服务"
published: 2026-08-25
description: "在用户领域微服务的Spring Boot启动类上添加@EnableFeignClients注解，并指定 Feign 客户端所在的包路径："
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-6-2
pinned: false
comment: true
---

### 启用Feign和Sentinel


在用户领域微服务的Spring Boot启动类上添加`@EnableFeignClients`注解，并指定 Feign 客户端所在的包路径：：

```java
package com.example.rednote.contentmicroservice;

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


### 用户领域微服务Feign客户端新增接口


在公共模块下`src/main/java/com/example/rednote/common/interfaces/client/UserServiceClient.java`下新增接口：


```java
public interface UserServiceClient {
    // ...为节约篇幅，此处省略非核心内容

    @GetMapping("/user/current")
    ResponseEntity<UserDto> getCurrentUser();

    @GetMapping("/user/username/{username}")
    ResponseEntity<UserDto> findByUsername(@PathVariable String username);
}
```


在公共模块下`src/main/java/com/example/rednote/common/interfaces/client/UserServiceClientFallback.java`下新增接口实现：


```java
@Component
public class UserServiceClientFallback implements UserServiceClient {

    // ...为节约篇幅，此处省略非核心内容

    @Override
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }

    @Override
    public ResponseEntity<UserDto> findByUsername(String username) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }
}
```


### 在UserController新增接口


```java
@GetMapping("/current")
public ResponseEntity<UserDto> getCurrentUser() {
    User user = userService.getCurrentUser();

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

@GetMapping("/username/{username}")
public ResponseEntity<?> findByUsername(@PathVariable String username) {
    Optional<User> userOptional = userService.findByUsername(username);

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

### 在NoteController调用用户领域微服务Feign客户端


修改NoteController，在原调用UserService地方改为用UserServiceClient：


```java
@PostMapping("/publish")
public ResponseEntity<?> publishNote(@Valid @ModelAttribute("note") NotePublishDto notePublishDto,
                          BindingResult bindingResult) {
    // 验证表单
    if (bindingResult.hasErrors()) {
        // 自定义错误响应
        Map<String, String> errors = new HashMap<>();
        bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    } else {
        // 获取当前用户
        /*User currentUser = userService.getCurrentUser();*/
        UserDto currentUser = userServiceClient.getCurrentUser().getBody();

        // 创建笔记
        noteService.createNote(notePublishDto, currentUser);

        // 返回成功响应
        return ResponseEntity.ok("笔记创建成功");
    }
}

@GetMapping("/{noteId}")
public ResponseEntity<?> getNote(@PathVariable Long noteId) {
    Optional<Note> noteOptional = noteService.findByNoteId(noteId);

    if (!noteOptional.isPresent()) {
        throw new NoteNotFoundException("");
    }

    Note note = noteOptional.get();
    /*User currentUser = userService.getCurrentUser();*/
    UserDto author = userServiceClient.findByUserId(note.getUserId()).getBody();

    return ResponseEntity.ok(NoteDetailDto.toNoteDetailDto(note, author));
}
```
