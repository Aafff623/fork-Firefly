---
title: "在安全配置类中，配置评论模块的访问权限"
published: 2026-08-25
description: "1. 在 Spring Security 配置类中，进一步细化评论API的访问权限"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-14-7
pinned: false
comment: true
---

### 安全配置


1. 在 Spring Security 配置类中，进一步细化评论API的访问权限
2. 确保只有普通用户角色可以访问评论API


修改WebSecurityConfig如下：


```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            // ...为节约篇幅，此处省略非核心内容    
            .authorizeHttpRequests(authorize -> authorize
                    // ...为节约篇幅，此处省略非核心内容

                    // 允许USER角色的用户访问 /comment/** 的资源
                    .requestMatchers("/comment/**").hasRole("USER")
                    // 其他请求需要认证
                    .anyRequest().authenticated()
            )

 
    ;

    return http.build();
}            
```
