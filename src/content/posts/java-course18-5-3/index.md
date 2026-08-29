---
title: "全栈实战笔记详情查询功能后端接口改造"
published: 2026-08-25
description: "修改NoteController"
image: ''
tags: [Vue, 前后端分离, 实战]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course18-5-3
pinned: false
comment: true
---

### 后端接口改造

#### 修改NoteController


修改NoteController：

```java
/**
 * 显示笔记详情页面
 */
@GetMapping("/{noteId}")
/*public String showNoteDetail(@PathVariable Long noteId, Model model) {
    // 查询指定noteId的笔记
    Optional<Note> optionalNote = noteService.findNoteById(noteId);

    // 判定笔记是否存在，不存在则抛出异常
    if (!optionalNote.isPresent()) {
        throw new NoteNotFoundException("");
    }

    Note note = optionalNote.get();
    model.addAttribute("note", note);

    return "note-detail";
}*/
public ResponseEntity<?> showNoteDetail(@PathVariable Long noteId) {
    // 查询指定noteId的笔记
    Optional<Note> optionalNote = noteService.findNoteById(noteId);

    // 判定笔记是否存在，不存在则抛出异常
    if (!optionalNote.isPresent()) {
        throw new NoteNotFoundException("");
    }

    Note note = optionalNote.get();
    User currentUser = userService.getCurrentUser();
    // 将Note对象转为NoteDetailDto对象
    return ResponseEntity.ok(NoteDetailDto.toNoteDetailDto(note, currentUser));
}
```


#### 新增NoteDetailDto

为了能正确序列化，减少数据库查询和网络传输成本，创建了如下NoteDetailDto：

```java
package com.example.rednote.dto;

import com.example.rednote.entity.Note;
import com.example.rednote.entity.User;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * NoteDetailDto 笔记详情页展示DTO
 *
 * @version 2025/09/09
 **/
@Getter
@Setter
public class NoteDetailDto {
    // 以下字段来自Note
    private Long noteId;
    private String title;
    private String content;
    private List<String> images = new ArrayList<>();
    private List<String> topics = new ArrayList<>();
    private String category;
    // 以下字段来自User
    private String username;
    private String avatar;
    private Long userId;
    private boolean isLiked;
    private long likeCount;

    public static NoteDetailDto toNoteDetailDto(Note note, User currentUser) {
        NoteDetailDto noteDetailDto = new NoteDetailDto();
        noteDetailDto.setNoteId(note.getNoteId());
        noteDetailDto.setTitle(note.getTitle());
        noteDetailDto.setContent(note.getContent());
        noteDetailDto.setImages(note.getImages());
        noteDetailDto.setTopics(note.getTopics());
        noteDetailDto.setCategory(note.getCategory());
        noteDetailDto.setLikeCount(note.getLikeCount());

        User author = note.getAuthor();
        noteDetailDto.setUsername(author.getUsername());
        noteDetailDto.setAvatar(author.getAvatar());
        noteDetailDto.setUserId(author.getUserId());

        noteDetailDto.setLiked(note.isLikedByUser(currentUser.getUserId()));

        return noteDetailDto;
    }

}
```
