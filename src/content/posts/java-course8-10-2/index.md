---
title: "使用Bootstrap、Font Awesome以及Thymeleaf轻松实现笔记编辑界面"
published: 2026-08-25
description: "下面我将为你实现一个仿小红书的笔记修改界面，包含标题编辑、内容编辑、话题标签管理、分类管理等核心功能。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-10-2
pinned: false
comment: true
---

下面我将为你实现一个仿小红书的笔记修改界面，包含标题编辑、内容编辑、话题标签管理、分类管理等核心功能。


### 界面设计与实现

可以基于note-publish.html进行修改，只需要删除”图片上传区域“相关的样式、组件即可，


以下是笔记修改界面note-edit.html的完整实现代码：

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RN - 笔记编辑</title>
    <!-- 引入 Bootstrap CSS -->
    <link href="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/css/bootstrap.min.css"
          th:href="@{/css/bootstrap.min.css}" rel="stylesheet">

    <!-- 引入 Font Awesome -->
    <link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          th:href="@{/css/font-awesome.min.css}" rel="stylesheet">

    <!-- 自定义样式 -->
    <style>
        /* 基础样式 */
        body {
            background-color: #fef6f6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .container {
            max-width: 768px;
            margin: 0 auto;
            padding: 0 16px;
        }

        /* 顶部导航栏 */
        .header {
            background-color: white;
            border-bottom: 1px solid #eee;
            padding: 12px 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header .btn {
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
        }

        .btn-cancel {
            color: #333;
            border: 1px solid #ddd;
        }

        .btn-publish {
            background-color: #ff2442;
            color: white;
            border: none;
        }

        .btn-publish:hover {
            background-color: #e61e3a;
        }

        /* 内容区域 */
        .content {
            padding: 16px 0;
        }

        /* 标题输入框 */
        .note-title {
            border: none;
            width: 100%;
            font-size: 20px;
            font-weight: 600;
            padding: 12px 0;
            outline: none;
        }

        .note-title::placeholder {
            color: #999;
        }

        /* 已上传图片展示 */
        .uploaded-images {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 16px;
        }

        .uploaded-image {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            overflow: hidden;
            position: relative;
        }

        .uploaded-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .uploaded-image .delete-btn {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 20px;
            height: 20px;
            background-color: rgba(0, 0, 0, 0.6);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
        }

        /* 笔记内容编辑器 */
        .note-content {
            width: 100%;
            min-height: 200px;
            border: none;
            outline: none;
            font-size: 16px;
            line-height: 1.6;
            padding: 12px 0;
        }

        .note-content::placeholder {
            color: #999;
        }

        /* 话题选择 */
        .topic-input {
            position: relative;
            margin-bottom: 20px;
        }

        .topic-input input {
            width: 100%;
            padding: 12px;
            border: 1px solid #eee;
            border-radius: 8px;
            outline: none;
        }

        /* 分类选择 */
        .category-selector {
            margin-bottom: 20px;
        }

        .category-input i {
            color: #ff2442;
        }

        /* 添加到 style 标签中 */
        .category-selector select {
            width: 100%;
            padding: 12px;
            border: 1px solid #eee;
            border-radius: 8px;
            background-color: white;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 16px;
            cursor: pointer;
        }

        .category-selector select:focus {
            outline: none;
            border-color: #ff2442;
            box-shadow: 0 0 0 2px rgba(255, 36, 66, 0.1);
        }

        .btn-view-note {
            background-color: #ff2442;
            color: white;
        }

        .error-message {
            color: #ff2442;
            font-size: 12px;
            margin-top: 4px;
        }
    </style>
</head>
<body>
<!-- 操作栏 -->
<div class="header">
    <div class="container">
        <div class="d-flex justify-content-between align-items-center">
            <button class="btn btn-cancel" id="cancelPublishBtn">
                取消
            </button>
            <button class="btn btn-publish" id="publishNoteBtn">
                保存
            </button>
        </div>
    </div>
</div>

<!-- 主体部分 -->
<div class="container content">
    <form id="noteForm" method="post" th:object="${note}"
          th:action="@{/note/{noteId}(noteId=${note.noteId})}">
        <!-- 标题输入框 -->
        <input type="text" class="note-title" id="title" name="title"
               th:field="*{title}" placeholder="分享你的生活点滴...">
        <div class="error-message" th:if="${#fields.hasErrors('title')}" th:errors="*{title}">
        </div>

        <!-- 已上传图片预览 -->
        <div class="uploaded-images" id="uploadedImages">
            <div class="uploaded-image" th:each="image : ${note.images}">
                <img th:src="${image}" class="preview-img">
            </div>
        </div>
        <!-- 错误消息 -->
        <div class="error-message" th:if="${#fields.hasErrors('images')}" th:errors="*{images}">
        </div>

        <!-- 笔记内容 -->
        <textarea class="note-content" id="content" name="content"
                  th:field="*{content}" placeholder="详细描述你的分享内容..."></textarea>
        <div class="error-message" th:if="${#fields.hasErrors('content')}" th:errors="*{content}">
        </div>

        <!-- 话题 -->
        <div class="topic-input">
            <input type="text" class="form-control" id="topicInput" name="topics"
                   th:field="*{topics}" placeholder="添加话题，多个话题用空格隔开">
        </div>

        <!-- 分类 -->
        <div class="category-selector">
            <label for="categorySelect" class="form-label">请选择一个分类：</label>
            <select class="form-control" id="categorySelect" name="category"
                    th:field="*{category}">
                <option value="穿搭">穿搭</option>
                <option value="美食">美食</option>
                <option value="彩妆">彩妆</option>
                <option value="影视">影视</option>
                <option value="职场">职场</option>
                <option value="情感">情感</option>
                <option value="家居">家居</option>
                <option value="游戏">游戏</option>
                <option value="旅行">旅行</option>
                <option value="健身">健身</option>
            </select>
            <div class="error-message" th:if="${#fields.hasErrors('category')}" th:errors="*{category}">
            </div>
        </div>
    </form>

    <!-- 操作反馈 -->
    <div th:if="${success}" class="alert alert-success mt-4">
        <i class="fa fa-check-circle"></i>
        [[${success}]]
    </div>
    <div th:if="${error}" class="alert alert-danger mt-4">
        <i class="fa fa-exclamation-circle"></i>
        [[${error}]]
    </div>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/js/bootstrap.bundle.min.js"
        th:src="@{/js/bootstrap.bundle.min.js}"></script>

<script>
    // 笔记发布表单的校验
    // 在发布按钮上设置点击事件
    document.getElementById("publishNoteBtn").addEventListener("click", function (event) {
        // 获取笔记标题
        const title = document.getElementById("title").value;
        if (title.trim() === "") {
            alert("请输入笔记标题");
            return;
        }

        // 获取笔记内容
        const content = document.getElementById("content").value;
        if (content.trim() === "") {
            alert("请输入笔记内容");
            return;
        }

        // 提交表单
        document.getElementById("noteForm").submit();
    })

    // 取消发布的事件处理
    document.getElementById("cancelPublishBtn").addEventListener("click", function (event) {
        // 用户确认是否取消发布
        if (confirm("确定要取消发布吗？所有内容将不会被保存")) {
            window.history.back();
        }
    })
</script>
</body>
</html>
```
