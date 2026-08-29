---
title: "通过配置文件的方式初始化管理员账号"
published: 2026-08-25
description: "在application.properties或application.yml中添加管理员配置"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-15-3
pinned: false
comment: true
---

### 配置文件中添加管理员信息

在`application.properties`或`application.yml`中添加管理员配置：

```properties
# 管理员配置
admin.username=admin
admin.password=admin123
```


### 初始化管理员账号


修改UserServiceImpl，只能加如下方法，在应用启动的时候，自动通过配置文件初始化管理员账号：

```java
import jakarta.annotation.PostConstruct;
import com.example.rednote.common.Role;

// ...为节约篇幅，此处省略非核心内容

@Value("${admin.username}")
private String adminUsername;

@Value("${admin.password}")
private String adminPassword;

@PostConstruct
public void initAdminUser() {
    // 查询数据库是否存在管理员用户
    Optional<User> optionalAdminUser = findByUsername(adminUsername);
    User adminUser;
    if (!optionalAdminUser.isPresent()) {
        // 不存在，则创建管理员用户
        adminUser = new User();
        adminUser.setUsername(adminUsername);
    } else {
        // 存在，则获取管理员用户
        adminUser = optionalAdminUser.get();
    }

    // 明文密码加密
    String encodedPassword = passwordEncoder.encode(adminPassword);
    adminUser.setPassword(encodedPassword);

    adminUser.setRole(Role.ADMIN);

    updateUser(adminUser);
}
```

### 用户服务增加查询用户名的接口

修改UserService，增加如下接口：


```java
/**
  * 根据用户名查找用户
  *
  * @param username
  * @return
  */
Optional<User> findByUsername(String username);
```


修改UserServiceImpl，增加如下接口实现：

```java
@Override
public Optional<User> findByUsername(String username) {
    return userRepository.findByUsername(username);
}
```


### 增加后台管理控制器


增加后台管理控制器AdminController，以便显示后台管理界面。


```java
package com.example.rednote.controller;

import org.springframework.stereotype.Controller;
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
        return "admin";
    }
}
```

### 运行调测


通过以上实现，可以在项目中完整实现了角色管理功能，包括可以使用管理员账号admin进行登录。

如下图15-1所示，是admin登录应用之后，访问`/explore`页面路径的效果，提示没有权限。


![图15-1 访问`/explore`页面路径的效果](./images/15-1.png)


如下图15-2所示，是admin访问`/admin`页面路径的效果，显示有权限。


![图15-2 访问`/admin`页面路径的效果](./images/15-2.png)

说明基于角色的访问控制已经生效了。


通过查询数据库表t_user数据，能够看到已经初始化了用户名为admin角色为ADMIN的用户了：


```sql
mysql> select * from t_user;
+---------+-----------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------------------------------------------+-------------+----------+-------+
| user_id | avatar                                                                      | bio                                                                      | password                                                     | phone       | username | role  |
+---------+-----------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------------------------------------------+-------------+----------+-------+
|       1 | /uploads/2025-08-21/35ff037f-043a-4551-8912-99b89eb11591_user_181_181.jpg | Life was like a box of chocolates, you never know what you're gonna get. | $2a$10$wfuboZNYniQBTNo5/3vuau6HKpbr0y3ktavpzH6L3jd6Yw7cbHwKm | 13411111111 | user     | USER  |
|       2 | NULL                                                                        | NULL                                                                     | $2a$10$5QzEQnaMCKP/jy4PCHy7Re2gJE18xzslF3JoBwgbubkYPprdtNQla | 13411111112 | bobo     | USER  |
|      52 | NULL                                                                        | NULL                                                                     | $2a$10$Zvc89ZXXwQSaF1.PTCAPreYVgQPwEvO1aE3yFw6V.PPsZJVD6POcu | NULL        | admin    | ADMIN |
+---------+-----------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------------------------------------------+-------------+----------+-------+
3 rows in set (0.008 sec)
```
