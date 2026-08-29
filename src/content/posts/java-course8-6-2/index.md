---
title: "使用Bootstrap响应式设计实现用户信息展示页面"
published: 2026-08-25
description: "1. 借助 Bootstrap 的各类组件（如Card、Form等）设计用户信息展示页面"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-6-2
pinned: false
comment: true
---

1. 借助 Bootstrap 的各类组件（如Card、Form等）设计用户信息展示页面
2. 为编辑按钮添加点击事件，实现信息编辑与展示状态的切换
3. 提供友好的确认和提示信息
4. 响应式设计适配移动端

### 设计用户信息展示视图模板

在`src/main/resources/templates`目录下新建user-profile.html文件：


```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RN - 个人资料</title>
    <!-- 引入 Bootstrap CSS -->
    <link href="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/css/bootstrap.min.css"
          th:href="@{/css/bootstrap.min.css}" rel="stylesheet">

    <!-- 引入 Font Awesome -->
    <link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          th:href="@{/css/font-awesome.min.css}" rel="stylesheet">

          <style>
    /* 小红书风格 */
    * {
        font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        background-color: #f5f5f5;
    }

    /* 顶部导航栏 */
    .header {
        position: sticky;
        top: 0;
        background-color: white;
        padding: 16px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: #f0f0f0;
    }

    .user-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
    }

    .user-meta {
        font-size: 12px;
        color: #666;
    }

    .action-btn {
        margin-left: auto;
        font-size: 14px;
        color: #ff2442;
    }
</style>
</head>
<body>
<!-- 导航栏 -->
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
        <a class="navbar-brand" href="/" th:href="@{/}">
            <img src="../static/images/rn_logo.png" th:src="@{/images/rn_logo.png}" alt="RN" height="24">
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link" href="#" sec:authentication="name">
                        [[${#authentication.name}]]
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/user/profile" th:href="@{/user/profile}">个人资料</a>
                </li>
                <li class="nav-item">
                    <!-- 注销 -->
                    <form action="/logout" th:action="@{/logout}" method="post">
                        <button type="submit" class="nav-link">退出登录</button>
                    </form>
                </li>
            </ul>
        </div>
    </div>
</nav>

<!-- 主体部分 -->
<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    个人资料
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4 text-center">
                            <img src="../static/images/rn_avatar.png"
                                 th:src="${user.avatar ?: '/images/rn_avatar.png'}}"
                                 class="rounded-circle" alt="用户头像" height="88" width="88">
                            <p class="mt-3">[[${user.username}]]</p>
                            <a href="/user/edit" th:href="@{/user/edit}" class="btn btn-primary btn-sm">编辑资料</a>
                        </div>

                        <div class="col-md-8">
                            <dive class="mb-3">
                                <label class="form-label">手机号</label>
                                <p class="form-control-plaintext">[[${user.phone}]]</p>
                            </dive>
                            <dive class="mb-3">
                                <label class="form-label">个人简介</label>
                                <p class="form-control-plaintext">[[${user.bio ?: '这家伙很懒，什么都没写'}]]</p>
                            </dive>

                            <a href="/user/change-password" th:href="@{/user/change-password}"
                               class="btn btn-outline-secondary">修改密码</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/js/bootstrap.bundle.min.js"
        th:src="@{/js/bootstrap.bundle.min.js}"></script>

</body>
</html>
```
