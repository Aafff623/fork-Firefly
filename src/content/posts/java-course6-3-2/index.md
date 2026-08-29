---
title: "安全防护升级：攻克系统安全薄弱痛点，构建零信任安全架构"
published: 2026-08-25
description: "使用 PasswordEncoder 加密密码，避免明文存储"
image: ''
tags: [Java, Spring Security, 安全]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course6-3-2
pinned: false
comment: true
---

### 密码加密
使用 `PasswordEncoder` 加密密码，避免明文存储：
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// 加密示例
String encodedPassword = passwordEncoder.encode("rawPassword");
```


### 会话管理
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) {
    http
        .sessionManagement(session -> session
            // 限制单用户登录次数
            .maximumSessions(1)
            // 阻止第二次登录
            .maxSessionsPreventsLogin(true)
        );
    return http.build();
}        
```

### CSRF 防护
默认启用，需在表单中添加 CSRF Token：
```html
<form action="/login" method="post">
    <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}">
    <!-- 其他表单字段 -->
</form>
```

### CORS 配置
```java
@Bean
public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
    http
        .securityMatcher("/api/**")
        .cors((cors) -> cors
            .configurationSource(apiConfigurationSource())
        )
        ...
    return http.build();
}

UrlBasedCorsConfigurationSource apiConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("https://api.example.com"));
    configuration.setAllowedMethods(Arrays.asList("GET","POST"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```


### 与 OAuth2.0 集成
Spring Security 5 后支持 OAuth2.0 协议，可作为资源服务器或客户端。


以下配置示例是作为OAuth2资源服务器：

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests((authorize) -> authorize
            .anyRequest().authenticated()
        )
        .oauth2ResourceServer((oauth2) -> oauth2
            .jwt(Customizer.withDefaults())
        );
    return http.build();
}
```


以下配置示例是作为OAuth2客户端：

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // ...
        .oauth2Login(Customizer.withDefaults());
    return http.build();
}
```
