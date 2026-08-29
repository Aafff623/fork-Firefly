---
title: "掌握Repository设计模式来实现UserRepository"
published: 2026-08-25
description: "本节内容"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-4-5
pinned: false
comment: true
---

本节内容：

1. 用户表结构设计
2. 创建用户实体类，使用 `@Entity`、`@Table` 等注解映射到用户表
3. 创建继承自 Repository 的UserRepository接口，用于操作用户表

### 用户实体


```java
package com.example.rednote.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User 用户实体
 *
 * @version 2025/08/16
 **/
@Entity
@Table(name = "t_user")
// @Data集合了@Getter @Setter @ToString @EqualsAndHashCode
@Data
// 无参构造器
@NoArgsConstructor
// 包含所有参数的构造器
@AllArgsConstructor
public class User {
    /**
     * 用户ID
     */
    @jakarta.persistence.Id
    @jakarta.persistence.GeneratedValue(strategy = GenerationType.AUTO)
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码
     */
    private String password;

    /**
     * 手机号
     */
    private String phone;
}
```


‌GenerationType ‌是 Java Persistence API （JPA）中的一个枚举类型，用于指定数据库中自动生成主键值的策略。它包含了以下四种类型：

* AUTO ‌：由持久化提供者自动选择生成策略，默认为此选项。根据底层数据库的支持情况，可能会选择 IDENTITY 、 SEQUENCE 或 TABLE 。
* IDENTITY ‌：使用数据库的自增长特性生成主键值。适用于支持自增长列的数据库，如 MySQL 、 SQL Server 等。
* SEQUENCE ‌：使用数据库的序列生成主键值。适用于支持序列的数据库，如 Oracle 、 PostgreSQL 等。
* TABLE ‌：使用一个特定的数据库表来生成主键值。它会创建一个表来保存生成的主键值，并通过表中的行锁来保证唯一性。适用于不支持自增长列或序列的数据库‌


这些类型可以通过在实体类的主键字段上使用`@GeneratedValue`注解来指定。


### 用户资源库


```java
package com.example.rednote.repository;

import com.example.rednote.entity.User;
import org.springframework.data.repository.Repository;

import java.util.Optional;

/**
 * UserRepository 用户资源库
 *
 * @version 2025/08/16
 **/
public interface UserRepository extends Repository<User, Long> {
    /**
     * 保存用户
     *
     * @param user
     * @return
     */
    User save(User user);

    /**
     * 根据手机号查找用户
     *
     * @param phone
     * @return
     */
    Optional<User> findByPhone(String phone);

    /**
     * 根据用户名查找用户
     *
     * @param username
     * @return
     */
    Optional<User> findByUsername(String username);
}
```
