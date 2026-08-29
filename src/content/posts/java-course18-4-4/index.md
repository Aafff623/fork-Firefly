---
title: "全栈实战登录功能：密码加密与 Token 认证的攻防实战"
published: 2026-08-25
description: "将用户登录功能从 Thymeleaf 后端渲染模式迁移到 Vue 3 前端渲染模式，需要对架构、交互流程和安全机制进行全面调整。以下是核心改造点和实施建议。"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-4-4
pinned: false
comment: true
---

将用户登录功能从 Thymeleaf 后端渲染模式迁移到 Vue 3 前端渲染模式，需要对架构、交互流程和安全机制进行全面调整。以下是核心改造点和实施建议。


### 一、架构与交互模式的核心变化

#### 1. 数据流转方式
- Thymeleaf 模式：
  ```
  浏览器 → 表单提交 → 后端控制器 → 验证 → Session 存储 → 重定向到主页
  ```
- Vue 3 模式：
  ```
  浏览器 → Vue 组件 → API 请求 → 后端验证 → JWT/会话令牌 → 前端存储 → 路由跳转
  ```

#### 2. 安全机制调整
- CSRF 防护：
  - Thymeleaf：自动注入 CSRF 令牌到表单
  - Vue 3：禁用 CSRF 令牌
- 认证方式：
  - Thymeleaf：基于 Session/Cookie
  - Vue 3：推荐 JWT（JSON Web Token）或增强的 Session 机制


### 后端接口改造


修改 AuthController.java：

```java
import com.example.rednote.config.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;

// ...为节约篇幅，此处省略非核心内容

@Autowired
private JwtTokenProvider jwtTokenProvider;

@Autowired
private AuthenticationManager authenticationManager;

// ...为节约篇幅，此处省略非核心内容

/**
 * 处理登录表单的提交
 */
@PostMapping("/login")
/*public String processLoginForm(@Valid @ModelAttribute("user") UserLoginDto loginDto,
                                BindingResult bindingResult,
                                Model model) {
    // 检查用户名是否存在
    if (!userService.existsByUsername(loginDto.getUsername())) {
        bindingResult.rejectValue("username", null, "该用户名未注册");

        model.addAttribute("user", loginDto);
        return "login-form";
    }

    // 检查密码是否正确
    if (!userService.verifyPassword(loginDto.getUsername(), loginDto.getPassword())) {
        bindingResult.rejectValue("password", null, "密码错误");

        model.addAttribute("user", loginDto);
        return "login-form";
    }

    // 登录成功，重定向到首页或
    return "redirect:/";
}*/
public ResponseEntity<?> processLoginForm(@Valid @RequestBody UserLoginDto loginDto,
                                BindingResult bindingResult) {
    // 检查用户名是否存在
    if (!userService.existsByUsername(loginDto.getUsername())) {
        bindingResult.rejectValue("username", null, "该用户名未注册");

        // 自定义错误响应
        Map<String, String> errors = new HashMap<>();
        bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }

    // 检查密码是否正确
    if (!userService.verifyPassword(loginDto.getUsername(), loginDto.getPassword())) {
        bindingResult.rejectValue("password", null, "密码错误");

        // 自定义错误响应
        Map<String, String> errors = new HashMap<>();
        bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }

    // 获取认证用户
    Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    loginDto.getUsername(),
                    loginDto.getPassword()
            )
    );

    // 校验成功，生成JWT
    String jwt = jwtTokenProvider.generateToken(authentication);

    // 返回响应
    return ResponseEntity.ok(jwt);
}
```


### 后端安全配置调整


1. 取消.formLogin()
2. 取消.rememberMe()
3. 取消.logout()
4. 启用 JWT 认证过滤器
5. 配置 AuthenticationManager Bean

修改WebSecurityConfig如下：


```java
import org.springframework.security.authentication.AuthenticationManager;

// ...为节约篇幅，此处省略非核心内容

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            // ...为节约篇幅，此处省略非核心内容

            /*.formLogin(form -> form
                    // 指定登录页面
                    .loginPage("/auth/login")
                    // 指定执行登录的地址
                    .loginProcessingUrl("/auth/login")
                    // 自定义失败处理器
                    .failureHandler(authenticationFailureHandler())
                    // 指定登录成功后跳转的页面
                    .defaultSuccessUrl("/")
                    .permitAll()
            )*/

            // ...为节约篇幅，此处省略非核心内容

            // 注销
            /*.logout(logout -> logout
                    // 清理会话
                    .invalidateHttpSession( true)
                    // 清理认证信息
                    .clearAuthentication(true)
                    // 用户访问此URL时，交由Spring Security处理注销逻辑
                    .logoutUrl("/logout")
                    // 注销成功后，重定向到指定URL
                    .logoutSuccessUrl("/auth/login?error=" + LOGOUT)
                    // 删除会话Cookie
                    .deleteCookies("JSESSIONID")

            )*/
            // 记住我
            /*.rememberMe(rememberMe -> rememberMe
                    // 设置记住我令牌的有效期（秒），默认是2周。以下设置1周
                    .tokenValiditySeconds(60 * 60 * 24 * 7)
                    // 设置用于签名令牌的密钥
                    .key("rnRememberMeKey")
            )*/
            // 启用JWT认证过滤器
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
    ;

    return http.build();
}

// ...为节约篇幅，此处省略非核心内容

@Bean
public JwtAuthenticationFilter jwtAuthenticationFilter() {
    return new JwtAuthenticationFilter();
}

@Bean
public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
}
```


### JWT 认证实现


添加 JJWT (Java JWT) 库的依赖。`Jwts` 类是 JJWT 库的核心类，用于创建、解析和验证 JWT 令牌。以下是解决方案。


#### 1. Maven 项目

在 `pom.xml` 中添加：


```xml
<properties>
    <java.version>24</java.version>
    <jsonwebtoken.version>0.13.0</jsonwebtoken.version>
</properties>

<!-- ...为节约篇幅，此处省略非核心内容 -->

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>${jsonwebtoken.version}</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>${jsonwebtoken.version}</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>${jsonwebtoken.version}</version>
    <scope>runtime</scope>
</dependency>
```


#### 2. JWT 工具类

新建`src/main/java/com/example/rednote/config/JwtTokenProvider.java`：

```java
package com.example.rednote.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * JwtTokenProvider JWT工具类
 *
 * @version 2025/09/08
 **/
@Component
public class JwtTokenProvider {
    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs}")
    private long jwtExpirationMs;

    /**
     * 生成JWT
     *
     * @param authentication
     * @return
     */
    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS256, jwtSecret)
                .compact();
    }

    /**
     * 从JWT中获取用户名
     *
     * @param token
     * @return
     */
    public String getUsernameFromJwtToken(String token) {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * 验证JWT
     *
     * @param authToken
     * @return
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                    .setSigningKey(jwtSecret)
                    .build()
                    .parseClaimsJws(authToken);

            return true;
        } catch (Exception e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        }

        return false;
    }
}
```

#### 3. JWT 认证过滤器


新建`src/main/java/com/example/rednote/config/JwtAuthenticationFilter.java`：


```java
package com.example.rednote.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthenticationFilter JWT认证过滤器
 *
 * @version 2025/09/08
 **/
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // 从请求头中获取JWT
        String jwt = getJwtFromRequest(request);
        if (jwt != null && jwtTokenProvider.validateJwtToken(jwt)) {
            // 从JWT中获取用户名
            String username = jwtTokenProvider.getUsernameFromJwtToken(jwt);

            // 从用户名中获取用户详情
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 创建一个已认证的Authentication对象
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 设置已认证的Authentication对象到SecurityContextHolder中
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 从请求头中获取JWT
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}
```


#### 4. 配置文件


在 `application.properties` 中添加 JWT 配置：

```properties
# 配置 JWT
## 你的Base64编码密钥（至少256位）
app.jwtSecret=bQUBj9U7io0VXuhlaC9XmeaSGSwkqOlG4itHzIgUvOk=
## 24小时
app.jwtExpirationMs=86400000
```

生成 Base64 密钥的方法：

```java
package com.example.rednote;

import io.jsonwebtoken.security.Keys;

import java.util.Base64;

/**
 * JwtSecretGenerator 生成Base64密钥
 *
 * @version 2025/09/08
 **/
public class JwtSecretGenerator {
    public static void main(String[] args) {
        String secret = Base64.getEncoder().encodeToString(
                Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256).getEncoded()
        );
        System.out.println(secret);
    }
}
```
