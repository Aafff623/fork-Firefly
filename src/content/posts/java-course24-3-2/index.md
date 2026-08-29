---
title: "容器操作实战，建立标准化启停与监控机制"
published: 2026-08-25
description: "容器操作是将镜像转化为运行服务的核心，需建立“启动-运行-监控-停止”的标准化流程，保障AI服务稳定运行。"
image: ''
tags: [Docker, 容器化]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course24-3-2
pinned: false
comment: true
---

容器操作是将镜像转化为运行服务的核心，需建立“启动-运行-监控-停止”的标准化流程，保障AI服务稳定运行。

### 1. 容器启动：标准化启动参数（以Spring AI为例）
```bash
# 启动容器（核心参数）
docker run -d \
  --name rn-nginx \ # 容器名称（标准化命名：服务名-环境）
  -p 80:80 \ # 端口映射（宿主机:容器）
  nginx # 镜像名称
```


### 2. 容器运行监控：实时掌握AI服务状态
#### （1）基础监控命令
```bash
# 查看运行中的容器
docker ps
# 查看所有容器（包括停止的）
docker ps -a
# 查看容器日志（实时跟踪）
docker logs -f rn-nginx
# 查看容器资源占用（CPU/内存/网络）
docker stats rn-nginx
# 进入容器内部（调试用）
docker exec -it rn-nginx /bin/bash
# 查看容器详细信息
docker inspect rn-nginx
```

#### （2）AI场景进阶监控：日志与指标收集
- 日志标准化：将Spring AI日志输出到stdout（Docker默认收集），配合ELK栈收集分析；
- 指标暴露：通过Spring Boot Actuator暴露监控指标（/actuator/prometheus），Prometheus采集容器指标；
- GPU监控（AI推理场景）：安装nvidia-docker，通过`docker stats`监控GPU使用率。

### 3. 容器运维：常用操作（标准化流程）
```bash
# 重启容器
docker restart rn-nginx
# 暂停/恢复容器
docker pause rn-nginx
docker unpause rn-nginx
# 更新容器配置（如重启策略）
docker update --restart=always rn-nginx
# 停止容器
docker stop rn-nginx
# 删除容器（需先停止）
docker rm rn-nginx
# 批量停止/删除容器（运维批量操作）
docker stop $(docker ps -q --filter name=spring-ai-)
docker rm $(docker ps -aq --filter name=spring-ai-)
```

### 4. 故障排查：容器化AI服务常见问题定位
| 问题现象       | 排查步骤                                                                 |
|----------------|--------------------------------------------------------------------------|
| 容器启动失败   | 1. 执行`docker logs 容器名`查看日志；2. 检查端口是否被占用；3. 检查镜像是否存在 |
| AI服务响应慢   | 1. 执行`docker stats`查看资源占用；2. 检查容器网络是否通畅；3. 查看模型调用日志 |
| 数据丢失       | 1. 检查数据卷是否正确挂载；2. 执行`docker volume inspect`查看数据卷路径；3. 检查容器内文件权限 |
| API Key失效    | 1. 执行`docker inspect`查看环境变量；2. 重新启动容器并传递新的API Key       |

### 5. 容器停止与清理：标准化下线流程
```bash
# 步骤1：停止容器
docker stop rn-nginx
# 步骤2：备份数据卷（如有必要）
cp -r /var/lib/docker/volumes/ai-data/_data /backup/ai-data-$(date +%Y%m%d)
# 步骤3：删除容器（如需下线）
docker rm rn-nginx
# 步骤4：清理无用容器/镜像/数据卷
docker system prune -a
```
