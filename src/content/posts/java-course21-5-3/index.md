---
title: "修改用户领域微服务的认证服务"
published: 2026-08-25
description: "将rednote-common模块下的CustomAuthenticationFailureHandler、CustomAuthenticationProvider、CustomUserDetails…"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-5-3
pinned: false
comment: true
---

### 认证相关的等类


将`rednote-common`模块下的CustomAuthenticationFailureHandler、CustomAuthenticationProvider、CustomUserDetails、JwtAuthenticationFilter、JwtTokenProvider、UserDetailsServiceImpl、WebSecurityConfig等类迁移到`rednote-user-microservice`模块下。

### 迁移实体及仓库等类

将`rednote-common`模块下的User、UserRepository等类迁移到`rednote-user-microservice`模块下。
