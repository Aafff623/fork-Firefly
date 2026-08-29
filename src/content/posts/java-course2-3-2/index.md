---
title: "快速掌握测试战略一：单元测试"
published: 2026-08-25
description: "TDD（Test-Driven Development，测试驱动开发）方法要求我们开发功能代码之前，先编写单元测试用例代码。真正的单元测试通常运行得非常快，所以，花费时间用于编写测试用例对整个开发周期…"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-3-2
pinned: false
comment: true
---

### Mock 对象

TDD（Test-Driven Development，测试驱动开发）方法要求我们开发功能代码之前，先编写单元测试用例代码。真正的单元测试通常运行得非常快，所以，花费时间用于编写测试用例对整个开发周期来说，是效率上的提升。TDD 是敏捷开发中的一项核心实践和技术，也是一种设计方法论。

遵循 Spring 的体系结构建议，代码库的清晰分层和组件化将有助于更轻松地进行单元测试，可以让代码更少地依赖容器。但是，任何一种测试方法都不能涵盖所有的单元测试场景。所以，Spring 框架提供了 Mock 对象和测试支持类。

Mock 测试就是在测试过程中，对于某些不容易构造或者不容易获取的对象，用一个虚拟的对象来创建以便测试的测试方法。这个虚拟的对象就是 Mock 对象。Mock 对象就是真实对象在调试期间的代替品。

这篇关注 Mock 对象的使用。

#### Environment

`org.springframework.mock.env` 包中包含 Environment 和 PropertySource 抽象的 Mock 实现。MockEnvironment 和 MockPropertySource 对于开发依赖于环境特定属性的代码的容器外测试很有用。


#### JNDI

`org.springframework.mock.jndi` 包中包含了 JNDI SPI 的实现，可以使用该实现为测试套件或独立应用程序设置简单的 JNDI 环境。例如，如果 JDBC DataSources 在测试代码中与Java EE 容器中的 JNDI 名称绑定到相同的 JNDI 名称，则可以在测试场景中同时复用应用程序代码和配置，而无需进行修改。


#### Servlet API

`org.springframework.mock.web` 包中包含了一组全面的 Servlet API Mock 对象，可用于测试 Web 上下文、控制器和过滤器。这些 Mock 对象是针对 Spring Web MVC 框架的使用，通常比动态 Mock 对象技术（如 EasyMock）或替代 Servlet API Mock 对象技术（如 MockObjects）更方便使用。


#### Spring Web Reactive

`org.springframework.mock.http.server.reactive` 包中包含了用于 WebFlux 应用程序的 ServerHttpRequest 和 ServerHttpResponse 的 Mock 实现。包`org.springframework.mock.web.server` 包含一个模拟的 ServerWebExchange，它依赖于那些 Mock 的请求和响应对象。

MockServerHttpRequest 和 MockServerHttpResponse 都从相同的抽象基类扩展到特定于服务器的实现，并与他们共享行为。例如，Mock 请求一旦创建就是不可变的，但是你可以使用ServerHttpRequest 中的 mutate() 方法来创建一个可被修改的实例。

## 测试工具类


### 测试工具


`org.springframework.test.util` 包中包含几个用于单元测试和集成测试的工具类。

`ReflectionTestUtils` 是基于反射的工具类的集合。借助这个工具，开发人员可以在测试中按需更改常量值、设置非 public 的字段，调用非 public 配置方法等。


`AopTestUtils` 是 AOP 相关的工具类的集合。这些方法可以用来获取隐藏在一个或多个 Spring 代理后面的底层目标对象的引用。

###  测试 Spring MVC

`org.springframework.test.web` 包包含了 ModelAndViewAssert，可以将其与 JUnit、TestNG 或任何其他测试框架结合使用，用于处理 Spring MVC ModelAndView 对象的单元测试。
