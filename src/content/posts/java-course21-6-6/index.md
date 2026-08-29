---
title: "修改首页笔记探索控制器支持调用用户领域微服务"
published: 2026-08-25
description: "修改ExploreController，在原调用UserService地方改为用UserServiceClient"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-6-6
pinned: false
comment: true
---

### 在ExploreController调用用户领域微服务Feign客户端


修改ExploreController，在原调用UserService地方改为用UserServiceClient：


```java
@GetMapping("/note")
public ResponseEntity<NoteResponseDto> getNotesByCategory(
                              @RequestParam(defaultValue = "1") int page,
                              @RequestParam(required = false) String category,
                              @RequestParam(required = false) String query) {

    // ...为节约篇幅，此处省略非核心内容

    /*User currentUser = userService.getCurrentUser();*/

    List<NoteExploreDto> noteExploreDtoList = new ArrayList<>();
    for (Note note : notes.getContent()) {
        /*noteExploreDtoList.add(NoteExploreDto.toExploreDto(note, currentUser));*/
        UserDto author = userServiceClient.findByUserId(note.getUserId()).getBody();
        noteExploreDtoList.add(noteService.toExploreDto(note, author));
    }
    notesResponseDto.setNotes(noteExploreDtoList);

    ResponseEntity<NoteResponseDto> responseEntity = ResponseEntity.ok(notesResponseDto);
    return responseEntity;
}
```
