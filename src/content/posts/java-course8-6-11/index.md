---
title: "Spring MVC实现头像图片上传"
published: 2026-08-25
description: "在 Spring MVC 中实现头像上传功能，需要处理文件接收、存储、安全验证和 URL 管理等多个环节。下面我将详细介绍实现步骤和最佳实践。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-6-11
pinned: false
comment: true
---

在 Spring MVC 中实现头像上传功能，需要处理文件接收、存储、安全验证和 URL 管理等多个环节。下面我将详细介绍实现步骤和最佳实践。

文件上传配置：

* 表单使用 enctype="multipart/form-data"
* 需要在控制器中处理 MultipartFile 参数


### 静态资源映射配置

新增Spring MVC的配置文件WebMvcConfig.java，用于映射文件上传目录到URL路径：


```java
package com.example.rednote.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebMvcConfig MVC配置
 *
 * @version 2025/08/18
 **/
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    // 文件存储根路径，可以配置在应用配置文件中
    @Value("${file.upload-dir:./rednote}")
    private String uploadDir;

    // 静态资源访问路径前缀，可以配置在应用配置文件中
    @Value("${file.static-path-prefix:/uploads/}")
    private String staticPathPrefix;

    // 添加资源处理器
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + staticPathPrefix);
    }
}
```


### 控制器实现

修改UserController控制器，增加对头像上传的处理：

```java
import org.springframework.transaction.annotation.Transactional;

// ...为节约篇幅，此处省略非核心内容

@Autowired
private FileStorageService fileStorageService;

@Transactional
@PostMapping("/edit")
public String updateProfile(@ModelAttribute User user, RedirectAttributes redirectAttributes,
                            @RequestParam("avatarFile") MultipartFile avatarFile) {
    User currentUser = userService.getCurrentUser();
    String oldAvatar = currentUser.getAvatar();

    // 验证文件类型和大小
    if (avatarFile != null && !avatarFile.isEmpty()) {
        // 验证文件类型
        String contentType = avatarFile.getContentType();
        if (!contentType.startsWith("image/")) {
            redirectAttributes.addFlashAttribute("error", "请上传图片文件");

            return "redirect:/user/edit";
        }

        // 文件名
        String fileName = avatarFile.getOriginalFilename();

        // 处理文件上传
        String fileUrl = fileStorageService.saveFile(avatarFile, fileName);
        currentUser.setAvatar(fileUrl);

        // 删除旧头像文件
        fileStorageService.deleteFile(oldAvatar);
    }

    // 更新用户信息
    currentUser.setPhone(user.getPhone());
    /*currentUser.setAvatar(user.getAvatar());*/
    currentUser.setBio(user.getBio());

    // 修改内容保存到数据库
    userService.updateUser(currentUser);

    // 重定向到指定页面，并传递参数
    redirectAttributes.addFlashAttribute("success", "个人信息更新成功");

    return "redirect:/user/profile";
}
```

其中

* MultipartFile用于处理头像文件
* FileStorageService.saveFile()用于保存文件
* FileStorageService.deleteFile()用于删除文件


### 文件存储服务接口


接口如下：


```java
package com.example.rednote.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * FileStorageService 文件存储服务
 *
 * @version 2025/06/07
 **/
public interface FileStorageService {

    /**
     * 保存文件
     *
     * @param file     上传的文件
     * @param fileName 文件名
     * @return 文件访问路径
     */
    String saveFile(MultipartFile file, String fileName);

    /**
     * 删除文件
     *
     * @param filePath 文件路径
     */
    void deleteFile(String filePath);

}
```
