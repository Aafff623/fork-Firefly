---
title: "修改点赞控制器支持调用用户领域微服务"
published: 2026-08-25
description: "修改LikeController，在原调用UserService地方改为用UserServiceClient"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-6-4
pinned: false
comment: true
---

### 在LikeController调用用户领域微服务Feign客户端


修改LikeController，在原调用UserService地方改为用UserServiceClient：


```java
@Autowired
//private UserService userService;
private UserServiceClient userServiceClient;

@PostMapping("/{noteId}")
public ResponseEntity<?> toggleLike(@PathVariable Long noteId) {
    /*User currentUser = userService.getCurrentUser();*/
    UserDto currentUser = userServiceClient.getCurrentUser().getBody();

    boolean isLiked = likeService.toggleLike(noteId, currentUser);
    long likeCount = likeService.getLikeCount(noteId);

    return ResponseEntity.ok(new LikeResponseDto(isLiked, likeCount));
}
```

### 修改点赞服务


修改LikeService的toggleLike接口：


```java
/**
 * 点赞/取消点赞
 *
 * @param noteId
 * @param user
 * @return
 */
/*boolean toggleLike(Long noteId, User user);*/
boolean toggleLike(Long noteId, UserDto user);
```


修改LikeServiceImpl的toggleLike方法：


```java
@Override
@Transactional
public boolean toggleLike(Long noteId, UserDto user) {
    // ...为节约篇幅，此处省略非核心内容
    } else {
        // ...为节约篇幅，此处省略非核心内容

        // 数据库增加数据
        Like like = new Like();

        // 将用户对象改为了用户ID
        /*like.setUser(user);*/
        like.setUserId(user.getUserId());
        like.setNote(note);
        likeRepository.save(like);
        return true;
    }
}
```
