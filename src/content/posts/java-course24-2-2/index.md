---
title: "Docker安装与环境搭建，快速完成开发环境标准化"
published: 2026-08-25
description: "Docker支持Linux、Windows、macOS，以下聚焦生产环境主流的Linux（CentOS 7/8） 安装，及开发环境的Docker Desktop安装。"
image: ''
tags: [Docker, 容器化]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course24-2-2
pinned: false
comment: true
---

Docker支持Linux、Windows、macOS，以下聚焦生产环境主流的Linux（CentOS 7/8） 安装，及开发环境的Docker Desktop安装。

### 1. Linux（CentOS）安装Docker
#### （1）前置准备：卸载旧版本（如有）
```bash
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
```

#### （2）安装依赖包
```bash
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

#### （3）配置阿里云镜像源（加速安装）
```bash
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

#### （4）安装Docker CE（社区版）
```bash
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

#### （5）启动并设置开机自启
```bash
# 启动Docker
sudo systemctl start docker
# 设置开机自启
sudo systemctl enable docker
# 验证安装
docker --version
# 运行测试容器（hello-world）
sudo docker run hello-world
```

#### （6）配置镜像加速（解决拉取镜像慢的问题）
国内访问Docker Hub速度慢，需配置阿里云/网易云镜像加速：
```bash
# 创建配置目录
sudo mkdir -p /etc/docker
# 写入镜像加速配置
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://你的阿里云镜像加速地址.mirror.aliyuncs.com"]
}
EOF
# 重启Docker服务
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 2. Windows/macOS安装Docker Desktop
- 下载地址：[Docker官方下载](https://www.docker.com/products/docker-desktop/)；
- 安装要点：
  - Windows需开启“Hyper-V”和“容器功能”（Win10/11专业版），家庭版需安装WSL2；
  - 安装后在设置中配置国内镜像加速（同Linux的daemon.json配置）；
  - 验证：打开终端执行`docker --version`和`docker run hello-world`。

### 3. 开发环境标准化：一键搭建全栈项目基础环境
以“Spring AI+Redis+Milvus”为例，通过Docker Compose一键搭建环境：
#### （1）编写docker-compose.yml
```yaml
version: '3.8'
services:
  # Redis：存储对话上下文
  redis:
    image: redis:7.0-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: always

  # Milvus：向量数据库（用于RAG）
  milvus:
    image: milvusdb/milvus:v2.3.0
    ports:
      - "19530:19530"
    volumes:
      - milvus-data:/var/lib/milvus
    environment:
      - MILVUS_MODE=standalone
    restart: always

volumes:
  redis-data:
  milvus-data:
```

#### （2）启动环境
```bash
# 启动所有服务（后台运行）
docker-compose up -d
# 查看容器状态
docker-compose ps
# 停止服务
docker-compose down
```
新人入职仅需执行上述命令，5分钟即可完成Redis+Milvus环境搭建，无需手动安装配置，实现开发环境标准化。
