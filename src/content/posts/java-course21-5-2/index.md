---
title: "修改用户控制器支持调用文件领域微服务"
published: 2026-08-25
description: "在公共模块下新建src/main/java/com/example/rednote/common/interfaces/client/FileServiceClient.java，使用fallback实…"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-5-2
pinned: false
comment: true
---

### 配置Feign客户端实现熔断降级


在公共模块下新建`src/main/java/com/example/rednote/common/interfaces/client/FileServiceClient.java`，使用fallback实现熔断降级：


```java
package com.example.rednote.common.interfaces.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * FileServiceClient FileService Feign Client
 *
 * @version 2025/07/21
 **/
@FeignClient(
        name = "rednote-file-microservice",
        fallback = FileServiceClientFallback.class // 指定降级实现类
)
public interface FileServiceClient {
    @PostMapping(value = "/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<String> uploadImage(@RequestPart("file") MultipartFile file);

    @DeleteMapping("/file/{fileId}")
    ResponseEntity<String> deleteImage(@PathVariable String fileId);
}
```


在公共模块下新建`src/main/java/com/example/rednote/common/interfaces/client/FileServiceClientFallback.java`：


```java
package com.example.rednote.common.interfaces.client;

import com.example.rednote.common.dto.ErrorResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * FileServiceClientFallback FileServiceClient Fallback
 *
 * @version 2025/07/21
 **/
// 降级实现类
@Component
class FileServiceClientFallback implements FileServiceClient {

    @Override
    public ResponseEntity<String> uploadImage(MultipartFile file) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }

    @Override
    public ResponseEntity<String> deleteImage(String fileId) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(null);
    }
}
```


### 在Controller调用Feign客户端


修改UserController，在原调用GridFSStorageService地方改为用FileServiceClient：


```java
@Autowired
//private GridFSStorageService gridFSStorageService;
private FileServiceClient fileServiceClient;

@PostMapping("/edit")
public ResponseEntity<?> updateProfile(@RequestParam(required = true) String phone,
                                        @RequestParam(required = false) String bio,
                            @RequestParam(required = false, value = "avatarFile") MultipartFile file) {
    User currentUser = userService.getCurrentUser();
    String oldAvatar = currentUser.getAvatar();
    String fileUrl = null;
    Map<String, String> map = new HashMap<>();

    // 验证文件类型和大小
    if (file !=null && !file.isEmpty()) {
        // 验证文件类型
        String contentType = file.getContentType();
        if (!contentType.startsWith("image/")) {
            map.put("error", "请上传图片文件");
            return ResponseEntity.ok(map);
        }

        // 处理头像上传
        /*
        String fileId = gridFSStorageService.uploadImage(file);
        fileUrl = MongoConfig.STATIC_PATH_PREFIX + fileId;
        currentUser.setAvatar(fileUrl);

        // 删除旧头像照片
        if (oldAvatar !=null && !oldAvatar.isEmpty()) {
            String oldFileId = oldAvatar.substring(MongoConfig.STATIC_PATH_PREFIX.length());
            gridFSStorageService.deleteImage(oldFileId);
        }*/
        String fileId = fileServiceClient.uploadImage(file).getBody().toString();
        fileUrl = FileConstant.STATIC_PATH_PREFIX + fileId;
        currentUser.setAvatar(fileUrl);

        // 删除旧头像照片
        if (oldAvatar !=null && !oldAvatar.isEmpty()) {
            String oldFileId = oldAvatar.substring(FileConstant.STATIC_PATH_PREFIX.length());
            fileServiceClient.deleteImage(oldFileId);
        }
    }

    // 更新用户信息
    currentUser.setPhone(phone);
    currentUser.setBio(bio);

    userService.updateUser(currentUser);

    map.put("success", "个人信息更新成功");
    return ResponseEntity.ok(map);
}
```


### 修改常量

将MongoConfig的常量STATIC_PATH_PREFIX，移动到在公共模块下新类`src/main/java/com/example/rednote/common/constant/FileConstant.java`中：


```java
package com.example.rednote.common.constant;

/**
 * FileConstant 文件常量
 *
 * @version 2025/07/21
 **/
public class FileConstant {
    public static String STATIC_PATH_PREFIX = "/file/";
}
```
