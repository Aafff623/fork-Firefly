---
title: "全栈实战信息管理功能：实现用户信息展示"
published: 2026-08-25
description: "将用户信息管理功能从 Thymeleaf 后端渲染模式迁移到 Vue 3 前端渲染模式，需要对数据流转、组件设计、API 接口和安全机制进行全面调整。以下是核心改造点和实施建议。"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-4-7
pinned: false
comment: true
---

将用户信息管理功能从 Thymeleaf 后端渲染模式迁移到 Vue 3 前端渲染模式，需要对数据流转、组件设计、API 接口和安全机制进行全面调整。以下是核心改造点和实施建议。


### 架构与交互模式的核心变化
 
- Thymeleaf 模式：
  ```
  浏览器 → 表单提交 → 后端控制器 → 数据库操作 → 重定向到详情页
  ```
- Vue 3 模式：
  ```
  浏览器 → Vue 组件 → API 请求 → 后端服务 → JSON 响应 → 前端更新视图
  ```

 

### 后端接口改造


修改UserController：

```java
// 获取用户笔记列表数据在界面上展示
@GetMapping("/profile/{userId}")
/*public String profileWithNotes(Model model,
                                @PathVariable Long userId,
                                @RequestParam(defaultValue = "1") int page,
                                @RequestParam(defaultValue = "12") int size) {
    // 获取当前用户信息
    Optional<User> optionalUser = userService.findByUserId(userId);

    // 判断用户是否存在
    if (!optionalUser.isPresent()) {
        throw new UserNotFoundException("");
    }

    User user = optionalUser.get();
    model.addAttribute("user", user);

    // 获取用户笔记列表数据
    Page<Note> notePage = noteService.getNotesByUser(userId, page - 1, size);

    // 添加笔记列表数据到模型中
    model.addAttribute("notePage", notePage);
    model.addAttribute("currentPage", page);
    model.addAttribute("totalPages", notePage.getTotalPages());

    return "user-profile";
}*/
public ResponseEntity<?> profileWithNotes(
                                @PathVariable Long userId,
                                @RequestParam(defaultValue = "1") int page,
                                @RequestParam(defaultValue = "12") int size) {
    // 获取当前用户信息
    Optional<User> optionalUser = userService.findByUserId(userId);

    // 判断用户是否存在
    if (!optionalUser.isPresent()) {
        throw new UserNotFoundException("");
    }

    User user = optionalUser.get();

    // 获取用户笔记列表数据
    Page<Note> notePage = noteService.getNotesByUser(userId, page - 1, size);

    // 转为DTO
    List<NoteExploreDto> noteExploreDtoList =
            notePage.map(note ->  NoteExploreDto.toExploreDto(note, user)).getContent();

    // 添加笔记列表数据到模型中
    Map<String, Object> map = new HashMap<>();
    map.put("user", user);
    map.put("noteList", noteExploreDtoList);
    map.put("currentPage", page);
    map.put("totalPages", notePage.getTotalPages());

    return ResponseEntity.ok(map);
}
```

为了避免序列化问题，将`Page<Note>`转为了`List<NoteExploreDto>`。

### 静态资源的访问


#### 1. 后端安全配置调整


允许匿名访问静态图片资源，修改WebSecurityConfig如下：


```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
            // 禁用CSRF防护
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authorize -> authorize
                    // ...为节约篇幅，此处省略非核心内容

                    /*// 允许ADMIN、USER角色的用户访问 /file/** 的资源
                    .requestMatchers("/file/**").hasAnyRole("ADMIN", "USER")*/
                    // 允许匿名访问静态图片资源
                    .requestMatchers("/uploads/**").permitAll()
                    .requestMatchers("/file/**").permitAll()
                    // 其他请求需求认证
                    .anyRequest().authenticated()
            )
             
            // ...为节约篇幅，此处省略非核心内容 
    ;

    return http.build();
}
```

#### 2. 前端设置反向代理


修改vite.config.ts，设置针对静态图片资源的反向代理：

```ts
// 设置反向代理
server: {
  host: 'localhost',
  port: 5173, // Vue开发端口
  proxy: {
    // ...为节约篇幅，此处省略非核心内容

    '/uploads': {
      target: 'http://localhost:8080',
      changeOrigin: true
    },
    '/file': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```
