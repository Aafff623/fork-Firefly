---
title: "实战：内嵌Tomcat支撑轻量级Servlet容器部署"
published: 2026-08-25
description: "传统部署需先安装 Tomcat，再手动部署 WAR 包，操作过于繁琐。而嵌入式 Tomcat 将容器与应用代码打包在一起，方便部署、运行、测试。"
image: ''
tags: [Java, Spring MVC, Web]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course3-5-2
pinned: false
comment: true
---

传统部署需先安装 Tomcat，再手动部署 WAR 包，操作过于繁琐。而嵌入式 Tomcat 将容器与应用代码打包在一起，方便部署、运行、测试。


### 核心优势

#### 1. 简化部署与运维
   - 零依赖外部服务器：  
     传统部署需先安装 Tomcat，再手动部署 WAR 包；而嵌入式 Tomcat 将容器与应用代码打包在一起，直接通过 `java -jar` 运行，避免环境配置差异。
   - 环境一致性：  
     开发、测试、生产环境使用相同的 Tomcat 版本和配置，减少“在我机器上能运行”的问题。
   - 自动化运维友好：  
     可与 Docker、Kubernetes 等容器化工具无缝集成，支持镜像化部署和动态扩缩容。

#### 2. 提升开发效率
   - 快速启动与热重启：  
     嵌入式 Tomcat 通常与开发工具（如 IntelliJ IDEA、Spring DevTools）深度集成，支持代码修改后秒级重启应用，显著提升调试效率。
   - 日志集成：  
     应用日志与 Tomcat 日志统一输出，便于问题排查（如通过 Logback 或 Log4j2 集中管理）。

#### 3. 适配微服务架构
   - 独立进程模型：  
     每个微服务可嵌入独立的 Tomcat 实例，避免共享容器导致的资源竞争和依赖冲突。
   - 轻量化与弹性：  
     嵌入式 Tomcat 的资源占用（内存、CPU）通常低于独立服务器，适合大规模微服务集群部署。

#### 4. 支持云原生与 Serverless
   - 无状态化设计：  
     嵌入式 Tomcat 天然适合无状态服务，可快速水平扩展以应对流量高峰。
   - 函数即服务（FaaS）适配：  
     在 AWS Lambda、Azure Functions 等场景中，嵌入式容器可缩短冷启动时间，提升响应速度。


### 项目初始化


执行以下命令进行初始化项目原型：


```
mvn archetype:generate -DgroupId=com.example.spring.mvc -DartifactId=spring-mvc-json-tomcat-embed -DarchetypeArtifactId=maven-archetype-webapp -DarchetypeVersion=1.5 -DinteractiveMode=false
```

此时会创建一个名为“spring-mvc-json-tomcat-embed”的Web应用程序。


在 `pom.xml` 中添加必要的依赖，包括 Servlet API、JSON 处理库（如 Jackson）：
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
    <!-- Tomcat Embed -->
    <dependency>
      <groupId>org.apache.tomcat.embed</groupId>
      <artifactId>tomcat-embed-core</artifactId>
      <version>11.0.10</version>
    </dependency>
    <dependency>
      <groupId>org.apache.tomcat.embed</groupId>
      <artifactId>tomcat-embed-jasper</artifactId>
      <version>11.0.10</version>
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

### Web应用程序入口

使用Tomcat作为内嵌Servlet容器启动：


```java
package com.example.spring.mvc;

import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;

import java.io.File;

/**
 * App 内嵌Tomcat应用启动类
 *
 * @version 2025/08/10
 **/
public class App {
    public static void main(String[] args) throws LifecycleException {
        // 创建Tomcat启动器
        Tomcat tomcat = new Tomcat();

        // 设置基础目录，许多其他位置（比如工作目录）的默认设置都是从基础目录派生出来的
        // 可以自定义目录，或者是使用缓存目录 System.getProperty("java.io.tmpdir")
        File baseDir = new File("/data/tomcat-embed");
        tomcat.setBaseDir(baseDir.getAbsolutePath());

        // 设置默认HTTP连接器端口号
        tomcat.setPort(8080);

        // 添加Web应用程序，这相当于将Web应用程序添加到主机的appBase（通常是Tomcat的webapps目录）。
        // contextPath - 要使用的上下文映射，""表示根上下文；
        // docBase - 上下文的基本目录，用于静态文件。必须存在且为绝对路径。
        String contextPath = "";
        String docBase = new File("src/main/webapp").getAbsolutePath();
        tomcat.addWebapp(contextPath, docBase);

        // 启动Tomcat
        tomcat.start();

        // 获取默认HTTP连接器
        tomcat.getConnector();
    }
}
```


### 测试 JSON 处理

右键运行App.java文件，可以启动应用，然后使用工具（如 Postman 或 cURL）进行测试。

#### 发送 GET 请求


```bash
curl http://localhost:8080/users
```


预期响应：


```json
[{"id":1,"name":"John Doe","email":"john@example.com"},{"id":2,"name":"Jane Smith","email":"jane@example.com"}]
```

#### 发送 POST 请求


```bash
curl -X POST -H "Content-Type: application/json" -d '{ "name":"User","email":"user@example.com"}' http://localhost:8080/users
```


预期响应：
```json
{
  "id": 3,
  "name": "User",
  "email": "user@example.com"
}
```

### 制作uber-jar进行打包、运行


这样你就可以在纯 Spring 框架中实现 Spring MVC 的 JSON 处理功能。


uber-jar 也被称为"fat jar"或者"shadow jar"，简单来说，就是一个包含了项目所有依赖的 jar 包。通常，一个 Java 项目会依赖很多外部库，这些库都是以独立的 jar 文件存在的。部署项目的时候，需要把项目本身的 jar 包和所有依赖的 jar 包一起放到服务器上。uber-jar 的出现就是为了简化这个过程，它把所有需要的库都打包到一个 jar 文件里，这样部署和分发就方便多了。

举个例子，假设你在开发一个简单的 Web 应用，它用了 Spring 框架、Hibernate ORM 和一些日志库。如果没有 uber-jar，你需要把应用的 jar 包，加上 Spring、Hibernate、日志库等等所有依赖的 jar 包一起部署到服务器。这样部署起来比较麻烦，而且容易出现版本冲突之类的问题。

但如果用了 uber-jar，所有这些依赖都会被打包到应用的 jar 包里。你只需要部署这一个文件，服务器就能跑起你的应用了，是不是方便很多？

uber-jar 的优点主要有以下几点：

* 部署简单： 只需要部署一个文件，不用管理一堆依赖。
* 避免依赖冲突： 所有的依赖都在 uber-jar 里，不会和其他应用的依赖冲突。
* 可移植性强： uber-jar 可以很方便地复制到不同的环境运行，不用担心缺依赖。

当然，uber-jar 也有缺点：

* 文件体积大： 因为它包含了所有依赖，uber-jar 的文件体积会比普通的 jar 包大很多。
* 更新麻烦： 如果要更新某个依赖，需要重新构建整个 uber-jar。

那在 Maven 里怎么创建 uber-jar 呢？可以使用maven-shade-plugin，在pom.xml中添加如下内容：


```xml
<build>
    <finalName>spring-mvc-json-tomcat-embed</finalName>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-shade-plugin</artifactId>
        <version>3.6.0</version>
        <configuration>
          <createDependencyReducedPom>true</createDependencyReducedPom>
          <filters>
            <filter>
              <artifact>*:*</artifact>
              <excludes>
                <exclude>module-info.class</exclude>
                <exclude>META-INF/*.SF</exclude>
                <exclude>META-INF/*.DSA</exclude>
                <exclude>META-INF/*.RSA</exclude>
              </excludes>
            </filter>
          </filters>
        </configuration>
        <executions>
          <execution>
            <phase>package</phase>
            <goals>
              <goal>shade</goal>
            </goals>
            <configuration>
              <transformers>
                <!-- 设置主类 -->
                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                  <mainClass>com.example.spring.mvc.App</mainClass>
                </transformer>
              </transformers>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
</build>    
```


修改打包的格式为jar：

```xml
<!--<packaging>war</packaging>-->
<packaging>jar</packaging>
```


使用 Maven 打包项目：

```bash
mvn clean package
```

生成了spring-mvc-json-tomcat-embed.jar文件。该JAR文件可以直接通过以下方式启动：
```bash
java -jar spring-mvc-json-tomcat-embed.jar
```

### 总结

嵌入式 Tomcat 把容器和应用代码打包在一起，消除了外部服务器依赖，简化了配置流程。无论是构建微服务、快速原型开发，还是适配容器化环境，它都能降低系统复杂度。
