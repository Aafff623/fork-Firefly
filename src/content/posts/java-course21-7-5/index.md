---
title: "重构安全配置类"
published: 2026-08-25
description: "将各服务共有的安全配置（如JWT过滤器、密码加密、无状态会话等）抽取到公共模块的src/main/java/com/example/rednote/common/config/BaseSecurityC…"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-7-5
pinned: false
comment: true
---

### 抽取公共安全配置，保留服务特定配置

#### 1. 公共模块：抽取通用安全逻辑

将各服务共有的安全配置（如JWT过滤器、密码加密、无状态会话等）抽取到公共模块的`src/main/java/com/example/rednote/common/config/BaseSecurityConfig.java`中：

```java
package com.example.rednote.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * BaseSecurityConfig 各服务共有的安全配置
 *
 * @version 2025/07/28
 **/
public abstract class BaseSecurityConfig {

    // 公共Bean：密码加密器（所有服务通用）
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 公共过滤器：JWT认证过滤器（所有服务通用）
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    // 公共配置：无状态会话、禁用CSRF等（所有服务通用）
    protected void configureCommon(HttpSecurity http) throws Exception {
        http

                .authorizeHttpRequests(authorize -> authorize
                        // 允许指定资源的请求不需认证
                        .requestMatchers("/auth/login", "/login", "/auth/register", "/css/**", "/js/**", "/fonts/**", "/images/**", "/favicon.ico").permitAll()
                        .requestMatchers("/error").permitAll()
                        // 允许管理员角色访问
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        // 允许管理员或者普通用户角色访问
                        .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
                        // 允许普通用户角色访问
                        .requestMatchers("/note/**").hasRole("USER")
                        // 允许普通用户角色访问
                        .requestMatchers("/explore/**").hasRole("USER")
                        // 允许普通用户角色访问
                        .requestMatchers("/like/**").hasRole("USER")
                        // 允许普通用户角色访问
                        .requestMatchers("/comment/**").hasRole("USER")
                        // 允许普通用户角色访问
                        /*.requestMatchers("/log/**").hasRole("USER")*/
                        .requestMatchers("/log/**").hasAnyRole("USER", "ADMIN")
                        /*// 允许管理员或者普通用户角色访问
                        .requestMatchers("/file/**").hasAnyRole("USER", "ADMIN")*/
                        // 允许匿名访问静态图片资源
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/file/**").permitAll()
                        // 其他请求需要认证
                        .anyRequest().authenticated()
                )
                // 禁用 CSRF
                .csrf(csrf -> csrf.disable())
                // 异常处理
                .exceptionHandling(exception -> exception
                        // 指定403错误页面
                        .accessDeniedPage("/error/403")
                )
                // 无状态会话
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // 启用 JWT 认证过滤器
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
        ;
    }

    // 抽象方法：留给子类实现服务特定的权限规则
    protected abstract void configureAuthorize(HttpSecurity http) throws Exception;
}
```


原来在`rednote-user-microservice`模块下的CustomAuthenticationFailureHandler.java、CustomAuthenticationProvider.java、CustomUserDetails.java、JwtAuthenticationFilter.java、JwtTokenProvider.java迁移到`rednote-common`模块下。


#### 2. 各领域微服务：继承基础配置，添加特定规则

用户领域服务继承公共配置，仅保留自身特有的权限规则：

```java
package com.example.rednote.usermicroservice.infrastructure.config;

import com.example.rednote.common.config.BaseSecurityConfig;
import com.example.rednote.common.config.CustomAuthenticationProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;

/**
 * WebSecurityConfig 安全配置类
 *
 * @version 2025/05/30
 **/
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true) // 启用@PreAuthorize等注解
public class WebSecurityConfig extends BaseSecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securedFilterChain(HttpSecurity http) throws Exception {
        // 1. 应用公共配置（无状态、JWT过滤器等）
        configureCommon(http);

        // 2. 配置用户服务特有的权限规则
        configureAuthorize(http);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        return new CustomAuthenticationProvider(userDetailsService, passwordEncoder());
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Override
    protected void configureAuthorize(HttpSecurity http) throws Exception {
    }

}
```

内容领域微服务、文件领域微服务、管理领域微服务也继承基础配置，自身的权限规则如果没有特殊配置，则可以置空：

```java
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
 * @version 2025/05/30
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


### 总结：公共模块放“通用逻辑”，服务模块放“特定规则”
- 适合放公共模块的内容：  
  - JWT过滤器、密码加密器等通用组件。  
  - 无状态会话、禁用CSRF等通用配置。  
  - 抽象基类（如 `BaseSecurityConfig`）。

- 必须留在服务模块的内容：  
  - 服务特定的接口路径权限规则（如 `/admin/`、`/note/`）。  
  - 依赖服务特有Bean的配置（如用户服务的 `UserDetailsService`）。  
  - 服务独有的认证/授权逻辑（如管理服务的特殊权限校验）。

这种设计既避免了代码重复，又保留了各服务安全配置的灵活性，是微服务架构中安全配置的最佳实践。
