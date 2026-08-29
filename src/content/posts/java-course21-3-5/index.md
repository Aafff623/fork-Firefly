---
title: "开启分布式配置管理"
published: 2026-08-25
description: "修改父模块pom.xml"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-3-5
pinned: false
comment: true
---

### 添加依赖


修改父模块pom.xml


```xml
<dependencies>
  <!--...为节约篇幅，此处省略非核心内容-->
  <dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
  </dependency>
</dependencies>
```


### 增加配置

在所有领域微服务应用配置中添加如下配置：

```
spring.cloud.nacos.config.server-addr=127.0.0.1:8848
```

并针对各个应用的应用名称不同，分别增加以下配置

```
spring.config.import[0]=nacos:rednote-file-microservice.properties?group=DEFAULT_GROUP
```

```
spring.config.import[0]=nacos:rednote-user-microservice.properties?group=DEFAULT_GROUP
```

```
spring.config.import[0]=nacos:rednote-content-microservice.properties?group=DEFAULT_GROUP
```

```
spring.config.import[0]=nacos:rednote-admin-microservice.properties?group=DEFAULT_GROUP
```

```
spring.config.import[0]=nacos:rednote-gateway-microservice.properties?group=DEFAULT_GROUP
```
