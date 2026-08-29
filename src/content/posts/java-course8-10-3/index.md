---
title: "NoteController控制器来处理笔记编辑请求"
published: 2026-08-25
description: "在原有的NoteController基础上，增加方法以实现相关功能。"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-10-3
pinned: false
comment: true
---

在原有的NoteController基础上，增加方法以实现相关功能。

### 创建笔记编辑DTO


```java
package com.example.rednote.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * NoteEditDto 笔记编辑DTO
 *
 * @version 2025/08/19
 **/
@Getter
@Setter
public class NoteEditDto {
    @NotNull
    private Long noteId;

    @NotEmpty(message = "标题不能为空")
    @Size(max = 60, message = "标题长度不能超过60个字符")
    private String title;

    @NotEmpty(message = "内容不能为空")
    @Size(max = 900, message = "内容长度不能超过900个字符")
    private String content;

    private String topics;

    @NotEmpty(message = "分类不能为空")
    private String category;

    private List<String> images = new ArrayList<>();
}
```

### 处理用户访问笔记编辑界面展示

新增方法如下。


```java
/**
 * 显示笔记编辑页面
 */
@GetMapping("/{noteId}/edit")
public String showEditForm(@PathVariable Long noteId, Model model) {
    // 查询指定noteId的笔记
    Optional<Note> optionalNote = noteService.findNoteById(noteId);

    // 判定笔记是否存在，不存在则抛出异常
    if (!optionalNote.isPresent()) {
        throw new NoteNotFoundException("");
    }

    // 获取当前用户信息
    User user = userService.getCurrentUser();

    Note note = optionalNote.get();

    // 判定笔记是否属于当前用户，不属于则抛出异常
    if (!note.getAuthor().getUserId().equals(user.getUserId())) {
        throw new NoteNotFoundException("");
    }

    // 将Note对象转为NoteEditDto对象
    NoteEditDto noteEditDto = new NoteEditDto();
    noteEditDto.setNoteId(note.getNoteId());
    noteEditDto.setTitle(note.getTitle());
    noteEditDto.setContent(note.getContent());
    noteEditDto.setCategory(note.getCategory());
    noteEditDto.setImages(note.getImages());

    // 话题的List要转为String
    noteEditDto.setTopics(StringUtil.joinToString(note.getTopics(), " "));

    model.addAttribute("note", noteEditDto);

    return "note-edit";
}
```

当用户使用GET请求访问`/note/{noteId}/edit`时，则会返回note-edit.html模板页面。


需要注意是的，返回前端的NoteEditDto的topics是字符串类型，因此从Note获取到值之后，需要通过StringUtil.joinToString()工具做转换。


```java
public class StringUtil {
    // ...为节约篇幅，此处省略非核心内容

    // List转字符串
    public static String joinToString(List<String> source, String regex) {
        return String.join(regex, source);
    }
}
```


### 控制器处理用户笔记编辑请求

新增方法如下。


```java
/**
 * 处理笔记编辑请求
 */
@PostMapping("/{noteId}")
public String updateNote(@PathVariable Long noteId,
                            @Valid @ModelAttribute("note") NoteEditDto noteEditDto,
                            BindingResult result,
                            Model model,
                            RedirectAttributes redirectAttributes) {
    // 验证表单
    if (result.hasErrors()) {
        model.addAttribute("note", noteEditDto);
        return "note-edit";
    }

    // 检查笔记是否存在
    Optional<Note> optionalNote = noteService.findNoteById(noteId);
    if (!optionalNote.isPresent()) {
        throw new NoteNotFoundException("");
    }

    Note note = optionalNote.get();

    try {
        noteService.updateNote(note, noteEditDto);
        redirectAttributes.addFlashAttribute("success", "笔记更新成功");
        return "redirect:/note/" + noteId;
    } catch (Exception e) {
        log.error("笔记更新失败：{}", e.getMessage(), e);

        model.addAttribute("error", "笔记更新失败：" + e.getMessage());
        model.addAttribute("note", noteEditDto);
        return "note-edit";
    }
} 
```


当用户使用POST请求访问`/note/{noteId}`时，将修改后的笔记数据保存入库。
