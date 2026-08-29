---
title: "实战GridFS文件存储服务"
published: 2026-08-25
description: "java"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-4-2
pinned: false
comment: true
---

### 创建文件存储服务接口

```java
package com.example.rednote.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * GridFSStorageService GridFS存储服务
 *
 * @version 2025/09/06
 **/
public interface GridFSStorageService {
    /**
     * 上传图片
     *
     * @param multipartFile
     * @return
     */
    String uploadImage(MultipartFile multipartFile);

    /**
     * 下载图片
     *
     * @param fileId
     * @return
     */
    GridFSFile downloadImage(String fileId);

    /**
     * 删除图片
     *
     * @param fileId
     */
    void deleteImage(String fileId);

    /**
     * 获取图片流
     *
     * @param fileId
     * @return
     */
    InputStream getImageStream(String fileId);
}
```


### 实现文件存储服务


```java
package com.example.rednote.service.impl;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.example.rednote.exception.FileStorageException;
import com.example.rednote.service.GridFSStorageService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * GridFSStorageServiceImpl GridFS存储服务
 *
 * @version 2025/09/06
 **/
@Service
public class GridFSStorageServiceImpl implements GridFSStorageService {
    @Autowired
    private GridFsTemplate gridFsTemplate;

    @Autowired
    private GridFSBucket gridFSBucket;

    @Override
    public String uploadImage(MultipartFile multipartFile) {
        // 创建文件元数据
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("contentType", multipartFile.getContentType());
        metadata.put("size", multipartFile.getSize());
        metadata.put("uploadDate", LocalDateTime.now());

        // 存储文件到GridFS
        try {
            ObjectId objectId = gridFsTemplate.store(
                    multipartFile.getInputStream(),
                    UUID.randomUUID().toString(),
                    multipartFile.getContentType(),
                    metadata);

            return objectId.toString();
        } catch (IOException e) {
            throw new FileStorageException("文件上传失败：" + multipartFile.getOriginalFilename(), e);
        }
    }

    @Override
    public GridFSFile downloadImage(String fileId) {
        return gridFsTemplate.findOne(new Query(Criteria.where("_id").is(fileId)));
    }

    @Override
    public void deleteImage(String fileId) {
        gridFsTemplate.delete(new Query(Criteria.where("_id").is(fileId)));
    }

    @Override
    public InputStream getImageStream(String fileId) {
        GridFSFile gridFSFile = downloadImage(fileId);
        if (gridFSFile != null) {
            return gridFSBucket.openDownloadStream(gridFSFile.getObjectId());
        }

        return null;
    }
}
```
