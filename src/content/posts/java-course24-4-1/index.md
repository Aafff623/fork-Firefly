---
title: "容器编排实战，一键搞定多服务部署"
published: 2026-08-25
description: "单容器部署无法满足全栈项目“多服务依赖”的需求，容器编排工具可实现多容器的“一键部署、依赖管理、扩缩容”，核心工具为Docker Compose（单机）和Kubernetes（K8s，集群），以下聚焦…"
image: ''
tags: [Docker, 容器化]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course24-4-1
pinned: false
comment: true
---

单容器部署无法满足全栈项目“多服务依赖”的需求，容器编排工具可实现多容器的“一键部署、依赖管理、扩缩容”，核心工具为Docker Compose（单机）和Kubernetes（K8s，集群），以下聚焦AI全栈工程师入门必备的Docker Compose。

### 1. 容器编排核心价值（AI场景）

- 一键部署：编写`docker-compose.yml`定义所有服务，执行`docker-compose up -d`一键启动；
- 依赖管理：自动处理服务启动顺序（如先启动Redis，再启动后端服务）；
- 配置统一：所有服务的配置集中在一个文件，便于管理；
- 扩缩容简单：执行`docker-compose up -d --scale rn-nginx=3`快速扩缩容；
- 环境一致性：编排文件可提交到代码库，团队成员使用相同配置。


```yml
services:
  nginx-server-1:
    image: nginx:latest
    hostname: nginx-server-1
    container_name: nginx-server-1
    deploy:
      resources:
        limits:
          memory: 1G
    ports:
      - "80:81"
  nginx-server-2:
    image: nginx:latest
    hostname: nginx-server-2
    container_name: nginx-server-2
    deploy:
      resources:
        limits:
          memory: 1G
    ports:
      - "80:82"    
```

### 2. Docker Compose vs Kubernetes：选型建议
| 特性           | Docker Compose | Kubernetes | 适用场景                     |
|----------------|----------------|------------|------------------------------|
| 部署规模       | 单机           | 集群       | Compose：中小规模全栈项目（单机）；K8s：大规模/高可用AI服务 |
| 学习成本       | 低             | 高         | 入门选Compose，进阶学K8s     |
| 扩缩容         | 简单（--scale） | 自动化（HPA） | Compose适合手动扩缩容，K8s支持自动扩缩容 |
| AI场景适配     | 基础（单机GPU） | 高级（集群GPU调度） | 开发/测试用Compose，生产集群用K8s |
