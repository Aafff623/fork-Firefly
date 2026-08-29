---
title: "开启分布式事务功能"
published: 2026-08-25
description: "修改父模块pom.xml"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-3-6
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
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
  </dependency>
</dependencies>
```


### 增加配置

在所有领域微服务应用配置中添加如下配置：

```
# 配置 Seata
seata.tx-service-group=rednote_tx_group
seata.service.vgroup-mapping.rednote_tx_group=default
seata.registry.type=nacos
seata.registry.nacos.server-addr=127.0.0.1:8848
seata.registry.nacos.namespace=public
seata.registry.nacos.cluster=default
```
