---
title: "重构头像和笔记图片上传接口"
published: 2026-08-25
description: "修改UserController"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-4-3
pinned: false
comment: true
---

### 重构头像上传接口


修改UserController


```java
/*@Autowired
    private FileStorageService fileStorageService;*/

@Autowired
private GridFSStorageService gridFSStorageService;

@Transactional
@PostMapping("/edit")
public String updateProfile(@ModelAttribute User user, RedirectAttributes redirectAttributes,
                            @RequestParam("avatarFile") MultipartFile avatarFile) {
    User currentUser = userService.getCurrentUser();
    String oldAvatar = currentUser.getAvatar();

    // 验证文件类型和大小
    if (avatarFile != null && !avatarFile.isEmpty()) {
        // 验证文件类型
        String contentType = avatarFile.getContentType();
        if (!contentType.startsWith("image/")) {
            redirectAttributes.addFlashAttribute("error", "请上传图片文件");

            return "redirect:/user/edit";
        }

        /*// 文件名
        String fileName = avatarFile.getOriginalFilename();*/

        // 处理文件上传
        /*String fileUrl = fileStorageService.saveFile(avatarFile, fileName);*/
        String fileId = gridFSStorageService.uploadImage(avatarFile);
        String fileUrl = MongoConfig.STATIC_PATH_PREFIX + fileId;

        currentUser.setAvatar(fileUrl);

        // 删除旧头像文件
        /*fileStorageService.deleteFile(oldAvatar);*/
        if (oldAvatar != null && !oldAvatar.isEmpty()) {
            String oldFileId = oldAvatar.substring(oldAvatar.lastIndexOf("/") + 1);
            gridFSStorageService.deleteImage(oldFileId);
        }
    }

    // 更新用户信息
    // ...为节约篇幅，此处省略非核心内容
}
```

### 重构笔记图片上传服务

修改NoteServiceImpl


```java
/*@Autowired
    private FileStorageService fileStorageService;*/

@Autowired
private GridFSStorageService gridFSStorageService;

@Transactional
@Override
public Note createNote(NotePublishDto notePublishDto, User author) {
    // 递增
    // ...为节约篇幅，此处省略非核心内容

    // 处理图片上传
    List<MultipartFile> images = notePublishDto.getImages();
    if (images != null) {
        for (MultipartFile image : images) {
            if (!image.isEmpty()) {
                /*String fileName = image.getOriginalFilename();
                String fileUrl = fileStorageService.saveFile(image, fileName);*/
                String fileId = gridFSStorageService.uploadImage(image);
                String fileUrl = MongoConfig.STATIC_PATH_PREFIX + fileId;

                note.getImages().add(fileUrl);
            }

        }
    }

    return noteRepository.save(note);
}

@Override
@Transactional
public void deleteNote(Note note) {
    // 递增
    // ...为节约篇幅，此处省略非核心内容

    // 再删图片文件
    List<String> images = note.getImages();
    for (String image : images) {
        /*fileStorageService.deleteFile(image);*/
        String fileId = image.substring(image.lastIndexOf("/") + 1);
        gridFSStorageService.deleteImage(fileId);
    }
}
```
