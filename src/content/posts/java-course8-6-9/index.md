---
title: "设计密码修改表单，对新密码进行强度校验和确认匹配"
published: 2026-08-25
description: "1. 设计密码修改表单，包含原密码、新密码和确认新密码输入框"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-6-9
pinned: false
comment: true
---

1. 设计密码修改表单，包含原密码、新密码和确认新密码输入框
2. 验证原密码的正确性，对新密码进行强度校验和确认匹配


### 设计密码修改表单


在`src/main/resources/templates`目录下新建user-change-password.html文件：

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RN - 修改密码</title>
    <!-- 引入 Bootstrap CSS -->
    <link href="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/css/bootstrap.min.css"
          th:href="@{/css/bootstrap.min.css}" rel="stylesheet">

    <!-- 引入 Font Awesome -->
    <link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          th:href="@{/css/font-awesome.min.css}" rel="stylesheet">

    <!-- 自定义样式 -->
    <style>
        .password-container {
            max-width: 500px;
            margin: 0 auto;
            padding: 32px;
        }

        .password-card {
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: none;
        }

        .card-header {
            background-color: white;
            border-bottom: none;
            padding: 32px 32px 0;
        }

        .card-body {
            padding: 32px;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-label {
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }

        .form-control {
            border-radius: 12px;
            border: 1px solid #e8e8e8;
            padding: 12px 16px;
            height: 48px;
        }

        .form-control:focus {
            border-color: #ff2442;
            box-shadow: 0 0 0 2px rgba(255, 36, 66, 0.1);
        }

        .btn-primary {
            background-color: #ff2442;
            border-color: #ff2442;
            border-radius: 24px;
            padding: 12px 48px;
            font-weight: 600;
            height: 48px;
            width: 100%;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            background-color: #e61e3a;
            box-shadow: 0 4px 12px rgba(255, 36, 66, 0.2);
        }

        .error-message {
            color: #ff2442;
            font-size: 12px;
            margin-top: 4px;
        }

        .back-link {
            display: block;
            text-align: center;
            margin-top: 24px;
            color: #999;
            font-size: 14px;
        }

        .back-link:hover {
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
<div class="password-container">
    <div class="card password-card">
        <!-- 编辑标题 -->
        <div class="card-header">
            <h2 class="text-center">修改密码</h2>
            <p>请输入当前密码和新密码</p>
        </div>

        <div class="card-body">
            <form action="/user/change-password" th:action="@{/user/change-password}" method="post">
                <!-- 当前密码 -->
                <div class="form-group">
                    <label for="oldPassword" class="form-label">当前密码</label>
                    <input type="password" class="form-control" id="oldPassword" name="oldPassword" required/>
                </div>

                <!-- 新密码 -->
                <div class="form-group">
                    <label for="newPassword" class="form-label">新密码</label>
                    <input type="password" class="form-control" id="newPassword" name="newPassword" required/>
                    <div class="error-message" id="newPasswordError"></div>
                </div>

                <!-- 确认密码 -->
                <div class="form-group">
                    <label for="confirmPassword" class="form-label">确认密码</label>
                    <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" required/>
                    <div class="error-message" id="confirmPasswordError"></div>
                </div>

                <!-- 提交按钮 -->
                <button type="submit" class="btn btn-primary">确认修改</button>
            </form>

            <!-- 返回个人资料 -->
            <a href="/user/profile" th:href="@{/user/profile}" class="back-link">返回个人资料</a>
        </div>
    </div>

    <!-- 操作反馈 -->
    <div th:if="${success}" class="alert alert-success mt-3" role="alert">
        [[${success}]]
    </div>
    <div th:if="${error}" class="alert alert-danger mt-3" role="alert">
        [[${error}]]
    </div>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/js/bootstrap.bundle.min.js"
        th:src="@{/js/bootstrap.bundle.min.js}"></script>

<!-- TODO 密码校验 -->
</body>
</html>
```
### 密码校验


验证原密码的正确性，对新密码进行强度校验和确认匹配：

```html
<script>
    // 密码验证，验证两次输入的密码是否一致
    document.querySelector('#confirmPassword').addEventListener('input', function () {
        const newPassword = document.querySelector('#newPassword').value;
        const confirmPasswordError = document.querySelector('#confirmPasswordError');

        if (this.value !== newPassword) {
            confirmPasswordError.textContent = '两次输入的密码不一致';
        } else {
            confirmPasswordError.textContent = '';
        }
    });

    // 密码强度验证
    document.querySelector('#newPassword').addEventListener('input', function () {
        const newPassword = this.value;
        const errorMessage = document.querySelector('#newPasswordError');

        // 密码长度至少8位
        if (newPassword.length < 8) {
            errorMessage.textContent = '密码长度至少8位';
            return;
        }

        // 密码必须包含字母和数字
        if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            errorMessage.textContent = '密码必须包含字母和数字';
            return;
        }

        errorMessage.textContent = '';
    })
</script>
```
