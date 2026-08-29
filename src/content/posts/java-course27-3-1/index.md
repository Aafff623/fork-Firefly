---
title: "如何进行全栈视角下的后端项目K8s改造？"
published: 2026-08-25
description: "新建rednote-gateway-microservice-deployment.yaml文件，内容如下"
image: ''
tags: [Kubernetes, K8s, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course27-3-1
pinned: false
comment: true
---

### 后端API部署（Namespace+Deployment+Service）


新建rednote-gateway-microservice-deployment.yaml文件，内容如下

```Plain Text
# 定义命名空间
apiVersion: v1
kind: Namespace
metadata:
  name: rednote
# 定义部署Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rednote-gateway-microservice
  namespace: rednote
  labels:
    app: rednote-gateway
spec:
  replicas: 1 # 副本数
  selector:
    matchLabels:
      app: rednote-gateway
  strategy:
    type: RollingUpdate # 滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: rednote-gateway
    spec:
      containers:
        - name: rednote-gateway-microservice
          image: rednote-gateway-microservice:1.0.0
          imagePullPolicy: Never  # 使用本地镜像
          ports:
            - containerPort: 8080
              protocol: TCP
          # 资源限制
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi    
# 定义服务Service
apiVersion: v1
kind: Service
metadata:
  name: rednote-gateway-microservice
  namespace: rednote
spec:
  type: NodePort
  selector:
    app: rednote-gateway
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 30080
      protocol: TCP
```


### 关键配置说明
- `imagePullPolicy: Never`：Docker Desktop中优先使用本地构建的镜像，避免去外网拉取（需先执行`docker build -t rednote-gateway-microservice:1.0.0 .`构建镜像）；
- `NodePort: 30080`：本地可通过`http://localhost:30080`访问网关服务；
- 资源限制：适配Docker Desktop的轻量特性，CPU/内存配置远低于生产环境；
- 依赖服务地址：格式为`服务名.命名空间.svc.cluster.local`，需确保网关等依赖服务已部署在`rednote`命名空间。


应用后端API部署配置：

```Plain Text

kubectl apply -f rednote-gateway-microservice-deployment.yaml
```
