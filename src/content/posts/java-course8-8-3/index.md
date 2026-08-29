---
title: "实现笔记的分页查询、排序等功能"
published: 2026-08-25
description: "修改UserRepository，增加接口如下"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-8-3
pinned: false
comment: true
---

### 根据用户ID查询用户

修改UserRepository，增加接口如下：


```java
public interface UserRepository extends Repository<User, Long> {

    // ...为节约篇幅，此处省略非核心内容

    /**
     * 根据用户ID查询用户
     *
     * @param userId
     * @return
     */
    Optional<User> findByUserId(Long userId);
}
```

修改UserService，增加接口如下：


```java
public interface UserService {

    // ...为节约篇幅，此处省略非核心内容

    /**
     * 根据用户ID查询用户
     *
     * @param userId
     * @return
     */
    Optional<User> findByUserId(Long userId);
}
```

修改UserServiceImpl，实现如下接口：


```java
@Service
public class UserServiceImpl implements UserService {

    // ...为节约篇幅，此处省略非核心内容

    @Override
    public Optional<User> findByUserId(Long userId) {
        return userRepository.findByUserId(userId);
    }
}
```


### 根据作者的用户ID分页查询笔记

修改UserRepository，增加接口如下：


```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

// ...为节约篇幅，此处省略非核心内容

public interface NoteRepository extends Repository<Note, Long> {

    // ...为节约篇幅，此处省略非核心内容

    /**
     * 根据作者的用户ID分页查询笔记
     *
     * @param userId
     * @param pageable
     * @return
     */
    Page<Note> findByAuthorUserId(Long userId, Pageable pageable);
}
```


Note实体类中没有直接名为userId的属性，在Note实体中，用户关联是通过User对象（author字段）实现的，而非直接的userId字段，因此不能在NoteRepository中定义了findByUserId方法。但可以使用author.userId代替userId，因此接口名称为`findByAuthorUserId`。


修改NoteService，增加接口如下：


```java
public interface NoteService {

    // ...为节约篇幅，此处省略非核心内容

    /**
     * 根据作者的用户ID分页查询笔记
     *
     * @param userId
     * @param page
     * @param size
     * @return
     */
    Page<Note> getNotesByUser(Long userId, int page, int size);
}
```

修改UserServiceImpl，实现如下接口：


```java
@Service
public class NoteServiceImpl implements NoteService {

    // ...为节约篇幅，此处省略非核心内容

    @Override
    public Page<Note> getNotesByUser(Long userId, int page, int size) {
        // 分页查询的笔记列表结果按照创建时间降序排序
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createAt"));
        return noteRepository.findByAuthorUserId(userId, pageable);
    }
}
```


* `Sort.by(Sort.Direction.DESC, "createAt")`是指定按照Note的createdAt字段排序。
* descending()是降序排序。
* 上述两个条件组合就是按照按照Note的createdAt字段降序排序。


### Spring Data JPA 中 Page 和 Pageable 的用法详解

在Spring Data JPA中，`Pageable` 和 `Page` 是Spring Data JPA中处理分页查询的核心组件，掌握它们的用法对于构建高效、可维护的后端服务至关重要。合理使用分页技术不仅能提升系统性能，还能显著改善用户体验。


#### 1. Pageable：分页查询请求
`Pageable` 是一个接口，用于封装分页查询的参数，包括：
- 页码（从0开始）
- 每页大小
- 排序规则

常用实现类：`PageRequest`

#### 2. Page：分页查询结果
`Page` 是一个接口，代表分页查询的结果，包含：
- 当前页数据列表
- 总页数
- 总记录数
- 当前页码
- 每页大小
- 是否有下一页/上一页


#### 3. 性能考虑

1. 避免大数据量下的性能问题：
   - 对于超大数据集，使用 `Slice` 代替 `Page`（不计算总页数）
   - 合理设置每页大小，避免一次查询过多数据

2. 排序字段优化：
   - 经常用于排序的字段应添加索引
   - 复合排序（多字段排序）需确保索引顺序与查询一致

3. 缓存分页结果：
   - 对于静态数据或变化不频繁的数据，考虑缓存分页结果


#### 4. 常见问题与解决方案

| 问题描述 | 解决方案 |
|---------|---------|
| 页码从0开始不习惯 | 在前端模板中+1显示（如示例中的 `th:text="${pageNum + 1}"`） |
| 大数据量查询慢 | 使用 `Slice` 接口，避免计算总记录数 |
| 排序字段无索引 | 为排序字段添加数据库索引 |
| 分页参数被篡改 | 在控制器中添加参数校验，限制每页最大数量 |
