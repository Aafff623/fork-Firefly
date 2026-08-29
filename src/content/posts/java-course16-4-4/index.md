---
title: "新增图片访问接口"
published: 2026-08-25
description: "java"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-4-4
pinned: false
comment: true
---

### 文件控制器

```java
package com.example.rednote.controller;

import com.mongodb.client.gridfs.model.GridFSFile;
import com.example.rednote.service.GridFSStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * FileController 文件控制器
 *
 * @version 2025/09/06
 **/
@RestController
@RequestMapping("/file")
public class FileController {
    @Autowired
    private GridFSStorageService gridFSStorageService;

    /**
     * 下载文件
     *
     * @param fileId
     * @return
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<Resource> downloadImage(@PathVariable String fileId) {
        GridFSFile file = gridFSStorageService.downloadImage(fileId);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        // 从元数据获取内容类型
        String contentType = file.getMetadata().getString("contentType");

        InputStreamResource resource = new InputStreamResource(gridFSStorageService.getImageStream(fileId));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(file.getLength())
                .body(resource);
    }
}
```


### 安全配置


1. 在 Spring Security 配置类中，进一步细化图片访问API的访问权限
2. 确保允许管理员或者普通用户角色访问图片访问API


修改WebSecurityConfig如下：


```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            // ...为节约篇幅，此处省略非核心内容    
            .authorizeHttpRequests(authorize -> authorize
                    // ...为节约篇幅，此处省略非核心内容

                    // 允许ADMIN、USER角色的用户访问 /file/** 的资源
                    .requestMatchers("/file/**").hasAnyRole("ADMIN", "USER")
                    // 其他请求需要认证
                    .anyRequest().authenticated()
            )

 
    ;

    return http.build();
}            
```
