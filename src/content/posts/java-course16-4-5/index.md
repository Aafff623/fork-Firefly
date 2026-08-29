---
title: "功能扩展及优化建议"
published: 2026-08-25
description: "java"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-4-5
pinned: false
comment: true
---

### 高级功能扩展实现

#### 1. 图片缩略图生成

```java
// 上传图片并生成缩略图
public Map<String, String> uploadImageWithThumbnail(MultipartFile file) throws IOException {
    // 1. 上传原始图片
    String originalFileId = uploadImage(file);
    
    // 2. 生成缩略图
    BufferedImage originalImage = ImageIO.read(file.getInputStream());
    BufferedImage thumbnailImage = resizeImage(originalImage, 200, 200); // 调整为200x200
    
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    ImageIO.write(thumbnailImage, "jpg", baos);
    ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
    
    // 3. 上传缩略图
    Map<String, Object> thumbnailMetadata = new HashMap<>();
    thumbnailMetadata.put("contentType", "image/jpeg");
    thumbnailMetadata.put("size", baos.size());
    thumbnailMetadata.put("uploadDate", LocalDateTime.now());
    thumbnailMetadata.put("originalFileId", originalFileId);
    
    ObjectId thumbnailId = gridFsTemplate.store(
        bais, 
        "thumbnail_" + file.getOriginalFilename(), 
        "image/jpeg", 
        thumbnailMetadata
    );
    
    Map<String, String> result = new HashMap<>();
    result.put("originalFileId", originalFileId);
    result.put("thumbnailFileId", thumbnailId.toString());
    return result;
}

// 调整图片大小
private BufferedImage resizeImage(BufferedImage originalImage, int targetWidth, int targetHeight) {
    BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
    Graphics2D graphics2D = resizedImage.createGraphics();
    graphics2D.drawImage(originalImage, 0, 0, targetWidth, targetHeight, null);
    graphics2D.dispose();
    return resizedImage;
}
```


#### 2. 文件访问权限控制

```java
// 带权限验证的图片访问
@GetMapping("/secure/{fileId}")
public ResponseEntity<Resource> secureDownloadImage(@PathVariable String fileId, 
                                                   @AuthenticationPrincipal UserDetails user) {
    // 1. 查询文件元数据
    GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(fileId)));
    
    if (file == null) {
        return ResponseEntity.notFound().build();
    }
    
    // 2. 验证权限（示例：检查用户ID是否匹配）
    Long fileOwnerId = (Long) file.getMetadata().get("userId");
    Long currentUserId = getUserIdFromUserDetails(user);
    
    if (!fileOwnerId.equals(currentUserId)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
    
    // 3. 返回文件
    InputStreamResource resource = new InputStreamResource(getImageStream(fileId));
    
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
        .contentType(MediaType.parseMediaType(file.getContentType()))
        .contentLength(file.getLength())
        .body(resource);
}
```

#### 3. 文件加密存储

```java
// 上传加密文件
public String uploadEncryptedImage(MultipartFile file) throws IOException {
    // 生成加密密钥
    SecretKey secretKey = generateSecretKey();
    
    // 加密文件内容
    byte[] encryptedBytes = encrypt(file.getInputStream(), secretKey);
    
    // 存储加密文件和密钥
    Map<String, Object> metadata = new HashMap<>();
    metadata.put("contentType", file.getContentType());
    metadata.put("size", encryptedBytes.length);
    metadata.put("encryptionKey", Base64.getEncoder().encodeToString(secretKey.getEncoded()));
    
    ObjectId fileId = gridFsTemplate.store(
        new ByteArrayInputStream(encryptedBytes),
        file.getOriginalFilename(),
        file.getContentType(),
        metadata
    );
    
    return fileId.toString();
}

// 下载解密文件
public InputStream downloadDecryptedImage(String fileId) {
    GridFSFile file = downloadImage(fileId);
    
    if (file != null) {
        String encryptionKeyBase64 = (String) file.getMetadata().get("encryptionKey");
        SecretKey secretKey = decodeSecretKey(encryptionKeyBase64);
        
        return decrypt(getImageStream(fileId), secretKey);
    }
    
    return null;
}
```


 

#### 4. 监控 GridFS 性能

```bash
# 查看 GridFS 集合大小
db.fs.files.stats()
db.fs.chunks.stats()

# 监控 MongoDB 慢查询
db.setProfilingLevel(1, 100)  # 记录超过100ms的查询

# 查看 GridFS 索引
db.fs.files.getIndexes()
db.fs.chunks.getIndexes()
```

#### 5. 定期维护任务

```java
// 清理无效文件
@Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点执行
public void cleanupOrphanedChunks() {
    // 删除没有关联文件的 chunks
    gridFsTemplate.getDb().getCollection("fs.chunks").deleteMany(
        new Document("files_id", new Document("$nin", 
            gridFsTemplate.getDb().getCollection("fs.files").distinct("_id", new Document(), ObjectId.class)
        ))
    );
}

// 备份 GridFS 数据
public void backupGridFS() {
    // 使用 mongodump 备份 GridFS 集合
    ProcessBuilder processBuilder = new ProcessBuilder(
        "mongodump",
        "--uri=" + mongoProperties.getUri(),
        "--collection=fs.files",
        "--collection=fs.chunks",
        "--out=/backup/mongodb"
    );
    
    try {
        Process process = processBuilder.start();
        int exitCode = process.waitFor();
        
        if (exitCode == 0) {
            log.info("GridFS 备份成功");
        } else {
            log.error("GridFS 备份失败，退出码: {}", exitCode);
        }
    } catch (IOException | InterruptedException e) {
        log.error("执行 GridFS 备份时出错", e);
    }
}
```


#### 6. 迁移现有图片到 GridFS

如果你已有图片存储在文件系统中，可以使用以下代码迁移：

```java
// 从文件系统迁移图片到 GridFS
public void migrateImagesFromFileSystem(String sourceDirectory) throws IOException {
    Path directory = Paths.get(sourceDirectory);
    
    try (DirectoryStream<Path> stream = Files.newDirectoryStream(directory)) {
        for (Path path : stream) {
            if (Files.isRegularFile(path)) {
                String fileName = path.getFileName().toString();
                String contentType = Files.probeContentType(path);
                
                try (InputStream is = Files.newInputStream(path)) {
                    gridFsTemplate.store(is, fileName, contentType);
                    log.info("已迁移文件: {}", fileName);
                }
            }
        }
    }
}
```


### 性能优化

#### 1. 配置 MongoDB 分片集群


MongoDB 分片集群配置


```properties
# MongoDB 分片集群配置
spring.data.mongodb.uri=mongodb://shard1.example.com:27017,shard2.example.com:27017,shard3.example.com:27017/rednote?replicaSet=myReplicaSet&sharded=true
```

#### 2. 图片缓存策略

```java
// 使用 Redis 缓存热门图片
public InputStream getCachedImage(String fileId) {
    // 先从 Redis 缓存获取
    String cacheKey = "image_cache:" + fileId;
    byte[] imageBytes = redisTemplate.opsForValue().get(cacheKey);
    
    if (imageBytes != null) {
        return new ByteArrayInputStream(imageBytes);
    }
    
    // 从 GridFS 获取
    GridFSFile file = downloadImage(fileId);
    if (file != null) {
        try (InputStream is = getImageStream(fileId);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                baos.write(buffer, 0, bytesRead);
            }
            
            imageBytes = baos.toByteArray();
            
            // 缓存到 Redis（设置合理的过期时间）
            redisTemplate.opsForValue().set(cacheKey, imageBytes, 1, TimeUnit.HOURS);
            
            return new ByteArrayInputStream(imageBytes);
        } catch (IOException e) {
            // 处理异常
        }
    }
    
    return null;
}
```

#### 3. 异步上传处理

```java
// 异步上传服务
@Service
public class AsyncUploadService {
    
    @Async("uploadExecutor")
    public CompletableFuture<String> uploadImageAsync(MultipartFile file) {
        try {
            String fileId = gridFSStorageService.uploadImage(file);
            return CompletableFuture.completedFuture(fileId);
        } catch (IOException e) {
            return CompletableFuture.failedFuture(e);
        }
    }
}

// 配置异步线程池
@Configuration
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("upload-");
        executor.initialize();
        return executor;
    }
}
```


通过以上方案，你可以在小红书项目中高效地使用 MongoDB GridFS 存储用户上传的图片，解决大文件存储问题，并获得良好的扩展性和性能。
