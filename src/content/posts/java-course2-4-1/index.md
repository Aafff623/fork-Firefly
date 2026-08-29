---
title: "全栈后端之数据之道：DAO设计模式"
published: 2026-08-25
description: "DAO（Data Access Object，数据访问对象）设计模式是一种用于将数据访问逻辑与业务逻辑分离的设计模式，它在全栈后端开发中扮演着重要角色，以下是关于它的详细介绍"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-4-1
pinned: false
comment: true
---

DAO（Data Access Object，数据访问对象）设计模式是一种用于将数据访问逻辑与业务逻辑分离的设计模式，它在全栈后端开发中扮演着重要角色，以下是关于它的详细介绍：

### 基本概念

DAO 设计模式的核心思想是将数据访问操作封装在一个独立的类或接口中，使得业务逻辑层不需要关心数据是如何从数据源（如数据库、文件系统等）中获取和存储的。这样做的好处包括提高代码的可维护性、可测试性和可扩展性，同时也遵循了单一职责原则。

### 主要组成部分

- DAO 接口：定义了对数据进行操作的方法，例如增删改查（CRUD）操作。接口的存在使得业务逻辑层可以依赖于抽象而不是具体的实现，方便后续切换不同的数据源或数据库。
```java
// 示例：用户 DAO 接口
public interface UserDAO {
    User getUserById(int id);
    void saveUser(User user);
    void updateUser(User user);
    void deleteUser(int id);
}
```
- DAO 实现类：实现了 DAO 接口中定义的方法，负责与具体的数据源进行交互。在实现类中，会包含数据库连接、SQL 语句执行等操作。
```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

// 示例：用户 DAO 实现类
public class UserDAOImpl implements UserDAO {
    private static final String DB_URL = "jdbc:mysql://localhost:3306/mydb";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "password";

    @Override
    public User getUserById(int id) {
        User user = null;
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?")) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                user = new User();
                user.setId(rs.getInt("id"));
                user.setName(rs.getString("name"));
                // 其他属性设置
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return user;
    }

    @Override
    public void saveUser(User user) {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             PreparedStatement stmt = conn.prepareStatement("INSERT INTO users (name) VALUES (?)")) {
            stmt.setString(1, user.getName());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // 其他方法实现
}
```
- 实体类：用于表示数据库中的表记录，通常包含与表字段对应的属性以及相应的 getter 和 setter 方法。
```java
// 示例：用户实体类
public class User {
    private int id;
    private String name;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

### 优点
- 可维护性：当数据源或数据库发生变化时，只需要修改 DAO 实现类，而不会影响到业务逻辑层的代码。
- 可测试性：可以通过模拟 DAO 接口的实现来对业务逻辑进行单元测试，而不需要依赖实际的数据库。
- 可扩展性：如果需要添加新的数据源或数据库操作，只需要在 DAO 接口和实现类中进行扩展，不会对现有代码造成太大影响。

### 实际应用场景
- Web 应用开发：在 Web 应用中，业务逻辑通常需要与数据库进行交互。使用 DAO 模式可以将数据库操作封装起来，使得业务逻辑代码更加清晰和易于维护。
- 企业级应用开发：在企业级应用中，可能会涉及到多个数据源和复杂的数据库操作。DAO 模式可以帮助管理这些数据访问逻辑，提高系统的可维护性和可扩展性。

### 注意事项
- 资源管理：在 DAO 实现类中，需要注意数据库连接、语句和结果集等资源的正确关闭，避免资源泄漏。可以使用 `try-with-resources` 语句来简化资源管理。
- 异常处理：对于数据库操作中可能出现的异常，需要进行适当的处理，避免将异常直接暴露给业务逻辑层。可以在 DAO 实现类中捕获异常并进行日志记录，或者将异常封装成自定义异常抛出。
