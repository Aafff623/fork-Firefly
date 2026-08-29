---
title: "创建Spring Security配置类，允许任何请求都不需要授权"
published: 2026-08-25
description: "创建Spring Security配置类，允许任何请求都不需要授权。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-4-7
pinned: false
comment: true
---

创建Spring Security配置类，允许任何请求都不需要授权。

```java
package com.example.rednote.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

/**
 * WebSecurityConfig 安全配置
 *
 * @version 2025/08/16
 **/
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    // 添加安全过滤器链
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 禁用CSRF防护
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        // 允许所有请求不需要授权
                        .anyRequest().permitAll()
                )
                .formLogin(Customizer.withDefaults());

        return http.build();
    }
}
```
