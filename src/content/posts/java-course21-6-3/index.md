---
title: "修改笔记服务"
published: 2026-08-25
description: "修改NoteService的createNote接口"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-6-3
pinned: false
comment: true
---

### 修改createNote

修改NoteService的createNote接口：


```java
Note createNote(NotePublishDto notePublishDto, UserDto author);
```


修改NoteServiceImpl的createNote方法：


```java
@Autowired
//private GridFSStorageService gridFSStorageService;
private FileServiceClient fileServiceClient;

@Transactional
@Override
/*public Note createNote(NotePublishDto notePublishDto, User author) {
    // 递增
    redisTemplate.opsForValue().increment(NOTE_COUNT_KEY);

    Note note = new Note();

    // 字符串转为List
    note.setTopics(StringUtil.splitToList(notePublishDto.getTopics()," "));
    note.setTitle(notePublishDto.getTitle());
    note.setContent(notePublishDto.getContent());
    note.setCategory(notePublishDto.getCategory());
    note.setAuthor(author);

    // 处理图片上传
    if (notePublishDto.getImages() != null) {
        for (MultipartFile image : notePublishDto.getImages()) {
            if (!image.isEmpty()) {
                *//*String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                String fileUrl = fileStorageService.saveFile(image, fileName);*//*
                String fileId = gridFSStorageService.uploadImage(image);
                String fileUrl = MongoConfig.STATIC_PATH_PREFIX + fileId;
                note.getImages().add(fileUrl);
            }
        }
    }

    return noteRepository.save(note);
}*/
public Note createNote(NotePublishDto notePublishDto, UserDto author) {
    // 递增
    redisTemplate.opsForValue().increment(NOTE_COUNT_KEY);

    Note note = new Note();

    // 字符串转为List
    note.setTopics(StringUtil.splitToList(notePublishDto.getTopics()," "));
    note.setTitle(notePublishDto.getTitle());
    note.setContent(notePublishDto.getContent());
    note.setCategory(notePublishDto.getCategory());

    // 用户对象改为了用户ID
    note.setUserId(author.getUserId());

    // 处理图片上传
    if (notePublishDto.getImages() != null) {
        for (MultipartFile image : notePublishDto.getImages()) {
            if (!image.isEmpty()) {
                // 调用文件领域微服务客户端
                String fileId = fileServiceClient.uploadImage(image).getBody().toString();
                String fileUrl = FileConstant.STATIC_PATH_PREFIX + fileId;
                note.getImages().add(fileUrl);
            }
        }
    }

    return noteRepository.save(note);
}
```


### 修改deleteNote

修改NoteServiceImpl的deleteNote方法：


```java
@Override
@Transactional
/*public void deleteNote(Note note) {
    // 递增
    redisTemplate.opsForValue().decrement(NOTE_COUNT_KEY);

    // 注意：先删库再删文件。以防止删除文件异常时，方便回滚数据库

    // 删除笔记
    noteRepository.delete(note);

    // 删除所有关联图片
    for (String imageUri : note.getImages()) {
        // 删除旧头像照片
        *//*fileStorageService.deleteFile(imageUri);*//*
        String fileId = imageUri.substring(MongoConfig.STATIC_PATH_PREFIX.length());
        gridFSStorageService.deleteImage(fileId);
    }
}*/
public void deleteNote(Note note) {
    // 递增
    redisTemplate.opsForValue().decrement(NOTE_COUNT_KEY);

    // 注意：先删库再删文件。以防止删除文件异常时，方便回滚数据库

    // 删除笔记
    noteRepository.delete(note);

    // 删除所有关联图片
    for (String imageUri : note.getImages()) {
        // 删除旧头像照片
        /*fileStorageService.deleteFile(imageUri);*/
        String fileId = imageUri.substring(FileConstant.STATIC_PATH_PREFIX.length());
        fileServiceClient.deleteImage(fileId);
    }
}
```

### 修改isAuthor

修改NoteServiceImpl的isAuthor方法：


```java
@Autowired
private UserServiceClient userServiceClient;

@Override
/*public boolean isAuthor(Long noteId, String username) {
    Note note = noteRepository.findByNoteId(noteId)
            .orElseThrow(() -> new NoteNotFoundException(""));

    return note.getAuthor().getUsername().equals(username);
}*/
public boolean isAuthor(Long noteId, String username) {
    Note note = noteRepository.findByNoteId(noteId)
            .orElseThrow(() -> new NoteNotFoundException(""));

    UserDto userDto = userServiceClient.findByUsername(username).getBody();

    return note.getUserId().equals(userDto.getUserId());
}
```


### 修改toExploreDto

修改NoteServiceImpl的toExploreDto方法：


```java
@Override
public NoteExploreDto toExploreDto(Note note, UserDto user) {
    NoteExploreDto noteExploreDto = new NoteExploreDto();
    noteExploreDto.setNoteId(note.getNoteId());
    noteExploreDto.setTitle(note.getTitle());
    noteExploreDto.setCover(note.getImages().get(0));
    /*noteExploreDto.setUsername(note.getAuthor().getUsername());
    noteExploreDto.setAvatar(note.getAuthor().getAvatar());
    noteExploreDto.setUserId(note.getAuthor().getUserId());*/
    noteExploreDto.setUsername(user.getUsername());
    noteExploreDto.setAvatar(user.getAvatar());
    noteExploreDto.setUserId(user.getUserId());
    // 赋值isLiked、likeCount属性
    noteExploreDto.setLiked(note.isLikedByUser(user.getUserId()));
    noteExploreDto.setLikeCount(note.getLikeCount());

    return noteExploreDto;
}
```
