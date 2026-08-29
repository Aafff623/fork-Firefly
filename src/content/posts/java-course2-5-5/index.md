---
title: "实战：掌握三种常见的事务传播机制"
published: 2026-08-25
description: "Spring 事务传播机制（Propagation）核心作用：当多个事务方法互相调用时，Spring 决定事务是共用、新建、还是不开启事务。"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-5-5
pinned: false
comment: true
---

Spring 事务传播机制（Propagation）核心作用：当多个事务方法互相调用时，Spring 决定事务是共用、新建、还是不开启事务。

这篇演示三种常见的事务传播机制。

1. REQUIRED 是默认，共用事务
2. REQUIRES_NEW 完全独立事务
3. NESTED 嵌套，子回滚不影响父


### 项目初始化


在“spring-declarative-transaction”应用的基础上，复制为一个新的“spring-transaction-propagation”应用，用于演示事务传播机制。在这个应用中，我们会演示三种常见的事务传播机制


其中，我们使用了 JDBC 的方式来链接数据库。数据库，我们采用了 H2 内嵌数据库，方便我们进行测试。


### 修正UserDao

去除模拟异常的代码：


```java
public User create(User user) {
    String sql = "INSERT INTO users(name, email) VALUES(?, ?)";

    KeyHolder keyHolder = new GeneratedKeyHolder();
    jdbcTemplate.update(connection -> {
        PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
        ps.setString(1, user.getName());
        ps.setString(2, user.getEmail());
        return ps;
    }, keyHolder);

    user.setId(keyHolder.getKey().longValue());

    // 模拟异常情况
    /*if (user.getId() == 3) {
        throw new UnsupportedOperationException();
    }*/

    return user;
}
```


### 通用 Service

```java
package com.example.spring.jdbc.service;

import com.example.spring.jdbc.entity.User;

import java.util.List;

public interface UserService {
    User create(User user);

    List<User> findAll();
}
```


```java
package com.example.spring.jdbc.service;


import com.example.spring.jdbc.dao.UserDao;
import com.example.spring.jdbc.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserDao userDao;

    @Override
    public User create(User user) {
        return userDao.create(user);
    }

    @Override
    public List<User> findAll() {
        return userDao.findAll();
    }
}
```


```java
package com.example.spring.jdbc.service;

/**
 * TxService 事务服务
 *
 * @version 2026/04/05
 **/
public interface TxService {
    // 外部处理
    void outer();

    // 内部处理
    void inner();

    void printAllUsers();
}
```


### 1. REQUIRED（默认）
规则：有事务就加入，没有就新建。最常用。

```java
package com.example.spring.jdbc.service;

import com.example.spring.jdbc.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * TxRequiredServiceImpl REQUIRED（默认）
 *
 * @version 2026/04/05
 **/
@Service
public class TxRequiredServiceImpl implements TxService {
    @Autowired
    private UserService userService;

    // 关键！注入自己的代理对象
    @Autowired
    @Qualifier("txRequiredServiceImpl")
    private TxService txService;

    // 外层：REQUIRED
    @Transactional(propagation = Propagation.REQUIRED)
    public void outer() {
        // 创建新用户
        User newUser = new User("Charlie", "charlie@example.com");
        userService.create(newUser);

        txService.inner(); // 调用内层

        // 抛异常 → 内外一起回滚
        //throw new RuntimeException("outer异常");
    }

    // 内层：REQUIRED
    @Transactional(propagation = Propagation.REQUIRED)
    public void inner() {
        // 创建新用户
        User newUser = new User("Deck", "deck@example.com");
        userService.create(newUser);

        throw new RuntimeException("inner异常");
    }

    @Override
    public void printAllUsers() {
        userService.findAll().stream().forEach(user -> System.out.println(user));
    }

}
```

结果：两条数据都回滚，共用同一个事务。


```java
package com.example.spring.jdbc;

import com.example.spring.jdbc.config.AppConfig;
import com.example.spring.jdbc.dao.UserDao;
import com.example.spring.jdbc.entity.User;
import com.example.spring.jdbc.service.TxRequiredServiceImpl;
import com.example.spring.jdbc.service.TxService;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.io.IOException;
import java.util.List;

/**
 * 使用JdbcTemplate访问数据库示例
 */
public class App {
    public static void main(String[] args) throws IOException {
        // 创建Spring应用上下文
        AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(AppConfig.class);

        // bean
        TxService txService = context.getBean("txRequiredServiceImpl", TxService.class);
        //TxService txService = context.getBean("txRequiresNewServiceImpl", TxService.class);
        //TxService txService = context.getBean("txNestedServiceImpl", TxService.class);

        try {
            txService.outer();
        } catch (Exception e) {
            System.out.println("Exception" + e.toString());
        }

        // 查询库中数据
        txService.printAllUsers();

        // 卡住，看控制台SQL&事务日志，不会闪退
        System.out.println("=== 执行完毕，按回车退出 ===");
        System.in.read();
    }
}
```


### 2. REQUIRES_NEW
规则：挂起当前事务，新建独立事务。内外互不影响。

```java
package com.example.spring.jdbc.service;

import com.example.spring.jdbc.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * TxRequiredServiceImpl REQUIRED（默认）
 *
 * @version 2026/04/05
 **/
@Service
public class TxRequiresNewServiceImpl implements TxService {
    @Autowired
    private UserService userService;

    // 关键！注入自己的代理对象
    @Autowired
    @Qualifier("txRequiresNewServiceImpl")
    private TxService txService;

    // 外层：REQUIRED
    @Transactional(propagation = Propagation.REQUIRED)
    public void outer() {
        // 创建新用户
        User newUser = new User("Charlie", "charlie@example.com");
        userService.create(newUser);

        try {
            txService.inner(); // 独立事务
        } catch (Exception e) {

        }

        // **规则**：**挂起当前事务，新建独立事务**。内外互不影响。
        throw new RuntimeException("outer异常");
    }

    // 内层：REQUIRES_NEW
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void inner() {
        // 创建新用户
        User newUser = new User("Deck", "deck@example.com");
        userService.create(newUser);

        // 内层抛异常 → 自己回滚
        //throw new RuntimeException("inner异常");
    }

    @Override
    public void printAllUsers() {
        userService.findAll().stream().forEach(user -> System.out.println(user));
    }

}
```

结果：
- inner：回滚
- outer：提交（因为捕获了异常）


### 3. NESTED（嵌套事务）
规则：嵌套在父事务中，有保存点。
- 子异常 → 子回滚，父可继续
- 父异常 → 父子一起回滚

```java
package com.example.spring.jdbc.service;

import com.example.spring.jdbc.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * TxRequiredServiceImpl REQUIRED（默认）
 *
 * @version 2026/04/05
 **/
@Service
public class TxNestedServiceImpl implements TxService {
    @Autowired
    private UserService userService;

    // 关键！注入自己的代理对象
    @Autowired
    @Qualifier("txNestedServiceImpl")
    private TxService txService;

    // 外层：REQUIRED
    @Transactional(propagation = Propagation.REQUIRED)
    public void outer() {
        // 创建新用户
        User newUser = new User("Charlie", "charlie@example.com");
        userService.create(newUser);

        try {
            txService.inner(); // 独立事务
        } catch (Exception e) {

        }

        // **规则**：嵌套在父事务中，**有保存点**。
        // - 子异常 → 子回滚，父可继续
        // - 父异常 → 父子一起回滚
        //throw new RuntimeException("outer异常");
    }

    // 内层：NESTED
    @Transactional(propagation = Propagation.NESTED)
    public void inner() {
        // 创建新用户
        User newUser = new User("Deck", "deck@example.com");
        userService.create(newUser);

        // 内层抛异常 → 自己回滚
        throw new RuntimeException("inner异常");
    }

    @Override
    public void printAllUsers() {
        userService.findAll().stream().forEach(user -> System.out.println(user));
    }

}
```

结果：
- inner 回滚
- outer 提交成功


### Spring 事务传播机制「极简速记图+口诀」

| 传播枚举 | 中文理解 | 有无当前事务 | 行为动作 | 异常回滚特点 | 开发常用场景 |
|:--- |:--- |:--- |:--- |:--- |:--- |
| REQUIRED（默认） | 有就入伙，没就新建 | 有事务 | 加入当前事务 | 全员同生共死 | 90%普通业务、增删改主流程 |
|  |  | 无事务 | 新建独立事务 | 自己失败自己回滚 |  |
| REQUIRES_NEW | 独立门户，永远新开 | 有事务 | 挂起旧事务，开全新事务 | 内外事务互不影响 | 日志记录、异步流水、独立对账 |
|  |  | 无事务 | 新建事务 | 自己管控自己 |  |
| NESTED | 嵌套挂靠，留存档点 | 有事务 | 嵌套父事务，设SavePoint | 子错子回滚，父错全回滚 | 订单子流程、部分业务可回撤 |
|  |  | 无事务 | 新建事务 | 同REQUIRED |  |
