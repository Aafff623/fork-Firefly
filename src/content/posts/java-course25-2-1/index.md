---
title: "如何进行全栈视角下的实现文件服务容器化改造？"
published: 2026-08-25
description: "打开另一个终端窗口，使用 mongosh 命令连接到 MongoDB"
image: ''
tags: [Docker, 容器化, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course25-2-1
pinned: false
comment: true
---

### MongoDB设置账号密码


#### 接到 MongoDB
打开另一个终端窗口，使用 mongosh 命令连接到 MongoDB：


列出当前 MongoDB 实例的可用数据库：

```
db.getMongo().getDBNames()
```


#### 切换到 rednote 数据库
使用 rednote 数据库来创建用户：


```
use rednote
```


#### 创建用户
使用以下命令创建一个具有权限的用户：


```js
db.createUser({
    user: "admin",           // 替换为你的用户名
    pwd: "admin123",      // 替换为你的密码
    roles: [{ role: "readWrite", db: "rednote" }]
})
```

验证下

```
db.auth("admin", "admin123")
```


#### 修改MonngoDB配置文件

# 原为 127.0.0.1，改为 0.0.0.0 允许所有IP访问

```
net:
  bindIp: 0.0.0.0  # 原为 127.0.0.1，改为 0.0.0.0 允许所有IP访问
```


### 开放 MySQL 远程连接

默认情况下 MySQL 仅允许本地访问。以下是开启 MySQL 远程连接的详细步骤。

#### 1. 修改 MySQL 用户权限

登录 MySQL：

```
mysql -u root -p
```


顾名思义，该方法就是直接修改更改“mysql”数据库里的“user”表里的“host”列，将“localhost”改为“%”。

```
use mysql;
select user,host from user;
update user set host='%' where user='root';
```


### 修改服务地址


将所有领域微服务应用的配置中的localhost、127.0.0.1 改为实际IP地址：


```
# 配置 MongoDB
#spring.data.mongodb.uri=mongodb://localhost:27017
spring.data.mongodb.grid-fs-database=rednote_files
spring.data.mongodb.host=192.168.68.157
spring.data.mongodb.port=27017
spring.data.mongodb.username=admin
spring.data.mongodb.password=admin123
spring.data.mongodb.database=rednote
spring.data.mongodb.authentication-database=rednote

# 数据库配置
spring.datasource.url=jdbc:mysql://192.168.68.157:3306/rednote_content_domain?useUnicode=true&characterEncoding=utf-8&zeroDateTimeBehavior=convertToNull&transformedBitIsBoolean=true&allowMultiQueries=true&useSSL=false&allowPublicKeyRetrieval=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=

spring.datasource.url=jdbc:mysql://192.168.68.157:3306/rednote_user_domain?useUnicode=true&characterEncoding=utf-8&zeroDateTimeBehavior=convertToNull&transformedBitIsBoolean=true&allowMultiQueries=true&useSSL=false&allowPublicKeyRetrieval=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=

# 配置 Nacos
spring.cloud.nacos.discovery.server-addr=192.168.68.157:8280

spring.cloud.nacos.config.server-addr=192.168.68.157:8280

seata.registry.nacos.server-addr=192.168.68.157:8280
```


### 制作Docker镜像

在领域微服务根目录下创建Dockerfile文件

```
# 指定基础镜像
FROM openjdk:24-ea-17-slim

# 创建目录，作为工作目录
RUN mkdir -p /rednote-file-microservice
WORKDIR /rednote-file-microservice

# 将文件复制到镜像中
COPY ./target/rednote-file-microservice-0.0.1-SNAPSHOT.jar app.jar

# 设置TZ时区
ENV TZ=Asia/Shanghai

# 声明要暴露的端口
EXPOSE 9010

# 启动应用
CMD ["java", "-jar", "app.jar"]
```


先执行Maven构建，生成rednote-file-microservice-0.0.1-SNAPSHOT.jar文件，而后在执行docker构建：


```
docker build -t rednote-file-microservice:1.0.0 .
```


容器启动

```bash
# 启动容器（核心参数）
docker run -d --name rednote-file-microservice -p 9010:9010 rednote-file-microservice:1.0.0 
```
