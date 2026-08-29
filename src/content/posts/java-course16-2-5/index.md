---
title: "缓存穿透、缓存雪崩、缓存击穿问题及解决方案"
published: 2026-08-25
description: "问题描述：大量请求查询不存在的数据，导致请求穿透到数据库。"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-2-5
pinned: false
comment: true
---

#### 1. 缓存穿透解决方案

问题描述：大量请求查询不存在的数据，导致请求穿透到数据库。

解决方案：
```java
// 缓存空值
public Note getNote(Long noteId) {
    String key = "note:" + noteId;
    Note note = (Note) redisTemplate.opsForValue().get(key);
    
    if (note == null) {
        // 从数据库查询
        note = noteRepository.findById(noteId).orElse(null);
        
        // 即使数据不存在，也缓存空值（设置较短过期时间）
        if (note == null) {
            redisTemplate.opsForValue().set(key, null, 10, TimeUnit.MINUTES);
        } else {
            redisTemplate.opsForValue().set(key, note, 1, TimeUnit.HOURS);
        }
    }
    return note;
}
```

#### 2. 缓存雪崩解决方案

问题描述：大量缓存同时过期，导致请求全部打到数据库。

解决方案：
```java
// 随机过期时间
public void cacheNote(Note note) {
    String key = "note:" + note.getId();
    
    // 基础过期时间（1小时）+ 随机偏移（0-30分钟）
    long expireTime = 3600 + new Random().nextInt(1800);
    
    redisTemplate.opsForValue().set(key, note, expireTime, TimeUnit.SECONDS);
}

// 多级缓存
public Note getNote(Long noteId) {
    String key = "note:" + noteId;
    
    // 1. 先从本地缓存获取（Caffeine）
    Note note = localCache.get(key);
    if (note != null) {
        return note;
    }
    
    // 2. 从Redis获取
    note = (Note) redisTemplate.opsForValue().get(key);
    if (note != null) {
        // 放入本地缓存
        localCache.put(key, note);
        return note;
    }
    
    // 3. 从数据库获取
    note = noteRepository.findById(noteId).orElse(null);
    if (note != null) {
        // 放入Redis和本地缓存
        redisTemplate.opsForValue().set(key, note, 1, TimeUnit.HOURS);
        localCache.put(key, note);
    }
    return note;
}
```

#### 3. 缓存击穿解决方案

问题描述：热点数据缓存过期时，大量请求同时访问该数据。

解决方案：
```java
// 互斥锁（分布式锁）
public Note getNote(Long noteId) {
    String key = "note:" + noteId;
    Note note = (Note) redisTemplate.opsForValue().get(key);
    
    if (note == null) {
        // 获取分布式锁
        String lockKey = "lock:note:" + noteId;
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, "1", 30, TimeUnit.SECONDS);
        
        if (locked) {
            try {
                // 再次检查缓存（可能其他线程已更新）
                note = (Note) redisTemplate.opsForValue().get(key);
                if (note == null) {
                    // 从数据库获取
                    note = noteRepository.findById(noteId).orElse(null);
                    if (note != null) {
                        redisTemplate.opsForValue().set(key, note, 1, TimeUnit.HOURS);
                    }
                }
            } finally {
                // 释放锁
                redisTemplate.delete(lockKey);
            }
        } else {
            // 获取锁失败，等待后重试
            Thread.sleep(100);
            return getNote(noteId);
        }
    }
    return note;
}

// 永不过期（逻辑过期）
public Note getNote(Long noteId) {
    String key = "note:" + noteId;
    NoteCacheWrapper wrapper = (NoteCacheWrapper) redisTemplate.opsForValue().get(key);
    
    if (wrapper != null) {
        // 检查是否逻辑过期
        if (wrapper.getExpireTime() < System.currentTimeMillis()) {
            // 异步更新缓存
            CompletableFuture.runAsync(() -> refreshNoteCache(noteId));
            return wrapper.getNote();
        }
        return wrapper.getNote();
    }
    
    // 缓存不存在，从数据库获取
    return noteRepository.findById(noteId).orElse(null);
}
```
