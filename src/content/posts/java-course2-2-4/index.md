---
title: "AOP核心概念及用法"
published: 2026-08-25
description: "AOP（Aspect Oriented Programming，面向切面编程）通过提供另一种思考程序结构的方式来补充 OOP（Object Oriented Programming，面向对象编程）。O…"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-2-4
pinned: false
comment: true
---

AOP（Aspect Oriented Programming，面向切面编程）通过提供另一种思考程序结构的方式来补充 OOP（Object Oriented Programming，面向对象编程）。OOP 模块化的关键单元是类，而在 AOP 中，模块化的单元是切面（Aspect）。切面可以实现诸如跨多个类型和对象之间的事务管理、日志等方面的模块化。

### 2.4.1 AOP 概述

AOP 编程的目标与 OOP 编程的目标并没有什么不同，都是为了减少重复和专注于业务。相比之下，OOP 是婉约派的，用继承和组合的方式，绵绵编织成一套类和对象体系。而 AOP 是豪放派，大手一挥，凡某包某类某命名方法，一并如斯处理。OOP 是绣花针，而 AOP 是砍柴刀。

Spring 框架关键组件之一是 AOP 框架。虽然 Spring IoC 容器不依赖于 AOP，但在 Spring 应用中，经常会使用 AOP 来简化编程。在 Spring 框架中使用 AOP 主要有以下优势。

* 提供声明式企业服务，特别是作为 EJB 声明式服务的替代品。最重要的是这种服务是声明式事务管理。
* 允许用户实现自定义切面，在某些不适合用 OOP 编程的场景中，采用 AOP 来补充。
* 可以对业务逻辑的各个部分进行隔离，从而使业务逻辑各部分之间的耦合度降低，提高程序的可重用性，同时提高了开发的效率。

要使用 Spring AOP 需要添加 `spring-aop` 模块。

### 2.4.2 AOP 核心概念

AOP 概念并非 Spring AOP 特有的，这些概念同样适用于其他 AOP 框架，如 AspectJ。

* Aspect（切面）：将关注点进行模块化。某些关注点可能会横跨多个对象，例如，事务管理就是 Java 企业级应用中一个关于横切关注点的很好的例子。 在 Spring AOP 中，切面可以使用常规类（基于模式的方法）或使用@Aspect 注解的常规类来实现切面。
* Join Point（连接点）：在程序执行过程中某个特定的点，如某方法调用的时候或者处理异常的时候。 在 Spring AOP 中，一个连接点总是代表一个方法的执行。
* Advice（通知）：在切面的某个特定的连接点上执行的动作。通知有各种类型，其中包括“around”、“before”和“after”等通知。许多 AOP 框架，包括 Spring，都是以拦截器来实现通
知模型的，并维护一个以连接点为中心的拦截器链。
* Pointcut（切入点）：匹配连接点的断言。通知和一个切入点表达式关联，并在满足这个切入点的连接点上运行（如当执行某个特定名称的方法时）。切入点表达式如何和连接点匹配是
AOP 的核心。Spring 默认使用 AspectJ 切入点语法。
* Introduction（引入）：声明额外的方法或者某个类型的字段。Spring 允许引入新的接口（以及一个对应的实现）到任何被通知的对象。 例如，可以使用一个引入来使 bean 实现 IsModified 接口，以便简化缓存机制。在 AspectJ 社区 ，Introduction 也称 Inter-type Declaration（内部类型声明）。
* Target Object（目标对象）：被一个或者多个切面所通知的对象。也有人把它称为 Advised（被通知） 对象。既然 Spring AOP 是通过运行时代理实现的，这个对象永远是一个 Proxied（被代理） 对象。
* AOP Proxy（AOP 代理）：AOP 框架创建的对象，用来实现 Aspect Contract（切面契约）包括通知方法执行等功能。在 Spring 中，AOP 代理可以是 JDK 动态代理或者 CGLIB 代理。
* Weaving（织入）： 把切面连接到其他的应用程序类型或者对象上，并创建一个 Advised （被通知）的对象。 这些可以在编译时（如使用 AspectJ 编译器）、类加载时和运行时完成。

Spring 和其他纯 Java AOP 框架一样，在运行时完成织入。其中有关 Advice（通知）的类型主要有几下几种。

* Before Advice（前置通知）： 在某连接点之前执行的通知，但这个通知不能阻止连接点前的执行（除非它抛出一个异常）。
* After Returning Advice（返回后通知）： 在某连接点正常完成后执行的通知，例如，一个方法没有抛出任何异常，正常返回。
* After Throwing Advice（抛出异常后通知）： 在方法抛出异常退出时执行的通知。
* After (finally) Advice（最后通知）： 当某连接点退出的时候执行的通知（不论是正常返回还是异常退出）。
* Around Advice（环绕通知）： 包围一个连接点的通知，如方法调用。这是最强大的一种通知类型。环绕通知可以在方法调用前后完成自定义的行为，它也会选择是否继续执行连接点或者
直接返回它们自己的返回值或抛出异常来结束执行。

Around Advice（环绕通知）是最常用的一种通知类型。与AspectJ 一样，Spring 提供所有类型的通知，推荐使用尽量简单的通知类型来实现需要的功能。例如，如果只是需要用一个方法的返回值来更新缓存，虽然使用环绕通知也能完成同样的事情，但是最好使用 After Returning 通知而不是环绕通知。用最合适的通知类型可以使编程模型变得简单，并且能够避免很多潜在的错误。例如，不需要调用 JoinPoint（用于Around Advice）的 proceed() 方法，就不会有调用的问题。

在 Spring 2.0 中，所有的通知参数都是静态类型，因此可以使用合适的类型（如一个方法执行后的返回值类型）作为通知的参数，而不是使用一个对象数组。

切入点和连接点匹配的概念是 AOP 的关键，这使得 AOP 不同于其他仅仅提供拦截功能的旧技术。 切入点使得通知可独立于 OO（Object Oriented，面向对象）层次。 例如，一个提供声明式事务管理的 Around Advice（环绕通知）可以被应用到一组横跨多个对象中的方法上（如服务层的所有业务操作）。

### 2.4.3 Spring AOP

Spring AOP 用纯 Java 实现，它不需要专门的编译过程。Spring AOP 不需要控制类装载器层次，因此它适用于 Servlet 容器或应用服务器。

Spring 目前仅支持使用方法调用作为连接点。虽然可以在不影响 Spring AOP 核心 API 的情况下加入对成员变量拦截器的支持，但 Spring 并没有实现成员变量拦截器。如果需要通知对成员变量的访问和更新连接点，可以考虑其他语言，如 AspectJ。

Spring 实现 AOP 的方法跟其他的框架不同。Spring 并不是要尝试提供最完整的 AOP 实现（尽管 Spring AOP 有这个能力）， 相反地，它其实侧重于提供一种 AOP 实现和 Spring IoC 容器的整合，用于帮助解决在企业级开发中的常见问题。

因此，Spring AOP 通常都和 Spring IoC 容器一起使用。Aspect 使用普通的 bean 定义语法，与其他 AOP 实现相比这是一个显著的区别。有些事使用 Spring AOP 是无法轻松或者高效完成的，如通知一个细粒度的对象。这种时候，使用 AspectJ 是最好的选择。对于大多数在企业级 Java 应用中遇到的问题，Spring AOP 都能提供一个非常好的解决方案。

Spring AOP 从来没有打算通过提供一种全面的 AOP 解决方案来取代 AspectJ。它们之间的关系应该是互补而不是竞争。Spring 可以无缝地整合 Spring AOP、IoC 和 AspectJ，使所有的 AOP 应用完全融入基于 Spring 的应用体系，这样的集成不会影响 Spring AOP API 或者AOP Alliance API。

Spring AOP 保留了向下兼容性，这体现了 Spring 框架的核心原则——非侵袭性，即 Spring 框架并不强迫在业务或者领域模型中引入框架特定的类和接口。

### 2.4.4 AOP 代理

Spring AOP 默认使用标准的 JDK 动态代理来作为 AOP 的代理，这样任何接口（或者接口的 set 方法）都可以被代理。

Spring AOP 也支持使用 CGLIB 代理，对于需要代理类而不是代理接口的时候，CGLIB 代理是很有必要的。如果一个业务对象并没有实现一个接口，默认就会使用 CGLIB。 还有，面向接口编程也是一个最佳实践，业务对象通常都会实现一个或多个接口。还可以强制地使用 CGLIB，在那些（希望是罕见的）需要通知一个未在接口中声明的方法的情况下，或者需要传递一个代理对象作为一种具体类型的方法的情况下。

### 2.4.5 使用 @AspectJ

`@AspectJ`是用于切面的常规 Java 类注解。AspectJ 项目引入了`@AspectJ`风格，作为 AspectJ 5 版本的一部分。 Spring 使用了与 AspectJ 5 相同的用于切入点解析和匹配的的注解，但 AOP 运行时仍然是纯粹的 Spring AOP，并且不依赖于 AspectJ 编译器或编织器。

#### 1.启用 @AspectJ

可以通过 XML 或者 Java 配置来启用`@AspectJ`支持。在任何情况下，还需要确保 AspectJ 的`org.aspectj:aspectjweaver`库在应用程序的类路径中（1.9或以后版本）。这个库在 AspectJ 发布的 lib 目录中或通过 Maven 的中央存库得到。配置如下：

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
</dependency>
```

下面演示了使用 @Configuration 和 @EnableAspectJAutoProxy 注解来启用 `@AspectJ` 的例子。

```java
@Configuration
@EnableAspectJAutoProxy
public class AppConfig {

}
```

基于 XML 的配置，可以使用 `aop:aspectj-autoproxy` 元素。

```xml
<aop:aspectj-autoproxy/>
```

#### 2.声明 Aspect

在启用 `@AspectJ` 支持的情况下，在应用上下文中定义的任意带有一个 `@AspectJ` 注解的切面的 bean 都将被 Spring 自动识别并用于配置 Spring AOP。以下例子展示了一个切面所需要的最小定义。

```xml
<bean id="myAspect" class="com.example.spring.aop.Fighter">
<!-- 配置aspect的属性 -->
</bean>
```

上面这个 bean 指向一个使用了 `@AspectJ` 注解的 bean 类。下面是 Fighter 类定义，使用了 org.aspectj.lang.annotation.Aspect 注解。

```java
package com.example.spring.aop;

@Aspect
public class Fighter {

}
```

#### 3.声明 Pointcut

Spring AOP 只支持 Spring bean 方法执行连接点，所以可以把切入点看作是匹配 Spring bean 上的方法执行。一个切入点声明有两个部分，一个包含名称和任意参数的签名，另一个是切入点表达式，该表达式决定了哪个方法的执行。 在 @AspectJ 中，一个切入点实际就是一个普通的方法定义提供的一个签名。切入点表达式使用 @Pointcut 注解来表示，注意，这个方法的返回类型必须是 void。

下面的例子定义了一个切入点“anyOldTransfer”，这个切入点匹配了任意名为 transfer 的方法执行。

```java
@Pointcut("execution(* transfer(..))")// Pointcut表达式
private void anyOldTransfer() {}// Pointcut签名
```

切入点表达式也就是`@Pointcut`注解的值，是正规的 AspectJ 5 切入点表达式。

切入点表达式可以使用 “&&”、“||”和“!”。也可以通过名称来引用切入点表达式。以下示例显示了三种切入点表达式：anyPublicOperation（如果是任何公共方法，则匹配）、inTrading（在 trading 模块中的方法，则匹配）和 tradingOperation（在 trading 模块中的任何公共方法，则匹配）。

```java
@Pointcut("execution(public * *(..))")
private void anyPublicOperation() {}

@Pointcut("within(com.xyz.someapp.trading..*)")
private void inTrading() {}

@Pointcut("anyPublicOperation() && inTrading()")
private void tradingOperation() {}
```
