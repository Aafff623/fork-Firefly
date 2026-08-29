---
title: "创建专门处理后台管理请求的控制器类"
published: 2026-08-25
description: "将/admin路径视为后台管理请求的总路口，其他分为以下几个功能"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-15-5
pinned: false
comment: true
---

将`/admin`路径视为后台管理请求的总路口，其他分为以下几个功能：

* `/admin/dashboard`路径处理数据看板；
* `/admin/user`路径处理用户管理；
* `/admin/note`路径处理笔记管理；
* `/admin/comment`路径处理评论管理；


AdminController修改如下：

```java
package com.example.rednote.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * AdminController 后台管理控制器
 *
 * @version 2025/08/23
 **/
@Controller
@RequestMapping("/admin")
public class AdminController {
    @GetMapping()
    public String goToAdmin() {
        /*return "admin";*/
        // 重定向到第一个功能界面“数据看板”
        return "redirect:/admin/dashboard";
    }

    /**
     * 显示数据看板界面
     */
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("contentFragment", "admin-dashboard");
        return "admin";
    }

    /**
     * 显示用户管理界面
     */
    @GetMapping("/user")
    public String user(Model model) {
        model.addAttribute("contentFragment", "admin-user");
        return "admin";
    }

    /**
     * 显示笔记管理界面
     */
    @GetMapping("/note")
    public String note(Model model) {
        model.addAttribute("contentFragment", "admin-note");
        return "admin";
    }

    /**
     * 显示评论管理界面
     */
    @GetMapping("/comment")
    public String comment(Model model) {
        model.addAttribute("contentFragment", "admin-comment");
        return "admin";
    }
}
```


上述代码，当访问`/admin`路径时，会重定向到`/admin/dashboard`。

四个功能都是使用相同的admin.html主模板，并在运行时自动替换为不通过功能的模板片段contentFragment。
