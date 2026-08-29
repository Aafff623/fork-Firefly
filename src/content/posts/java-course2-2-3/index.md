---
title: "实战：依赖注入的例子"
published: 2026-08-25
description: "“Hello world”应用是基于Java配置方式，而这个例子里，应用是基于XML的配置方式。通过这个例子演示基于构造函数的依赖注入，同时，我们也会演示如何来解析构造函数的参数。"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-2-3
pinned: false
comment: true
---

“Hello world”应用是基于Java配置方式，而这个例子里，应用是基于XML的配置方式。通过这个例子演示基于构造函数的依赖注入，同时，我们也会演示如何来解析构造函数的参数。

### 初始化项目原型


执行以下命令进行初始化项目原型：

```
mvn archetype:generate -DgroupId=com.example.spring.di -DartifactId=spring-dependency-injection -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.5 -DinteractiveMode=false
```

此时会创建一个名为“spring-dependency-injection”的项目。

们需要将`spring-context`模块引入我们的应用，就在pom.xml文件中添加如下的 Maven 配置片段：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>6.2.9</version>
    </dependency>

    <!-- ...为节约篇幅，此处省略非核心内容 -->
</dependencies>
```


### 定义服务类

定义消息服务接口 MessageService，该接口的主要职责是打印消息。

```java
package com.example.spring.di.service;

/**
 * MessageService 消息服务
 *
 * @version 2025/08/07
 **/
public interface MessageService {
    String getMessage();
}
```

消息服务类接口的实现 MessageServiceImpl代码如下。

```java
package com.example.spring.di.service;

/**
 * MessageServiceImpl 消息服务
 *
 * @version 2025/08/07
 **/
public class MessageServiceImpl implements MessageService {

    private String username;
    private String position;

    public MessageServiceImpl(String username, String position) {
        this.username = username;
        this.position = position;
    }

    @Override
    public String getMessage() {
        return "I am " + username + ", and my position in the company is as a " + position;
    }
}
```

其中，MessageServiceImpl 是具有带参的构造函数 username、age，并将这两个参数在 getMessage 方法中返回。

### 修改打印器

与“Hello world”应用中的打印器 MessagePrinter 的区别，就是将 `@Component`、`@Autowired` 注解去掉，改为基于 XML 的配置方式。

```java
package com.example.spring.di;

import com.example.spring.di.service.MessageService;

/**
 * MessagePrinter 打印器
 *
 * @version 2025/08/09
 **/
public class MessagePrinter {
    final private MessageService service;

    public MessagePrinter(MessageService service) {
        this.service = service;
    }

    public void printMessage() {
        String message = this.service.getMessage();
        System.out.println(message);
    }
}
```

我们期望，在执行 printMessage 方法之后就能将消息内容打印出来。而消息内容，是依赖于 MessageService 来提供的。这里，我们通过 XML 配置，将 MessageService 的实现改注入。

### 修改应用主类

App 是我们应用的入口类了。

```java
package com.example.spring.di;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * 依赖注入的例子
 */
public class App {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("spring.xml");
        MessagePrinter printer = context.getBean(MessagePrinter.class);
        printer.printMessage();
    }
}
```

由于，我们的应用是基于 XML 的配置，所以，这里需要 ClassPathXmlApplicationContext 类。这个类是 Spring 上下文的其中一种实现，可以实现基于 XML 的配置加载。按照约定，Spring 应用的配置文件 spring.xml 放置在应用的 resources 目录下。

### 创建配置文件

在应用的 resources 目录下，我们创建了一个 Spring 应用的配置文件 spring.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- 定义 bean -->
    <bean id="messageServiceImpl"
          class="com.example.spring.di.service.MessageServiceImpl">
        <constructor-arg name="username" value="Way Lau" />
        <constructor-arg name="position" value="Java Full Stack Developer" />
    </bean>

    <bean id="messagePrinter" class="com.example.spring.di.MessagePrinter">
        <constructor-arg name="service" ref="messageServiceImpl" />
    </bean>
</beans>
```

在该 spring.xml 文件中，我们可以清楚的看到 bean 之间的依赖关系。 messageServiceImpl 有两个构造函数的参数 username 和 age，其参数值在实例化的时候就解析了。messagePrinter 引用了 messageServiceImpl 作为其构造函数的参数。

### 运行

运行 App 类，就能在控制台看到“I am Way Lau, and my position in the company is as a Java Full Stack Developer”字样的信息了。
