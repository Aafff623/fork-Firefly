---
title: "全栈实战注册功能：从需求分析到接口联调的全栈开发流程"
published: 2026-08-25
description: "将用户注册功能从 Thymeleaf 后端渲染模式迁移到 Vue 3 前端渲染模式，需要对架构、交互流程和安全机制进行全面调整。以下是核心改造点和实施建议"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-4-2
pinned: false
comment: true
---

将用户注册功能从 Thymeleaf 后端渲染模式迁移到 Vue 3 前端渲染模式，需要对架构、交互流程和安全机制进行全面调整。以下是核心改造点和实施建议：


### 架构与交互模式的核心变化

#### 1. 数据流转方式

- Thymeleaf 模式：
  ```
  浏览器 → 表单提交 → 后端控制器 → 验证 → 重定向/错误页面
  ```
- Vue 3 模式：
  ```
  浏览器 → Vue表单组件 → API请求 → 后端验证 → JSON响应 → 前端处理结果
  ```

#### 2. 接口实现方式


- Thymeleaf 模式：
  * 表单提交场景（application/x-www-form-urlencoded）
  * 适用场景：传统表单提交，非 JSON 数据
  * 使用方式：@ModelAttribute + @Valid

- Vue 3 模式：
  * JSON 请求场景（application/json）
  * 适用场景：前后端分离的 REST API
  * 使用方式：@RequestBody + @Valid


### 后端接口改造


修改 AuthController.java：

```java
/**
 * 处理注册表单提交
 */
@PostMapping("/register")
/*public String processRegistrationForm(@Valid @ModelAttribute("user") UserRegistrationDto registrationDto,
                                        BindingResult bindingResult,
                                        Model model) {
    // 检查用户名是否已存在
    if (userService.existsByUsername(registrationDto.getUsername())) {
        bindingResult.rejectValue("username", null, "该用户名已被使用");
    }

    // 检查手机号是否已注册
    if (userService.existsByPhone(registrationDto.getPhone())) {
        bindingResult.rejectValue("phone", null, "该手机号已被注册");
    }

    // 检查手机验证码是否校验通过
    if (!userService.verifyCode(registrationDto.getPhone(), registrationDto.getVerificationCode())) {
        bindingResult.rejectValue("verificationCode", null, "验证码不正确");
    }

    // 检查用户名、手机号、验证码是否通过
    // 如果有错误，则返回注册页面
    if (bindingResult.hasErrors()) {
        model.addAttribute("user", registrationDto);
        return "registration-form";
    }

    // 注册用户
    userService.registerUser(registrationDto);

    // 注册成功，跳转到登录页面
    return "redirect:/auth/login";
}*/
public ResponseEntity<?> processRegistrationForm(@Valid @RequestBody UserRegistrationDto registrationDto,
                                                    BindingResult bindingResult) {
    // 检查用户名是否已存在
    if (userService.existsByUsername(registrationDto.getUsername())) {
        bindingResult.rejectValue("username", null, "该用户名已被使用");
    }

    // 检查手机号是否已注册
    if (userService.existsByPhone(registrationDto.getPhone())) {
        bindingResult.rejectValue("phone", null, "该手机号已被注册");
    }

    // 检查手机验证码是否校验通过
    if (!userService.verifyCode(registrationDto.getPhone(), registrationDto.getVerificationCode())) {
        bindingResult.rejectValue("verificationCode", null, "验证码不正确");
    }

    // 检查用户名、手机号、验证码是否通过
    // 如果有错误，则返回错误列表
    if (bindingResult.hasErrors()) {
        // 自定义错误响应
        Map<String, String> errors = new HashMap<>();
        bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity.badRequest().body(errors);
    }

    // 注册用户
    userService.registerUser(registrationDto);

    // 注册成功
    return ResponseEntity.ok("用户注册成功");
}
```


### 后端安全配置调整


1. 禁用CSRF防护
2. 会话管理使用无状态会话


修改WebSecurityConfig如下：


```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            // 启用CSRF防护
            // .csrf(Customizer.withDefaults())
            // 禁用CSRF防护
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authorize -> authorize
                    // 允许指定资源的请求不需要认证
                    .requestMatchers("/auth/register", "/auth/login", "/css/**", "/js/**", "/fonts/**", "/images/**", "/favicon.ico").permitAll()
                    .requestMatchers("/error/**").permitAll()
                    // 允许ADMIN角色的用户访问 /admin/** 的资源
                    .requestMatchers("/admin/**").hasRole("ADMIN")
                    // 允许ADMIN、USER角色的用户访问 /user/** 的资源
                    .requestMatchers("/user/**").hasAnyRole("ADMIN", "USER")
                    // 允许USER角色的用户访问 /note/** 的资源
                    .requestMatchers("/note/**").hasRole("USER")
                    // 允许USER角色的用户访问 /explore/** 的资源
                    .requestMatchers("/explore/**").hasRole("USER")
                    // 允许USER角色的用户访问 /like/** 的资源
                    .requestMatchers("/like/**").hasRole("USER")
                    // 允许USER角色的用户访问 /comment/** 的资源
                    .requestMatchers("/comment/**").hasRole("USER")
                    // 允许USER角色的用户访问 /log/** 的资源
                    .requestMatchers("/log/**").hasRole("USER")
                    // 允许ADMIN、USER角色的用户访问 /file/** 的资源
                    .requestMatchers("/file/**").hasAnyRole("ADMIN", "USER")
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
            )
            // 异常处理
            .exceptionHandling(exception -> exception
                    // 指定403错误页面
                    .accessDeniedPage("/error/403")
            )
            // 会话管理
            /*.sessionManagement(session -> session
                    // 会话创建策略
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                    // 访问无效会话时，重定向到指定URL
                    .invalidSessionUrl("/auth/login?error=" + SESSION_INVALID)
                    // 同一用户最大会话数
                    .maximumSessions(1)
                    // 访问过期会话时，重定向到指定URL
                    .expiredUrl("/auth/login?error=" + SESSION_EXPIRED)
                    // false表示允许新登录，踢掉旧会话，旧会话会过期
                    .maxSessionsPreventsLogin(false)
                    // 会话注册表
                    .sessionRegistry(sessionRegistry())
            )*/
            // 无状态会话
            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // 注销
            .logout(logout -> logout
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

            )
            // 记住我
            .rememberMe(rememberMe -> rememberMe
                    // 设置记住我令牌的有效期（秒），默认是2周。以下设置1周
                    .tokenValiditySeconds(60 * 60 * 24 * 7)
                    // 设置用于签名令牌的密钥
                    .key("rnRememberMeKey")
            )
    ;

    return http.build();
}

// ...为节约篇幅，此处省略非核心内容

/*@Bean
public SessionRegistry sessionRegistry() {
    return new SessionRegistryImpl();
}*/
```
