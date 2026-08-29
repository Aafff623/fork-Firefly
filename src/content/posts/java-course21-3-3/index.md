---
title: "开启服务调用与负载均衡功能"
published: 2026-08-25
description: "spring-cloud-loadbalancer 是 Spring Cloud 提供的 客户端负载均衡器，用于在微服务架构中动态选择服务实例，实现请求的负载分发。它是 Netflix Ribbon …"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-3-3
pinned: false
comment: true
---

spring-cloud-loadbalancer 是 Spring Cloud 提供的 客户端负载均衡器，用于在微服务架构中动态选择服务实例，实现请求的负载分发。它是 Netflix Ribbon 的替代方案（Ribbon 已停止维护），与 Spring Cloud Gateway、Feign、RestTemplate 等组件无缝集成，支持多种负载均衡策略。

### 添加依赖


修改父模块pom.xml


```xml
<dependencies>
  <!--...为节约篇幅，此处省略非核心内容-->
  <dependency>
		<groupId>org.springframework.cloud</groupId>
		<artifactId>spring-cloud-loadbalancer</artifactId>
	</dependency>
	<dependency>
		<groupId>org.springframework.cloud</groupId>
		<artifactId>spring-cloud-starter-openfeign</artifactId>
	</dependency>
</dependencies>
```


### 增加配置

在所有领域微服务应用配置中添加如下配置：

```
# 配置 Spring Cloud Loadbalancer
spring.cloud.loadbalancer.enabled=true
```
