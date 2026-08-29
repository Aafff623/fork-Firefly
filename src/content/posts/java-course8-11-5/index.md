---
title: "调整安全配置类细化首页笔记探索的访问权限"
published: 2026-08-25
description: "1. 在 Spring Security 配置类中，进一步细化首页笔记索页面的访问权限"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-11-5
pinned: false
comment: true
---

1. 在 Spring Security 配置类中，进一步细化首页笔记索页面的访问权限
2. 确保只有普通用户角色可以访问首页笔记索页面


修改WebSecurityConfig如下：


```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            // ...为节约篇幅，此处省略非核心内容    
            .authorizeHttpRequests(authorize -> authorize
                    // ...为节约篇幅，此处省略非核心内容

                    // 允许USER角色的用户访问 /explore/** 的资源
                    .requestMatchers("/explore/**").hasRole("USER")
                    // 其他请求需要认证
                    .anyRequest().authenticated()
            )

 
    ;

    return http.build();
}            
```
