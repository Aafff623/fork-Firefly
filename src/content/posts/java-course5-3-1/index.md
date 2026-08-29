---
title: "快速实现Spring Data基础：掌握全栈思想下的数据库操作"
published: 2026-08-25
description: "对于底层数据存储的管理，我们通常使用标准 CRUD 功能的资源库来实现。使用 Spring Data 声明这些查询将会变得简单，只需要四步过程"
image: ''
tags: [Java, Spring Data, JPA, MongoDB]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course5-3-1
pinned: false
comment: true
---

### 查询方法

对于底层数据存储的管理，我们通常使用标准 CRUD 功能的资源库来实现。使用 Spring Data 声明这些查询将会变得简单，只需要四步过程：

#### 1. 声明扩展`Repository`或其子接口之一的接口

声明接口，并输入将处理的域类和ID类型。

```java
interface PersonRepository extends Repository<Person, Long> { … }
```

#### 2. 在接口上声明查询方法

```java
interface PersonRepository extends Repository<Person, Long> {
  List<Person> findByLastname(String lastname);
}
```

#### 3. 为这些接口创建代理实例

可以通过 JavaConfig 的方式：


```java
@Configuration
@EnableJpaRepositories(basePackages = "com.example.repositories")
public class JpaConfig {
}
```

或通过 XML 配置方式：


```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xmlns:jpa="http://www.springframework.org/schema/data/jpa"
   xsi:schemaLocation="http://www.springframework.org/schema/beans
     http://www.springframework.org/schema/beans/spring-beans.xsd
     http://www.springframework.org/schema/data/jpa
     http://www.springframework.org/schema/data/jpa/spring-jpa.xsd">

   <jpa:repositories base-package="com.example.repositories"/>

</beans>
```


在此示例中使用了 JPA 命名空间。如果您使用任何其他存储库的存储库抽象，则需要将其更改为您的存储模块的相应命名空间声。

另外，请注意，JavaConfig 变量不会明确配置包，因为默认情况下使用注释类的包。如果要自定义要扫描的程序包，请使用数据存储特定存储库的`@Enable…`注解。例如：

```
@EnableJpaRepositories(basePackages = "com.example.repositories.jpa")
@EnableMongoRepositories(basePackages = "com.example.repositories.mongo")
interface Configuration { }
```


#### 4. 获取注入的存储库实例并使用它


```java
public class SomeClient {

  @Autowired
  private PersonRepository repository;

  public void doSomething() {
    List<Person> persons = repository.findByLastname("Lau");
  }
}
```


### 定义资源库的接口

首先需要定义实体类的接口，接口必须继承资源库并且输入实体类型和ID类型，如果需要用到 CRUD 方法，可以使用`CrudRepository`来替代`Repository`.

#### 自定义接口

通常，您的存储库接口将会扩展`Repository`、 `CrudRepository`或`PagingAndSortingRepository`。 另外，如果你不想继承 Spring Data 接口，还可以接口`@RepositoryDefinition`。 扩展`CrudRepository`，将会公开一套完整的方法来操作您的实体。 如果你喜欢其中的方法来调用，你也可以简单地复制`CrudRepository`中的部分方法到你的 repository。

> 这允许您自定义数据库的功能的抽象。

下面是一个有选择地公开 CRUD 方法的例子：

```java
@NoRepositoryBean
interface MyBaseRepository<T, ID extends Serializable> extends Repository<T, ID> {

  T findOne(ID id);

  T save(T entity);
}

interface UserRepository extends MyBaseRepository<User, Long> {
  User findByEmailAddress(EmailAddress emailAddress);
}
```

第一步你定义了一个公共基础的接口 `findOne(…)`和`save(...)`方法,这些方法将会引入到你选择的 Spring Data 的实现类中，例如 `SimpleJpaRepository`，因为他们匹配`CrudRepository`的方法签名，所以`UserRepository`将会具备`save(...)`的功能和`findOne(…)`的功能，当然也具备`findByEmailAddress`的功能。

> 注意，如果中间的资源库接口添加了`@NoRepositoryBean`注解，这样运行时，Spring Data 将不会创建拥有该注解的实例。

#### 使用 Spring Data 多模块来创建资源库

使用单个 Spring Data 模块在应用中是非常简单，但有时候我们需要多个 Spring Data 模块，比如：需要定义的资源库需要去区分两种不同的持久化技术，如果在 classpath 中发现多个资源库时， Spring Data 会进行严格的配置限制，确保每资源库或者实体决定绑定哪个 Spring Data 模块：

* 如果资源库定义了继承特定的资源库，那么他是一个特定的 Spring Data 模块;
* 如果实体注解了一个特定的声明，它是一个特定的 Spring Data 模块。Spring Data 模块可以接纳第三方的声明，例如JPA 的`@Entity`，或者提供来自 Spring Data MonggoDB/Spring Data Elasticsearch 的 `@Document` 。

下面是自定义特定模块接口的资源库：

```java
interface MyRepository extends JpaRepository<User, Long> { }

@NoRepositoryBean
interface MyBaseRepository<T, ID extends Serializable> extends JpaRepository<T, ID> {
  …
}

interface UserRepository extends MyBaseRepository<User, Long> {
  …
}
```

`MyRepository` 和  `UserRepository` 继承于 `JpaRepository`在这个层级中是对 Spring Data JPA 模块的合法替代。

使用一般的接口定义的资源库：

```java
interface AmbiguousRepository extends Repository<User, Long> {
 …
}

@NoRepositoryBean
interface MyBaseRepository<T, ID extends Serializable> extends CrudRepository<T, ID> {
  …
}

interface AmbiguousUserRepository extends MyBaseRepository<User, Long> {
  …
}
```

`AmbiguousRepository`和`AmbiguousUserRepository` 仅在他们的层级来继承`Repository`和`CrudRepostory`。当它们使用单个 Spring Data 模块的时候是完美的，但是如果使用多模块 Spring Data 时， Spring 将无法区分每个资源库的范围。


下面例子是使用实体类注解来定义资源库的使用范围：

```java
nterface PersonRepository extends Repository<Person, Long> {
 …
}

@Entity
public class Person {
  …
}

interface UserRepository extends Repository<User, Long> {
 …
}

@Document
public class User {
  …
}
```

`PersonRepository`所引用的`Person`使用了`@Entity` 注解，所以这个仓库清晰的使用了Sping Data JPA。 `UserRepository`所引用的`User`声明了`@Document`，表明这个仓库将使用 Spring Data MongoDB 模块。

下面是使用混合的注解来定义资源库的例子：

```java
interface JpaPersonRepository extends Repository<Person, Long> {
 …
}

interface MongoDBPersonRepository extends Repository<Person, Long> {
 …
}

@Entity
@Document
public class Person {
  …
}
```

这个例子中实体类`Person` 使用了 JPA 和 Spring Data MongoDB 两种 注解，表明这个实体类既可以用于`JpaPersonRepository`也可以用于`MongoDBPersonRepository`，Spring Data 因不能区分类型而导致未定义的行为。

在同一个域类型上使用多个持久化技术特定的注释可以跨多个持久性技术重用域类型，但是 Spring Data 不再能够确定一个唯一的模块来绑定存储库。

最后一种方法来区分不同的仓库类型，使用包路径来判断。不同的包路径下的仓库使用不同的仓库类型，通过在配置类 Configuration 中声明注解来实现，也可以通过 XML 配置来定义。

通过注解来实现不同包路下使用不同的仓库：

```java
@EnableJpaRepositories(basePackages = "com.example.repositories.jpa")
@EnableMongoRepositories(basePackages = "com.example.repositories.mongo")
interface Configuration { }
```


### 定义查询方法

资源库代理有两种方法去查询，可以是根据方法名或者自定义查询。可用的选项取决于实际的存储。但不管如何，必须要有一个策略来决定创建什么实际查询。 让我们来看看可用的选项。

#### 查询查找策略

以下策略可供查询库基础设施来解决。您可以配置策略名称空间通过 `query-lookup-strategy`属性的XML配置或通过`queryLookupStrategy`启用的属性`${store}`库注释的Java配置。一些策略可能不支持特定的数据存储。

* `CREATE` 尝试从查询方法名构造一个特定于存储的查询。一般的方法是从方法名中删除一组已知的前缀，并解析方法的其余部分。
* `USE_DECLARED_QUERY`尝试查找已声明的查询，如果找不到则抛出异常。查询可以在某处通过注释定义，也可以通过其他方式声明。
* `CREATE_IF_NOT_FOUND`，（默认）结合了`CREATE`和`USE_DECLARED_QUERY`。它首先查找已声明的查询，如果没有找到已声明的查询，则创建一个基于自定义方法名称的查询。这是默认的查找策略，因此，如果您没有显式配置任何内容，则使用该策略。它允许通过方法名快速定义查询，也可以根据需要通过引入声明查询来自定义调优这些查询。


#### 创建查询

内置到 Spring Data 存储库基础结构中的查询构建器机制对于在存储库的实体上构建约束查询很有用。 机制剥离前缀`find…By`、`read…By`、`query…By`、`count…By`和`get…By`从该方法开始解析其余部分。 引入子句可以包含其他表达式，例如在要创建的查询上设置不同标志的区别。 但是，第一个`By`作为分隔符指示实际标准的开始。在非常基本的层次上，你可以定义实体属性的条件，并将它们与`And`和`Or`连接。

下面是根据方法名创建查询的例子:

```java
public interface PersonRepository extends Repository<User, Long> {

  List<Person> findByEmailAddressAndLastname(EmailAddress emailAddress, String lastname);

  // 启用 distinct 标志
  List<Person> findDistinctPeopleByLastnameOrFirstname(String lastname, String firstname);
  List<Person> findPeopleDistinctByLastnameOrFirstname(String lastname, String firstname);

  // 给独立的属性启用 ignore case
  List<Person> findByLastnameIgnoreCase(String lastname);

  // 给所有合适的属性启用 ignore case
  List<Person> findByLastnameAndFirstnameAllIgnoreCase(String lastname, String firstname);

  // 启用 ORDER BY
  List<Person> findByLastnameOrderByFirstnameAsc(String lastname);
  List<Person> findByLastnameOrderByFirstnameDesc(String lastname);
}
```

实际结果的解析方法取决于你的持久化存储所创建的查询。有一些要注意的事情：

* 表达式通常是可以在运算符组合的属性上进行遍历。您可以组合属性表达式 `AND`和`OR`。您还获得对诸如`Between`，`LessThan`，`GreaterThan`之间的运算符的支持，对于属性表达式。受支持的操作符可能因数据存储方式而异。
* 方法解析器支持为单个属性设置 IgnoreCase 标志（例如`findByLastnameIgnoreCase(...)`）也可以是所有属性（通常为 String 实例，例如`findByLastnameAndFirstnameAllIgnoreCase(...)`）。是否支持 ignore case 写取决于具体的存储方式。
* 您可以通过将`OrderBy`子句附加到引用属性的查询方法并提供排序方向（`Asc`或`Desc`）来应用静态排序。 

#### 属性表达式

属性表达式只能引用的受管理实体的直接属性，如前面的示例所示。  在查询创建时，您已经确保已解析的属性是受管域类的属性。 但是，您也可以通过遍历嵌套属性来定义约束。 假设一个 `Person` 有一个带有 `ZipCode` 的 `Address`。 在这种情况下，方法名称为

```java
List<Person> findByAddressZipCode(ZipCode zipCode);
```

解析算法从解释整个部分（`AddressZipCode`）作为属性开始，并检查域类中具有该名称（未资本化）的属性。如果算法成功，它使用该属性。如果不是，算法将来自右侧的骆驼情形部分的源分割成头部和尾部，并且尝试找到相应的属性，在我们的示例中，`AddressZip`和`Code`。如果算法找到具有该头部的属性，则它采用尾部并继续从那里构建树，以刚才描述的方式分割尾部。如果第一个分割不匹配，算法将分割点移动到左边（`Address`，`ZipCode`），然后继续。

虽然这应该适用于大多数情况下，算法可能选择错误的属性。假设`Person`类也有一个`addressZip`属性。该算法将在第一个分割循环中匹配，并且基本上选择错误的属性，最后失败（因为`addressZip`的类型可能没有` code`属性）。

要解决这种模糊性，您可以在方法名称中使用下划线`_`手动定义遍历点。所以我们的方法名称最终会这样：

```java
List<Person> findByAddress_ZipCode(ZipCode zipCode);
```

由于我们将下划线`_`视为保留字符，我们强烈建议遵循标准 Java 命名约定（即不在属性名称中使用下划线，而是使用驼峰案例）。

#### 特殊参数处理

要处理查询中的参数，您只需定义方法参数，如上面的示例中所示。基础设施还会识别某些特定类型，如 Pageable 和 Sort，以动态地对查询应用进行分页和排序。

下面使用 `Pageable`、`Slice` 和 `Sort`来查询

```java
Page<User> findByLastname(String lastname, Pageable pageable);

Slice<User> findByLastname(String lastname, Pageable pageable);

List<User> findByLastname(String lastname, Sort sort);

List<User> findByLastname(String lastname, Pageable pageable);
```

第一个方法允许在你的查询方法的静态定义查询中通过一个`org.springframework.data.domain.Pageable`实例来动态的添加分页。分页类知道元素的总数和可用页数。它通过基础库来触发一个统计查询计算所有的总数。由于这个查询可能对存储库消耗巨大，可以使用 `Slice` 来替代。`Slice` 仅仅知道是否有下一个`Slice`可用，这对查询大数据已经足够了。

排序选项和分页的处理方式一样。如果你需要排序，简单的添加一个`org.springframework.data.domain.Sort`参数到你的方法即可。也正如你所见，简单的返回一个列表也是可以的，在这种情况下，将不会创建构建实际页面实例所需的附加元数据（这反过来意味着将不必发出额外的计数查询），而是简单地限制查询以仅查找给定范围实体。

> 要找出在你的查询中有多少页，你需要触发一个额外的计数查询。按照默认来说这个查询可以从你实际触发查询中衍生出来


#### 限制查询结果

查询方法的结果可以通过关键字 `first` 或 `top` 来限制，它们可以互换使用。 可选的数字值可以追加到 top/first，以指定要返回的最大结果大小。 如果省略该数字，则假定结果大小为1。

下面示例用`Top`和`First`查询限制结果大小 ：

``` java
User findFirstByOrderByLastnameAsc();

User findTopByOrderByAgeDesc();

Page<User> queryFirst10ByLastname(String lastname, Pageable pageable);

Slice<User> findTop3ByLastname(String lastname, Pageable pageable);

List<User> findFirst10ByLastname(String lastname, Sort sort);

List<User> findTop10ByLastname(String lastname, Pageable pageable);
```

限制表达式也支持 `Distinct` 关键字。对于限制查询的结果集定义到一个实例中包装这个结果到一个`Optional`中也是被支持的。

如果分页或者切片被应用到一个限制查询分页(计算多少页可用)则它也能应用于限制结果。

> 要注意结合通过 Sort 参数动态排序的限制结果容许表达查询的方法为“K”最小的，以及“K”最大的元素。

#### 流查询结果

可以通过使用Java 8 `Stream<T>`作为返回类型来递增地处理查询方法的结果。 不是简单地将查询结果包装在`Stream`数据存储中，而是使用特定方法来执行流传输。


下面例子是以Java 8 `Stream<T>`来进行查询的流处理结果：

```java
@Query("select u from User u")
Stream<User> findAllByCustomQueryAndStream();

Stream<User> readAllByFirstnameNotNull();

@Query("select u from User u")
Stream<User> streamAllPaged(Pageable pageable);
```

> 一个数据流可能包裹底层数据存储特定资源，因此在使用后必须关闭。 你也可以使用close()方法或者使用 try-with-resources 语句<sup>[2]</sup>来关闭数据流。

在try-with-resources 块中操作一个Stream`Stream<T>`的例子：

```java
try (Stream<User> stream = repository.findAllByCustomQueryAndStream()) {
  stream.forEach(…);
}
```

> 当前不是所有的 Spring Data 模块都支持 `Stream<T>`作为返回类型


#### 异步查询结果

可以使用 Spring 的异步方法执行能力来异步地执行存储库查询。 这意味着该方法将在调用时立即返回，并且实际的查询执行将在已经提交到 Spring 任务执行器的任务中发生。

```java
@Async
Future<User> findByFirstname(String firstname);              // (1)

@Async
CompletableFuture<User> findOneByFirstname(String firstname);  // (2)

@Async
ListenableFuture<User> findOneByLastname(String lastname);    // (3)
```

- (1) 使用 `java.util.concurrent.Future` 作为返回类型；
- (2) 使用  Java 8 `java.util.concurrent.CompletableFuture`作为返回类型；
- (3) 使用  `org.springframework.util.concurrent.ListenableFuture`作为返回类型。


### 创建资源实例

为存储库接口创建实例以及定义 bean 的方式有两种。 一种方法是 Spring 命名空间；另外一种是 Java Config 配置方式，该配置方式也是推荐的方式。


#### XML配置

每个 Spring Data 模块都包含一个资源库元素，您可以简单地定义 Spring 所要扫描的基础包。

通过 XML 来配置 Spring Data 资源库的例子：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans:beans xmlns:beans="http://www.springframework.org/schema/beans"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="http://www.springframework.org/schema/data/jpa"
  xsi:schemaLocation="http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans.xsd
    http://www.springframework.org/schema/data/jpa
    http://www.springframework.org/schema/data/jpa/spring-jpa.xsd">

  <repositories base-package="com.example.repositories" />

</beans:beans>
```

在示例中，指示 Spring 扫描`com.example.repositories`及其所有子包以扩展 `Repository`或其子接口之一。 对于找到的每个接口，基础结构注册持久化技术特定的`FactoryBean`以创建处理查询方法的调用的适当代理。 每个 bean 都注册在从接口名派生的bean名称下，因此`UserRepository`的接口将注册在`userRepository`下。 `base-package`属性允许使用通配符，以便您可以定义扫描包的模式。


#### 使用过滤器

可以使用 `<include-filter />`或`<exclude-filter />` 来进行相关的过滤：


```xml
<repositories base-package="com.example.repositories">
  <context:exclude-filter type="regex" expression=".*SomeRepository" />
</repositories>
```

#### JavaConfig 方式


可以在JavaConfig 类上使用`@Enable${store}Repositories`注解，来实现来触发存储库基础结构，示例配置如下所示：


```java
@Configuration
@EnableJpaRepositories("com.example.repositories")
class ApplicationConfiguration {

  @Bean
  public EntityManagerFactory entityManagerFactory() {
    // …
  }
}
```

> 该示例使用 JPA 特定的注释，您可以根据实际使用的存储模块更改它。 这同样适用于 EntityManagerFactory bean 的定义。 


#### 独立使用

您还可以使用 Spring 容器之外的存储库基础结构，例如 在 CDI 环境中。 你仍然需要在你的类路径中有一些 Spring 库，但一般来说你可以通过编程方式设置存储库。 提供存储库支持的 Spring Data 模块提供了一个持久化技术特定的 RepositoryFactory，您可以使用如下。

下面是例子：

```java
RepositoryFactorySupport factory = // … 在这里实例化工厂
UserRepository repository = factory.getRepository(UserRepository.class);
```
