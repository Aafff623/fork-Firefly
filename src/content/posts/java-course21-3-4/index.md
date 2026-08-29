---
title: "开启服务注册与发现功能"
published: 2026-08-25
description: "修改父模块pom.xml"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-3-4
pinned: false
comment: true
---

### 添加依赖


修改父模块pom.xml


```xml
<properties>
  <!--...为节约篇幅，此处省略非核心内容-->
	<nacos.version>3.1.1</nacos.version>
</properties>

<dependencies>
  <!--...为节约篇幅，此处省略非核心内容-->
  <dependency>
		<groupId>com.alibaba.cloud</groupId>
		<artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
  </dependency>
</dependencies>

<dependencyManagement>
		<dependencies>
				<!--...为节约篇幅，此处省略非核心内容-->
				
				<!-- 强制指定 nacos-client 版本-->
				<dependency>
						<groupId>com.alibaba.nacos</groupId>
						<artifactId>nacos-client</artifactId>
						<version>${nacos.version}</version>
				</dependency>
		</dependencies>
</dependencyManagement>
```

### 启用功能

在所有领域微服务应用的RednoteApplication中添加`@EnableDiscoveryClient`：


```java
package com.example.rednote.filesmicroservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class RednoteApplication {

	public static void main(String[] args) {
		SpringApplication.run(RednoteApplication.class, args);
	}

}
```

### 增加配置

在所有领域微服务应用配置中添加如下配置：

```
# 配置 Nacos
spring.cloud.loadbalancer.nacos.enabled=true
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
management.endpoints.web.exposure.include=*
```
