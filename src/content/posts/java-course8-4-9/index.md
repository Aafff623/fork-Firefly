---
title: "使用BCryptPasswordEncoder对用户密码进行加密和验证"
published: 2026-08-25
description: "BCryptPasswordEncoder 是 Spring Security 提供的一个强大密码加密工具，它使用 BCrypt 哈希算法对密码进行加密，具有自动生成盐值、自适应迭代因子等安全特性。以…"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-4-9
pinned: false
comment: true
---

`BCryptPasswordEncoder` 是 Spring Security 提供的一个强大密码加密工具，它使用 BCrypt 哈希算法对密码进行加密，具有自动生成盐值、自适应迭代因子等安全特性。以下是具体实现方法：


### 配置 BCryptPasswordEncoder Bean

在安全配置类种，注册 `BCryptPasswordEncoder` Bean：
```java
package com.example.rednote.config;

// ...为节约篇幅，此处省略非核心内容

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * WebSecurityConfig 安全配置类
 * @version 2025/05/30
**/
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {
    // ...为节约篇幅，此处省略非核心内容

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // 默认强度为10
        // 或指定强度：new BCryptPasswordEncoder(12)
    }
}

```


### 在服务层使用密码加密

修改UserServiceImpl，在用户注册时加密密码：

```java
@Override
public User registerUser(UserRegistrationDto registrationDto) {
    // 创建新用户
    User user = new User();
    user.setUsername(registrationDto.getUsername());
    user.setPhone(registrationDto.getPhone());

    // 加密密码
    // user.setPassword(registrationDto.getPassword());
    String encodedPassword = passwordEncoder.encode(registrationDto.getPassword());
    user.setPassword(encodedPassword);

    // 保存用户
    return userRepository.save(user);
}
```

### 允许调试


启动应用后，在应用里面执行注册。

注册完成之后，通过MySQL客户端工具，查询数据库用户表的数据，则可以看到查询内容如下：


```
mysql> SELECT * FROM t_user;
+---------+--------------------------------------------------------------+-------------+----------+
| user_id | password                                                     | phone       | username |
+---------+--------------------------------------------------------------+-------------+----------+
|       1 | $2a$10$596iAK4CnjYZJBfssZS16uZ0vfXqer6YNnutih8MlX0wvScEF8Cby | 13711111111 | user     |
+---------+--------------------------------------------------------------+-------------+----------+
1 row in set (0.019 sec)
```

可以看到，明文输入的密码“12345qwert”被加密为密文“$2a$10$596iAK4CnjYZJBfssZS16uZ0vfXqer6YNnutih8MlX0wvScEF8Cby”保存进了数据库。


### 注意事项

1. 盐值自动生成：
   - BCrypt 会自动生成随机盐值，并将其包含在加密后的密码字符串中
   - 无需手动管理盐值，相同密码每次加密结果都不同

2. 密码强度：
   - 默认强度为 10，数值越大加密越慢但安全性更高
   - 可通过 `new BCryptPasswordEncoder(12)` 指定强度

3. 存储要求：
   - 加密后的密码长度固定为 60 个字符
   - 数据库字段应设置为 `VARCHAR(60)` 或更大

4. 安全建议：
   - 永远不要存储明文密码
   - 使用 HTTPS 保护密码传输
   - 定期升级 BCrypt 强度


通过 `BCryptPasswordEncoder`，你可以轻松实现安全的密码加密和验证机制，保护用户账户安全。
