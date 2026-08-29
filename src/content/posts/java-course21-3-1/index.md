---
title: "引入Spring Cloud微服务框架"
published: 2026-08-25
description: "修改父模块pom.xml"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-3-1
pinned: false
comment: true
---

### 添加Spring Cloud依赖管理

修改父模块pom.xml


```xml
<properties>
    <!--...为节约篇幅，此处省略非核心内容-->
    <spring-cloud.version>2025.0.0</spring-cloud.version>
</properties>

<!--...为节约篇幅，此处省略非核心内容-->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```


### 添加Spring Cloud Alibaba依赖管理

修改父模块pom.xml


```xml
<properties>
    <!--...为节约篇幅，此处省略非核心内容-->
    <spring-cloud-alibaba.version>2025.0.0.0</spring-cloud-alibaba.version>
</properties>

<!--...为节约篇幅，此处省略非核心内容-->
<dependencyManagement>
    <dependencies>
			<dependency>
				<groupId>com.alibaba.cloud</groupId>
				<artifactId>spring-cloud-alibaba-dependencies</artifactId>
				<version>${spring-cloud-alibaba.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
</dependencyManagement>
```
