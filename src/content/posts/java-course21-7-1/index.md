---
title: "修改后台管理界面控制器支持调用用户领域微服务"
published: 2026-08-25
description: "在用户领域微服务的Spring Boot启动类上添加@EnableFeignClients注解，并指定 Feign 客户端所在的包路径："
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-7-1
pinned: false
comment: true
---

### 启用Feign和Sentinel


在用户领域微服务的Spring Boot启动类上添加`@EnableFeignClients`注解，并指定 Feign 客户端所在的包路径：：

```java
package com.example.rednote.adminmicroservice;

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

    @GetMapping("/user")
    ResponseEntity<AllUsersDto> getAllUsers(@RequestParam(defaultValue = "1") int page);

    @PostMapping("/user/edit-by-admin")
    ResponseEntity<String> updateUserByAdmin(@RequestBody UserEditByAdminDto user);

    @DeleteMapping("/user/{userId}")
    ResponseEntity<DeleteResponseDto> deleteUser(@PathVariable Long userId);

    @GetMapping("/user/count")
    ResponseEntity<Long> countUsers();
}
```


新增`src/main/java/com/example/rednote/common/dto/AllUsersDto.java`如下：


```java
package com.example.rednote.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * AllUsersDto
 *
 * @version 2025/07/29
 **/
@Getter
@Setter
@AllArgsConstructor
public class AllUsersDto {
    private List<UserEditByAdminDto> userList;
    private int currentPage;
    private int totalPages;

}
```

新增`src/main/java/com/example/rednote/common/dto/UserEditByAdminDto.java`如下：


```java
package com.example.rednote.common.dto;

import com.example.rednote.common.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

/**
 * UserEditByAdminDto
 *
 * @version 2025/07/24
 **/
@Getter
@Setter
public class UserEditByAdminDto {
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
     * 密码
     */
    private String password;

    /**
     * 角色， 默认值设置为USER
     */
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;


}
```


在公共模块下`src/main/java/com/example/rednote/common/interfaces/client/UserServiceClientFallback.java`下新增接口实现：


```java
@Component
public class UserServiceClientFallback implements UserServiceClient {

    // ...为节约篇幅，此处省略非核心内容

    @Override
    public ResponseEntity<AllUsersDto> getAllUsers(int page) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }

    @Override
    public ResponseEntity<String> updateUserByAdmin(UserEditByAdminDto user) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }

    @Override
    public ResponseEntity<DeleteResponseDto> deleteUser(Long userId) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }

    @Override
    public ResponseEntity<Long> countUsers() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }
}
```


### 在UserController新增接口


```java
private static final int PAGE_SIZE = 10;

@GetMapping
public ResponseEntity<AllUsersDto> getAllUsers(@RequestParam(defaultValue = "1") int page) {
    Page<User> userPage = userService.getAllUsers(page, PAGE_SIZE);
    // 转换为 DTO
    List<UserEditByAdminDto> userDtoList = userPage.map(user -> {
        UserEditByAdminDto dto = new UserEditByAdminDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());

        return dto;
    }).getContent();

    AllUsersDto allUsersDto = new AllUsersDto(userDtoList, page, userPage.getTotalPages());

    return ResponseEntity.ok(allUsersDto);
}

@PostMapping("/edit-by-admin")
public ResponseEntity<String> updateUserByAdmin(@RequestBody UserEditByAdminDto user) {
    Optional<User> userOptional = userService.findByUserId(user.getUserId());

    if (!userOptional.isPresent()) {
        throw new UserNotFoundException("");
    }

    User oldUser = userOptional.get();

    userService.updateUserByAdmin(oldUser, user);

    return ResponseEntity.ok("更新成功");
}

@DeleteMapping("/{userId}")
public ResponseEntity<DeleteResponseDto> deleteUser(@PathVariable Long userId) {
    Optional<User> userOptional = userService.findByUserId(userId);

    if (!userOptional.isPresent()) {
        throw new UserNotFoundException("");
    }

    userService.deleteUser(userId);

    DeleteResponseDto response = new DeleteResponseDto();
    response.setMessage("用户删除成功");
    response.setRedirectUrl("/admin/user");

    return ResponseEntity.ok(response);
}

@GetMapping("/count")
public ResponseEntity<Long> countUsers() {
    long userCount = userService.countUsers();
    return ResponseEntity.ok(userCount);
}
```


### 修改用户服务


修改UserService的updateUserByAdmin接口：


```java
/**
 * 管理员更新用户
 *
 * @param oldUser
 * @param newUser
 */
/*void updateUserByAdmin(User oldUser, User newUser);*/
void updateUserByAdmin(User oldUser, UserEditByAdminDto newUser);
```


修改UserServiceImpl的updateUserByAdmin方法：


```java
@Override
/*public void updateUserByAdmin(User oldUser, User newUser) {

    // 更新基本信息
    oldUser.setPhone(newUser.getPhone());

    // 更新密码（如果有输入）
    if (newUser.getPassword() !=null && !newUser.getPassword().isEmpty()) {
        oldUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
    }

    userRepository.save(oldUser);
}*/
public void updateUserByAdmin(User oldUser, UserEditByAdminDto newUser) {

    // 更新基本信息
    oldUser.setPhone(newUser.getPhone());

    // 更新密码（如果有输入）
    if (newUser.getPassword() !=null && !newUser.getPassword().isEmpty()) {
        oldUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
    }

    userRepository.save(oldUser);
}
```


### 在AdminController调用用户领域微服务Feign客户端


修改AdminController，在原调用UserService地方改为用UserServiceClient：


```java
@GetMapping("/user")
/*public ResponseEntity<?> getUser(@RequestParam(defaultValue = "1") int page) {
    Page<User> userPage = userService.getAllUsers(page, PAGE_SIZE);

    Map<String, Object> map = new HashMap<>();
    map.put("userList", userPage.getContent());
    map.put("currentPage", page);
    map.put("totalPages", userPage.getTotalPages());

    return ResponseEntity.ok(map);
}*/
public ResponseEntity<?> getUser(@RequestParam(defaultValue = "1") int page) {
    ResponseEntity<AllUsersDto> responseEntity = userServiceClient.getAllUsers(page);
    return ResponseEntity.ok(responseEntity.getBody());
}

@GetMapping("/user/{userId}/edit")
/*public ResponseEntity<?> editUser(@PathVariable Long userId) {
    Optional<User> userOptional = userService.findByUserId(userId);

    if (!userOptional.isPresent()) {
        throw new UserNotFoundException("");
    }

    return ResponseEntity.ok(userOptional.get());
}*/
public ResponseEntity<UserDto> editUser(@PathVariable Long userId) {
    ResponseEntity<UserDto> responseEntity = userServiceClient.findByUserId(userId);
    return ResponseEntity.ok(responseEntity.getBody());
}

@PostMapping("/user")
/*public ResponseEntity<?> updateUser(@ModelAttribute User user) {
    Optional<User> userOptional = userService.findByUserId(user.getUserId());

    if (!userOptional.isPresent()) {
        throw new UserNotFoundException("");
    }

    User oldUser = userOptional.get();

    userService.updateUserByAdmin(oldUser, user);

    return ResponseEntity.ok("更新成功");
}*/
public ResponseEntity<?> updateUser(@ModelAttribute UserEditByAdminDto user) {
    ResponseEntity<?> responseEntity = userServiceClient.updateUserByAdmin(user);
    return ResponseEntity.ok(responseEntity.getBody());
}

@DeleteMapping("/user/{userId}")
/*public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
    Optional<User> userOptional = userService.findByUserId(userId);

    if (!userOptional.isPresent()) {
        throw new UserNotFoundException("");
    }

    userService.deleteUser(userId);

    DeleteResponseDto response = new DeleteResponseDto();
    response.setMessage("用户删除成功");
    response.setRedirectUrl("/admin/user");

    return ResponseEntity.ok(response);
}*/
public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
    ResponseEntity<DeleteResponseDto> responseEntity = userServiceClient.deleteUser(userId);
    return ResponseEntity.ok(responseEntity.getBody());
}
```
