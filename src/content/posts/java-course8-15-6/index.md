---
title: "实现可重用的admin.html主模板"
published: 2026-08-25
description: "admin.html主模板实现了"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-15-6
pinned: false
comment: true
---

admin.html主模板实现了：

* 导航栏
* 菜单
* 内容区域


```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RN - 后台管理</title>
    <!-- 引入 Bootstrap CSS -->
    <link href="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/css/bootstrap.min.css"
          th:href="@{/css/bootstrap.min.css}" rel="stylesheet">

    <!-- 引入 Font Awesome -->
    <link href="https://cdn.bootcdn.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          th:href="@{/css/font-awesome.min.css}" rel="stylesheet">

    <style>
        /* 全局样式 */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f5f5f5;
        }

        .bi {
            display: inline-block;
            width: 1rem;
            height: 1rem;
        }

        /*
        * Sidebar
        */
        @media (min-width: 768px) {
            .sidebar .offcanvas-lg {
                position: -webkit-sticky;
                position: sticky;
                top: 48px;
            }

            .navbar-search {
                display: block;
            }

            .sidebar .nav-link {
                font-size: .875rem;
                font-weight: 500;
            }

            .sidebar .nav-link.active {
                color: #2470dc;
            }

            .sidebar-heading {
                font-size: .75rem;
            }
        }
    </style>
</head>
<!--导航栏-->
<header class="navbar navbar-expand-lg">
    <div class="container">
        <a class="navbar-brand" href="/" th:href="@{/}">
            <img src="../static/images/rn_logo.png" th:src="@{/images/rn_logo.png}" alt="RN" height="24">
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
    </div>
</header>

<body>
<div class="container">
    <div class="row">
        <!--菜单-->
        <div class="sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary">
            <div class="offcanvas-md offcanvas-end bg-body-tertiary" tabindex="-1" id="sidebarMenu"
                 aria-labelledby="sidebarMenuLabel">
                <div class="offcanvas-body d-md-flex flex-column p-0 pt-lg-3 overflow-y-auto">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link d-flex align-items-center gap-2 active" aria-current="page"
                               href="/admin/dashboard" th:href="@{/admin/dashboard}">
                                <i class="fa fa-tachometer"></i>
                                数据看板
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link d-flex align-items-center gap-2" aria-current="page"
                               href="/admin/user" th:href="@{/admin/user}">
                                <i class="fa fa-users"></i>
                                用户管理
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link d-flex align-items-center gap-2" aria-current="page"
                               href="/admin/note" th:href="@{/admin/note}">
                                <i class="fa fa-file-text"></i>
                                笔记管理
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link d-flex align-items-center gap-2" aria-current="page"
                               href="/admin/comment" th:href="@{/admin/comment}">
                                <i class="fa fa-comments"></i>
                                评论管理
                            </a>
                        </li>
                    </ul>
                    <hr class="my-3">
                    <ul class="nav flex-column mb-auto">
                        <li class="nav-item">
                            <form method="post" th:action="@{/logout}" action="/logout">
                                <input type="submit" class="nav-link" value="退出登录">
                            </form>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <!--内容区域-->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <!--代码片段-->
            <div th:replace="~{${contentFragment}}"></div>
        </main>
    </div>
</div>


<!-- Bootstrap JS -->
<script src="https://cdn.bootcdn.net/ajax/libs/bootstrap/5.3.6/js/bootstrap.bundle.min.js"
        th:src="@{/js/bootstrap.bundle.min.js}"></script>

</body>
</html>
```


其中，菜单可以跳转到不同的子功能的页面。子功能的页面内容区域通过`th:replace="~{${contentFragment}}"`来实现动态替换不同的HTML片段。
