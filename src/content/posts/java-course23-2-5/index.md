---
title: "调整安全及路由规则以支持对外提供AI服务"
published: 2026-08-25
description: "1. 在 Spring Security 配置类中，进一步细化AI接口的访问权限"
image: ''
tags: [AI, 实战, 融合]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course23-2-5
pinned: false
comment: true
---

### 修改安全配置基类


1. 在 Spring Security 配置类中，进一步细化AI接口的访问权限
2. 允许管理员或者普通用户角色访问可以访问AI接口


修改公共模块下的BaseSecurityConfig如下：


```java
protected void configureCommon(HttpSecurity http) throws Exception {
    http

            .authorizeHttpRequests(authorize -> authorize
                    // ...为节约篇幅，此处省略非核心内容
                    
                    // 允许管理员或者普通用户角色访问
                    .requestMatchers("/ai/**").hasAnyRole("USER", "ADMIN")
                    // 其他请求需要认证
                    .anyRequest().authenticated()
            )
```


### 新增安全配置类


在AI领域微服务模块新增安全配置类`src/main/java/com/example/rednote/aimicroservice/infrastructure/config/WebSecurityConfig.java`：


```java
package com.example.rednote.aimicroservice.infrastructure.config;

import com.example.rednote.common.config.BaseSecurityConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * WebSecurityConfig 安全配置类
 *
 * @version 2025/08/04
 **/
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true) // 启用@PreAuthorize等注解
public class WebSecurityConfig extends BaseSecurityConfig {

    @Bean
    public SecurityFilterChain securedFilterChain(HttpSecurity http) throws Exception {
        // 1. 应用公共配置（无状态、JWT过滤器等）
        configureCommon(http);

        // 2. 配置用户服务特有的权限规则
        configureAuthorize(http);

        return http.build();
    }

    @Override
    protected void configureAuthorize(HttpSecurity http) throws Exception {
        // 如果没有特殊配置，则可以置空
    }

}
```


### 新增路由配置


修改API网关领域微服务模块的应用配置，增加如下路由配置

```
spring.cloud.gateway.mvc.routes[4].id=rednote-ai-microservice
spring.cloud.gateway.mvc.routes[4].uri=lb://rednote-ai-microservice
spring.cloud.gateway.mvc.routes[4].predicates[0]=Path=/ai/**
```
