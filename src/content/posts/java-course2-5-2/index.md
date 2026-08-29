---
title: "事务实现资源同步"
published: 2026-08-25
description: "通过之前的介绍，我们现在应该清楚如何创建不同的事务管理器，以及它们如何链接到需要与事务同步的相关资源上，例如 DataSourceTransactionManager 到 JDBC 数据源，Hiber…"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-5-2
pinned: false
comment: true
---

通过之前的介绍，我们现在应该清楚如何创建不同的事务管理器，以及它们如何链接到需要与事务同步的相关资源上，例如 DataSourceTransactionManager 到 JDBC 数据源，HibernateTransactionManager 链接到 Hibernate SessionFactory 等等。


### 5.2.1 高级别的同步方法

高级别的同步方法是首选的方法，通常是使用 Spring 基于模板的持久性集成 API，或者是原生的 ORM API 来管理本地的资源工厂。这些事务感知型解决方案在内部处理资源创建和重用、清理、映射等，用户可以无需关注这些细节。这样，用户可以纯粹专注于非模板化的持久性逻辑。通常，我们会使用原生的 ORM API 或使用 JdbcTemplate 采取模板方法进行 JDBC 访问。


### 5.2.2 低级别的同步方法


低级别的同步方法包括 DataSourceUtils（用于JDBC）、EntityManagerFactoryUtils（用于JPA）、SessionFactoryUtils（用于Hibernate）等。当您希望应用程序代码直接处理原生持久性 API 的资源类型时，可以使用这些类来确保获得正确的 Spring 框架管理的实例、事务（可选）同步、正确地映射等。

例如，在 JDBC 的情况下，不是调用 JDBC 传统的 DataSource 的 getConnection() 方法的，而是使用 Spring 的 `org.springframework.jdbc.datasource.DataSourceUtils` 类，如下所示：

```java
Connection conn = DataSourceUtils.getConnection(dataSource);
```

如果现有的事务已经有一个同步（链接）到它的连接，则返回该实例。否则，方法调用会触发创建一个新的连接，该连接（可选）与任何现有事务同步，并可用于同一事务中的后续重用。如前所述，任何 SQLException 都被封装在 Spring 框架 CannotGetJdbcConnectionException 中，这是 Spring 框架未检查的 DataAccessExceptions 的层次结构之一。这种方法为您提供了比从 SQLException 容易获得的信息更多的信息，并确保跨数据库的可移植性。

这种方法也可以在没有 Spring 事务管理的情况下工作（事务同步是可选的），因此无论是否使用 Spring 进行事务管理，都可以使用它。

当然，一旦你使用了 Spring 的 JDBC、JPA 或者 Hibernate 支持，你通常不会使用 DataSourceUtils 或其他帮助类，因为通过 Spring 抽象，比直接使用相关的 API 更简便。例如，如果使用 Spring JdbcTemplate 或 jdbc.object 包来简化 JDBC 的使用，无需编写任何特殊代码，就能在后台执行正确的连接检索。


### 5.2.3 TransactionAwareDataSourceProxy


TransactionAwareDataSourceProxy 类是最低级别的。一般情况下，几乎不需要使用这个类，而是使用上面提到的更高级别的抽象来编写新的代码。

这是目标 DataSource 的代理，它封装了目标 DataSource 以增加对 Spring 管理的事务的感知。在这方面，它类似于由 Java EE 服务器提供的事务性 JNDI 数据源。
