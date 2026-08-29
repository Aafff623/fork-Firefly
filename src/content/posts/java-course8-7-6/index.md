---
title: "笔记发布成功的界面设计"
published: 2026-08-25
description: "笔记发布可能成功或者失败"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-7-6
pinned: false
comment: true
---

笔记发布可能成功或者失败：

* 校验失败，则返回note-publish.html
* 校验成功，则返回note-publish-success.html

note-publish-success.html内容如下：


```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RN - 笔记发布成功</title>
    <!-- 引入 Bootstrap CSS -->
    <link href="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/css/bootstrap.min.css"
          th:href="@{/css/bootstrap.min.css}" rel="stylesheet">

    <!-- 引入 Font Awesome -->
    <link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          th:href="@{/css/font-awesome.min.css}" rel="stylesheet">

    <!-- 自定义样式 -->
    <style>
        /* 全局样式 */
        * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            box-sizing: border-box;
        }

        body {
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-image: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        }

        /* 发布成功弹窗 */
        .success-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .success-content {
            background-color: white;
            border-radius: 24px;
            padding: 48px 32px;
            text-align: center;
            box-shadow: 0 12px 32px rgba(255, 36, 66, 0.15);
            animation: fadeInUp 0.5s ease-out;
        }

        /* 动画效果 */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* 图标样式 */
        .success-icon {
            width: 80px;
            height: 80px;
            background-color: #ff2442;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 24px;
        }

        .success-icon i {
            font-size: 36px;
            color: white;
            animation: bounce 1.5s infinite;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }

        /* 标题与文案 */
        .success-title {
            font-size: 24px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
        }

        .success-desc {
            font-size: 16px;
            color: #666;
            margin-bottom: 32px;
        }

        /* 操作按钮 */
        .btn-group {
            display: flex;
            gap: 16px;
            justify-content: center;
        }

        .btn-view {
            background-color: #ff2442;
            color: white;
            padding: 12px 32px;
            border: none;
            border-radius: 24px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .btn-view:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 36, 66, 0.2);
        }

        .btn-continue {
            background-color: white;
            color: #666;
            padding: 12px 32px;
            border: 2px solid #ff2442;
            border-radius: 24px;
            font-weight: 600;
            cursor: pointer;
        }

    </style>
</head>
<body>

<div class="success-modal">
    <div class="success-content">
        <div class="success-icon">
            <i class="fa fa-check"></i>
        </div>

        <h2 class="success-title">发布成功！</h2>
        <p class="success-desc">
            你的笔记已被推荐到首页，快去看看有没有新互动吧~
        </p>

        <div class="btn-group">
            <button class="btn-view" onclick="goToNote()">查看笔记</button>
            <button class="btn-continue" onclick="continuePublish()">继续发布</button>
        </div>
    </div>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/js/bootstrap.bundle.min.js"
        th:src="@{/js/bootstrap.bundle.min.js}"></script>

<script>
    // 跳转到笔记详情页面
    function goToNote() {
        // TODO 跳转到笔记详情页面，替换为实际笔记ID
        window.location.href = '/note/1234';
    }

    // 继续发布
    function continuePublish() {
        window.history.back();
    }
</script>

</body>
</html>
```
