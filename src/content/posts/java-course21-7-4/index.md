---
title: "采用令牌传递机制处理微服务之间的调用权限"
published: 2026-08-25
description: "在微服务架构中，OpenFeign客户端之间的调用权限处理需要兼顾安全性和易用性，通常采用“令牌传递”或“服务间认证”机制。"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-7-4
pinned: false
comment: true
---

在微服务架构中，OpenFeign客户端之间的调用权限处理需要兼顾安全性和易用性，通常采用“令牌传递”或“服务间认证”机制。

为什么认证过滤器中不能查库？

1. 性能损耗：每个请求都查库会导致数据库压力增大，尤其在高并发场景下。
2. 服务耦合：所有微服务都需要连接用户数据库，违背微服务“数据隔离”原则。
3. 可用性风险：若用户服务数据库故障，所有依赖它的服务都会受影响。


### 核心原则：JWT 自包含用户信息

JWT 的设计理念是自包含令牌，即令牌本身已包含足够的用户信息（如用户名、ID、权限），无需每次请求都查询数据库。因此：
- 查库逻辑仅需在用户登录时执行一次，用于验证用户身份并生成包含必要信息的 JWT。
- 后续所有请求通过解析 JWT 获取用户信息，不再查库。

因此在微服务架构中，需要移除 `JwtAuthenticationFilter` 中的 `UserDetailsService` 依赖后，用户信息的查询逻辑应放在认证阶段（登录时），而不是在每次请求的过滤器中。


### 查库逻辑的正确位置：登录接口（认证服务）

以用户服务为例，登录接口是查询用户信息的唯一时机，具体流程修改AuthController如下：


```java
@Autowired
private UserDetailsService userDetailsService;

@PostMapping("/login")
    public ResponseEntity<?> processLoginForm(@Valid @RequestBody UserLoginDto loginDto,
                                   BindingResult bindingResult) {
    // ...为节约篇幅，此处省略非核心内容

    /*
    // 认证用户
    Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    loginDto.getUsername(),
                    loginDto.getPassword()
            )
    );

    // 生成JWT
    String jwt = tokenProvider.generateToken(authentication);*/

    // 生成JWT
    // 1. 获取用户信息（从数据库获取）
    CustomUserDetails userDetails = (CustomUserDetails)userDetailsService.loadUserByUsername(loginDto.getUsername());

    // 2. 生成 JWT（包含用户ID、用户名、权限等信息）
    String jwt = tokenProvider.generateToken(userDetails);

    // 返回响应
    return ResponseEntity.ok(jwt);
}
```

关键：JWT 生成时已包含用户的核心信息（ID、权限等），后续请求无需再查库，直接解析 JWT 即可。


### 修改认证过滤器

修改JwtAuthenticationFilter如下：


```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws IOException, ServletException {
    try {
        // 从请求头中获取JWT
        String jwt = getJwtFromRequest(request);

        if (jwt != null && tokenProvider.validateJwtToken(jwt)) {
            // 从JWT中获取用户名
            String username = tokenProvider.getUsernameFromJwtToken(jwt);

            // 加载用户信息
            /*UserDetails userDetails = userDetailsService.loadUserByUsername(username);*/

            // 1. 从JWT中获取用户信息

            Long userId = tokenProvider.getUserIdFromJwtToken(jwt); // 新增：解析用户ID
            Collection<? extends GrantedAuthority> authorities = tokenProvider.getAuthoritiesFromJwtToken(jwt); // 解析权限

            // 2. 构建用户信息（可自定义 UserDetails 实现）
            UserDetails userDetails = new CustomUserDetails(userId, username, "", authorities);

            // 创建认证对象
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // 设置认证到SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 关键：存储token到请求上下文（必须执行这一步）
            RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                attributes.setAttribute("JWT_TOKEN", jwt, RequestAttributes.SCOPE_REQUEST);
                // 可临时打印日志验证是否存储成功
                logger.info("存储JWT_TOKEN到上下文");
            } else {
                logger.error("RequestAttributes为空，无法存储JWT_TOKEN");
            }
        }
    } catch (Exception e) {
        logger.error("无法设置用户认证: {}", e);
    }

    filterChain.doFilter(request, response);
}
```


修改JwtTokenProvider，增加如下方法：


```java
public String generateToken(CustomUserDetails userPrincipal) {
    // 提取权限字符串
    List<String> roles = userPrincipal.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());

    // 构建 JWT 声明
    Map<String, Object> newClaims = new HashMap<>();
    newClaims.put("userId", userPrincipal.getUserId());
    newClaims.put("roles", roles);

    return Jwts.builder()
            .claims(newClaims)
            .subject(userPrincipal.getUsername())
            .issuedAt(new Date())
            .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
            .signWith(SignatureAlgorithm.HS256, jwtSecret)
            .compact();
}

// 从 JWT 中获取用户ID
public Long getUserIdFromJwtToken(String token) {
    Claims claims = Jwts.parser().setSigningKey(jwtSecret).build().parseClaimsJws(token).getBody();
    return claims.get("userId", Long.class);
}

// 从 JWT 中获取权限
public Collection<GrantedAuthority> getAuthoritiesFromJwtToken(String token) {
    Claims claims = Jwts.parser().setSigningKey(jwtSecret).build().parseClaimsJws(token).getBody();
    List<String> roles = claims.get("roles", List.class);

    return roles.stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());
}
```


### 服务间Feign调用传递令牌

使用了 UsernamePasswordAuthenticationToken 之后，Feign 拦截器只需稍作调整即可传递令牌。在公共模块下添加Feign令牌传递拦截器：

```java
package com.example.rednote.common.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

/**
 * FeignTokenInterceptor Feign Token Interceptor
 *
 * @version 2025/07/28
 **/
@Component
public class FeignTokenInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 适配 UsernamePasswordAuthenticationToken
        if (authentication instanceof UsernamePasswordAuthenticationToken) {
            // RequestAttributes 存储令牌（推荐）
            RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                String token = (String) attributes.getAttribute("JWT_TOKEN", RequestAttributes.SCOPE_REQUEST);
                if (token != null) {
                    template.header("Authorization", "Bearer " + token);
                }
            }
        }
    }
}
```
