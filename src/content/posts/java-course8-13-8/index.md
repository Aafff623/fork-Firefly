---
title: "自定义UserDetails破解在界面获取不到用户ID的难题"
published: 2026-08-25
description: "此时如何运行应用，前端解析note.isLikedByUserauthentication.principal?.userId报错，报错信息是“Property or field 'id' canno…"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-13-8
pinned: false
comment: true
---

此时如何运行应用，前端解析`note.isLikedByUser(#authentication.principal?.userId`报错，报错信息是“Property or field 'id' cannot be found on object of type 'org.springframework.security.core.userdetails.User'”，那么要如何解决呢？

### 问题分析

这个错误是由于Spring Security返回的`UserDetails`对象结构与你的代码期望不匹配导致的。具体原因如下：

1. 类型不匹配：
   - `#authentication.principal` 返回的是`org.springframework.security.core.userdetails.User`对象
   - 这个对象默认只有`username`、`password`、`authorities`等属性，没有你期望的`userId`字段

2. 解决方案：
   - 需要自定义`UserDetails`实现类，包含用户ID字段
   - 或者通过用户名从数据库中查询完整用户信息


### 自定义 Spring Security UserDetails 实现方案

可以通过继承 `org.springframework.security.core.userdetails.User` 类来扩展自定义属性，这样既能保留 Spring Security 的默认行为，又能添加自己需要的字段（如用户ID）。以下是具体实现方案：


#### 创建自定义 UserDetails 类

```java
package com.example.rednote.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * CustomUserDetails 自定义UserDetails
 *
 * @version 2025/06/16
 **/
public class CustomUserDetails extends User {
    // 新增用户ID字段
    private final Long userId;

    public CustomUserDetails(Long userId,
                             String username,
                             String password,
                             Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);

        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }

}
```


#### 修改 UserDetailsService 实现


修改 UserDetailsService 实现，返回CustomUserDetails对象：

```java
package com.example.rednote.config;

import com.example.rednote.common.ExceptionType;
import com.example.rednote.entity.User;
import com.example.rednote.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

/**
 * UserDetailsServiceImpl UserDetailsService实现
 *
 * @version 2025/08/17
 **/
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 根据用户名查询用户，判定用户是否存在
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (!optionalUser.isPresent()) {
            // 抛出用户不存在的异常
            throw new UsernameNotFoundException(ExceptionType.USERNAME_NOT_FOUND);
        }

        User user = optionalUser.get();

        /*
        // 将User转为UserDetails对象
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .disabled(false)
                // 设置所有的数据库里面的用户都是USER角色
                .authorities(new SimpleGrantedAuthority("ROLE_USER"))
                .build();
        */

        // 将User转为自定义的UserDetails对象
        return new CustomUserDetails(
                user.getUserId(),
                user.getUsername(),
                user.getPassword(),
                // 设置所有的数据库里面的用户都是USER角色
                AuthorityUtils.createAuthorityList("ROLE_USER"));
    }
}
```


### 关键点说明

1. 继承而非替代：
   - 继承 `org.springframework.security.core.userdetails.User` 保留了 Spring Security 的默认行为
   - 无需重写所有方法，只需添加需要的字段和 getter

2. 构造函数传递：
   - 确保在构造函数中调用父类构造函数并传递必要参数
   - 可以根据需要添加更多构造函数变体

3. 安全上下文集成：
   - Spring Security 会自动将自定义 `UserDetails` 放入安全上下文中
   - 在 Thymeleaf 中通过 `#authentication.principal` 访问时，可直接获取扩展属性


### 总结

通过继承或包装 Spring Security 的 `User` 类，你可以轻松添加自定义属性（如用户ID），并在 Thymeleaf 模板中直接访问。这种方法既保持了与 Spring Security 的兼容性，又满足了业务需求，是处理此类问题的标准做法。
