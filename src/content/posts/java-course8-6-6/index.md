---
title: "实现用户基本信息的编辑页面"
published: 2026-08-25
description: "在src/main/resources/templates目录下新建user-profile-edit.html文件"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-6-6
pinned: false
comment: true
---

在`src/main/resources/templates`目录下新建user-profile-edit.html文件：

```html
<!DOCTYPE html>
<html  lang="en" xmlns:th="http://www.thymeleaf.org"
       xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RN - 个人资料编辑</title>
    <!-- 引入 Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" th:href="@{/css/bootstrap.min.css}" rel="stylesheet">
    <!-- 引入 Font Awesome -->
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" th:href="@{/css/font-awesome.min.css}" rel="stylesheet">
    <!-- 自定义样式 -->
    <style>
        .profile-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 32px;
        }

        .profile-header {
            text-align: center;
            margin-bottom: 32px;
        }

        .profile-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 20px;
            position: relative;
        }

        .profile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border: 4px solid white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .avatar-upload {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            background-color: #ff2442;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.3s;
        }

        .avatar-upload:hover {
            background-color: #e61e3a;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-label {
            font-weight: 600;
            color: #333;
        }

        .form-control {
            border-radius: 12px;
            border: 1px solid #e8e8e8;
            padding: 12px 16px;
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
            width: 100%;
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
<div class="profile-container">
    <!-- 编辑标题 -->
    <div class="profile-header">
        <h2 class="text-center">编辑个人资料</h2>
        <p>请填写或者更新你的个人信息</p>
    </div>

    <!-- 编辑表单 -->
    <form action="/user/edit" th:action="@{/user/edit}" method="post" th:object="${user}" enctype="multipart/form-data">
        <!-- 头像 -->
        <div class="form-group position-relative">
            <div class="profile-avatar">
                <img src="../static/images/rn_avatar.png" th:src="${user.avatar ?: '/images/rn_avatar.png'}" alt="用户头像" height="88" width="88">
                <div class="avatar-upload">
                    <label>更换头像</label>
                </div>
            </div>
            <div class="error-message" th:if="${#fields.hasErrors('avatar')}" th:errors="*{avatar}">
                头像格式错误（支持JPG/PNG，最大10MB）
            </div>
        </div>

        <!-- 用户名（不可编辑） -->
        <div class="form-group">
            <label class="form-label">用户名</label>
            <input type="text" class="form-control" th:value="${user.username}" disabled>
        </div>

        <!-- 手机号 -->
        <div class="form-group">
            <label class="form-label">手机号</label>
            <input type="tel" class="form-control" th:field="*{phone}" placeholder="请输入手机号">
            <div class="error-message" th:if="${#fields.hasErrors('phone')}" th:errors="*{phone}">
                请输入有效的手机号
            </div>
        </div>

        <!-- 个人简介 -->
        <div class="form-group">
            <label class="form-label">个人简介</label>
            <textarea class="form-control" th:field="*{bio}" rows="3" placeholder="请输入个人简介（最多255字）"></textarea>
            <div class="error-message" th:if="${#fields.hasErrors('bio')}" th:errors="*{bio}">
                个人简介最多255字
            </div>
        </div>

        <!-- 提交按钮 -->
        <button type="submit" class="btn btn-primary">保存修改</button>
    </form>

    <!-- 操作反馈 -->
    <div th:if="${success}" class="alert alert-success mt-3">
        [[${success}]]
    </div>
    <div th:if="${error}" class="alert alert-danger mt-3">
        [[${error}]]
    </div>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" th:src="@{/js/bootstrap.bundle.min.js}"></script>

</body>
</html>
```


其中，更换头像的功能在后续的课程中还做介绍。
