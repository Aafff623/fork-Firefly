---
title: "新增文件上传接口"
published: 2026-08-25
description: "修改FileController，新增文件上传接口"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-4-1
pinned: false
comment: true
---

修改FileController，新增文件上传接口：

```java
/**
 * 上传文件
 *
 * @param file
 * @return
 */
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<String> uploadImage(@RequestPart("file") MultipartFile file) {
    String fileId = null;

    // 验证文件
    if (file != null && !file.isEmpty()) {
        // 处理文件上传
        fileId = gridFSStorageService.uploadImage(file);
    }

    return ResponseEntity.ok(fileId);
}
```

服务间调用使用 Feign 客户端，文件上传需要通过 multipart/form-data 格式传输，但 Feign 客户端默认不会自动设置该格式，也不会正确处理 MultipartFile 类型参数，导致服务端接收的请求不是 multipart 类型。Feign 客户端必须显式指定请求类型为 multipart/form-data，并使用 @RequestPart 注解接收文件。
