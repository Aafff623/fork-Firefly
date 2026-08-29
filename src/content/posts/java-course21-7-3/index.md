---
title: "启用全局事务管理"
published: 2026-08-25
description: "在以下方法上增加@GlobalTransactional事务。"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-7-3
pinned: false
comment: true
---

在以下方法上增加`@GlobalTransactional`事务。


NoteServiceImpl：

```java
/*@Transactional*/
@Override
@GlobalTransactional
public Note createNote(NotePublishDto notePublishDto, UserDto author) {
  // ...为节约篇幅，此处省略非核心内容
} 

/*@Transactional*/
@Override
@GlobalTransactional
public void deleteNote(Note note) {
  // ...为节约篇幅，此处省略非核心内容
} 
```

UserController：

```java
@PostMapping("/edit")
@GlobalTransactional
public ResponseEntity<?> updateProfile(@RequestParam(required = true) String phone,
                                        @RequestParam(required = false) String bio,
                            @RequestParam(required = false, value = "avatarFile") MultipartFile file) {
  // ...为节约篇幅，此处省略非核心内容
} 
```


对于标记了 `@GlobalTransactional` 的方法（协调远程调用和本地操作），可以省略 `@Transactional`，因为：

* `@GlobalTransactional` 已隐含了本地事务的管理能力（默认会创建本地事务）。
* 叠加使用不会报错，但属于冗余配置（`@GlobalTransactional` 优先级更高）。
