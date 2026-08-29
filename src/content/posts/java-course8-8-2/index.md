---
title: "控制器来处理笔记列表查询请求及重定向"
published: 2026-08-25
description: "我们需要在原有的用户信息管理页面展示该用户发布的笔记列表。因此，需要修改用户控制器UserController以实现相关功能。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-8-2
pinned: false
comment: true
---

我们需要在原有的用户信息管理页面展示该用户发布的笔记列表。因此，需要修改用户控制器UserController以实现相关功能。


### 控制器处理用户笔记列表数据展示

新增方法如下，以获取用户笔记列表数据并在界面上展示。


```java
import org.springframework.web.bind.annotation.PathVariable

// ...为节约篇幅，此处省略非核心内容

@Controller
@RequestMapping("/user")
public class UserController {
      
    // ...为节约篇幅，此处省略非核心内容

    @Autowired
    private UserService userService;

    @Autowired
    private NoteService noteService;

    @GetMapping("/profile/{userId}")
    public String profileWithNotes(Model model,
                                   @PathVariable Long userId,
                                   @RequestParam(defaultValue = "1") int page,
                                   @RequestParam(defaultValue = "12") int size) {
        // 获取当前用户信息
        Optional<User> optionalUser = userService.findByUserId(userId);

        // 判断用户是否存在
        if (!optionalUser.isPresent()) {
            throw new UserNotFoundException("");
        }

        User user = optionalUser.get();
        model.addAttribute("user", user);

        // 获取用户笔记列表数据
        Page<Note> notePage = noteService.getNotesByUser(userId, page - 1, size);

        // 添加笔记列表数据到模型中
        model.addAttribute("notePage", notePage);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", notePage.getTotalPages());

        return "user-profile";
    }
}    
```


上述代码

* 通过`@PathVariable`传递参数，获取到所需要查询的用户的ID。
* page、size参数用于分页查询，分别指要查询的页面页码及该页码数据量。
* 当访问`/user/profile/{userId}`路径时，如果正常处理，会返回user-profile.html模板页面。
* 如果传入的userId不存在，则会抛出UserNotFoundException异常。


### UserNotFoundException异常


新增UserNotFoundException用于表示用户不存在异常：


```java
package com.example.rednote.exception;

/**
 * UserNotFoundException 用户不存在异常
 *
 * @version 2025/06/07
 **/
public class UserNotFoundException extends ValidationException {
    public UserNotFoundException(String message) {
        super("用户不存在异常. " + message);
    }

    public UserNotFoundException(String message, Throwable cause) {
        super("用户不存在异常. " + message, cause);
    }
}
```

### 用户信息管理页面重定向


原有的访问用户信息管理页面的路径是`/user/profile`，用来表示展示用户自己的信息。现在对改控制器做修改，以便重定向到`/user/profile/{userId}`路径：


```java
@GetMapping("/profile")
public String profile(Model model) {
    // 获取当前用户信息
    User user = userService.getCurrentUser();

    /*model.addAttribute("user", user);

    return "user-profile";*/

    // 重定向
    return "redirect:/user/profile/" + user.getUserId();
}
```

这样，`/user/profile/{userId}`接口就能处理包括自己在内的所有人的用户信息展示了。
