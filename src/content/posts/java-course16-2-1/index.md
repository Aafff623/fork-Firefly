---
title: "使用Redis存储用户登录状态与会话信息"
published: 2026-08-25
description: "将单体应用重构为使用 Redis 存储会话信息是提升性能和可扩展性的重要一步。单体项目下，会话存储在应用的内存中，应用重启，会话就丢失。改为 Redis 会话存储方案，可以实现会话的集中化管理，尤其适…"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-2-1
pinned: false
comment: true
---

将单体应用重构为使用 Redis 存储会话信息是提升性能和可扩展性的重要一步。单体项目下，会话存储在应用的内存中，应用重启，会话就丢失。改为 Redis 会话存储方案，可以实现会话的集中化管理，尤其适用于分布式系统。即便是应用重启或者销毁重建，会话依然存在。

在 Spring Security 6.5 中集成 Spring Data Redis 3.5.0、Spring Session 3.5.0 可以实现分布式系统会话的集中化管理。以下是一个完整的用法示例，涵盖依赖配置、Redis 配置、Spring Security 配置以及会话管理。


### 添加依赖

在使用由 Redis 支持的 Spring Session 之前，必须确保拥有正确的依赖关系。修改pom.xml增加如下内容：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

Spring Boot为Spring会话模块提供依赖管理，所以无需显式声明依赖版本。


### 配置 Spring Session

添加所需的依赖项后，可以在应用的配置文件里面添加相关的配置。得益于一流的自动配置支持，只需添加依赖项Spring Boot就可以为我们设置由Redis支持的Spring Session。

在后台，Spring Boot应用的配置等同于手动添加`@EnableRedisHttpSession`注解。这将创建一个名为springSessionRepositoryFilter的Spring bean，用于实现Filter。过滤器负责替换由Spring会话支持的HttpSession实现。

通过使用application.properties可以进行进一步的定制。修改application.properties，增加如下内容：

```yaml
# 配置 Spring Session
## 控制会话数据同步到 Redis 的时机，分别是 ON_SAVE 和 IMMEDIATE.
spring.session.redis.flush-mode=on_save
## 会话存储的key的命名空间，可以区分多应用下的key
spring.session.redis.namespace=spring:session:rednote
```

`spring.session.redis.namespace`配置会话存储的key的命名空间，可以区分多应用下的key。


`spring.session.redis.flush-mode` 是 Spring Session 与 Redis 集成时用于控制会话数据同步到 Redis 时机的配置属性，其作用是决定何时将会话数据写入 Redis 存储，以下是详细介绍：

#### 属性含义
`spring.session.redis.flush-mode` 提供了两种模式来控制会话数据同步到 Redis 的时机，分别是 `ON_SAVE` 和 `IMMEDIATE`。

#### 两种模式
- ON_SAVE
    - 含义：仅在调用 `SessionRepository.save(Session)` 方法时，才会将会话中的数据同步到 Redis 中。在 Web 应用中，通常是在请求完成响应后，即 HTTP 响应提交时开始同步。这意味着在执行 response 之前，会话数据都是缓存在本地的。
    - 适用场景：适用于对实时性要求不高，且希望减少 Redis 写入操作的场景。这样可以降低 Redis 的压力，提高系统的整体性能。
- IMMEDIATE
    - 含义：实时将会话数据同步到 Redis。当执行 `SessionRepository.createSession()` 时，会将会话数据同步到 Redis 中；当对会话的属性进行 `set`、`remove` 等操作时，也会同步会话中的数据到 Redis 中。
    - 适用场景：适用于对会话数据的实时性要求较高的场景，例如需要确保多个节点之间的会话数据实时一致的应用。

#### 配置方式
- 在配置文件中配置：可以在 `application.properties` 或 `application.yml` 文件中进行配置。例如，在 `application.properties` 中配置为 `spring.session.redis.flush-mode=on_save` 或 `spring.session.redis.flush-mode=immediate`。
- 通过注解配置：也可以在 `@EnableRedisHttpSession` 注解上进行配置，例如 `@EnableRedisHttpSession(redisFlushMode = RedisFlushMode.ON_SAVE)` 或 `@EnableRedisHttpSession(redisFlushMode = RedisFlushMode.IMMEDIATE)`。


### 配置 Redis 链接


Spring Boot会自动创建一个RedisConnectionFactory，将Spring会话连接到本地主机端口6379（默认端口）上的Redis服务器。在生产环境中，需要更新配置以指向Redis服务器。例如，可以在应用程序属性中包含以下内容：

```yaml
# 配置 Spring Data Redis
spring.data.redis.host: localhost
spring.data.redis.port: 6379
spring.data.redis.password:
```


### Servlet容器初始化

我们的Spring引导配置创建了一个名为springSessionRepositoryFilter的Spring bean，用于实现Filter。springSessionRepositoryFilterbean负责用由SpringSession支持的自定义实现替换HttpSession。

为了使我们的Filter发挥其魔力，Spring需要加载我们的Config类。最后，我们需要确保我们的servlet容器（即Tomcat）对每个请求使用我们的springSessionRepositoryFilter。幸运的是，Spring Boot自动为我们处理了这两个步骤。

### 运行调测

我们不再使用Tomcat的HttpSession，而是在Redis中保留这些值。Spring会话用Redis支持的实现替换了HttpSession。当Spring Security的SecurityContextPersistenceFilter将SecurityContext保存到HttpSession时，它将被持久化到Redis中。

当创建了一个新的HttpSession时，Spring Session会在您的浏览器中创建一个名为“SESSION”的cookie。该cookie包含您的会话ID。您可以查看cookies（使用Chrome或Firefox）。

可以在Redis里面查询到这些会话信息：

```
127.0.0.1:6379> KEYS '*'
1) "spring:session:rednote:sessions:e483098c-78d3-49b7-888b-d0d5d52d4597"
2) "spring:session:rednote:sessions:e0367d34-59a4-4baf-ab15-b412c2e12228"
3) "spring:session:rednote:sessions:88ef47f7-3a55-4e0e-afd9-448be37af74b"
4) "spring:session:rednote:sessions:7cdc38c7-a45b-4ef0-9254-20640beb327b"
5) "spring:session:rednote:sessions:c534df9a-ddd1-45c8-9128-0ecb655e32f1"
6) "spring:session:rednote:sessions:91398728-b4e4-47ba-8d55-4b36801e56d6"
7) "spring:session:rednote:sessions:232f49ae-d939-43b7-85f2-a8237115c755"
8) "spring:session:rednote:sessions:ea8f9743-d7fc-4eb6-8c9e-98b47c34d5a1"
```

### 性能优化建议

1. 会话序列化优化：
   - 使用更轻量的序列化方式（如Kryo或Protostuff）
   - 避免在Session中存储大对象

2. Redis 集群配置：
   ```yaml
   spring:
     redis:
       cluster:
         nodes:
           - 192.168.1.100:7000
           - 192.168.1.101:7001
           - 192.168.1.102:7002
       password: yourpassword
   ```

3. 缓存失效策略：
   - 对高频访问数据设置较长过期时间
   - 使用LRU策略清理旧数据

4. 监控与告警：
   - 配置Redis监控（如RedisInsight）
   - 设置内存使用阈值告警

5. 性能测试：
   - 使用JMeter或LoadRunner对比Redis前后的登录响应时间
   - 监控Redis内存使用情况


### 总结

通过以上配置，你的小红书项目将实现：
1. 用户会话信息集中存储在Redis
2. 支持分布式部署和水平扩展
3. 提高会话管理性能和可靠性
4. 实现用户信息的缓存优化

这种架构改造为后续微服务化奠定了基础，同时显著提升了系统的性能和可扩展性。
