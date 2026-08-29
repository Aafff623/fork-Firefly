---
title: "实战：掌握全栈前后端高效对话核心技能JSON处理"
published: 2026-08-25
description: "在 Spring MVC 中处理 JSON 数据是开发 Web 应用时的常见需求，下面为你详细介绍 Spring MVC 进行 JSON 处理的实战内容，涵盖环境搭建、配置、数据转换、请求响应处理等方…"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3-5-1
pinned: false
comment: true
---

在 Spring MVC 中处理 JSON 数据是开发 Web 应用时的常见需求，下面聊聊 Spring MVC 进行 JSON 处理的实战内容，涵盖环境搭建、配置、数据转换、请求响应处理等方面。


### 项目初始化


执行以下命令进行初始化项目原型：


```
mvn archetype:generate -DgroupId=com.example.spring.mvc -DartifactId=spring-mvc-json -DarchetypeArtifactId=maven-archetype-webapp -DarchetypeVersion=1.5 -DinteractiveMode=false
```

此时会创建一个名为“spring-mvc-json”的Web应用程序。

在 `pom.xml` 中添加必要的依赖，包括 Servlet API、JSON 处理库（如 Jackson）等：
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
    <!-- Servlet API -->
    <dependency>
        <groupId>jakarta.servlet</groupId>
        <artifactId>jakarta.servlet-api</artifactId>
        <version>6.1.0</version>
        <scope>provided</scope>
    </dependency>
    <!-- Jackson JSON 处理库 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.19.2</version>
    </dependency>
    <!-- Spring MVC -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
    </dependency>

    <!-- ...为节约篇幅，此处省略非核心内容 -->
</dependencies>
```


### 创建数据模型

和之前一样，创建一个简单的 `User` 类作为数据模型：


```java
package com.example.spring.mvc.model;

/**
 * User 用户模型
 *
 * @version 2025/08/08
 **/
public class User {
    private long id;
    private String name;
    private String email;

    public User() {
    }

    public User(long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    // Getters and Setters
    public long getId() {
        return id;
    }

    public void setId(long id) {
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
}
```

### 创建控制器


创建一个控制器类来处理 HTTP 请求并返回 JSON 数据：

```java
package com.example.spring.mvc.controller;

import com.example.spring.mvc.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * UserController 用户控制器
 *
 * @version 2025/08/10
 **/
@Controller
@RequestMapping("/users")
public class UserController {

    // 用户存储
    private final ConcurrentHashMap<Long, User> users = new ConcurrentHashMap<>();
    private final AtomicLong counter = new AtomicLong(1);

    public UserController() {
        // 初始化测试数据
        Long id1 = counter.getAndIncrement();
        users.put(id1, new User(id1, "John", "john@example.com"));

        Long id2 = counter.getAndIncrement();
        users.put(id2, new User(id2, "Smith", "smith@example.com"));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(new ArrayList<>(users.values()));
    }

    @PostMapping
    @ResponseBody
    public User createUser(@RequestBody User user) {
        Long id = counter.getAndIncrement();
        user.setId(id);

        users.put(id, user);

        return user;
    }
}
```


使用ConcurrentHashMap来存储用户数据。

### Spring MVC 配置


创建 Spring MVC 的配置类，配置组件扫描、消息转换器等：

```java
package com.example.spring.mvc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig Web配置
 *
 * @version 2025/08/10
 **/
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "com.example.spring.mvc")
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        return new MappingJackson2HttpMessageConverter();
    }
}
```


### Web应用初始化

创建一个 `WebInitializer` 类来初始化 Spring MVC 应用：


```java
package com.example.spring.mvc.config;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRegistration;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

/**
 * WebInitializer Web应用初始化
 *
 * @version 2025/08/10
 **/
public class WebInitializer implements WebApplicationInitializer {
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
        rootContext.register(WebConfig.class);

        servletContext.addListener(new ContextLoaderListener(rootContext));

        AnnotationConfigWebApplicationContext dispatcherContext = new AnnotationConfigWebApplicationContext();
        dispatcherContext.register(WebConfig.class);

        ServletRegistration.Dynamic dispatcher = servletContext.addServlet("dispatcher", new DispatcherServlet(dispatcherContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }
}
```


### 测试 JSON 处理

使用 Maven 打包项目：

```bash
mvn clean package
```

生成了spring-mvc-json.war文件。

将项目部署到 Servlet 容器（如 Tomcat）中，然后使用工具（如 Postman 或 cURL）进行测试。

#### 发送 GET 请求


```bash
curl http://localhost:8080/spring-mvc-json/users
```


预期响应：


```json
[{"id":1,"name":"John Doe","email":"john@example.com"},{"id":2,"name":"Jane Smith","email":"jane@example.com"}]
```

#### 发送 POST 请求


```bash
curl -X POST -H "Content-Type: application/json" -d '{ "name":"User","email":"user@example.com"}' http://localhost:8080/spring-mvc-json/users
```


预期响应：
```json
{
  "id": 3,
  "name": "User",
  "email": "user@example.com"
}
```


这样你就可以在纯 Spring 框架中实现 Spring MVC 的 JSON 处理功能。
