---
title: "从Spring Security中获取当前认证信息"
published: 2026-08-25
description: "在控制器方法中，从 Spring Security 的上下文获取当前登录用户的信息"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-6-4
pinned: false
comment: true
---

在控制器方法中，从 Spring Security 的上下文获取当前登录用户的信息

### 在UserServiceImpl中实现getCurrentUser()

getCurrentUser()实现如下：

```java
@Override
public User getCurrentUser() {
    // 从安全上下文中获取认证信息
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.isAuthenticated()) {
        // 获取当前用户名
        String username = authentication.getName();
        // 根据用户名查询用户
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isPresent()) {
            return optionalUser.get();
        }
    }

    throw new UsernameNotFoundException(ExceptionType.USERNAME_NOT_FOUND);
}
```


### `SecurityContextHolder.getContext().getAuthentication()` 详解

`SecurityContextHolder.getContext().getAuthentication()` 是 Spring Security 中获取当前认证信息的核心方法。这个方法链涉及三个主要组件：`SecurityContextHolder`、`SecurityContext` 和 `Authentication`，下面我将深入解析它们的工作原理和使用场景。


工作流程如下：

1. 用户登录：
   - 用户提交凭证（用户名/密码）
   - `AuthenticationProvider` 验证凭证
   - 验证成功后，创建已认证的 `Authentication` 对象
   - 通过 `SecurityContextHolder.getContext().setAuthentication(auth)` 设置认证信息

2. 请求处理：
   - 每个请求通过 `SecurityContextPersistenceFilter` 从 Session 或其他存储中恢复安全上下文
   - 安全上下文被设置到当前线程的 `SecurityContextHolder`
   - 在整个请求处理过程中，可以随时通过 `SecurityContextHolder.getContext().getAuthentication()` 获取当前用户信息
   - 请求处理完毕后，安全上下文可能被持久化到 Session 中

3. 请求结束：
   - `SecurityContextPersistenceFilter` 清除当前线程的安全上下文（防止线程池复用导致的安全问题）


### 核心组件解析

#### 1. SecurityContextHolder
- 作用：存储当前线程的安全上下文（`SecurityContext`）
- 实现方式：
  - ThreadLocal：默认模式，每个线程独立存储安全上下文（最常用）
  - InheritableThreadLocal：子线程可以继承父线程的安全上下文
  - 全局模式：所有线程共享同一个安全上下文（极少使用）
- 关键方法：
  ```java
  SecurityContext context = SecurityContextHolder.getContext(); // 获取当前安全上下文
  SecurityContextHolder.setContext(context); // 设置安全上下文
  SecurityContextHolder.clearContext(); // 清除安全上下文
  ```

#### 2. SecurityContext
- 作用：存储当前认证信息（`Authentication` 对象）的容器
- 关键方法：
  ```java
  Authentication authentication = context.getAuthentication(); // 获取认证对象
  context.setAuthentication(authentication); // 设置认证对象
  ```

#### 3. Authentication
- 作用：表示当前用户的认证信息
- 核心属性：
  ```java
  principal // 用户身份（通常是 UserDetails 实现）
  credentials // 凭证（通常是密码，认证后会被清除）
  authorities // 用户权限（GrantedAuthority 集合）
  authenticated // 是否已认证的标志
  ```
