---
title: "缓存用户总数、笔记总数快速响应前端请求"
published: 2026-08-25
description: "将用户总数、笔记总数等数据存储在 Redis 中，可以快速响应前端请求，显著提升用户体验。"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-2-4
pinned: false
comment: true
---

将用户总数、笔记总数等数据存储在 Redis 中，可以快速响应前端请求，显著提升用户体验。 


### 数据模型设计

#### 1. 用户总数模型

使用原子计数器存储用户总数：

```
// 用户总数（原子计数器）
KEY: "rednote:user:user_count"
VALUE: 用户总数数量
```

#### 2. 笔记总数模型

使用原子计数器存储评论总数：

```
// 评论总数（原子计数器）
KEY: "rednote:note:note_count"
VALUE: 笔记总数数量
```


### 实现方案

#### 1. 用户总数功能实现

```java
import org.springframework.data.redis.core.RedisTemplate;

// ...为节约篇幅，此处省略非核心内容

@Service
public class UserServiceImpl implements UserService {

    private static final String USER_COUNT_KEY = "rednote:user:user_count";

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // 注入密码编码器

    @Override
    @Transactional
    public void registerUser(UserRegistrationDto registrationDto) {
        // 在Redis增加用户数
        redisTemplate.opsForValue().increment(USER_COUNT_KEY);

        // 创建新用户
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setPhone(registrationDto.getPhone());

        // 加密密码
        /*user.setPassword(registrationDto.getPassword());*/
        String encodedPassword = passwordEncoder.encode(registrationDto.getPassword());
        user.setPassword(encodedPassword);

        // 保存用户
        userRepository.save(user);
    }
 
    @Override
    public long countUsers() {
        // 从Redis中获取用户数
        String userCountFromRedis = redisTemplate.opsForValue().get(USER_COUNT_KEY);
        // 判断Redis是否命中
        if (userCountFromRedis != null) {
            // 命中，直接返回
            return Long.parseLong(userCountFromRedis);
        } else {
            // 未命中，从数据库中查询
            long userCountFromDb = userRepository.count();
            // 保存用户数到Redis中
            redisTemplate.opsForValue().set(USER_COUNT_KEY, String.valueOf(userCountFromDb));

            return userCountFromDb;
        }
        /*return userRepository.count();*/
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        // 删除用户时在Redis中减去用户数
        redisTemplate.opsForValue().decrement(USER_COUNT_KEY);

        userRepository.deleteById(userId);
    }

   // ...为节约篇幅，此处省略非核心内容
}
```

#### 2. 笔记总数功能实现

```java
import org.springframework.data.redis.core.RedisTemplate;

// ...为节约篇幅，此处省略非核心内容

@Service
public class NoteServiceImpl implements NoteService {

    private static final String NOTE_COUNT_KEY = "rednote:note:note_count";

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Transactional
    @Override
    public Note createNote(NotePublishDto notePublishDto, User author) {
        // 创建笔记对象时在Redis递增笔记总数
        redisTemplate.opsForValue().increment(NOTE_COUNT_KEY);

        Note note = new Note();

        note.setTitle(notePublishDto.getTitle());
        note.setContent(notePublishDto.getContent());
        note.setCategory(notePublishDto.getCategory());
        note.setAuthor(author);

        // 话题字符串转为List
        note.setTopics(StringUtil.splitToList(notePublishDto.getTopics(), " "));

        // 处理图片上传
        List<MultipartFile> images = notePublishDto.getImages();
        if (images != null) {
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String fileName = image.getOriginalFilename();
                    String fileUrl = fileStorageService.saveFile(image, fileName);
                    note.getImages().add(fileUrl);
                }

            }
        }

        return noteRepository.save(note);
    }

    @Override
    @Transactional
    public void deleteNote(Note note) {
        // 在删除笔记时在Redis递减笔记总数
        redisTemplate.opsForValue().decrement(NOTE_COUNT_KEY);

        // 注意：先删除数据库数据再删图片文件。以防止删除文件异常时，方便回滚数据库数据

        // 先删除数据库数据
        noteRepository.delete(note);

        // 再删图片文件
        List<String> images = note.getImages();
        for (String image : images) {
            fileStorageService.deleteFile(image);
        }
    }


    @Override
    public long countNotes() {
        // 从Redis中获取笔记总数
        String noteCountFromRedis = redisTemplate.opsForValue().get(NOTE_COUNT_KEY);

        // 判定Redis是否命中
        if (noteCountFromRedis != null) {
            // 命中，则直接返回
            return Long.parseLong(noteCountFromRedis);
        } else {
            // 未命中，从数据库中查询
            long noteCountFromDb = noteRepository.count();
            redisTemplate.opsForValue().set(NOTE_COUNT_KEY, String.valueOf(noteCountFromDb));

            return noteCountFromDb;
        }

        /*return noteRepository.count();*/
    }

    // ...为节约篇幅，此处省略非核心内容
}
```
