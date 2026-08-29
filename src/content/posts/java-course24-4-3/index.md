---
title: "容器编排常用命令深度解析，掌握规模化容器调度技巧"
published: 2026-08-25
description: "Docker Compose命令是规模化管理容器的核心，掌握以下命令能实现“一键部署、批量运维、扩缩容”，适配全栈项目的规模化部署需求。"
image: ''
tags: [Docker, 容器化]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course24-4-3
pinned: false
comment: true
---

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
