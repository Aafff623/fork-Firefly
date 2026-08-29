---
title: "不同视角下的笔记详情界面展示效果"
published: 2026-08-25
description: "通过th:if实现不同视角下的笔记详情界面显示效果。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-9-5
pinned: false
comment: true
---

通过`th:if`实现不同视角下的笔记详情界面显示效果。


如果是访客的视角，界面效果如下图9-1所示。


![图9-1 访客的视角的笔记详情界面效果](./images/9-1.png)

在该视角下，访客可以对他人笔记进行点赞、评论、收藏和分享，对笔记作者进行关注。


如果是自己的视角，界面效果如下图9-2所示。


![图9-2 自己的视角的笔记详情界面效果](./images/9-2.png)


在该视角下，笔记作者可以对该笔记进行编辑、删除、点赞、评论、收藏和分享。
