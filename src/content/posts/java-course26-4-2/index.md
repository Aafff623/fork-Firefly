---
title: "-2 Deployment 管理实战，搭一套可扩展的服务更新流程"
published: 2026-08-25
description: "Deployment是K8s中管理无状态服务的核心控制器，基于ReplicaSet实现Pod的副本管理、滚动更新、版本回滚等功能。全栈项目的前端应用、API服务等无状态组件，均适合通过Deployme…"
image: ''
tags: [Kubernetes, K8s, 编排]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course26-4-2
pinned: false
comment: true
---

Deployment是K8s中管理无状态服务的核心控制器，基于ReplicaSet实现Pod的副本管理、滚动更新、版本回滚等功能。全栈项目的前端应用、API服务等无状态组件，均适合通过Deployment部署。下面通过实战聊聊Deployment的创建、扩缩容、更新、回滚等核心操作，搭一套可扩展、高可用的服务更新流程。

### 一、Deployment基础创建与配置

#### 1. 完整Deployment YAML配置示例

```Plain Text

apiVersion: apps/v1
kind: Deployment
metadata:
  name: fullstack-api-deployment  # Deployment名称
  namespace: fullstack-namespace  # 命名空间（隔离环境）
  labels:
    app: fullstack-api
spec:
  replicas: 3  # 期望Pod副本数（实现高可用）
  selector:
    matchLabels:
      app: fullstack-api  # 匹配标签为app:fullstack-api的Pod
  strategy:
    type: RollingUpdate  # 滚动更新策略（无停机更新）
    rollingUpdate:
      maxSurge: 1        # 更新过程中最多可超出的副本数（避免资源过载）
      maxUnavailable: 0  # 更新过程中最少可用的副本数（保障服务不中断）
  revisionHistoryLimit: 10  # 保留的版本历史数（用于回滚）
  progressDeadlineSeconds: 600  # 更新超时时间（600秒未完成则标记失败）
  template:
    metadata:
      labels:
        app: fullstack-api  # Pod标签，需与selector.matchLabels一致
    spec:
      containers:
      - name: fullstack-api
        image: fullstack-api:v1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "200m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        volumeMounts:
        - name: log-volume
          mountPath: /app/logs
      volumes:
      - name: log-volume
        emptyDir: {}
```

#### 2. 基础操作命令

```Plain Text

#!/bin/bash
# 应用YAML创建Deployment
kubectl apply -f deployment-fullstack-api.yaml
# 查看Deployment状态
kubectl get deployments -n fullstack-namespace
# 查看Deployment关联的ReplicaSet
kubectl get rs -n fullstack-namespace
# 查看Deployment管理的Pod
kubectl get pods -n fullstack-namespace -l app=fullstack-api
# 查看Deployment详细信息
kubectl describe deployment fullstack-api-deployment -n fullstack-namespace
# 删除Deployment（会同时删除关联的Pod和ReplicaSet）
kubectl delete deployment fullstack-api-deployment -n fullstack-namespace
```

### 二、Deployment扩缩容实战（适配流量波动）

全栈项目流量存在波峰波谷，通过Deployment扩缩容可灵活调整Pod副本数，保障服务性能的同时节省资源。

#### 1. 手动扩缩容

```Plain Text

#!/bin/bash
# 手动调整副本数为5
kubectl scale deployment fullstack-api-deployment --replicas=5 -n fullstack-namespace
# 验证扩缩容结果
kubectl get pods -n fullstack-namespace -l app=fullstack-api | wc -l
```

#### 2. 自动扩缩容（HPA配置）

结合Horizontal Pod Autoscaler（HPA），可根据CPU、内存使用率或自定义指标（如QPS）自动扩缩容，示例如下：

```Plain Text

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: fullstack-api-hpa
  namespace: fullstack-namespace
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: fullstack-api-deployment  # 关联的Deployment
  minReplicas: 3  # 最小副本数
  maxReplicas: 10  # 最大副本数
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # CPU使用率达到70%触发扩容
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80  # 内存使用率达到80%触发扩容
```

```Plain Text

#!/bin/bash
# 应用HPA配置
kubectl apply -f hpa-fullstack-api.yaml
# 查看HPA状态
kubectl get hpa -n fullstack-namespace
# 查看HPA详细信息（含扩缩容历史）
kubectl describe hpa fullstack-api-hpa -n fullstack-namespace
```

### 三、Deployment滚动更新与回滚实战

全栈项目需频繁迭代更新，Deployment的滚动更新策略可实现无停机更新，若更新失败可快速回滚到上一稳定版本，保障业务连续性。

#### 1. 滚动更新操作

##### 方式一：修改YAML文件更新

```Plain Text

# 修改deployment-fullstack-api.yaml中镜像版本为v1.1
spec:
  template:
    spec:
      containers:
      - name: fullstack-api
        image: fullstack-api:v1.1  # 新版本镜像
# 应用更新
kubectl apply -f deployment-fullstack-api.yaml
```

##### 方式二：命令行直接更新镜像

```Plain Text

#!/bin/bash
# 直接更新Deployment的镜像版本
kubectl set image deployment/fullstack-api-deployment fullstack-api=fullstack-api:v1.1 -n fullstack-namespace
# 查看更新进度
kubectl rollout status deployment/fullstack-api-deployment -n fullstack-namespace
```

#### 2. 版本回滚操作

```Plain Text

#!/bin/bash
# 查看Deployment版本历史
kubectl rollout history deployment/fullstack-api-deployment -n fullstack-namespace
# 查看指定版本的详细信息
kubectl rollout history deployment/fullstack-api-deployment --revision=2 -n fullstack-namespace
# 回滚到上一版本
kubectl rollout undo deployment/fullstack-api-deployment -n fullstack-namespace
# 回滚到指定版本（如版本1）
kubectl rollout undo deployment/fullstack-api-deployment --to-revision=1 -n fullstack-namespace
# 暂停更新（如需调试）
kubectl rollout pause deployment/fullstack-api-deployment -n fullstack-namespace
# 恢复更新
kubectl rollout resume deployment/fullstack-api-deployment -n fullstack-namespace
```

#### 3. 滚动更新优化配置

根据全栈项目业务特性调整滚动更新参数，平衡更新速度与服务稳定性：

```Plain Text

spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%        # 允许超出期望副本数的25%（如3个副本最多可扩到4个）
      maxUnavailable: 1    # 允许最多1个副本不可用（适用于副本数较少的场景）
  progressDeadlineSeconds: 300  # 缩短更新超时时间，快速发现更新异常
```
