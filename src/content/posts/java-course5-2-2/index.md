---
title: "为何我们的全栈项目选择Spring Data？"
published: 2026-08-25
description: "Spring Data JPA 是更大的 Spring Data 家族（<http://projects.spring.io/spring-data）的一部分，使得轻松实现基于 JPA 的存储库变得更…"
image: ''
tags: [Java, Spring Data, JPA, MongoDB]
category: 指南
collections: [java-fullstack, java-fullstack-spring]
draft: false
lang: ''
slug: java-course5-2-2
pinned: false
comment: true
---

Spring Data JPA 是更大的 Spring Data 家族（<http://projects.spring.io/spring-data>）的一部分，使得轻松实现基于 JPA 的存储库变得更容易。该模块用于处理对基于 JPA 的数据访问层的增强支持。它使得更容易构建基于使用 Spring 数据访问技术栈的应用程序。

通过在上一章节的学习，我们知道了 JPA 是一套规范，这样在使用不同 ORM 实现的时候，可以只需要关注 JPA 里面的 API ，而无需关注具体的实现。但同时，JPA 也提供了 EntityManager 接口，来管理实体。

然而，Spring Data JPA 对于 JPA 的支持则是更近一步。使用 Spring Data JPA 开发者无需过多关注 EntityManager 的创建、事务处理等 JPA 相关的处理，这基本上也是作为一个开发框架而言所能做到的极限了，甚至 Spring Data JPA 让你连实现持久层业务逻辑的工作都省了，唯一要做的，就只是声明持久层的接口，其他都交给 Spring Data JPA 来帮你完成！

Spring Data JPA 就是这么强大，让你的数据持久层开发工作简化只需声明一个接口。比如，你声明了一个 findUserById() 这样一个方法声明，Spring Data JPA 就能能判断出这是根据给定条件的 ID 查询出满足条件的 User 对象，而其中的实现过程开发者无需关心，这一切都交予 Spring Data JPA 来完成。 


### Spring Data 是什么

Spring Data 是一个用于简化数据库访问，并支持云服务的开源框架。其主要目标是使得对数据的访问变得方便快捷，并支持 map-reduce 框架和云计算数据服务。Spring Data 包含多个子项目：

* Spring Data Commons - 提供共享的基础框架，适合各个子项目使用，支持跨数据库持久化；
* Spring Data JPA - 简化创建 JPA 数据访问层和跨存储的持久层功能；
* Spring Data Hadoop - 基于 Spring 的 Hadoop 作业配置和一个 POJO 编程模型的 MapReduce 作业；
* Spring Data KeyValue  - 集成了 Redis 和 Riak ，提供多个常用场景下的简单封装；
* Spring Data JDBC Extensions - 支持 Oracle RAD、高级队列和高级数据类型；
* ......

还有一些其他子项目，比如 Spring Data 家族中的 Spring Data Elasticsearch（<http://projects.spring.io/spring-data-elasticsearch/>）、Spring Data Mongodb（<http://projects.spring.io/spring-data-mongodb/>）等，这些都是针对  Elasticsearch、Mongodb 等NoSQL提供了数据访问层框架。

简言之，Spring Data 旨在统一包括数据库系统和NoSQL数据存储在内不同持久化存储的访问方式，让开发者通过统一的接口进行功能的实现。

### Spring Data JPA 特性

Spring Data JPA 是对 JPA 规范的实现。
 
对于普通开发者而言，自己实现应用程序的数据访问层是一件极其繁琐的过程。开发者必须编写太多的样板代码来执行简单查询、分页和审计。Spring Data JPA 旨在通过将努力减少到实际需要的量来显着改进数据访问层的实现。 作为开发人员，只需要编写存储库的接口，包括自定义查询方法，而这些接口的实现，Spring Data JPA 将会自动提供。

Spring Data JPA 包含如下特征：

* 基于 Spring 和 JPA 来构建复杂的存储库；
* 支持 Querydsl （<http://www.querydsl.com>） 谓词，因此支持类型安全的 JPA 查询；
* 域类的透明审计；
* 具备分页支持、动态查询执行、集成自定义数据访问代码的能力；
* 在引导时验证`@Query`带注释的查询；
* 支持基于 XML 的实体映射；
* 通过引入`@EnableJpaRepositories` 来实现基于 JavaConfig 的存储库配置。


### 如何使用 Spring Data JPA

在项目中使用`spring-data-jpa`的推荐方法是使用依赖关系管理系统：

```groovy
<dependency>
    <groupId>org.springframework.data</groupId>
    <artifactId>spring-data-jpa</artifactId>
    <version>3.5.2</version>
</dependency
```


在代码中，我们只需声明继承自 Spring Data JPA 中的接口：

```java
import org.springframework.data.jpa.repository.JpaRepository;
...

public interface UserRepository extends JpaRepository<User, Long>{

	  List<User> findByNameLike(String name);

}
```

在这里例子中，我们的代码，继承自了 Spring Data JPA 中的 JpaRepository 接口，而后声明相关的方法即可。
比如声明 findByNameLike，就能自动实现通过名称来模糊查询的方法。

### 核心概念

 Spring Data 存储库抽象中的中央接口是`Repository`。 它将域类以及域类的id类型作为类型参数进行管理。此接口主要作为标记接口捕获要使用的类型，并帮助您发现扩展此接口。 而`CrudRepository`为受管理的实体类提供复杂的 CRUD 功能。

```java
public interface CrudRepository<T, ID extends Serializable>
	extends Repository<T, ID> {
	
	<S extends T> S save(S entity);  //（1）
	
	T findOne(ID primaryKey);       //（2）
	
	Iterable<T> findAll();          //（3）
	
	Long count();                   //（4）
	
	void delete(T entity);          //（5）
	
	boolean exists(ID primaryKey);  //（6）
	
	// 省略更多方法...
}
```

CrudRepository 接口中的方法含义如下：

* （1）保存给定实体。
* （2）返回由给定id标识的实体。
* （3）返回所有实体。
* （4）返回实体的数量。
* （5）删除给定的实体。
* （6）指示是否存在具有给定 ID 的实体。

同时还提供其他特定的持久化技术的抽象，比如 `JpaRepository`或`MongoRepository`，这些接口扩展了`CrudRepository`。


在 `CrudRepository` 的顶部有一个`PagingAndSortingRepository`抽象，它增加了额外的方法来简化对实体的分页访问：

```java
public interface PagingAndSortingRepository<T, ID extends Serializable>
  extends CrudRepository<T, ID> {

  Iterable<T> findAll(Sort sort);

  Page<T> findAll(Pageable pageable);
}
```


比如，想访问用户的第二页的页面大小为20，你可以简单地做这样的事情：

```java
PagingAndSortingRepository<User, Long> repository = // … 获取 bean
Page<User> users = repository.findAll(new PageRequest(1, 20));
```


除了查询方法之外，还可以使用计数和删除查询。

派生计数查询：

```java
public interface UserRepository extends CrudRepository<User, Long> {

  Long countByLastname(String lastname);
}
```

派生删除查询：

```java
public interface UserRepository extends CrudRepository<User, Long> {

  Long deleteByLastname(String lastname);

  List<User> removeByLastname(String lastname);

}
```
