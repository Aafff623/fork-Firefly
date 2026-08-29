---
title: "实战：快速构建基于Servlet的REST API服务"
published: 2026-08-25
description: "以下是关于如何快速构建可监控的 REST API 服务的 Servlet 应用工程化实战的详细步骤。"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3-2-6
pinned: false
comment: true
---

下面聊聊如何快速构建可监控的 REST API 服务。

### 项目初始化


执行以下命令进行初始化项目原型：


```
mvn archetype:generate -DgroupId=com.example.servlet -DartifactId=servlet-rest-api-service -DarchetypeArtifactId=maven-archetype-webapp -DarchetypeVersion=1.5 -DinteractiveMode=false
```

此时会创建一个名为"spring-jdbc-template"的项目。这里使用的项目原型类型是maven-archetype-webapp，表示初始化的应用是一个Web应用。


在 `pom.xml` 中添加必要的依赖，包括 Servlet API、JSON 处理库（如 Jackson）：
```xml
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

    <!-- ...为节约篇幅，此处省略非核心内容 -->
</dependencies>
```
### 创建业务代码所在目录


在`src/main`目录下，已经初始化了一个webapp目录，这个目录下还有WEB-INF目录和index.jsp文件。WEB-INF目录下有web.xml文件。


需要在`src/main`目录下创建一个java目录，用来放置业务代码。


### 定义数据模型

创建一个简单的 Java 类来表示 API 处理的数据：
```java
package com.example.servlet.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * User 用户模型
 *
 * @version 2025/08/10
 **/
public class User {
    @JsonProperty("id")
    private int id;

    @JsonProperty("name")
    private String name;

    public User() {
    }

    public User(int id, String name) {
        this.id = id;
        this.name = name;
    }

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

### 创建 Servlet 处理 REST 请求

创建一个 Servlet 来处理 REST API 请求：

```java
package com.example.servlet.interfaces;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.servlet.model.User;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

/**
 * UserServlet User Servlet
 *
 * @version 2025/08/10
 **/
@WebServlet("/users")
public class UserServlet extends HttpServlet {
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // 设置内容类型为JSON
        response.setContentType("application/json");

        // 设置字符编码
        response.setCharacterEncoding("UTF-8");

        // 构造用户模型对象
        User user = new User(1, "Way Lau");

        // 将对象转为JSON字符串
        String json = objectMapper.writeValueAsString(user);

        // 写出JSON字符串
        PrintWriter out = response.getWriter();
        out.print(json);
        out.flush();
    }
}
```


### 打包项目

使用 Maven 打包项目：

```bash
mvn clean package
```

生成了servlet-rest-api-service.war文件。

### 部署到 Servlet 容器


将生成的 WAR 文件部署到 Tomcat 等 Servlet 容器中。

以为例，将WAR文件放置到webapps目录下，执行

```
cd D:\dev\java\apache-tomcat-11.0.10-windows-x64\apache-tomcat-11.0.10\bin
.\startup.bat
```

### REST API
使用工具（如浏览器、Postman 或 cURL）测试 REST API：

```bash
curl http://localhost:8080/servlet-rest-api-service/users
```

结果如下：

```
{"id":1,"name":"Way Lau"}
```


### 总结

这样你就可以快速构建一个可监控的 REST API 服务。使用 Servlet 处理 REST 请求，结合 Jackson 进行 JSON 数据处理，方便对 API 服务的性能和使用情况进行监控和分析。
