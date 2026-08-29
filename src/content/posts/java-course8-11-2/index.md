---
title: "使用Bootstrap、Font Awesome以及Thymeleaf轻松实现首页笔记探索界面设计"
published: 2026-08-25
description: "主要分为以下几个部分"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-11-2
pinned: false
comment: true
---

主要分为以下几个部分

* 顶部导航栏
* 分类导航
* 笔记卡片网格
* 加载更多内容提示
* 没有更多内容提示
* 底部导航栏

### 界面整体布局

在`src/main/resources/templates`目录下，新建一个explore.html，代表首页笔记探索界面。以下是页面整体布局代码：

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org" xmlns:sec="http://www.thymeleaf.org/extras/spring-security">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RN - 标记我的生活</title>
    <!-- 引入 Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css"
        th:href="@{/css/bootstrap.min.css}" rel="stylesheet">
    <!-- 引入 Font Awesome -->
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css"
        th:href="@{/css/font-awesome.min.css}" rel="stylesheet">
    <!-- TODO 自定义样式 -->
    <style>
        
    </style>
</head>
<header>
    <!-- TODO 顶部导航栏 -->
    
</header>
<header>
    <!-- TODO 分类导航 -->
    
</header>
<body>
    <main>
        <div class="container">
            <!-- TODO 笔记卡片网格 -->

            <!-- TODO 加载更多内容提示 -->

            
            <!-- TODO 没有更多内容提示 -->

        </div>
    </main>
    <footer>
        <!-- TODO 底部导航栏 -->


    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js"
        th:src="@{/js/bootstrap.bundle.min.js}"></script>
    <script>
         // TODO 程序运行脚本
    </script>
</body>

</html>
```


### 顶部导航栏


```html
<style>
    /* 全局样式 */
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background-color: #f5f5f5;
    }
</style>

<!-- ...为节约篇幅，此处省略非核心内容 -->
<!-- 顶部导航栏 -->
<header>
    <nav class="navbar navbar-expand-lg">
        <div class="container">
            <a class="navbar-brand" href="/" th:href="@{/}">
                <img src="../static/images/rn_logo.png" th:src="@{/images/rn_logo.png}" alt="RN" height="24">
            </a>

            <!-- 搜索框-->
            <div class="col-md-3">
                <div class="input-group">
                    <input class="form-control" type="text" placeholder="搜索感兴趣的内容" aria-label="Search">
                </div>
            </div>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                </ul>

                <ul class="navbar-nav mb-2 mb-lg-0">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" data-bs-target="dropdown" data-bs-toggle="dropdown"
                           aria-expanded="false">
                            [[${#authentication.name}]]
                        </a>

                        <ul class="dropdown-menu" id="dropdown">
                            <li class="dropdown-item">
                                <a class="nav-link" href="/user/profile" th:href="@{/user/profile}">个人资料</a>
                            </li>
                            <li class="dropdown-item">
                                <form th:action="@{/logout}" action="/logout" method="post">
                                    <button type="submit" class="nav-link">退出登录</button>
                                </form>
                            </li>
                        </ul>
                    </li>

                </ul>

            </div>
        </div>
    </nav>
</header>
<!-- ...为节约篇幅，此处省略非核心内容 -->
```


### 分类导航


```html
<!-- ...为节约篇幅，此处省略非核心内容 -->
<style>
    /* ...为节约篇幅，此处省略非核心内容 */

    /* 分类导航 */
    .category-nav {
        background-color: white;
        padding: 8px 0;
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
    }

    .category-item {
        display: inline-block;
        padding: 6px 12px;
        margin-right: 8px;
        border-radius: 20px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .category-item.active {
        background-color: #ff2442;
        color: white;
    }
</style>

</head>
<!-- 顶部导航栏 -->
<header>
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</header>

<!-- 分类导航 -->
<header>
    <div class="container">
        <div class="category-item active">推荐</div>
        <div class="category-item">穿搭</div>
        <div class="category-item">美食</div>
        <div class="category-item">彩妆</div>
        <div class="category-item">影视</div>
        <div class="category-item">职场</div>
        <div class="category-item">情感</div>
        <div class="category-item">家居</div>
        <div class="category-item">游戏</div>
        <div class="category-item">旅行</div>
        <div class="category-item">健身</div>
    </div>
</header>

<!-- ...为节约篇幅，此处省略非核心内容 -->
```


### 笔记卡片网格


```html
<!-- ...为节约篇幅，此处省略非核心内容 -->
<style>
    /* ...为节约篇幅，此处省略非核心内容 */

    /* 笔记卡片网格 */
    .notes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 8px;
        padding: 8px;
    }

    .note-card {
        background-color: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .note-image-container {
        position: relative;
        padding-bottom: 100%;
        /* 保持正方形比例 */
        overflow: hidden;
        border-radius: 12px;
    }

    .note-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .note-tag {
        position: absolute;
        bottom: 8px;
        left: 8px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
    }

    .note-content {
        padding: 8px;
    }

    .note-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .note-author {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
    }

    .author-avatar {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        margin-right: 6px;
    }

    .author-name {
        font-size: 12px;
        color: #666;
    }

    .note-author-stats {
        display: flex;
        justify-content: space-between;
    }
    
    .note-stats {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #999;
    }

    .stat-item {
        margin-right: 12px;
    }
</style>

<!-- ...为节约篇幅，此处省略非核心内容 -->

<header>
    <!-- 顶部导航栏 -->
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</header>
<header>
    <!-- 分类导航 -->
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</header>
<body>
    <main>
        <div class="container">
            <!-- 笔记卡片网格 -->
            <div class="notes-grid" id="notesGrid">
                <!-- 笔记卡片将通过JavaScript动态生成 -->
            </div>
            <!-- TODO 加载更多内容提示 -->

            
            <!-- TODO 没有更多内容提示 -->

        </div>
    </main>
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</body>

</html>
```


### 加载更多内容提示


```html
<!-- ...为节约篇幅，此处省略非核心内容 -->
<style>
    /* ...为节约篇幅，此处省略非核心内容 */

    /* 加载更多 */
    .load-more {
        text-align: center;
        padding: 16px 0;
        color: #666;
        font-size: 14px;
    }

</style>
<!-- ...为节约篇幅，此处省略非核心内容 -->
 
<header>
    <!-- 顶部导航栏 -->
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</header>
<header>
    <!-- 分类导航 -->
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</header>
<body>
    <main>
        <div class="container">
            <!-- 笔记卡片网格 -->
            <!-- ...为节约篇幅，此处省略非核心内容 -->

            <!-- 加载更多内容提示 -->
            <div class="load-more" id="loadMore">
                <i class="fa fa-spinner fa-spin"></i> 加载更多
            </div>
            
            <!-- TODO 没有更多内容提示 -->

        </div>
    </main>
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</body>

</html>
```


### 没有更多内容提示


```html
<!-- ...为节约篇幅，此处省略非核心内容 -->
<style>
    /* ...为节约篇幅，此处省略非核心内容 */

    /* 没有更多 */
    .no-more {
        text-align: center;
        padding: 0 0 50px 0;
        color: #666;
        font-size: 14px;
        display: none;
    }
</style>
</head>
<header>
    <!-- 顶部导航栏 -->
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</header>
<header>
    <!-- 分类导航 -->
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</header>
<body>
    <main>
        <div class="container">
            <!-- 笔记卡片网格 -->
            <!-- ...为节约篇幅，此处省略非核心内容 -->
            <!-- 加载更多内容提示 -->
            <!-- ...为节约篇幅，此处省略非核心内容 -->
            
            <!-- 没有更多内容提示 -->
            <div class="no-more" id="noMoreContent">
                <p>已经到底啦~</p>
            </div>
        </div>
    </main>
    <footer>
        <!-- TODO 底部导航栏 -->


    </footer>
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</body>

</html>
</body>

</html>
```


### 底部导航栏


```html
<!-- ...为节约篇幅，此处省略非核心内容 -->
<style>
    /* ...为节约篇幅，此处省略非核心内容 */
    /* 底部导航栏 */
    .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-around;
        padding: 8px 0;
        box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.05);
        z-index: 100;
        background-color: #f5f5f5;
    }

    .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #666;
        cursor: pointer;
    }

    .nav-item.active {
        color: #ff2442;
    }

    .nav-icon {
        font-size: 20px;
        margin-bottom: 2px;
    }

    .nav-text {
        font-size: 10px;
    }
</style>
</head>
<header>
    <!-- 顶部导航栏 -->
    
</header>
<header>
    <!-- 分类导航 -->
    
</header>
<body>
    <main>
        <div class="container">
            <!-- 笔记卡片网格 -->
            <!-- ...为节约篇幅，此处省略非核心内容 -->

            <!-- 加载更多内容提示 -->
            <!-- ...为节约篇幅，此处省略非核心内容 -->
            
            <!-- 没有更多内容提示 -->
            <!-- ...为节约篇幅，此处省略非核心内容 -->
        </div>
    </main>
    <footer>
        <!-- 底部导航栏 -->
        <div class="container bottom-nav">
            <div class="nav-item active">
                <i class="fa fa-home nav-icon"></i>
                <span class="nav-text">首页</span>
            </div>
            <div class="nav-item">
                <i class="fa fa-compass nav-icon"></i>
                <span class="nav-text">发现</span>
            </div>
            <div class="nav-item">
                <i class="fa fa-plus nav-icon"></i>
                <span class="nav-text">发布</span>
            </div>
            <div class="nav-item">
                <i class="fa fa-comment-o nav-icon"></i>
                <span class="nav-text">消息</span>
            </div>
            <div class="nav-item">
                <i class="fa fa-user-o nav-icon"></i>
                <span class="nav-text">我的</span>
            </div>
        </div>

    </footer>

    <!-- ...为节约篇幅，此处省略非核心内容 -->

    <script>
         // TODO 程序运行脚本
    </script>
</body>

</html>
```
