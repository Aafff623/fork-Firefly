---
title: "调整安全规则以支持自定义登录界面及失败处理器"
published: 2026-08-25
description: "1. 在 WebSecurityConfigurerAdapter 配置类中，调整安全规则以支持登录功能"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-5-5
pinned: false
comment: true
---

1. 在 WebSecurityConfigurerAdapter 配置类中，调整安全规则以支持登录功能
2. 在 配置登录页面的访问权限，允许匿名访问
3. 自定义失败处理器

### Spring Security 配置优化

为了支持完整的登录功能，需要对 Spring Security 配置进行调整。以下是一个优化后的安全配置类，包含登录、注册、权限控制、启用 CSRF 保护等功能：

```java
package com.example.rednote.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

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
                // 启用CSRF防护
                .csrf(Customizer.withDefaults())
                .authorizeHttpRequests(authorize -> authorize
                        // 允许指定资源的请求不需要认证
                        .requestMatchers("/auth/register", "/auth/login", "/css/**", "/js/**", "/fonts/**", "/images/**", "/favicon.ico").permitAll()
                        // 其他请求需求认证
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        // 指定登录页面
                        .loginPage("/auth/login")
                        // 指定执行登录的地址
                        .loginProcessingUrl("/auth/login")
                        // 自定义失败处理器
                        .failureHandler(authenticationFailureHandler())
                        // 指定登录成功后跳转的页面
                        .defaultSuccessUrl("/")
                        .permitAll()
                );

        return http.build();
    }

    // 注册 BCryptPasswordEncoder Bean
    @Bean
    public PasswordEncoder passwordEncoder() {
        // 构造函数可以指定密码的强度，默认是10
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public CustomAuthenticationFailureHandler authenticationFailureHandler() {
        return new CustomAuthenticationFailureHandler();
    }
}
```

上述代码

*  `requestMatchers("/auth/login", "/auth/register", "/css/", "/js/", "/fonts/", "/images/", "/favicon.ico").permitAll()`，允许指定资源的请求不需认证，包括静态资源、登录页面及注册页面
* formLogin用于自定义表单。failureHandler用于指定登录失败的处理器。
* csrf用于启动启用CSRF防护。


### 登录失败的处理器

需要配置用户认证服务来验证用户身份。以下是一个从数据库加载用户的示例：

```java
package com.example.rednote.config;

import com.example.rednote.common.ExceptionType;
import com.example.rednote.common.LoginErrorType;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import java.io.IOException;

/**
 * CustomAuthenticationFailureHandler 自定义的AuthenticationFailureHandler
 *
 * @version 2025/08/17
 **/
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {
    private static final Logger log = LoggerFactory.getLogger(CustomAuthenticationFailureHandler.class);

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        // 添加自定义的逻辑，比如日志记录、设置错误消息等
        String exceptionMessage = exception.getMessage();
        log.error("Authentication failed: {}", exceptionMessage);

        if (exceptionMessage.contains(ExceptionType.USERNAME_NOT_FOUND)) {
            // 处理用户名不存在的情况
            response.sendRedirect("/auth/login?error=" + LoginErrorType.USERNAME_NOT_FOUND);
        } else if (exceptionMessage.contains(ExceptionType.INCORRECT_PASSWORD)) {
            // 处理密码错误情况
            response.sendRedirect("/auth/login?error=" + LoginErrorType.INCORRECT_PASSWORD);
        } else {
            // 处理其他异常情况
            response.sendRedirect("/auth/login?error=unknown");
        }
    }
}
```


失败跳转到`/auth/login`，会根据不同的异常类型，返回不同的错误参数。


新增`src/main/java/com/example/rednote/common/ExceptionType.java`如下：


```java
package com.example.rednote.common;

/**
 * ExceptionType 异常类型
 *
 * @version 2025/08/17
 **/
public class ExceptionType {
    public static final String USERNAME_NOT_FOUND = "Username not found";
    public static final String INCORRECT_PASSWORD = "Incorrect password";
}
```


新增`src/main/java/com/example/rednote/common/LoginErrorType.java`如下：


```java
package com.example.rednote.common;

/**
 * LoginErrorType 登录错误类型
 *
 * @version 2025/08/17
 **/
public class LoginErrorType {
    public static final String USERNAME_NOT_FOUND = "usernameNotFound";
    public static final String INCORRECT_PASSWORD = "incorrectPassword";
}
```
