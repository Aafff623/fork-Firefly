---
title: "设计用户管理功能的用户分页查询"
published: 2026-08-25
description: "新增admin-user.html文件，用户管理功能HTML页面片段定义如下"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-15-8
pinned: false
comment: true
---

### 定义页面片段

新增admin-user.html文件，用户管理功能HTML页面片段定义如下：

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<body>
<!-- 定义片段 -->
<div th:fragment="admin-user">
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <h2>用户列表</h2>
        </div>
        <div class="card-body">
            <div class="table-responsive small">
                <table class="table table-striped table-sm">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>用户名</th>
                        <th>电话</th>
                        <th>角色</th>
                        <th>操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr th:each="user:${userPage.content}">
                        <td th:text="${user.userId}">1</td>
                        <td th:text="${user.username}">user</td>
                        <td th:text="${user.phone}">13412345678</td>
                        <td th:text="${user.role}">USER</td>
                        <td>
                            <button class="btn btn-sm btn-light">编辑</button>
                            <button class="btn btn-sm btn-danger">删除</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <!-- 分页控件 -->
            <div class="d-flex justify-content-center">
                <nav>
                    <ul class="pagination">
                        <li class="page-item" th:classappend="${userPage.first} ? 'disabled' : ''">
                            <a class="page-link" href="#" th:href="@{/admin/user(page=${userPage.number})}">
                                上一页
                            </a>
                        </li>
                        <li class="page-item" th:classappend="${userPage.number+1 == i} ? 'active' : ''"
                            th:each="i : ${#numbers.sequence(1,userPage.totalPages)}">
                            <a class="page-link" href="#" th:href="@{/admin/user(page=${i})}" th:text="${i}">
                                1
                            </a>
                        <li class="page-item" th:classappend="${userPage.last} ? 'disabled' : ''">
                            <a class="page-link" href="#" th:href="@{/admin/user(page=${userPage.number+1+1})}">
                                下一页
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</div>
</body>
</html>
```


上述片段的名称为“admin-user”。

### 分页查询所有用户

UserRepository新增如下接口：

```java
/**
  * 分页查询所有用户
  *
  * @param pageable
  * @return
  */
Page<User> findAll(Pageable pageable);
```


UserService新增如下接口：

```java
/**
  * 分页查询所有用户
  *
  * @param page
  * @param size
  * @return
  */
Page<User> getAllUsers(int page, int size);
```


UserServiceImpl新增如下方法：

```java
@Override
    public Page<User> getAllUsers(int page, int size) {
        // 构造Pageable对象，按照用户ID倒序排序
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("userId").descending());
        return userRepository.findAll(pageable);
    }
}
```


### 修改控制器


AdminController新增如下方法：

```java
private static final int PAGE_SIZE = 10;

/**
 * 显示用户管理界面
 */
@GetMapping("/user")
/*public String user(Model model) {*/
public String user(Model model, @RequestParam(defaultValue = "1") int page) {
    // 分页查询所有用户数据
    Page<User> userPage = userService.getAllUsers(page, PAGE_SIZE);

    model.addAttribute("userPage", userPage);
    model.addAttribute("contentFragment", "admin-user");
    return "admin";
}
```

### 运行调测


如下图15-6所示，是账号admin访问`/admin/user`页面路径的效果。


![图15-6 访问`/admin/user`页面路径的效果](./images/15-6.png)


如下图15-7所示，是在移动设备上访问`/admin/user`页面的效果。


![图15-7 移动设备上访问`/admin/user`页面路径的效果](./images/15-7.png)
