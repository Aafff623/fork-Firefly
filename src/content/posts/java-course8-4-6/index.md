---
title: "实现UserServiceImpl服务，调用UserRepository接口方法"
published: 2026-08-25
description: "java"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-4-6
pinned: false
comment: true
---

### 用户服务实现


```java
package com.example.rednote.service.impl;

import com.example.rednote.dto.UserRegistrationDto;
import com.example.rednote.entity.User;
import com.example.rednote.repository.UserRepository;
import com.example.rednote.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * UserServiceImpl 用户服务
 *
 * @version 2025/08/16
 **/
@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    @Override
    public boolean existsByPhone(String phone) {
        return userRepository.findByPhone(phone).isPresent();
    }

    @Override
    public boolean verifyCode(String phone, String verificationCode) {
        // 实际项目中会验证验证码逻辑。
        // 模拟验证码校验成功。简化处理，仅返回true
        return true;
    }

    @Override
    public void registerUser(UserRegistrationDto registrationDto) {
        // 创建新用户
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setPassword(registrationDto.getPassword());
        user.setPhone(registrationDto.getPhone());

        // 保存用户
        userRepository.save(user);
    }
}
```
