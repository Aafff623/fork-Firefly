---
title: "创建控制器方法来处理登录请求"
published: 2026-08-25
description: "1. 控制器功能"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-5-3
pinned: false
comment: true
---

### 实现说明

1. 控制器功能：
   - `showLoginForm`：显示登录表单，处理登录错误消息
   - `processLoginForm`：处理登录请求，验证用户名和密码（简化示例）


2. 表单验证：
   - 使用 `@ModelAttribute` 获取表单参数
   - 实际项目中可使用 `@Valid` 和 `BindingResult` 进行更复杂的表单验证

3. 登录处理：
   - 示例中使用简单的用户名密码比对
   - 实际项目中应使用 Spring Security 进行安全认证
   - 密码应使用 BCrypt 等强哈希算法加密存储

4. 错误处理：
   - 登录失败时通过重定向传递错误参数
   - 登录页面根据错误参数显示相应错误信息

5. 安全建议：
   - 永远不要明文存储密码
   - 使用 HTTPS 保护登录过程
   - 实现密码加密和盐值处理
   - 添加 CSRF 保护（Spring Security 默认启用）

在实际项目中，建议使用 Spring Security 处理认证和授权，这样可以获得更完善的安全功能，包括密码加密、会话管理、CSRF 保护等。上面的自定义控制器示例仅适用于简单场景或学习目的。

### Spring MVC 登录控制器实现

修改AuthController，增加如下代码，用于处理表单验证、用户认证和登录失败等场景：

```java
/**
 * 显示登录页面
 */
@GetMapping("/login")
public String showLoginForm(Model model) {
   model.addAttribute("user", new UserLoginDto());
   return "login-form";
}

/**
 * 处理登录表单的提交
 */
@PostMapping("/login")
public String processLoginForm(@Valid @ModelAttribute("user") UserLoginDto loginDto,
                              BindingResult bindingResult,
                              Model model) {
   // 检查用户名是否存在
   if (!userService.existsByUsername(loginDto.getUsername())) {
      bindingResult.rejectValue("username", null, "该用户名未注册");

      model.addAttribute("user", loginDto);
      return "login-form";
   }

   // 检查密码是否正确
   if (!userService.verifyPassword(loginDto.getUsername(), loginDto.getPassword())) {
      bindingResult.rejectValue("password", null, "密码错误");

      model.addAttribute("user", loginDto);
      return "login-form";
   }

   // 登录成功，重定向到首页或
   return "redirect:/";
}
```

检查用户名是否已存在：

1. UserRepository接口中添加根据用户名查询用户的方法
2. 在控制器的登录处理方法中，调用UserRepository接口的查询方法，从数据库中获取用户信息
3. 处理查询结果，若用户不存在则返回登录失败信息


### 相关支持类

#### 1. 用户登录 DTO
```java
package com.example.rednote.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * UserLoginDto 用户登录DTO
 *
 * @version 2025/08/16
 **/
@Getter
@Setter
public class UserLoginDto {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 4, max = 20, message = "用户名长度应为4-20个字符")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 20, message = "密码长度应为8-20个字符")
    @Pattern(regexp = "^[a-zA-Z0-9_]{8,20}$", message = "密码格式不正确")
    private String password;

    private boolean rememberMe;
}
```

#### 2. 用户服务接口

在UserService中增加如下接口用于验证密码：


```java
/**
 * 验证密码
 */
boolean verifyPassword(@NotBlank(message = "用户名不能为空") @Size(min = 4, max = 20, message = "用户名长度应为4-20个字符") String username, @NotBlank(message = "密码不能为空") @Size(min = 8, max = 20, message = "密码长度应为8-20个字符") @Pattern(regexp = "^[a-zA-Z0-9_]{8,20}$", message = "密码格式不正确") String password);
```
