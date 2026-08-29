---
title: "如何实现AI微服务K8s改造？"
published: 2026-08-25
description: "新建rednote-ai-microservice-deployment.yaml文件，内容如下"
image: ''
tags: [Kubernetes, K8s, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course27-3-3
pinned: false
comment: true
---

### 后端API部署（Deployment+Service）


新建rednote-ai-microservice-deployment.yaml文件，内容如下

```Plain Text
# 定义部署Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rednote-ai-microservice
  namespace: rednote
  labels:
    app: rednote-ai
spec:
  replicas: 1 # 副本数
  selector:
    matchLabels:
      app: rednote-ai
  strategy:
    type: RollingUpdate # 滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: rednote-ai
    spec:
      containers:
        - name: rednote-ai-microservice
          image: rednote-ai-microservice:1.0.0
          imagePullPolicy: Never  # 使用本地镜像
          ports:
            - containerPort: 9050
              protocol: TCP
          # 资源限制
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi  
          # 环境变量
          env:
            - name: spring.cloud.nacos.discovery.server-addr
              value: host.docker.internal:8280
            - name: spring.cloud.nacos.config.server-addr
              value: host.docker.internal:8280  
            - name: seata.registry.nacos.server-addr
              value: host.docker.internal:8280    
# 定义服务Service
apiVersion: v1
kind: Service
metadata:
  name: rednote-ai-microservice
  namespace: rednote
spec:
  type: ClusterIP # 集群内访问
  selector:
    app: rednote-ai
  ports:
    - port: 9050
      targetPort: 9050
      protocol: TCP
```

应用后端API部署配置：

```Plain Text

kubectl apply -f rednote-ai-microservice-deployment.yaml
```
