---
title: "-3 实现用户管理控制器，掌握多种视图解析方式"
published: 2026-08-25
description: "修改AdminController控制器类，增加如下方法"
image: ''
tags: [Java, Thymeleaf, 模板引擎]
category: 指南
collections: [java-fullstack, java-fullstack-frontend-basic]
draft: false
lang: ''
slug: java-course4-5-3
pinned: false
comment: true
---

### 修改控制器


修改AdminController控制器类，增加如下方法：

```java
@GetMapping("/user")
public String getUsers(Model model) {
    model.addAttribute("users", new ArrayList<>(users.values()));
    model.addAttribute("contentFragment", "admin-user");

    return "admin";
}

@GetMapping("/user/{id}/edit")
public String editUser(@PathVariable(name = "id", required = true) Long id, Model model) {
    User user = users.get(id);

    model.addAttribute("user", user);
    model.addAttribute("contentFragment", "admin-user-edit");

    return "admin";
}

@PostMapping("/user")
public String updateUser(@ModelAttribute User user) {
    // 更新或者新增
    if (user.getId() == null) {
        Long id = counter.getAndIncrement();
        user.setId(id);
    }

    users.put(user.getId(), user);

    return "redirect:/admin/user";
}

@DeleteMapping("/user/{id}")
public ResponseEntity<?> deleteUser(@PathVariable(name = "id", required = true) Long id) {
    users.remove(id);

    Map<String, String> response = new HashMap<>();
    response.put("message", "用户删除成功");
    response.put("redirectUrl", "/admin/user");

    return ResponseEntity.ok(response);
}

@GetMapping("/user/add")
public String addUser(Model model) {
    model.addAttribute("user", new User());
    model.addAttribute("contentFragment", "admin-user-edit");

    return "admin";
}
```
