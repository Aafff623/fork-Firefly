---
title: "掌握`@DeleteMapping`针对DELETE请求的特殊处理"
published: 2026-08-25
description: "在原有的NoteController基础上，增加方法以实现相关功能。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-10-7
pinned: false
comment: true
---

### 增加控制器方法

在原有的NoteController基础上，增加方法以实现相关功能。

```java
/**
 * 处理删除笔记的请求
 */
@DeleteMapping("/{noteId}")
public ResponseEntity<DeleteResponseDto> deleteNote(@PathVariable Long noteId) {
    // 检查笔记是否存在
    Optional<Note> optionalNote = noteService.findNoteById(noteId);
    if (!optionalNote.isPresent()) {
        throw new NoteNotFoundException("");
    }

    Note note = optionalNote.get();

    // 获取当前用户信息
    User user = userService.getCurrentUser();

    // 判定笔记是否属于当前用户，不属于则抛出异常
    if (!note.getAuthor().getUserId().equals(user.getUserId())) {
        throw new NoteNotFoundException("");
    }

    // 使用服务删除笔记
    noteService.deleteNote(note);

    // 返回响应的内容
    DeleteResponseDto deleteResponseDto = new DeleteResponseDto();
    deleteResponseDto.setMessage("笔记删除成功");
    deleteResponseDto.setRedirectUrl("/user/profile");

    return ResponseEntity.ok(deleteResponseDto);
}
```

注：在 Spring MVC 中使用 `@DeleteMapping` 处理删除请求后，但不能使用RedirectAttributes进行重定向。这是因为：HTTP 规范中，DELETE 请求不应该有重定向响应。浏览器在处理 DELETE 请求的重定向时可能会遇到各种问题，如安全限制、缓存问题或行为不一致。因此，使用ResponseEntity作为响应体。

### 通用删除响应对象DeleteResponseDto

ResponseEntity作为响应体所包裹的对象是DeleteResponseDto，代码如下：


```java
package com.example.rednote.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DeleteResponseDto 执行删除的响应对象
 *
 * @version 2025/06/12
 **/
@Getter
@Setter
public class DeleteResponseDto {
    /**
     * 信息
     */
    private String message;

    /**
     * 重定向URL
     */
    private String redirectUrl;
}
```

上述对象可以用于任意DELETE请求的场景。


### 增加NoteRepository方法

修改NoteRepository增加方法如下：


```java
/**
* 删除笔记
*
* @param note
*/
void delete(Note note);
```


### 删除笔记的服务

修改NoteService，增加如下接口：


```java
public interface NoteService {
 

    /**
     * 删除笔记
     *
     * @param note
     */
    void deleteNote(Note note);
}
```

修改NoteServiceImpl，实现笔记删除的方法：


```java
@Override
@Transactional
public void deleteNote(Note note) {
    // 注意：先删除数据库数据再删图片文件。以防止删除文件异常时，方便回滚数据库数据

    // 先删除数据库数据
    noteRepository.delete(note);

    // 再删图片文件
    List<String> images = note.getImages();
    for (String image : images) {
        fileStorageService.deleteFile(image);
    }
}
```

需要注意是的，上述方法既有删除文件的，又有删除数据库数据的。因此，需要加`@Transactional`进行事务管理，同时，先删库再删文件。这样，以在删除文件异常时，方便回滚数据库。
