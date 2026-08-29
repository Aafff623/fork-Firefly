---
title: "如何实现文件微服务K8s改造？"
published: 2026-08-25
description: "新建rednote-file-microservice-deployment.yaml文件，内容如下"
image: ''
tags: [Kubernetes, K8s, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course27-3-5
pinned: false
comment: true
---

### 后端API部署（Deployment+Service）


新建rednote-file-microservice-deployment.yaml文件，内容如下

```
# 定义部署Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rednote-file-microservice
  namespace: rednote
  labels:
    app: rednote-file
spec:
  replicas: 1 # 副本数
  selector:
    matchLabels:
      app: rednote-file
  strategy:
    type: RollingUpdate # 滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: rednote-file
    spec:
      containers:
        - name: rednote-file-microservice
          image: rednote-file-microservice:1.0.0
          imagePullPolicy: Never  # 使用本地镜像
          ports:
            - containerPort: 9010
              protocol: TCP
          # 资源限制
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 1024Mi  
          # 环境变量
          env:
            - name: spring.cloud.nacos.discovery.server-addr
              value: host.docker.internal:8280
            - name: spring.cloud.nacos.config.server-addr
              value: host.docker.internal:8280  
            - name: seata.registry.nacos.server-addr
              value: host.docker.internal:8280    
            - name: spring.data.mongodb.host
              value: host.docker.internal
# 定义服务Service
apiVersion: v1
kind: Service
metadata:
  name: rednote-file-microservice
  namespace: rednote
spec:
  type: ClusterIP # 集群内访问
  selector:
    app: rednote-file
  ports:
    - port: 9010
      targetPort: 9010
      protocol: TCP
```

应用后端API部署配置：

```
kubectl apply -f rednote-file-microservice-deployment.yaml
```
