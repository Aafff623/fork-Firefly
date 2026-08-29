---
title: "完善笔记发布后的查看笔记功能"
published: 2026-08-25
description: "java"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-9-7
pinned: false
comment: true
---

### 修改NoteController返回笔记对象模型

```java
@PostMapping("/publish")
public String publishNote(@Valid @ModelAttribute("note") NotePublishDto notePublishDto,
                          BindingResult bindingResult,
                          Model model) {
    // 验证表单
    if (bindingResult.hasErrors()) {
        model.addAttribute("note", notePublishDto);
        return "note-publish";
    } else {
        // 获取当前用户
        User currentUser = userService.getCurrentUser();

        // 创建笔记
        // noteService.createNote(notePublishDto, currentUser);
        Note note = noteService.createNote(notePublishDto, currentUser);
        model.addAttribute("note", note);
        
        // 返回成功响应
        return "note-publish-success";
    }
}
```


### 修改note-publish-success查看笔记按钮点击事件

```html
<div class="btn-group">
  <!--<button class="btn-view" onclick="goToNote()">查看笔记</button>-->
  <button class="btn-view" th:onclick="goToNote([[${note.noteId}]])">查看笔记</button>
  <button class="btn-continue" onclick="continuePublish()">继续发布</button>
</div>


<script>
  // 查看笔记（模拟跳转）
  function goToNote(noteId) {
      // 真实笔记ID
      // window.location.href = "/note/12345";
      window.location.href = "/note/" + noteId;
  }
</script>
```
