---
title: "自定义登录处理逻辑区分不同角色的登录"
published: 2026-08-25
description: "为了区分普通用户和管理员登录，可以自定义登录成功后的处理逻辑。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-15-4
pinned: false
comment: true
---

为了区分普通用户和管理员登录，可以自定义登录成功后的处理逻辑。


```java
package com.example.rednote.controller;

import com.example.rednote.common.Role;
import com.example.rednote.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * IndexController 首页控制器
 *
 * @version 2025/08/20
 **/
@Controller
@RequestMapping("/")
public class IndexController {
    @Autowired
    private UserService userService;

    @GetMapping
    public String index() {
        /*// 重定向到首页笔记探索页面
        return "redirect:/explore";*/

        // 判定当前用户角色，如果是管理员则跳转到管理页面，否则跳转到笔记探索页面
        return "redirect:/" + (userService.getCurrentUser().getRole() == Role.ADMIN ? "admin" : "explore");
    }
}
```


默认成功登录后会重定向到`/`，这里再判定角色：

* 如果是ADMIN角色，就重定向到`/admin`；
* 否则就重定向到`/explore`。
 

通过这种方式，你可以实现普通用户存储在数据库中，而管理员账号存储在配置文件中，同时使用统一的登录入口进行身份验证。
