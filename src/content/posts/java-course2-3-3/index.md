---
title: "进阶掌握测试战略二：集成测试"
published: 2026-08-25
description: "集成测试，也叫组装测试或联合测试。在单元测试的基础上，将所有模块按照设计要求组装成为子系统或系统，进行集成测试。虽然，单元测试保障了每个类、每个函数是可以正常工作的，但这也并不能保证连接起来也能正常的…"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-3-3
pinned: false
comment: true
---

集成测试，也叫组装测试或联合测试。在单元测试的基础上，将所有模块按照设计要求组装成为子系统或系统，进行集成测试。虽然，单元测试保障了每个类、每个函数是可以正常工作的，但这也并不能保证连接起来也能正常的工作。

在 Spring 应用中，集成测试经常需要关注以下几方面的内容：

* Spring IoC 容器上下文的是否正常注入了。
* 使用 JDBC 或 ORM 工具访问数据，这些使用这些工具所要完成的业务逻辑（诸如 SQL 语句、Hibernate 查询、JPA 实体映射）是否正确等等。

所以，集成测试是非常有必要的。

Spring 框架的 `spring-test` 模块为集成测试提供了一流的支持。此 Spring 的测试不依赖于应用程序服务器或其他部署环境。这样的测试比单元测试运行速度要慢，但要比等效的Selenium 测试或依赖部署到应用程序服务器的远程测试则要快得多。

在 Spring 2.5 及更高版本中，单元和集成测试支持以注解驱动的 Spring TestContext 框架的形式提供。TestContext 框架不受所使用的实际测试框架的影响，因此允许在各种环境中进行测试，包括 JUnit、TestNG 等等。

Spring 的集成测试支持以下主要功能：

* 在测试执行之间管理 Spring IoC 容器缓存。
* 提供测试夹具实例的依赖注入。
* 提供适合集成测试的事务管理。
* 提供特定于 Spring 的基类，以帮助开发人员编写集成测试。


### 上下文管理与缓存

在 Spring 应用中，初次启动应用往往比较耗时，不是因为 Spring 本身的开销，而是因为 Spring 容器实例化的对象需要时间来实例化。例如，具有 50 到 100 个 Hibernate 映射文件的项目可能需要10到20秒来加载映射文件。

这种耗时，同样体现在集成测试中。因为每个测试夹具中运行每个测试之前产生的成本会导致整体测试运行速度降低，从而降低开发人员的生产力。

所以，缓存上下文变得尤为重要。Spring TestContext 框架提供了 Spring ApplicationContexts 和 WebApplicationContexts 的一致加载以及这些上下文的缓存。

默认情况下，一旦加载，为每个测试重新使用配置的 ApplicationContext。因此，每个测试套件只需要一次设置成本，而后续的测试执行速度寄回变得快得多。在这种情况下，术语“测试套件（test suite）”意味着所有的测试都运行在同一个 JVM 中。使用 TestContext 框架可以查看上下文管理和上下文缓存。


### 测试夹具的依赖注入

当 TestContext 框架加载你的应用程序上下文时，它可以通过依赖注入来选择性地配置你的测试类的实例，这为使用应用程序上下文中预先配置的 bean 设置测试装置提供了一个方便的机制。这里的强大优势是，您可以在各种测试场景（例如，配置 Spring 管理的对象图、事务代理、数据源等）中重复使用应用程序上下文，从而避免为个别测试案例复制复杂的测试夹具设置。


### 事务管理

访问真实数据库的测试中的一个常见问题是它们对持久性存储的状态的影响。即使您正在使用开发数据库，​​对状态的更改也可能影响将来的测试。另外，许多操作（例如插入或修改持久性数据）不能在事务之外执行（或验证）。

TestContext 框架解决了这个问题。默认情况下，框架将为每个测试创建并回滚事务。您只需编写可以假定事务存在的代码即可。如果您在测试中调用事务代理对象，那么它们将根据其配置的事务语义正确行为。另外，如果一个测试方法在测试管理的事务内部运行时删除所选表的内容，事务将默认回滚，数据库将在测试执行之前返回到它的状态。事务支持通过在测试的应用程序上下文中定义的 PlatformTransactionManager bean 提供给测试。

### 集成测试类

Spring TestContext 框架提供了一些支持来简化集成测试的编写。这些基础类为测试框架提供了定义良好的钩子，还有一些便利的实例变量和方法，使你能够访问：

* ApplicationContext：用于从整体上来进行显示的 bean 查找或者测试上下文的状态。
* JdbcTemplate：用于执行 SQL 语句来查询数据库。这些的查询可用于确认执行数据库相关的应用程序代码前后数据库的状态，并且 Spring 保证这些查询与应用程序代码在同一个事务作用域中执行。如果需要与 ORM 工具协同使用，请确保避免误报。

还有，你可能想用特定于你的项目的实例和方法来创建你自己自定义的，应用程序范围的超类。


### JDBC

`org.springframework.test.jdbc`是包含 JdbcTestUtils 的包，它是一个 JDBC 相关的工具方法集，意在简化标准数据库测试场景。特别地，JdbcTestUtils 提供以下静态工具方法：

* countRowsInTable(..)：统计给定表的行数。
* countRowsInTableWhere(..)：使用提供的 where 语句进行筛选统计给定表的行数。
* deleteFromTables(..)：删除特定表的全部数据。
* deleteFromTableWhere(..)：使用提供的 where 语句进行筛选并删除给定表的数据。
* dropTables(..)：删除指定的表。

注意 AbstractTransactionalJUnit4SpringContextTests 和 AbstractTransactionalTestNGSpringContextTests 提供了委托给前面所述的 JdbcTestUtils 中的方法的简便方法。

`spring-jdbc` 模块提供了配置和启动嵌入式数据库的支持，可用于与数据库交互的集成测试中。
