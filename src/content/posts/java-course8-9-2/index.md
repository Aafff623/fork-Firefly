---
title: "使用Bootstrap、Font Awesome以及Thymeleaf轻松实现笔记详情界面"
published: 2026-08-25
description: "新建note-detail.html"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-9-2
pinned: false
comment: true
---

### 界面设计与实现


新建note-detail.html：

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RN - 笔记详情</title>
    <!-- 引入 Bootstrap CSS -->
    <link href="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/css/bootstrap.min.css"
          th:href="@{/css/bootstrap.min.css}" rel="stylesheet">

    <!-- 引入 Font Awesome -->
    <link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          th:href="@{/css/font-awesome.min.css}" rel="stylesheet">

    <!-- 自定义样式 -->
    <style>
        /* 全局样式 */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f5f5f5;
        }

        /* 笔记内容区 */
        .note-container {
            background-color: white;
            margin-bottom: 20px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .note-images {
            position: relative;
            background-color: #000;
        }

        .note-image {
            width: 100%;
            max-height: 60vh;
            object-fit: contain;
        }

        .note-content {
            padding: 20px;
        }

        .note-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .note-text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .note-tags {
            margin-bottom: 20px;
        }

        .tag {
            display: inline-block;
            background-color: #f0f0f0;
            color: #666;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 14px;
            margin-right: 8px;
            margin-bottom: 8px;
        }

        .note-action-bar {
            margin-bottom: 20px;
        }

        /* 作者信息 */
        .author-info {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }

        .author-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            margin-right: 12px;
        }

        .author-name {
            font-size: 16px;
            font-weight: 600;
        }

        .author-follow {
            margin-left: auto;
            background-color: #ff2442;
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            cursor: pointer;
        }

        .author-follow.following {
            background-color: #f0f0f0;
            color: #666;
        }

         /* 评论区（第一部分）*/
        .comments-section {
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            padding: 20px;
        }

        .comments-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .comments-title {
            font-size: 18px;
            font-weight: 600;
        }

        .comment-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            margin-right: 12px;
        }

        .comment-input {
            display: flex;
            margin-bottom: 20px;
        }

        .comment-textarea {
            flex-grow: 1;
            border: 1px solid #e0e0e0;
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 14px;
            resize: none;
            outline: none;
        }

        .comment-btn {
            margin-left: 12px;
            background-color: #ff2442;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .comment-item {
            padding: 10px 0;
            border-bottom: 1px solid #f5f5f5;
        }

        .comment-header {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }

    </style>
</head>
<body>
<!-- 主内容区 -->
<main class="container py-4 main-content">
    <!-- 笔记内容 -->
    <div class="note-container">
        <!-- 笔记图片 -->
        <div class="note-images">
            <img class="note-image" src="../static/images/rn_avatar.png" th:src="${note.images[0]}" alt="笔记图片">
        </div>

        <!-- 笔记内容区 -->
        <div class="note-content">
            <!-- 标题 -->
            <h1 class="note-title" th:text="${note.title}">分享我超爱的夏日穿搭，清爽又时尚</h1>

            <!-- 内容 -->
            <p class="note-text" th:text="${note.content}">
                夏天到了，又到了可以尽情展现个性穿搭的季节啦！<br><br>
            </p>

            <!-- 话题 -->
            <div class="note-tags">
                <span class="tag" th:each="topic : ${note.topics}" th:text="${topic}">
                </span>
            </div>

            <!-- 操作栏 -->
            <div class="note-action-bar">
                <!-- 返回 -->
                <button class="btn btn-light btn-sm" onclick="history.back()">
                    <i class="fa fa-arrow-left"></i>
                </button>
                <!-- 编辑 -->
                <button class="btn btn-light btn-sm" th:if="${#authentication.name == note.author.username}">
                    <i class="fa fa-edit"></i>
                </button>
                <!-- 删除 -->
                <button class="btn btn-light btn-sm" th:if="${#authentication.name == note.author.username}">
                    <i class="fa fa-trash"></i>
                </button>
                <!-- 分享 -->
                <button class="btn btn-light btn-sm">
                    <i class="fa fa-share-alt"></i>
                </button>
                <!-- 点赞 -->
                <button class="btn btn-light btn-sm">
                    <i class="fa fa-heart-o"></i>
                </button>
                <!-- 收藏 -->
                <button class="btn btn-light btn-sm">
                    <i class="fa fa-star-o"></i>
                </button>
            </div>

            <!-- 作者信息 -->
            <div class="author-info">
                <img class="author-avatar" src="../static/images/rn_avatar.png" th:src="${note.author.avatar ?: '/images/rn_avatar.png'}"
                     alt="作者头像">
                <div>
                    <div class="author-name" th:text="${note.author.username}">
                        user
                    </div>
                    <div class="author-meta">
                        已获得 1024 粉丝
                    </div>
                </div>
                <div class="author-follow" th:if="${#authentication.name != note.author.username}">
                    + 关注
                </div>
            </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
            <div class="comments-header">
                <div class="comments-title">
                    评论区
                </div>
            </div>

            <!-- 评论输入框 -->
            <div class="comment-input">
                <img class="comment-avatar" src="../static/images/rn_avatar.png" th:src="@{/images/rn_avatar.png}"
                     alt="头像">
                <textarea class="comment-textarea" placeholder="分享你的想法..."></textarea>
                <div class="comment-btn">
                    发送
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Bootstrap JS -->
<script src="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/js/bootstrap.bundle.min.js"
        th:src="@{/js/bootstrap.bundle.min.js}"></script>

</body>
</html>
```
