---
title: "建立全链路埋点与监控体系让数据驱动决策效率提升"
published: 2026-08-25
description: "修改note-detail.html"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-3-3
pinned: false
comment: true
---

### 前端埋点


修改note-detail.html：


```js
// 笔记浏览埋点，记录浏览时长
// 记录浏览开始时间
const startTime = new Date().getTime();

// 页面卸载时发送浏览事件
window.addEventListener('pagehide', function() {
    // 获取笔记ID、用户ID、浏览时长
    const noteId = document.querySelector('.comment-btn').dataset.noteId;
    const currentUserId = document.querySelector('meta[name="currentUserId"]')?.content;
    const browseTime = new Date().getTime() - startTime;

    // 发送浏览事件到后端
    fetch('/log/browse', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]')?.content
        },
        body: JSON.stringify({
            userId: parseInt(currentUserId),
            noteId: parseInt(noteId),
            browseTime: browseTime,
            userAgent: navigator.userAgent
        })
    }).catch(error => {
        // 添加错误处理，避免埋点错误影响用户体验
        console.error('埋点上报失败:', error);
    });
});
```

### 后端日志收集服务

新建控制器：

```java
package com.example.rednote.controller;

import com.example.rednote.dto.BrowseEvent;
import com.example.rednote.service.KafkaProducerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * LogController 日志收集控制器
 *
 * @version 2025/09/05
 **/
@RestController
@RequestMapping("/log")
public class LogController {

    @Autowired
    private KafkaProducerService kafkaProducerService;

    // 记录浏览事件
    @PostMapping("/browse")
    public ResponseEntity<Void> logBrowseEvent(@RequestBody BrowseEvent event) {
        // 设置事件戳
        event.setTimestamp(LocalDateTime.now());

        // 发送到Kafka
        kafkaProducerService.sendUserActionEvent(event);

        return ResponseEntity.ok().build();
    }
}
```


### 安全配置


1. 在 Spring Security 配置类中，进一步细化浏览事件API的访问权限
2. 确保只有普通用户角色可以访问浏览事件API


修改WebSecurityConfig如下：


```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            // ...为节约篇幅，此处省略非核心内容    
            .authorizeHttpRequests(authorize -> authorize
                    // ...为节约篇幅，此处省略非核心内容

                    // 允许USER角色的用户访问 /log/** 的资源
                    .requestMatchers("/log/**").hasRole("USER")
                    // 其他请求需要认证
                    .anyRequest().authenticated()
            )

 
    ;

    return http.build();
}            
```
