---
title: "点赞功能的数据库设计，掌握JPA关联映射"
published: 2026-08-25
description: "首先需要添加点赞相关的实体和关系，新建点赞实体Like.java如下"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-13-2
pinned: false
comment: true
---

### 设计实体

首先需要添加点赞相关的实体和关系，新建点赞实体Like.java如下：

```java
package com.example.rednote.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Like 点赞实体
 *
 * @version 2025/06/15
 **/
@Entity
@Table(name = "t_like")
@Data // @Data集合了 @ToString， @EqualsAndHashCode，所有字段的 @Getter和所有非final字段的 @Setter, @RequiredArgsConstructor
@NoArgsConstructor // 无参构造器
@AllArgsConstructor // 包含所有参数的构造器
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long likeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    private Note note;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

}
```

在Note实体中添加反向关联：

```java
@Entity
@Table(name = "t_note")
@Data // @Data集合了 @ToString， @EqualsAndHashCode，所有字段的 @Getter和所有非final字段的 @Setter, @RequiredArgsConstructor
@NoArgsConstructor // 无参构造器
@AllArgsConstructor // 包含所有参数的构造器
public class Note {

    // ...为节约篇幅，此处省略非核心内容
    
    @OneToMany(mappedBy = "note", cascade = CascadeType.REMOVE)
    private List<Like> likes = new ArrayList<>();

    // 计算点赞数的Transient字段
    @Transient
    public long getLikeCount() {
        return likes.size();
    }
    // 判断当前用户是否已点赞
    @Transient
    public boolean isLikedByUser(Long userId) {
        if (userId == null) {
            return false;
        }
        return likes.stream().anyMatch(like -> like.getUser().getUserId().equals(userId));
    }
}
```


### JPA 关联映射解析：@OneToMany(mappedBy = "note", cascade = CascadeType.REMOVE)

这句代码是 JPA（Java Persistence API）中定义一对多关联关系的核心注解，主要用于建立实体间的双向关联。让我们从多个维度深入解析其含义和作用。

`@OneToMany(mappedBy = "note", cascade = CascadeType.REMOVE)` 这行代码的核心作用是：

1. 建立双向关联：让`Note`和`Like`实体能够互相引用
2. 定义级联行为：删除笔记时自动清理相关点赞记录
3. 优化数据模型：避免数据库中冗余的关联字段

基本概念如下：

#### 1. @OneToMany 注解
- 语义：表示一个`Note`（笔记）实体可以关联多个`Like`（点赞）实体
- 关系方向：定义在“一”方（Note），映射到“多”方（Like）
- 默认FetchType：`LAZY`（延迟加载），即访问`note.getLikes()`时才查询数据库

#### 2. mappedBy 属性
- 作用：指定双向关联的反向端字段
- 原理：关联关系的控制权在`Like`实体的`note`字段上，`Note`实体仅作为反向映射
- 避免冗余：防止 JPA 在数据库中生成两个关联字段（如`note_id`和`like_note_id`）

#### 3. cascade = CascadeType.REMOVE
- 级联操作：当删除`Note`时，自动删除所有关联的`Like`记录
- 避免孤儿数据：防止删除笔记后，点赞记录仍然存在于数据库中
- 其他可选值：
  - `ALL`：所有操作都级联（PERSIST、MERGE、REMOVE 等）
  - `PERSIST`：级联持久化（保存父实体时自动保存子实体）
  - `MERGE`：级联合并（更新父实体时自动更新子实体）


### 常见问题与最佳实践

#### 1. 双向关联维护
- 必须同时设置双方引用：
  ```java
  // 正确方式
  Note note = new Note();
  Like like = new Like();
  
  note.getLikes().add(like); // 设置正向关联
  like.setNote(note);        // 设置反向关联
  ```

#### 2. 避免循环引用
- JSON序列化问题：双向关联可能导致无限递归
- 解决方案：
  - 使用`@JsonIgnore`或`@JsonBackReference`注解
  - 定义 DTO 层，选择性序列化需要的字段

#### 3. 替代关联方式
- 单向关联：如果只需要从`Like`访问`Note`，可以省略`Note.likes`字段
- 多对多关联：如果需要更灵活的关系管理（如用户与笔记的收藏关系），可以使用`@ManyToMany`


### 与其他关联注解对比

| 注解         | 关系类型 | 控制权       | 典型场景                     |
|------------------|--------------|------------------|----------------------------------|
| `@OneToMany`     | 一对多       | 在多的一端       | 笔记与点赞、订单与订单项         |
| `@ManyToOne`     | 多对一       | 在多的一端       | 评论与用户、订单与客户           |
| `@OneToOne`      | 一对一       | 通常在主实体     | 用户与用户详情、订单与支付记录   |
| `@ManyToMany`    | 多对多       | 通过中间表       | 用户与角色、学生与课程           |


在实际应用中，需要根据业务场景权衡级联操作的范围，处理好双向关联的维护，并注意可能出现的性能问题。通过合理使用 JPA 关联注解，可以构建出高效、健壮的实体关系模型。


### `@Transient`字段的用意

在Java开发中，`@Transient`字段是一个重要的注解，主要用于ORM（对象关系映射）框架（如Hibernate、MyBatis等）中，指示该字段不需要映射到数据库表中。下面从多个方面详细解析其用意和应用场景：


#### 核心作用：控制字段与数据库的映射关系

`@Transient`的核心功能是阻止字段被映射到数据库表，即：
- 该字段不会在数据库表中生成对应的列；
- 数据库查询结果也不会填充该字段的值。


#### 具体应用场景

1. 临时计算字段（非持久化数据）
- 字段值由其他字段计算或拼接而来，无需存储到数据库。
- 例：用户的全名（`fullName`）由`firstName`和`lastName`组合而成。

2. 缓存或临时状态字段
- 用于存储对象在运行时的临时状态（如缓存数据、权限标记等），无需持久化。

```java
@Transient
private boolean isAdmin; // 运行时根据权限判断，无需存入数据库
```

3. 避免敏感数据存储
- 防止敏感信息（如密码明文、临时令牌）被误存入数据库。

```java
@Transient
private String temporaryToken; // 临时令牌，不存入数据库
```

4. 优化性能（减少数据库列）
- 当对象包含大量无需持久化的字段时，使用`@Transient`可减少数据库表的列数，提升查询性能。


#### 总结

`@Transient`的核心价值在于分离业务对象与数据库表的映射关系，使实体类能更灵活地处理临时数据、计算字段或敏感信息，同时优化数据库设计和系统性能。在使用时需根据具体框架选择合适的注解，并注意字段的生命周期和序列化问题。
