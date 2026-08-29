---
title: "实战：使用AOP的例子"
published: 2026-08-25
description: "下面用一个简单有趣的例子来演示 Spring AOP 的用法。我们的例子是演绎了一段“武松打虎”的故事情节——武松（Fighter）在山里等着老虎（Tiger）出现，只要老虎出来了（Tiger）被武松…"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-2-5
pinned: false
comment: true
---

下面用一个简单有趣的例子来演示 Spring AOP 的用法。我们的例子是演绎了一段“武松打虎”的故事情节——武松（Fighter）在山里等着老虎（Tiger）出现，只要老虎出来了（Tiger）被武松发现了，武松就打老虎。


### 初始化项目原型


执行以下命令进行初始化项目原型：

```
mvn archetype:generate -DgroupId=com.example.spring.aop -DartifactId=spring-aop-aspect -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.5 -DinteractiveMode=false
```

此时会创建一个名为“spring-aop-aspect”的项目。

我们需要将`spring-context`、`spring-aspects`模块引入我们的应用，就在pom.xml文件中添加如下的 Maven 配置片段：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>6.2.9</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-aspects</artifactId>
        <version>6.2.9</version>
    </dependency>
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</dependencies>
```

但这种配置方式需要在每个依赖上面声明版本，略显繁琐。此时，可以使用`spring-framework-bom`。`spring-framework-bom`是一个 BOM 文件，用于管理 Spring Framework 及其相关模块的所有依赖版本。通过引入这个 BOM 文件，可以在项目中使用 Spring 框架及其各个模块，而无需显式指定每个依赖的版本号。确保项目中所有 Spring 框架相关的依赖都使用相同的版本，避免版本不一致导致的问题。 

`spring-framework-bom`用法如下：

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
        <artifactId>spring-aspects</artifactId>
    </dependency>
    <!-- ...为节约篇幅，此处省略非核心内容 -->
</dependencies>
```

### 定义业务模型
 
我们先定义了老虎（Tiger）类。

```java
package com.example.spring.aop;

/**
 * Tiger.
 *
 * @version 2025/08/07
 **/
public class Tiger {

	public void walk() {
		System.out.println("Tiger is walking..."); 
	}
}
```

老虎（Tiger）类只有一个 walk() 方法，只要老虎出来走动了，就会触发这个方法。

### 定义切面和配置

那么我们的打虎英雄武松（Fighter）要做什么呢？他主要关注于老虎的动向，等着老虎出来活动。所以，我们在 Fighter 类中，定义了一个 `@Pointcut("execution(* com.example.spring.aop.Tiger.walk())") `。同时，在该切入点前后，我们都可以执行相关的方法，定义在 foundBefore() 和 foundAfter()。

```java
package com.example.spring.aop;

import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;

/**
 * Fighter.
 *
 * @version 2025/08/07
 **/
@Aspect
public class Fighter {

	@Pointcut("execution(* com.example.spring.aop.Tiger.walk())")
	public void foundTiger() {
	}

	@Before(value = "foundTiger()")
	public void foundBefore() {
		System.out.println("Fighter wait for tiger...");
	}

	@AfterReturning("foundTiger()")
	public void foundAfter() {
		System.out.println("Fighter fight with tiger...");
	}

}
```

相应的 Spring 的配置如下。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	xmlns:context="http://www.springframework.org/schema/context"
	xmlns:aop="http://www.springframework.org/schema/aop"
	xsi:schemaLocation="
        http://www.springframework.org/schema/beans 
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context 
        http://www.springframework.org/schema/context/spring-context.xsd
        http://www.springframework.org/schema/aop  
        http://www.springframework.org/schema/aop/spring-aop.xsd">

    <!-- 启动AspectJ支持 -->  
    <aop:aspectj-autoproxy />

	<!-- 定义 bean -->
    <bean id="fighter" class="com.example.spring.aop.Fighter" />
    <bean id="tiger" class="com.example.spring.aop.Tiger" />
    
</beans>
```

### 定义主应用

我们主应用定义如下：

```java
package com.example.spring.aop;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * 使用AOP的例子
 */
public class App {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("spring.xml");
        Tiger tiger = context.getBean(Tiger.class);
        tiger.walk();
    }
}
```

### 运行

最终输出如下：

```
Fighter wait for tiger...
Tiger is walking...
Fighter fight with tiger...
```
