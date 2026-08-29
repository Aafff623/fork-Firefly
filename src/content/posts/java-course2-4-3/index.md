---
title: "实战：使用JdbcTemplate访问数据库"
published: 2026-08-25
description: "JdbcTemplate 类是 JDBC 核心包中的核心类。它用于处理资源的创建和释放，可以避免开发人员常见 JDBC 使用错误，例如忘记关闭连接。它执行核心 JDBC 工作流的基本任务，例如语句创建…"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-4-3
pinned: false
comment: true
---

JdbcTemplate 类是 JDBC 核心包中的核心类。它用于处理资源的创建和释放，可以避免开发人员常见 JDBC 使用错误，例如忘记关闭连接。它执行核心 JDBC 工作流的基本任务，例如语句创建和执行，使应用程序代码提供 SQL 并提取结果。JdbcTemplate 类执行 SQL 查询、更新语句和存储过程调用，对 ResultSets 执行迭代并提取返回的参数值。它还捕获 JDBC 异常并将它们转换为 `org.springframework.dao` 包中定义的通用的、更具信息性的异常层次结构。

使用 JdbcTemplate 时，只需要实现回调接口即可。PreparedStatementCreator 回调接口根据该类提供的 Connection 创建一个准备好的语句，提供 SQL 和任何必需的参数。 CallableStatementCreator 接口也是如此，该接口创建可调用语句。RowCallbackHandler 接口从 ResultSet 的每一行提取值。

JdbcTemplate 可以通过直接实例化 DataSource 引用在 DAO 实现中使用，或者在 Spring IoC 容器中配置并作为 bean 引用提供给 DAO。

DataSource 应始终在 Spring IoC 容器中配置为一个 bean。在上述的第一种情况下，bean 直接提供给服务；在第二种情况下，它被提供给准备好的模板。

以下是 JdbcTemplate 类用法的一些常见的示例。


### 初始化项目原型


执行以下命令进行初始化项目原型：

```
mvn archetype:generate -DgroupId=com.example.spring.jdbc -DartifactId=spring-jdbc-template -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.5 -DinteractiveMode=false
```

此时会创建一个名为“spring-jdbc-template”的项目。

我们需要将`spring-context`、`spring-jdbc`模块引入我们的应用，就在pom.xml文件中添加如下的 Maven 配置片段：

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-framework-bom</artifactId>
      <version>6.2.9</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>

    <!-- ...为节约篇幅，此处省略非核心内容 -->
  </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-jdbc</artifactId>
	</dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <version>2.3.232</version>
        <scope>runtime</scope>
    </dependency>
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</dependencies>
```


其中，我们使用了 JDBC 的方式来链接数据库。数据库，我们采用了 H2 内嵌数据库，方便我们进行测试。


### 定义领域模型

定义一个代码用户信息的 User 类：

```java
package com.example.spring.jdbc.entity;

/**
 * User 用户实体
 *
 * @version 2025/08/09
 **/
public class User {
    private Long id;
    private String name;
    private String email;

    public User() {
    }

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
```


定义了 DAO 的实现类 UserDao:

```java
package com.example.spring.jdbc.dao;

import com.example.spring.jdbc.entity.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

/**
 * UserDao User Dao
 *
 * @version 2025/08/09
 **/
@Repository
@Transactional
public class UserDao {
    private final JdbcTemplate jdbcTemplate;

    public UserDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        return user;
    };

    public User create(User user) {
        String sql = "INSERT INTO users(name, email) VALUES(?, ?)";

        // 获取key
        KeyHolder keyHolder = new GeneratedKeyHolder();

        this.jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            return ps;
        }, keyHolder);

        user.setId(keyHolder.getKey().longValue());
        return user;
    }

    public User findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        return this.jdbcTemplate.queryForObject(sql, userRowMapper, id);
    }

    public List<User> findAll() {
        String sql = "SELECT * FROM users";
        return this.jdbcTemplate.query(sql, userRowMapper);
    }

    public int update(User user) {
        String sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
        return this.jdbcTemplate.update(sql, user.getName(), user.getEmail(), user.getId());
    }

    public int delete(Long id) {
        String sql = "DELETE FROM users WHERE id = ?";
        return this.jdbcTemplate.update(sql, id);
    }
}
```


上述UserDao，实现了用户的增删改查。

### 配置文件

定义 Spring 应用的配置文件AppConfig：

```java
package com.example.spring.jdbc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

/**
 * AppConfig 应用配置
 *
 * @version 2025/08/09
 **/
// 配置类
@Configuration
// 扫描包下组件
@ComponentScan(basePackages = "com.example.spring.jdbc")
// 开启事务管理
@EnableTransactionManagement
public class AppConfig {
    // 定义数据源
    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .setName("testdb")
                // 启动应用时执行脚本
                .addScript("classpath:schema.sql")
                .addScript("classpath:data.sql")
                .build();
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

在配置文件中，我们定义了事务管理、DataSource、JdbcTemplate、PlatformTransactionManager 等，并启用了 Spring 自动扫描机制来注入 bean。


应用启动的时候，会自动执行schema.sql和data.sql，以便初始化内嵌数据库的表结构及数据。


schema.sql 内容如下：

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);
```

data.sql 内容如下：

```sql
INSERT INTO users(name, email) VALUES('Alice', 'alice@example.com');
INSERT INTO users(name, email) VALUES('Bob', 'bob@example.com');
```


### 编写主应用类

主应用类 App 如下：

```java
package com.example.spring.jdbc;

import com.example.spring.jdbc.config.AppConfig;
import com.example.spring.jdbc.dao.UserDao;
import com.example.spring.jdbc.entity.User;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.util.List;

/**
 * JdbcTemplate访问数据库的示例
 */
public class App {
    public static void main(String[] args) {
        // 创建Spring应用的上下文
        ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

        // 获取UserDao bean
        UserDao userDao = context.getBean(UserDao.class);

        // 创建新用户
        User newUser = new User("Charlie", "charlie@example.com");
        User saveUser = userDao.create(newUser);
        System.out.println("Created user: " + saveUser);

        // 查询所有用户
        System.out.println("\nAll users: ");
        List<User> users = userDao.findAll();
        users.forEach(System.out::println);
    }
}
```

在 App 类中，我们会执行用户表的初始化，以及用户的新增和查询。

### 运行

右键运行 App 类，能看到控制台打印信息如下：

```
8月 09, 2025 4:18:17 下午 org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseFactory initDatabase
信息: Starting embedded database: url='jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false', username='sa'
Created user: User{id=3, name='Charlie', email='charlie@example.com'}

All users: 
User{id=1, name='Alice', email='alice@example.com'}
User{id=2, name='Bob', email='bob@example.com'}
User{id=3, name='Charlie', email='charlie@example.com'}
```

从上述信息中，我们能够完整的看到整个数据库的操作过程。
