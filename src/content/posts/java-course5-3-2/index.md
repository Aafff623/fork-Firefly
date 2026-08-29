---
title: "进阶掌握Spring Data高级特性，斩获自定义实现的秘籍"
published: 2026-08-25
description: "通常有必要为几个存储库方法提供自定义实现。 Spring 数据存储库很容易允许您提供自定义存储库代码，并将其与通用 CRUD 抽象和查询方法功能集成。"
image: ''
tags: [Java, Spring Data, JPA, MongoDB]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course5-3-2
pinned: false
comment: true
---

### Spring Data 自定义实现


通常有必要为几个存储库方法提供自定义实现。 Spring 数据存储库很容易允许您提供自定义存储库代码，并将其与通用 CRUD 抽象和查询方法功能集成。

#### 向单个存储库添加自定义行为

要使用自定义功能丰富存储库，您首先需要定义自定义功能的接口和实现。 使用您提供的存储库接口来扩展自定义接口。

自定义资源库方法的接口：

```java
interface UserRepositoryCustom {
  public void someCustomMethod(User user);
}
```

自定义资源库方法接口的实现：

```java
class UserRepositoryImpl implements UserRepositoryCustom {

  public void someCustomMethod(User user) {
    // 自定义实现
  }
}
```

实现本身不依赖于 Spring Data，可以是普通的 Spring bean。 因此，您可以使用标准依赖注入行为来注入其他 bean 的引用，如JdbcTemplate 等方面。

```java
interface UserRepository extends CrudRepository<User, Long>, UserRepositoryCustom {

  // 此处用于声明查询方法
}
```

让您的标准存储库接口扩展自定义接口。这样做就能结合 CRUD 和自定义的功能。

如果使用命名空间配置，存储库基础架构尝试通过扫描我们发现存储库的包下面的类来自动检测自定义实现。这些类需要遵循将命名空间元素的属性`repository-impl-postfix`附加到找到的库的命名约定接口名称。此后缀默认为`Impl`。

配置示例:

```xml
<repositories base-package="com.example.repository" />

<repositories base-package="com.example.repository" repository-impl-postfix="FooBar" />
```


第一个配置示例将尝试查找类`com.example.repository.UserRepositoryImpl`作为自定义存储库实现，而第二个示例将尝试查找`com.example.repository.UserRepositoryFooBar`。


如果您的自定义实现仅使用基于注解的配置和自动装配，那么刚刚所示的方法将很有效，因为它将被视为任何其他Spring bean。如果你的自定义实现bean需要特殊的装配，你只需声明 bean 并命名它刚才描述的约定。基础设施然后将通过名称而不是创建一个自身来引用手动定义的 bean 定义。

自定义实现的手动装配的例子：

```xml
<repositories base-package="com.example.repository" />

<beans:bean id="userRepositoryImpl" class="…">
  <!-- 更多配置 -->
</beans:bean>
```


#### 向所有存储库添加自定义行为

当您要向所有的存储库接口添加单个方法时，上述方法是不可行的。 要向所有存储库添加自定义行为，您首先添加一个中间接口来声明共享行为。

声明自定义共享行为的接口：

```java
@NoRepositoryBean
public interface MyRepository<T, ID extends Serializable>
  extends PagingAndSortingRepository<T, ID> {

  void sharedCustomMethod(ID id);
}
```

现在，您的各个存储库接口将扩展此中间接口，而不是`Repository`接口，以包含已声明的功能。 接下来，创建中间接口的实现，以扩展持久性技术特定的存储库基类。 这个类将作为存储库代理的自定义基类。

自定义存储库基类的例子:


```java
public class MyRepositoryImpl<T, ID extends Serializable>
  extends SimpleJpaRepository<T, ID> implements MyRepository<T, ID> {

  private final EntityManager entityManager;

  public MyRepositoryImpl(JpaEntityInformation entityInformation,
                          EntityManager entityManager) {
    super(entityInformation, entityManager);

    this.entityManager = entityManager;
  }

  public void sharedCustomMethod(ID id) {
    // ...
  }
}
```

> 类需要具有特定于存储库的工厂实现使用的超类的构造函数。如果存储库基类具有多个构造函数，则覆盖采用 EntityInformation 加上特定于存储库的基础结构对象（例如 EntityManager 或模板类）的类。


Spring `<repositories />`命名空间的默认行为是为`base-package`下的所有接口提供一个实现。这意味着如果保持在它的当前状态，`MyRepository`的实现实例将由 Spring 创建。这当然不是所期望的，因为它只是作为`Repository`和要为每个实体定义的实际存储库接口之间的中介。要排除将`Repository`从实例化为存储库实例的接口，可以使用`@NoRepositoryBean`（如上所示）对其进行注释，或将其移动到已配置的`base-package`之外。

最后一步是使 Spring Data 基础结构感知自定义的存储库基类。在 JavaConfig 中，这是通过使用`@Enable…Repositories`的 repositoryBaseClass 属性来实现的：

下面例子是使用 JavaConfig 配置自定义存储库基类：

```java
@Configuration
@EnableJpaRepositories(repositoryBaseClass = MyRepositoryImpl.class)
class ApplicationConfiguration { … }
```

相应的属性在 XML 命名空间中可用:

```xml
<repositories base-package="com.acme.repository"
     base-class="….MyRepositoryImpl" />
```

### 从聚合根（aggregate root）发布事件


Spring Data 提供了`@DomainEvents`用来发布领域事件（domain event）。用法如下：

 
```java
class AnAggregateRoot {

    @DomainEvents 
    Collection<Object> domainEvents() {
        // … 返回你想在这里发布的事件
    }

    @AfterDomainEventsPublication 
    void callbackMethod() {
       // … 清理邻域事件列表
    }
}
```
