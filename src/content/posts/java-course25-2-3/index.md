---
title: "如何实现AI微服务容器化改造？"
published: 2026-08-25
description: "在领域微服务根目录下创建Dockerfile文件"
image: ''
tags: [Docker, 容器化, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course25-2-3
pinned: false
comment: true
---

### 制作Docker镜像

在领域微服务根目录下创建Dockerfile文件

```
# 指定基础镜像
FROM openjdk:24-ea-17-slim

# 创建目录，作为工作目录
RUN mkdir -p /rednote-ai-microservice
WORKDIR /rednote-ai-microservice

# 将文件复制到镜像中
COPY ./target/rednote-ai-microservice-0.0.1-SNAPSHOT.jar app.jar

# 设置TZ时区
ENV TZ=Asia/Shanghai

# 声明要暴露的端口
EXPOSE 9050

# 启动应用
CMD ["java", "-jar", "app.jar"]
```


### 构建镜像及运行


```
docker build -t rednote-ai-microservice:1.0.0 .


docker run -d --name rednote-ai-microservice -p 9050:9050 rednote-ai-microservice:1.0.0 
```
