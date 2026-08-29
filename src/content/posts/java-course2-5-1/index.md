---
title: "系统掌握事务管理，从ACID到全局事务的全栈生存法则"
published: 2026-08-25
description: "在关系型数据库中，一个事务可以是一条 SQL 语句，一组 SQL 语句或整个程序。事务是恢复和并发控制的基本单位。"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-5-1
pinned: false
comment: true
---

在关系型数据库中，一个事务可以是一条 SQL 语句，一组 SQL 语句或整个程序。事务是恢复和并发控制的基本单位。

事务应该具有4个属性，即原子性、一致性、隔离性和持久性。这四个属性通常称为 ACID 特性。

* 原子性（atomicity）。一个事务是一个不可分割的工作单位，事务中包括的所有操作要么都做，要么都不做。
* 一致性（consistency）。事务必须是使数据库从一个一致性状态变到另一个一致性状态。一致性与原子性是密切相关的。
* 隔离性（isolation）。一个事务的执行不能被其他事务干扰。即一个事务内部的操作及使用的数据对并发的其他事务是隔离的，并发执行的各个事务之间不能互相干扰。
* 持久性（durability）。持久性也称永久性（permanence），指一个事务一旦提交，它对数据库中数据的改变就应该是永久性的。接下来的其他操作或故障不应该对其有任何影响。

这篇，我们着重关注 Spring 的事务管理。

### 5.1.1 Spring 事务管理概述

Spring 框架支持全面的事务管理。

Spring 框架为事务管理提供了一致的抽象，具有以下优势：

* 跨越不同事务 API 的一致编程模型。如 Java 事务 API（JTA）、JDBC、Hibernate 和 Java 持久性 API（JPA）。
* 支持声明式事务管理。
* 用于编程式事务管理的简单 API 比复杂事务 API（如JTA）要简单。
* 与 Spring 的数据访问抽象有极佳整合能力。


### 5.1.2 Spring 事务模型


传统上，Java EE 开发人员对事务管理有两种选择：全局事务或本地事务。两者都有很大的局限性。接下来将讨论 Spring 框架的事务管理如何支持如何解决全局事务和本地事务模型的局限性。

#### 全局事务

全局事务使您能够使用多个事务资源，通常是关系型数据库和消息队列。应用程序服务器通过 JTA 管理全局事务，这个 API 的使用是相当的繁琐。还有，JTA 的 UserTransaction 通常需要来自 JNDI，这意味着还需要使用 JNDI 才能使用 JTA。很明显，全局事务的使用将限制应用程序代码的重用，因为 JTA 通常只在应用程序服务器环境中可用。

以前，使用全局事务的首选方式是通过 EJB CMT（容器管理事务）。CMT 是一种声明式事务管理（区别于编程式事务管理）。EJB CMT 消除了与事务相关的 JNDI 查找的需要，当然，使用EJB 本身也需要使用 JNDI。它消除了大部分但不是全部需要编写 Java 代码来控制事务。重要的缺点是 CMT 与 JTA 和应用服务器环境相关联。还有，只有在选择在 EJB 中实现业务逻辑时，或者至少在事务性 EJB Facade 后面才可用。一般来说，EJB 的负面影响非常大，所以这不是一个有吸引力的选择。

#### 本地事务

本地事务是特定于资源的，例如与 JDBC 连接关联的事务。本地事务可能更容易使用，但有明显的缺点：它们不能在多个事务资源上工作。例如，使用 JDBC 连接管理事务的代码无法在全局JTA 事务中运行。由于应用程序服务器不参与事务管理，因此无法确保跨多个资源的正确性。另一个缺点是本地事务对编程模型是侵入式的。

当然，大多数应用程序使用的是单个事务资源，因此本地事务仍然能够满足需求。

#### Spring 框架的一致编程模型

Spring 解决了全局事务和本地事务的缺点。它使应用程序开发人员能够在任何环境中使用一致的编程模型。只需编写一次代码，就能够从不同环境中的不同事务管理策略中受益。Spring 框架提供了声明式和编程式事务管理。

通过编程式事务管理，开发人员可以使用 Spring 框架事务抽象，它可以在任何事务基础设施上运行。使用声明式模型，开发人员通常会很少写或不用写与事务管理相关的代码，因此不依赖于 Spring 框架事务 API 或任何其他事务 API。大多数用户更喜欢声明式事务管理。


Spring 事务抽象的核心概念是事务策略。事务策略由 `org.springframework.transaction.PlatformTransactionManager` 接口定义：

```java
public interface PlatformTransactionManager {

    TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException;

    void commit(TransactionStatus status) throws TransactionException;

    void rollback(TransactionStatus status) throws TransactionException;
}
```


这主要是一个服务提供者接口（SPI），虽然它可以通过应用程序代码以编程方式使用。由于 PlatformTransactionManager 是一个接口，因此可以根据需要轻松进行 Mock 或 Stub。它不受诸如 JNDI 之类的查找策略的束缚。PlatformTransactionManager 实现像 Spring 框架 IoC 容器中的任何其他对象（或 bean）一样定义。单就此优势而言，即使您使用 JTA，Spring 框架事务也是一种有价值的抽象。Spring 的事务代码可以比直接使用 JTA 更容易测试。

PlatformTransactionManager 接口的任何方法都可以抛出未检查（unchecked ）的 TransactionException（也就是说，它扩展了java.lang.RuntimeException类）。应用程序开发人员可以自行选择捕获和处理 TransactionException。


`getTransaction(..)` 方法根据 TransactionDefinition 参数返回一个 TransactionStatus 对象。返回的 TransactionStatus 可能代表一个新的事务，或者是一个已经存在的事务（如果当前调用栈中存在匹配的事务）。后一种情况的含义是，与 Java EE 事务上下文一样，TransactionStatus 与一个执行线程相关联。

TransactionDefinition 接口指定了：

* 隔离（Isolation）：代表了事务与其他事务的分离程度。例如，这个事务可以看到来自其他事务的未提交的写入等。
* 传播（Propagation）：通常，在事务范围内执行的所有代码都将在该事务中运行。但是，如果在事务上下文已经存在的情况下执行事务方法，则可以选择指定行为。例如，代码可以在现有的事务中继续运行（常见的情况）。或者现有事务可以被暂停并创建新的事务。Spring 提供了 EJB CMT 所熟悉的所有事务传播选项。
* 超时（Timeout）：定义了事务超时之前该事务能够运行多久，并由事务基础设施自动回滚。
* 只读状态（Read-only status）：当您的代码读取但不修改数据时，可以使用只读事务。在某些情况下，只读事务可以是一个有用的优化，例如当您使用 Hibernate 时。

这些设置反映了标准的事务概念。理解这些概念对于使用 Spring 框架或任何事务管理解决方案都很重要。

TransactionStatus 接口为事务代码提供了一种简单的方法来控制事务执行和查询事务状态：

```java
public interface TransactionStatus extends SavepointManager {

    boolean isNewTransaction();

    boolean hasSavepoint();

    void setRollbackOnly();

    boolean isRollbackOnly();

    void flush();

    boolean isCompleted();

}
```

PlatformTransactionManager 实现通常需要知道它们的工作环境，如 JDBC、JTA、Hibernate等等。以下示例显示如何定义本地 PlatformTransactionManager 实现。

首先，定义了一个 JDBC 数据源：

```java
@Bean
public DataSource dataSource() {
    return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .setName("testdb")
            .addScript("classpath:schema.sql")
            .addScript("classpath:data.sql")
            .build();
}
```

相关的 PlatformTransactionManager bean 定义将会有一个对 DataSource 定义的引用。 它看起来像这样：


```java
@Bean
public PlatformTransactionManager transactionManager(DataSource dataSource) {
    return new DataSourceTransactionManager(dataSource);
}
```

如果您在 Java EE 容器中使用 JTA，那么您将通过 JNDI 获得的容器 DataSource 与 Spring 的 JtaTransactionManager 结合使用。以下是使用 JTA 和 JNDI 查找的例子：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:jee="http://www.springframework.org/schema/jee"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/jee
        http://www.springframework.org/schema/jee/spring-jee.xsd">

    <jee:jndi-lookup id="dataSource" jndi-name="jdbc/jpetstore"/>

    <bean id="txManager" class="org.springframework.transaction.jta.JtaTransactionManager" />

    <!-- 其他 bean 定义 -->

</beans>
```


JtaTransactionManager 不需要了解 DataSource 或任何其他特定资源，因为它使用容器的全局事务管理基础设施。

dataSource bean 的上述定义使用 jee 命名空间中的`<jee:jndi-lookup />`标签。

可以轻松地使用 Hibernate 本地事务，如以下示例所示。在这种情况下，需要定义一个 Hibernate LocalSessionFactoryBean，应用程序代码将用它来获取 Hibernate Session 实例。


这种情况下的 txManager bean 是 HibernateTransactionManager 类型。与 DataSourceTransactionManager 需要对 DataSource 的引用相同，HibernateTransactionManager 需要对 SessionFactory 的引用。

```xml
<bean id="sessionFactory" class="org.springframework.orm.hibernate5.LocalSessionFactoryBean">
    <property name="dataSource" ref="dataSource"/>
    <property name="mappingResources">
        <list>
            <value>org/springframework/samples/petclinic/hibernate/petclinic.hbm.xml</value>
        </list>
    </property>
    <property name="hibernateProperties">
        <value>
            hibernate.dialect=${hibernate.dialect}
        </value>
    </property>
</bean>

<bean id="txManager" class="org.springframework.orm.hibernate5.HibernateTransactionManager">
    <property name="sessionFactory" ref="sessionFactory"/>
</bean>
```


如果正在使用 Hibernate 和 Java EE 容器管理的 JTA 事务，那么应该简单地使用与之前 JTA JDBC 示例相同的 JtaTransactionManager。

```xml
<bean id="txManager" class="org.springframework.transaction.jta.JtaTransactionManager"/>
```

如果使用 JTA，那么无论使用哪种数据访问技术——无论是 JDBC、Hibernate JPA 还是其他任何支持的技术——事务管理器定义都将保持不变。这是由于 JTA 事务是全局事务，它可以征用任何事务资源。

在所有这些情况下，应用程序代码不需要改变，可以通过更改配置来更改事务的管理方式。这种更改意味着从本地事务转移到全局事务，反之亦然。


#### 是否真的需要应用程序服务器的 JTA

通常情况下，只有当应用程序需要处理跨多个资源的事务时，才需要应用程序服务器的 JTA 功能，这对于许多应用程序来说不是必需的，特别是很多应用程序都是使用单个高度可伸缩的数据库（如 Oracle RAC）。

即便没有应用程序服务器的 JTA 功能，还有很多那独立事务管理器可供选择，如 Atomikos Transactions 和 JOTM。当然，可能还需要其他应用程序服务器功能，例如 Java 消息服务（JMS）和 Java EE 连接器体系结构（JCA）。
