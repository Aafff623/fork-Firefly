---
title: "创建一个Spring MVC控制器类处理注册请求的方法"
published: 2026-08-25
description: "1. 控制器功能"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-4-4
pinned: false
comment: true
---

### 实现说明

1. 控制器功能：
   - `showRegistrationForm`：显示注册表单页面
   - `processRegistrationForm`：处理注册请求，包含表单验证和业务逻辑
   - `showLoginForm`：显示登录页面

2. 表单验证：
   - 使用 JSR-303 注解（如 `@NotBlank`, `@Size`, `@Pattern`）进行字段验证
   - 检查手机号和用户名是否已存在
   - 验证失败时返回错误信息到表单页面

3. 业务逻辑：
   - 密码加密存储（使用 Spring Security 的 `PasswordEncoder`）
   - 用户信息持久化到数据库
   - 注册成功后重定向到登录页面

4. 依赖关系：
   - 需要 `UserRepository` 接口实现数据库操作
   - 需要 `PasswordEncoder` Bean 进行密码加密
   - 需要 `User` 实体类映射数据库表

实际项目中，你还需要添加短信验证码服务、密码加密配置、数据库配置等相关功能。这个控制器提供了基本的注册流程框架，可以根据具体需求进行扩展。

### Spring MVC 注册控制器实现

以下是一个处理用户注册请求的 Spring MVC 控制器类 AuthController，包含用户注册的基本逻辑和表单验证：

```java
package com.example.rednote.controller;

import com.example.rednote.dto.UserRegistrationDto;
import com.example.rednote.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * AuthController 认证控制器
 *
 * @version 2025/08/16
 **/
@Controller
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * 显示注册表单页面
     */
    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("user", new UserRegistrationDto());
        return "registration-form";
    }

    /**
     * 处理注册表单提交
     */
    @PostMapping("/register")
    public String processRegistrationForm(@Valid @ModelAttribute("user") UserRegistrationDto registrationDto,
                                          BindingResult bindingResult,
                                          Model model) {
        // 检查用户名是否已存在
        if (userService.existsByUsername(registrationDto.getUsername())) {
            bindingResult.rejectValue("username", null, "该用户名已被使用");
        }

        // 检查手机号是否已注册
        if (userService.existsByPhone(registrationDto.getPhone())) {
            bindingResult.rejectValue("phone", null, "该手机号已被注册");
        }

        // 检查手机验证码是否校验通过
        if (!userService.verifyCode(registrationDto.getPhone(), registrationDto.getVerificationCode())) {
            bindingResult.rejectValue("verificationCode", null, "验证码不正确");
        }

        // 检查用户名、手机号、验证码是否通过
        // 如果有错误，则返回注册页面
        if (bindingResult.hasErrors()) {
            model.addAttribute("user", registrationDto);
            return "registration-form";
        }

        // 注册用户
        userService.registerUser(registrationDto);

        // 注册成功，跳转到登录页面
        return "redirect:/auth/login";
    }

    /**
     * 显示登录页面
     */
    @GetMapping("/login")
    public String showLoginForm() {
        return "login";
    }
}
```


在 Spring MVC 中，BindingResult 用于存储表单验证的错误信息。


### 相关支持类

#### 1. 用户注册 DTO
```java
package com.example.rednote.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * UserRegistrationDto 用户注册DTO
 *
 * @version 2025/08/16
 **/
@Getter
@Setter
public class UserRegistrationDto {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 4, max = 20, message = "用户名长度应为4-20个字符")
    private String username;

    @NotBlank(message = "手机号不能为空")
    @Size(min = 11, max = 11, message = "手机号长度应为11个字符")
    @Pattern(regexp = "^[1][3,4,5,7,8][0-9]{9}$", message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "验证码不能为空")
    @Size(min = 6, max = 6, message = "验证码长度应为6个字符")
    @Pattern(regexp = "^[0-9]{6}$", message = "验证码格式不正确")
    private String verificationCode;

    @NotBlank(message = "密码不能为空")
    @Size(min = 8, max = 20, message = "密码长度应为8-20个字符")
    @Pattern(regexp = "^[a-zA-Z0-9_]{8,20}$", message = "密码格式不正确")
    private String password;
}
```

#### 2. 用户服务接口
```java
package com.example.rednote.service;

import com.example.rednote.dto.UserRegistrationDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * UserService 用户服务
 *
 * @version 2025/08/16
 **/
public interface UserService {
    /**
     * 检查用户名是否已存在
     */
    boolean existsByUsername(@NotBlank(message = "用户名不能为空") @Size(min = 4, max = 20, message = "用户名长度应为4-20个字符") String username);

    /**
     * 检查手机号是否已注册
     */
    boolean existsByPhone(@NotBlank(message = "手机号不能为空") @Size(min = 11, max = 11, message = "手机号长度应为11个字符") @Pattern(regexp = "^[1][3,4,5,7,8][0-9]{8}$", message = "手机号格式不正确") String phone);

    /**
     * 验证短信验证码
     */
    boolean verifyCode(@NotBlank(message = "手机号不能为空") @Size(min = 11, max = 11, message = "手机号长度应为11个字符") @Pattern(regexp = "^[1][3,4,5,7,8][0-9]{9}$", message = "手机号格式不正确") String phone, @NotBlank(message = "验证码不能为空") @Size(min = 6, max = 6, message = "验证码长度应为6个字符") @Pattern(regexp = "^[0-9]{6}$", message = "验证码格式不正确") String verificationCode);

    /**
     * 注册新用户
     */
    void registerUser(@Valid UserRegistrationDto registrationDto);
}
```
