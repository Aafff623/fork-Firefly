---
title: "扩展全局异常处理器，处理评论模块中可能出现的异常"
published: 2026-08-25
description: "java"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-14-6
pinned: false
comment: true
---

```java
package com.example.rednote.exception;

/**
 * CommentNotFoundException 评论不存在异常
 *
 * @version 2025/08/22
 **/
public class CommentNotFoundException extends ValidationException {
    public CommentNotFoundException(String message) {
        super("评论不存在异常. " + message);
    }

    public CommentNotFoundException(String message, Throwable cause) {
        super("评论不存在异常. " + message, cause);
    }
}
```


```java
@ControllerAdvice
public class GlobalExceptionHandler {

    //  ...为节约篇幅，此处省略非核心内容

    // 评论不存在异常
    @ExceptionHandler(CommentNotFoundException.class)
    public String handleCommentNotFoundException(CommentNotFoundException ex, Model model) {
        logger.error("评论不存在异常: {}", ex.getMessage(), ex);

        model.addAttribute("errorCode", 404);
        model.addAttribute("errorMessage", "异常信息: " + ex.getMessage());
        
        return "400-error";
    }
}
```
