---
title: "调整安全配置类细化用户信息管理页面的访问权限"
published: 2026-08-25
description: "1. 在 Spring Security 配置类中，进一步细化用户信息管理页面的访问权限"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-6-5
pinned: false
comment: true
---

1. 在 Spring Security 配置类中，进一步细化用户信息管理页面的访问权限
2. 确保只有已登录用户可以访问自己的信息管理页面
3. 验证用户请求的信息是否与当前登录用户的身份匹配，防止越权操作


假设所有的用户都是USER角色：

```java
import org.springframework.security.core.authority.SimpleGrantedAuthority;

//  ...为节约篇幅，此处省略非核心内容


@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        //  ...为节约篇幅，此处省略非核心内容

        // 将User转为UserDetails对象
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .disabled(false)
                // 设置所有的数据库里面的用户都是USER角色
                /*.authorities(Collections.emptyList())*/
                .authorities(new SimpleGrantedAuthority("ROLE_USER"))
                .build();
    }
}
```
