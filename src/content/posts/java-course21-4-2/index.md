---
title: "新增文件删除接口"
published: 2026-08-25
description: "修改FileController，新增文件删除接口"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-4-2
pinned: false
comment: true
---

修改FileController，新增文件删除接口：

```java
/**
 * 删除文件
 *
 * @param fileId
 * @return
 */
@DeleteMapping("/{fileId}")
public ResponseEntity<String> deleteImage(@PathVariable String fileId) {
    // 验证文件是否存在
    GridFSFile file = gridFSStorageService.downloadImage(fileId);

    if (file == null) {
        return ResponseEntity.ok("文件不存在");
    }

    gridFSStorageService.deleteImage(fileId);

    return ResponseEntity.ok("文件删除成功");
}
```
