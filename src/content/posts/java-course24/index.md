---
title: "部署与运维（Docker）（Java 课程 24 · 全 10 节合订）"
published: 2026-09-18
description: "全栈终极技能：项目部署与运维，Docker 容器化基础。"
image: ''
tags: [Docker, 容器化]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course24
pinned: false
comment: true
---
> 本页为原「Java 课程 24」全部 10 个分节的合订本；原分节链接会自动跳转到本页。


## 1.1 如何掌握全栈工程师终极技能-项目部署与运维？

全栈工程师的部署与运维能力，核心是打通“开发环境-测试环境-生产环境”的一致性链路，解决项目（含Java后端、Vue.js前端、数据库、Redis、Kafka）的环境依赖复杂、资源调度难、规模化部署成本高等问题。掌握这一技能需围绕“认知-工具-实战-体系”四层逻辑构建能力：

### 1. 认知层：明确全栈项目部署运维的核心痛点
全栈项目（如前端应用、后端应用、数据库、Redis、Kafka）的部署运维问题，可分以下核心痛点：
- 环境碎片化：开发机、测试服务器、生产服务器的JDK版本、依赖库、模型配置不一致，导致“本地能跑，部署就崩”；
- 资源需求特殊：大模型推理需GPU/高内存，常规部署方式难以灵活分配资源；
- 规模化难：多实例部署、扩缩容、故障恢复依赖人工，效率低且易出错；
- 运维复杂度高：需监控容器日志、资源占用、模型调用状态，传统运维工具适配性差。

### 2. 工具层：以Docker为核心搭建技术栈
全栈部署运维的核心工具链需围绕Docker构建：
| 工具/技术       | 核心作用                                                                 |
|----------------|--------------------------------------------------------------------------|
| Docker         | 容器化打包应用（含依赖、配置、运行时），实现环境标准化                   |
| Docker Compose | 单机多容器编排，管理全栈项目的Java后端、Vue.js前端、数据库、Redis、Kafka等依赖关系    |
| Docker Registry | 镜像仓库（如阿里云镜像仓库），统一管理全栈项目镜像版本                     |
| 监控工具（Prometheus+Grafana） | 监控容器资源（CPU/GPU/内存）、服务QPS/延迟                           |
| CI/CD（Jenkins/GitLab CI） | 自动化构建Docker镜像、推送仓库、部署容器，打通“代码提交-部署上线”链路    |

### 3. 实战层：从“单机部署”到“规模化运维”进阶
- 入门：用Docker打包单个应用，解决环境一致性问题；
- 进阶：用Docker Compose编排Java后端、Vue.js前端、数据库、Redis、Kafka等全套服务；
- 高阶：结合CI/CD实现镜像自动构建、灰度发布，结合监控工具实现容器化所有服务的全生命周期管理。

### 4. 体系层：建立标准化部署运维流程
- 镜像标准化：制定全栈项目Dockerfile编写规范（如基础镜像选择、分层构建、安全加固）；
- 配置标准化：通过环境变量、配置文件挂载分离“代码与配置”，适配不同环境；
- 发布标准化：制定“构建-测试-推送-部署-回滚”流程，避免手动操作；
- 运维标准化：建立容器日志收集、资源监控、故障告警机制，保障服务稳定性。


## 2.1 Docker概述，建立现代化部署体系初印象

### 1. Docker的核心定义
Docker是基于Linux容器（LXC）的轻量级虚拟化技术，核心是将应用及其所有依赖（库、配置、运行时）打包成“容器镜像”，使得应用可以在任何支持Docker的环境中“一次构建，处处运行”，解决了传统部署的“环境地狱”问题。

### 2. Docker的核心价值（针对全栈项目）
| 价值维度       | 具体体现                                                                 |
|----------------|--------------------------------------------------------------------------|
| 环境一致性     | Java后端、Vue.js前端、数据库、Redis、Kafka依赖打包成镜像，开发/测试/生产环境完全一致 |
| 轻量级高效     | 容器基于宿主机内核运行，无需虚拟操作系统，启动秒级（对比VMware快10倍以上） |
| 资源隔离与可控 | 为容器分配指定CPU/内存/GPU资源，避免单应用占用全部资源             |
| 快速迭代部署   | 镜像版本化管理，更新应用仅需替换镜像并重启容器，回滚仅需切换镜像版本   |
| 规模化适配     | 配合编排工具（Compose/K8s），快速实现服务的多实例部署、扩缩容         |

### 3. Docker与传统部署/虚拟机的对比
| 部署方式       | 环境一致性 | 启动速度 | 资源占用 | 扩缩容难度 | 场景适配性 |
|----------------|------------|----------|----------|------------|--------------|
| 传统物理机/虚拟机 | 差（依赖手动配置） | 分钟级   | 高（占用完整OS资源） | 高（需手动部署） | 差（GPU分配复杂） |
| Docker容器     | 优（镜像打包所有依赖） | 秒级     | 低（共享宿主机内核） | 低（编排工具一键扩缩容） | 优（支持GPU容器、模型挂载） |


## 2.2 Docker安装与环境搭建，快速完成开发环境标准化

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


## 2.3 Docker核心概念深度解析：避免90%的容器化设计陷阱

Docker的核心概念是理解容器化设计的关键，错误的认知会导致镜像臃肿、容器隔离失效、数据丢失等问题，以下解析核心概念及避坑要点：

### 1. 镜像（Image）：容器的“只读模板”
- 定义：镜像是打包了应用代码、依赖、运行时、配置的只读文件，是创建容器的基础；
- 特性：
  - 分层存储：镜像由多个只读层叠加而成（如基础层JDK24、应用层业务代码），分层可复用，减少镜像体积；
  - 不可修改：镜像构建后只读，如需修改需重新构建新镜像；
- 避坑陷阱：
  ❌ 陷阱1：镜像分层过多/过大（如在镜像中安装无关工具、未清理构建缓存）→ 导致镜像体积GB级，拉取/部署慢；
  ✅ 解决方案：使用多阶段构建（Multi-stage Build），仅保留运行时依赖；构建后清理yum/apk缓存；
  ❌ 陷阱2：使用最新版镜像（latest tag）→ 生产环境镜像版本不可控，易引发兼容性问题；
  ✅ 解决方案：镜像指定具体版本（如redis:7.0-alpine，而非redis:latest）；

### 2. 容器（Container）：镜像的“运行实例”
- 定义：容器是镜像的可运行实例，在镜像只读层之上添加一层“可写层”，实现应用运行；
- 特性：
  - 隔离性：容器拥有独立的网络、进程、文件系统空间，与宿主机/其他容器隔离；
  - 临时性：默认情况下，容器内的可写层数据在容器删除后丢失；
- 避坑陷阱：
  ❌ 陷阱1：将AI模型文件、业务数据存储在容器可写层→ 容器删除后数据丢失；
  ✅ 解决方案：通过“数据卷（Volume）”或“绑定挂载（Bind Mount）”将数据存储到宿主机；
  ❌ 陷阱2：容器启动时未配置“重启策略”→ 宿主机重启后容器无法自动恢复；
  ✅ 解决方案：启动容器时指定`--restart=always`（始终重启）或`--restart=on-failure:3`（失败时重启3次）；
  ❌ 陷阱3：容器占用端口与宿主机/其他容器冲突→ 启动失败；
  ✅ 解决方案：使用动态端口映射（如`-p 0:8080`），或通过编排工具管理端口。

### 3. 数据卷（Volume）：容器的数据“持久化方案”
- 定义：数据卷是宿主机文件系统的专用目录，用于存储容器数据，独立于容器生命周期；
- 特性：
  - 持久化：容器删除后，数据卷中的数据仍保留；
  - 可共享：多个容器可挂载同一个数据卷，实现数据共享；
- 避坑陷阱：
  ❌ 陷阱：使用“绑定挂载”替代数据卷，且挂载路径权限配置错误→ 容器无权限读写数据；
  ✅ 解决方案：优先使用命名数据卷（如`docker volume create ai-data`），挂载时指定权限（如`-v ai-data:/app/data:rw`）。

### 4. 网络（Network）：容器间的“通信桥梁”
- 定义：Docker网络用于容器间、容器与宿主机的通信，默认包含bridge（桥接）、host（主机网络）、none（无网络）三种模式；
- 避坑陷阱：
  ❌ 陷阱1：所有容器使用默认bridge网络→ 容器间只能通过IP通信，IP变化后无法访问；
  ✅ 解决方案：创建自定义网络（如`docker network create ai-network`），容器接入后可通过容器名通信；
  ❌ 陷阱2：生产环境使用host网络→ 容器与宿主机共享网络命名空间，失去隔离性；
  ✅ 解决方案：仅在特殊场景（如需要高性能网络）使用host网络，生产环境优先自定义bridge网络。

### 5. Dockerfile：构建镜像的“脚本文件”
- 定义：Dockerfile是文本文件，包含构建镜像的一系列指令（如FROM、RUN、COPY、CMD）；
- 避坑陷阱：
  ❌ 陷阱1：RUN指令过多（如每个命令单独RUN）→ 镜像分层过多，体积增大；
  ✅ 解决方案：将多个RUN指令合并为一个，用`&&`连接，且清理缓存（如`RUN yum install -y xxx && yum clean all`）；
  ❌ 陷阱2：使用ROOT用户运行容器→ 存在安全风险；
  ✅ 解决方案：在Dockerfile中创建普通用户（`RUN useradd -m aiuser`），并通过`USER aiuser`切换用户；
  ❌ 陷阱3：CMD与ENTRYPOINT混用不当→ 容器启动命令执行异常；
  ✅ 解决方案：ENTRYPOINT定义固定执行命令，CMD传递默认参数（如`ENTRYPOINT ["java", "-jar"]`，`CMD ["app.jar"]`）。


## 3.1 镜像操作实战：斩获让环境部署效率的秘籍

镜像操作是Docker的核心实战技能，掌握镜像的构建、优化、推送、拉取，能大幅提升全栈项目部署效率，以下聚焦高频实战场景：

### 验证安装


运行 docker --version 检查版本，确保 Docker 可用


### 设置Docker国内镜像仓库

镜像仓库是Docker的必经之路，Docker Hub是官方提供的公共镜像仓库，但Docker Hub在国内无法访问或者速度慢。因此需要设置国内镜像仓库，提升镜像拉取效率。


临时:


```bash
docker pull docker.xuanyuan.me/hello-world
```

```bash
{
  // ...
  "registry-mirrors": ["https://docker.1ms.run"]
}
```


### 1. 基础镜像操作：拉取/查看/删除
```bash
# 查找镜像
docker search nginx

# 拉取镜像（指定版本）
docker pull hello-world:latest
docker pull nginx:latest

# 查看本地镜像
docker images # 列出所有镜像
docker images -q # 仅列出镜像ID

# 删除镜像（需先停止/删除依赖该镜像的容器）
docker rmi 镜像ID/镜像名:版本
# 强制删除
docker rmi -f 镜像ID
# 清理未使用的镜像（悬空镜像）
docker image prune -a
```

### 2. 实战：编写全栈项目Dockerfile
以“Spring AI集成通义千问”的Java项目为例，编写优化后的Dockerfile：
```dockerfile
# 阶段1：构建应用（多阶段构建，仅保留运行时依赖）
FROM maven:3.8.5-openjdk-17 AS builder
# 设置工作目录
WORKDIR /app
# 复制pom.xml并下载依赖（利用缓存，依赖不变时无需重新下载）
COPY pom.xml .
RUN mvn dependency:go-offline -B
# 复制源码并打包
COPY src ./src
RUN mvn package -DskipTests

# 阶段2：运行应用（使用轻量级基础镜像）
FROM openjdk:17-jdk-slim
# 创建普通用户
RUN useradd -m aiuser && chown -R aiuser /app
USER aiuser
# 设置工作目录
WORKDIR /app
# 从构建阶段复制打包后的jar包
COPY --from=builder /app/target/*.jar app.jar
# 暴露端口
EXPOSE 8080
# 启动命令（ENTRYPOINT+CMD组合）
ENTRYPOINT ["java", "-jar", "-Xmx512m"] # 限制内存
CMD ["app.jar"]
```
优化要点：
- 多阶段构建：构建阶段用maven镜像，运行阶段用轻量级openjdk镜像，减少镜像体积；
- 依赖缓存：先复制pom.xml下载依赖，源码变更时无需重新下载依赖；
- 资源限制：启动时指定`-Xmx512m`限制内存，避免占用过多资源；
- 安全加固：使用普通用户运行，避免ROOT权限。

### 3. 构建镜像：从Dockerfile到可运行镜像
```bash
# 构建镜像（-t指定标签：名称:版本）
docker build -t rn-nginx:1.0 .
# 构建时指定Dockerfile路径（非当前目录）
docker build -t rn-nginx:1.0 -f ./docker/Dockerfile .
```

### 4. 镜像优化：将体积从GB级降到百MB级
全栈项目镜像易臃肿，以下是核心优化技巧：
| 优化手段       | 具体操作                                                                 |
|----------------|--------------------------------------------------------------------------|
| 多阶段构建     | 分离构建/运行阶段，仅保留运行时依赖                                     |
| 选择轻量级镜像 | 使用alpine/slim版本镜像（如openjdk:17-jdk-slim vs openjdk:17）           |
| 清理构建缓存   | RUN指令后清理yum/apk/mvn缓存（如`RUN mvn package && rm -rf ~/.m2`）      |
| 合并RUN指令    | 将多个RUN指令合并为一个，减少分层（如`RUN apt update && apt install -y xxx && apt clean`） |
| 排除无关文件   | 编写.dockerignore文件（排除.git、target、logs等），避免复制无关文件       |

### 5. 镜像推送：上传到阿里云镜像仓库（企业级）
#### （1）登录阿里云镜像仓库
```bash
docker login --username=你的阿里云账号 registry.cn-hangzhou.aliyuncs.com
```

#### （2）为镜像打标签（符合仓库规范）
```bash
docker tag rn-nginx:1.0 registry.cn-hangzhou.aliyuncs.com/你的命名空间/rn-nginx:1.0
```

#### （3）推送镜像
```bash
docker push registry.cn-hangzhou.aliyuncs.com/你的命名空间/rn-nginx:1.0
```

#### （4）拉取私有镜像（部署时）
```bash
docker pull registry.cn-hangzhou.aliyuncs.com/你的命名空间/rn-nginx:1.0
```

### 6. 效率秘籍：镜像复用与版本管理
- 制作基础镜像：将全栈项目通用依赖制作成基础镜像，所有子项目基于该镜像构建，减少重复构建；
- 版本语义化：镜像版本遵循“主版本.次版本.补丁”（如1.0.0），避免随意命名；
- 镜像缓存策略：开发环境保留常用镜像，生产环境仅拉取指定版本镜像，定期清理无用镜像。


## 3.2 容器操作实战，建立标准化启停与监控机制

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


## 4.1 容器编排实战，一键搞定多服务部署

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


## 4.2 容器编排文件编写技巧解读，掌握让部署配置效率 的黄金法则

`docker-compose.yml`是容器编排的核心，掌握编写技巧能大幅提升部署配置效率，以下结合全栈项目场景拆解黄金法则：

### 1. 黄金法则1：版本与结构标准化
- 使用最新稳定版本（如3.8），避免兼容问题；
- 结构分层：按`version`→`services`→`volumes`→`networks`编写，逻辑清晰；
- 服务命名标准化：`服务名-环境`（如`spring-ai-prod`）。

### 2. 黄金法则2：利用依赖与启动顺序（AI多服务依赖）
全栈项目中Spring AI需依赖Redis/Milvus启动，通过`depends_on`控制顺序：
```yaml
version: '3.8'
services:
  spring-ai-qwen:
    build: .
    depends_on:
      - redis
      - milvus
    # 其他配置...
  redis:
    image: redis:7.0-alpine
  milvus:
    image: milvusdb/milvus:v2.3.0
```
进阶：`depends_on`仅保证启动顺序，不保证服务就绪，需在Spring AI中添加健康检查（如等待Redis端口开放）。

### 3. 黄金法则3：环境变量与配置分离（避免硬编码）
通过`env_file`加载环境变量文件，不同环境使用不同文件：
```yaml
# docker-compose.yml
services:
  spring-ai-qwen:
    env_file:
      - .env.prod # 生产环境变量文件
    environment:
      - SPRING_PROFILES_ACTIVE=prod # 覆盖或新增变量
```
```env
# .env.prod
SPRING_AI_ALIBABA_DASHSCOPE_API_KEY=你的APIKey
REDIS_HOST=redis
REDIS_PORT=6379
MILVUS_HOST=milvus
MILVUS_PORT=19530
```

### 4. 黄金法则4：资源限制与健康检查（保障AI服务稳定）
```yaml
services:
  spring-ai-qwen:
    # 资源限制
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1g
        reservations: # 预留资源
          cpus: '0.5'
          memory: 512m
    # 健康检查（AI服务就绪判断）
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s # 检查间隔
      timeout: 10s # 超时时间
      retries: 3 # 重试次数
      start_period: 60s # 启动后等待时间（AI服务启动可能较慢）
```

### 5. 黄金法则5：数据卷与网络复用（减少重复配置）
```yaml
# 定义全局数据卷（所有服务可复用）
volumes:
  redis-data:
  milvus-data:
  ai-log:

# 定义全局网络
networks:
  ai-network:
    driver: bridge

services:
  spring-ai-qwen:
    volumes:
      - ai-log:/app/logs
    networks:
      - ai-network
  redis:
    volumes:
      - redis-data:/data
    networks:
      - ai-network
```

### 6. 实战：全栈项目完整docker-compose.yml
```yaml
version: '3.8'

# 全局网络
networks:
  ai-network:
    driver: bridge

# 全局数据卷
volumes:
  redis-data:
  milvus-data:
  ai-log:

services:
  # Redis：对话上下文存储
  redis:
    image: redis:7.0-alpine
    networks:
      - ai-network
    volumes:
      - redis-data:/data
    restart: on-failure:3
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # Milvus：向量数据库
  milvus:
    image: milvusdb/milvus:v2.3.0
    networks:
      - ai-network
    volumes:
      - milvus-data:/var/lib/milvus
    environment:
      - MILVUS_MODE=standalone
      - ETCD_USE_EMBED=true
      - MINIO_USE_EMBED=true
    ports:
      - "19530:19530"
    restart: on-failure:3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 120s

  # Spring AI后端服务
  spring-ai-qwen:
    build: .
    networks:
      - ai-network
    ports:
      - "8080:8080"
    volumes:
      - ai-log:/app/logs
    env_file:
      - .env.prod
    depends_on:
      - redis
      - milvus
    restart: on-failure:3
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1g
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```


## 4.3 容器编排常用命令深度解析，掌握规模化容器调度技巧

Docker Compose命令是规模化管理容器的核心，掌握以下命令能实现“一键部署、批量运维、扩缩容”，适配全栈项目的规模化部署需求。

### 1. 基础命令：启动/停止/查看（高频使用）
```bash
# 启动所有服务（后台运行，-d）
docker-compose up -d
# 启动指定服务（如仅启动Redis+Milvus）
docker-compose up -d redis milvus
# 查看服务状态
docker-compose ps
# 查看服务日志（指定服务+实时跟踪）
docker-compose logs -f spring-ai-qwen
# 停止所有服务
docker-compose stop
# 停止指定服务
docker-compose stop spring-ai-qwen
# 停止并删除容器、网络（保留数据卷）
docker-compose down
# 停止并删除容器、网络、数据卷（谨慎使用）
docker-compose down -v
```

### 2. 规模化调度：扩缩容（应用服务水平扩展）
```bash
# 扩缩容（如启动3个Spring AI实例）
docker-compose up -d --scale spring-ai-qwen=3
# 注意：需确保服务无状态（如会话存储在Redis），端口映射避免冲突（可使用动态端口：-p 0:8080）
```

### 3. 镜像更新：一键更新应用服务（无停机）
```bash
# 步骤1：重新构建镜像
docker-compose build spring-ai-qwen
# 步骤2：重启服务（使用新镜像）
docker-compose up -d --force-recreate spring-ai-qwen
```

### 4. 配置更新：无需重启的配置生效
```bash
# 重新加载配置（仅支持部分配置，如环境变量）
docker-compose up -d --no-deps --force-recreate spring-ai-qwen
# --no-deps：不重启依赖服务；--force-recreate：强制重建容器
```

### 5. 运维排查：批量操作与状态监控
```bash
# 查看所有服务的资源占用
docker-compose stats
# 进入指定服务容器
docker-compose exec spring-ai-qwen /bin/bash
# 查看服务依赖关系
docker-compose top
# 验证编排文件语法
docker-compose config
# 清理未使用的资源（容器、网络、镜像）
docker-compose down --rmi all --volumes
```

### 6. 规模化部署技巧：结合脚本实现一键运维
编写`deploy.sh`脚本，实现全栈项目的一键部署/更新/回滚：
```bash
#!/bin/bash
# deploy.sh：全栈项目一键部署脚本

# 部署环境（prod/test）
ENV=$1
if [ -z "$ENV" ]; then
  echo "请指定环境：prod/test"
  exit 1
fi

# 步骤1：验证配置文件
docker-compose -f docker-compose-$ENV.yml config

# 步骤2：构建镜像
docker-compose -f docker-compose-$ENV.yml build

# 步骤3：启动服务
docker-compose -f docker-compose-$ENV.yml up -d

# 步骤4：查看服务状态
docker-compose -f docker-compose-$ENV.yml ps

echo "部署完成！日志查看：docker-compose -f docker-compose-$ENV.yml logs -f"
```
使用方式：
```bash
# 部署生产环境
./deploy.sh prod
# 部署测试环境
./deploy.sh test
```

### 7. 生产环境进阶：结合CI/CD实现自动化编排
将Docker Compose命令集成到Jenkins/GitLab CI中，实现“代码提交→镜像构建→自动部署”：
```yaml
# .gitlab-ci.yml示例
stages:
  - build
  - deploy

build:
  stage: build
  script:
    - docker-compose build
    - docker-compose push

deploy:
  stage: deploy
  script:
    - docker-compose down
    - docker-compose up -d
  only:
    - main # 仅主分支触发部署
```

## 总结
Docker容器化是AI全栈工程师突破部署运维瓶颈的核心技能，核心价值在于环境标准化、部署高效化、运维规模化。这篇聊到的内容：
1. 从认知层理解Docker解决的全栈项目部署痛点；
2. 从实战层掌握镜像构建、容器操作的标准化流程；
3. 从规模化层掌握Docker Compose编排技巧，实现多服务一键部署；
4. 结合AI场景优化（资源限制、GPU适配、数据持久化），保障服务稳定运行。


## 5.1 课程总结

容器化是全栈工程师突破“开发-部署”壁垒的核心技能，Docker作为容器化技术的事实标准，能解决全栈项目环境不一致、部署繁琐、运维复杂等痛点。这个系列从技能体系、Docker核心知识、实战操作、容器编排四个维度，拆解Docker容器化的核心内容，帮你把全栈项目的部署与运维能力补上来。


同时，规模化层掌握Docker Compose编排技巧，实现多服务一键部署。
