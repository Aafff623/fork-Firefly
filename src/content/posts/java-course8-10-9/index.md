---
title: "细粒度的访问控制确保只能作者修改、删除自己的笔记"
published: 2026-08-25
description: "在前面课程中介绍了，在对笔记进行编辑、删除的时候，是加了代码判断，确保只有笔记的作者才能修改、删除笔记的按钮。代码如下"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-10-9
pinned: false
comment: true
---

在前面课程中介绍了，在对笔记进行编辑、删除的时候，是加了代码判断，确保只有笔记的作者才能修改、删除笔记的按钮。代码如下：

```java
// 获取当前用户信息
User user = userService.getCurrentUser();

Note note = optionalNote.get();

// 判定笔记是否属于当前用户，不属于则抛出异常
if (!note.getAuthor().getUserId().equals(user.getUserId())) {
    throw new NoteNotFoundException("");
}

// 执行后续业务
```


但这种编程方式固然可行，但略微繁琐。本节介绍一种通过声明式的方式来实现细粒度的访问控制。


### Spring Security 的 `@PreAuthorize` 深入解析

`@PreAuthorize` 是 Spring Security 提供的一个强大注解，用于在方法调用前进行权限检查。它允许你基于表达式语言（SpEL）定义细粒度的访问控制规则，是实现方法级安全的核心工具之一。


`@PreAuthorize` 是一个方法级别的安全注解，用于在方法执行前验证当前用户是否具有执行该方法的权限。如果验证失败，Spring Security 会抛出 `AccessDeniedException`。

#### 使用场景

- 基于角色的访问控制
- 基于权限的访问控制
- 动态权限检查
- 复杂业务逻辑的权限控制

#### 基本语法

```java
@PreAuthorize("expression")
public void someMethod() {
    // 方法实现
}
```

#### 常用表达式

基于角色的访问控制

```java
@PreAuthorize("hasRole('ADMIN')")
public void adminOnlyMethod() {
    // 只有ADMIN角色可以访问
}
```

基于权限的访问控制

```java
@PreAuthorize("hasAuthority('READ_PRIVILEGE')")
public void readData() {
    // 只有拥有READ_PRIVILEGE权限的用户可以访问
}
```

组合多个条件

```java
@PreAuthorize("hasRole('USER') and hasAuthority('WRITE_PRIVILEGE')")
public void writeData() {
    // 用户必须同时具有USER角色和WRITE_PRIVILEGE权限
}
```

使用方法参数

```java
@PreAuthorize("#id == authentication.principal.id")
public void deleteUser(@PathVariable Long id) {
    // 只有用户可以删除自己的账户
}
```

自定义权限检查

```java
@PreAuthorize("@customSecurityService.checkPermission(authentication, #resourceId, 'DELETE')")
public void deleteResource(@PathVariable Long resourceId) {
    // 调用自定义服务检查权限
}
```

### 自定义权限检查是否是作者自己


在NoteService中增加接口：

```java
/**
  * 验证用户是否为笔记作者
  *
  * @param noteId
  * @param username
  * @return
  */
boolean isAuthor(Long noteId, String username);
```


在NoteServiceImpl中增加方法：

```java
@Override
public boolean isAuthor(Long noteId, String username) {
    Optional<Note> optionalNote = noteRepository.findByNoteId(noteId);
    if (!optionalNote.isPresent()) {
        throw new NoteNotFoundException("");
    }

    return username.equals(optionalNote.get().getAuthor().getUsername());
}
```

修改NoteController，在需要方法级别控制的方法上面加`@PreAuthorize`注解：

```java
@GetMapping("/{noteId}/edit")
@PreAuthorize("@noteServiceImpl.isAuthor(#noteId, authentication.name)")
public String showEditForm(@PathVariable Long noteId, Model model) {
    // ...为节约篇幅，此处省略非核心内容
}
```

```java
@PostMapping("/{noteId}")
@PreAuthorize("@noteServiceImpl.isAuthor(#noteId, authentication.name)")
public String updateNote(@PathVariable Long noteId,
                             @Valid @ModelAttribute("note") NoteEditDto noteEditDto,
                             BindingResult result,
                             Model model,
                             RedirectAttributes redirectAttributes) {
    // ...为节约篇幅，此处省略非核心内容
}
```

```java
@DeleteMapping("/{noteId}")
@PreAuthorize("@noteServiceImpl.isAuthor(#noteId, authentication.name)")
public ResponseEntity<DeleteResponseDto> deleteNote(@PathVariable Long noteId) {
    // ...为节约篇幅，此处省略非核心内容
}
```

上述`@noteServiceImpl`中的`noteServiceImpl`是指NoteServiceImpl在Spring中的Bean的名称。

### 配置要求

要使用 `@PreAuthorize`，需要在配置类上启用方法级安全：

```java
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
// 启用@PreAuthorize等注解
// 等同于老版本的@EnableGlobalMethodSecurity(prePostEnabled = true)
@EnableMethodSecurity
public class WebSecurityConfig {
    // ...为节约篇幅，此处省略非核心内容
}
```


Spring Security 的`@EnableMethodSecurity`注解用于开启方法级安全授权（Method Security），替代了旧版本中的`@EnableGlobalMethodSecurity`。以下是关键信息：

核心功能

* ‌灵活配置‌：支持基于Bean的配置方式，允许为不同授权类型（如JSR-250、Spring EL表达式等）单独设置配置。 ‌
* ‌权限校验‌：通过注解（如@PreAuthorize、@PostAuthorize）实现方法执行前后的权限验证。 ‌

与@EnableGlobalMethodSecurity的区别

* ‌版本差异‌：`@EnableMethodSecurity`是Spring Security 5.6版本引入的替代方案，而`@EnableGlobalMethodSecurity`在5.6之前使用。 ‌
* ‌配置方式‌：`@EnableMethodSecurity`支持更细粒度的配置（如JSR-250、Spring EL表达式等），而`@EnableGlobalMethodSecurity`仅提供三种预定义机制（prePostEnabled、securedEnabled、jsr250Enabled）。 ‌


### 总结

`@PreAuthorize` 提供了强大的方法级安全控制能力，通过 SpEL 表达式可以实现非常灵活的权限控制逻辑。它的主要优势包括：

1. 细粒度控制：可以精确到方法甚至方法参数级别的权限控制
2. 动态性：可以基于运行时信息（如用户属性、方法参数）进行权限检查
3. 可读性：表达式语言直观易懂，便于维护
4. 可扩展性：支持自定义 SpEL 函数和权限评估器

合理使用 `@PreAuthorize` 可以显著提高应用程序的安全性，同时保持代码的清晰和可维护性。
