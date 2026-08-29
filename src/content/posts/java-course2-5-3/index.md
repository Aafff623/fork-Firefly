---
title: "实战：快速掌握@Transactional声明式事务"
published: 2026-08-25
description: "Spring 框架的声明式事务管理是通过 Spring AOP 实现的。Spring 框架的声明式事务管理与 EJB CMT 类似，因为可以将事务行为指定到单个方法级别。如果需要，可以在事务上下文中调…"
image: ''
tags: [Java, Spring, IoC, AOP]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course2-5-3
pinned: false
comment: true
---

Spring 框架的声明式事务管理是通过 Spring AOP 实现的。Spring 框架的声明式事务管理与 EJB CMT 类似，因为可以将事务行为指定到单个方法级别。如果需要，可以在事务上下文中调用 `setRollbackOnly()` 方法。这两种事务管理的区别在于：

* 与 JTA 绑定的 EJB CMT 不同，Spring 框架的声明式事务管理适用于任何环境。通过简单地调整配置文件，它可以使用 JDBC、JPA 或 Hibernate 与 JTA 事务或本地事务协同工作。
* 可以将 Spring 框架声明式事务管理应用于任何类，而不仅仅是诸如 EJB 的特殊类。
* Spring 框架提供了声明式的回滚规则，这是一个 EJB 所没有的特性。提供了回滚规则的编程式和声明式支持。
* Spring 框架使您能够通过使用 AOP 来自定义事务行为。例如，可以在事务回滚的情况下插入自定义行为。而使用 EJB CMT 则不同，除 setRollbackOnly() 外，您不能影响容器的事务管理。
* Spring 框架不支持跨远程调用传播事务上下文。如果您需要此功能，我们建议您使用 EJB。但是，在使用这种功能之前请仔细考虑，因为通常情况下，使用事务的跨越远程调用的机会非常少。


回滚规则的概念很重要，它们指定了哪些异常会导致自动回滚。可以在配置中以声明方式指定。因此，尽管仍然可以调用 TransactionStatus 对象上的 setRollbackOnly() 来回滚当前事务，但通常可以指定 MyApplicationException 必须总是导致回滚的规则。这个选项的显著优点是业务对象不依赖于事务基础设施。例如，他们通常不需要导入 Spring 事务 API 或其他 Spring API。

虽然 EJB 容器默认行为会自动回滚系统异常事务（通常是运行时异常），但 EJB CMT 不会自动回滚应用程序异常（即除 `java.rmi.RemoteException` 之外的已检查异常）的事务。虽然声明式事务管理的 Spring 默认行为遵循 EJB 约定（回滚仅在未检查的异常时自动回滚），但定制此行为通常很有用。


### 声明式事务管理


关于 Spring 框架的声明式事务支持最重要的概念是通过 AOP 代理来启用此支持，并且事务性的 advice 由元数据（当前基于 XML 或基于注解的）驱动。 AOP 与事务性元数据的结合产生了 AOP 代理，该代理使用 TransactionInterceptor 和适当的 PlatformTransactionManager 实现来驱动方法调用周围的事务。

从概念上讲，调用事务代理的流程如下图5-1所示:


![图5-1 调用事务代理的流程](./images/5-1-tx.jpg)


### 声明式事务管理的例子

在“spring-jdbc-template”应用的基础上，复制为一个新的“spring-declarative-transaction”应用，用于演示声明式事务管理。在这个应用中，我们会实现一个简单的“用户管理”功能，在执行保存用户的操作时会开启事务。同时，当遇到操作异常时，也能保证事务回滚。


修改UserDao：

```java
public User create(User user) {
    String sql = "INSERT INTO users(name, email) VALUES(?, ?)";

    // 获取key
    KeyHolder keyHolder = new GeneratedKeyHolder();

    this.jdbcTemplate.update(connection -> {
        PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
        ps.setString(1, user.getName());
        ps.setString(2, user.getEmail());
        return ps;
    }, keyHolder);

    user.setId(keyHolder.getKey().longValue());

    // 模拟异常情况
    if (user.getId() == 3) {
        throw new UnsupportedOperationException();
    }

    return user;
}
```


上述代码中，把业务数据给存储到数据库中之后，继而抛出了一个异常，来触发事务的回滚。


主应用类 App 修改如下：

```java
public class App {
    public static void main(String[] args) {
        // 创建Spring应用上下文
        AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(AppConfig.class);

        // 获取UserRepository bean
        UserDao userDao = context.getBean(UserDao.class);

        // 创建新用户
        User newUser = new User("Charlie", "charlie@example.com");
        User savedUser = null;

        try {
            savedUser = userDao.create(newUser);
        } catch (Exception e) {
            System.out.println("Exception" + e.toString());
        }

        System.out.println("Created user: " + savedUser);

        // 查询所有用户
        System.out.println("\nAll users:");
        List<User> users = userDao.findAll();
        users.forEach(System.out::println);

        // 关闭上下文
        context.close();
    }
}
```

在 App 类中，我们会捕获保存用户操作过程中的异常，从而可以让应用正常往下执行。

### 运行

右键运行 App 类，能看到控制台打印信息如下：

```
8月 07, 2025 10:53:21 下午 org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseFactory initDatabase
信息: Starting embedded database: url='jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false', username='sa'
Exceptionjava.lang.UnsupportedOperationException
Created user: null

All users:
User{id=1, name='Alice', email='alice@example.com'}
User{id=2, name='Bob', email='bob@example.com'}
8月 07, 2025 10:53:22 下午 org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseFactory shutdownDatabase
信息: Shutting down embedded database: url='jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false'
```

从上述异常信息中，我们能够完整的看到整个事务的管理过程，由此可以证明，事务在遇到特定的异常，是可以进行事务回滚的。

 

### `@Transactional`详解

除了基于 XML 的事务配置的声明式方法之外，还可以使用基于注解的方法。使用注解的好处是，声明事务的语义会使声明更接近受影响的代码，而没有太多的不必要的耦合。

标准的 `javax.transaction.Transactional` 注解也支持作为 Spring 自己注解的一个直接替代。

以下是一个过使用 `@Transactional` 注解的一个例子：

```java
@Transactional
public class DefaultFooService implements FooService {

    Foo getFoo(String fooName);

    Foo getFoo(String fooName, String barName);

    void insertFoo(Foo foo);

    void updateFoo(Foo foo);
}
```

如果相同的效果是使用基于 XML 方式来配置，那么从整体上来说会比较繁琐一点：

```xml
<!-- from the file 'context.xml' -->
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:aop="http://www.springframework.org/schema/aop"
    xmlns:tx="http://www.springframework.org/schema/tx"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/tx
        http://www.springframework.org/schema/tx/spring-tx.xsd
        http://www.springframework.org/schema/aop
        http://www.springframework.org/schema/aop/spring-aop.xsd">

    <bean id="fooService" class="com.example.spring.service.DefaultFooService"/>

    <tx:annotation-driven transaction-manager="txManager"/>
    <bean id="txManager" 
        class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>

    <!-- ... -->

</beans>
```


注意：在使用代理时，应该将 `@Transactional` 注解仅应用于具有 public 的方法。如果使用 `@Transactional` 注解标注 protected、private 或包可见的方法，虽然不会引发错误，但注解的方法不会使用已配置的事务设置。


`@Transactional` 注解可以用于接口定义、接口上的方法、类定义或类上的 public 方法之前。然而，仅有 `@Transactional` 注解是不足以激活事务行为。`@Transactional` 注解只是一些元数据，可以被一些具有事务感知的运行时基础设施使用，并且可以使用元数据来配置具有事务行为的适当的 bean。在前面的示例中，`<tx:annotation-driven/>` 元素用于切换事务行为。


默认的 `@Transactional` 设置如下：

* 传播设置是 PROPAGATION_REQUIRED。
* 隔离级别是 ISOLATION_DEFAULT。
* 事务是读-写的。
* 事务超时默认为基础事务系统的默认超时.如果超时不受支持，则默认为无。
* 任何 RuntimeException 都会触发回滚，并且任何已检查的异常都不会触发回滚。

这些默认设置可以被更改。下表汇总了 `@Transactional` 注解的各种属性：


属性 | 类型 |描述
--- | --- | ---
value | String | 指定要使用的事务管理器的可选限定符
propagation | Propagation 枚举类型 | 设置事务的传播机制
isolation | Isolation 枚举类型 | 设置事务的隔离级别
readOnly | boolean  | 读-写还是只读事务
timeout | int | 事务超时时间（秒）
rollbackFor | Class对象的数组，必须从 Throwable 派生 | 导致回滚的异常类数组
rollbackForClassName | Class对象的数组，必须从 Throwable 派生 | 导致回滚的异常类名数组
noRollbackFor | Class对象的数组，必须从 Throwable 派生 | 不能导致回滚的异常类数组
noRollbackForClassName | 必须从 Throwable 派生的 String 类名称数组 | 不允许回滚的异常类名称数组
