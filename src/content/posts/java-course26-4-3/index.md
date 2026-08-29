---
title: "-3 Service管理实战，解决服务访问不可靠难题"
published: 2026-08-25
description: "在全栈项目的K8s部署中，Pod具有临时性（故障重启、调度迁移后IP会变化），直接通过Pod IP访问服务存在极大不稳定性。Service作为K8s的服务抽象，通过标签关联Pod集群，提供稳定的访问地…"
image: ''
tags: [Kubernetes, K8s, 编排]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course26-4-3
pinned: false
comment: true
---

在全栈项目的K8s部署中，Pod具有临时性（故障重启、调度迁移后IP会变化），直接通过Pod IP访问服务存在极大不稳定性。Service作为K8s的服务抽象，通过标签关联Pod集群，提供稳定的访问地址和负载均衡能力，是解决服务访问不可靠问题的核心方案。下面从Service的核心类型、实战配置、问题排查出发，聊聊Service管理技巧。

### 一、Service核心原理与类型

#### 1. 核心原理

Service通过标签选择器（selector）关联一组Pod，为这组Pod分配一个固定的ClusterIP（集群内部访问地址），并通过kube-proxy在每个Node节点维护网络规则，实现请求的负载均衡分发。无论Pod如何变化（IP变更、新增/删除），Service地址始终不变，保障服务访问的稳定性。

#### 2. 四种核心Service类型

|类型|核心作用|适用场景|
|---|---|---|
|ClusterIP|提供集群内部唯一的虚拟IP，仅集群内可访问|全栈项目内部服务通信（如前端→后端API、后端→数据库）|
|NodePort|在每个Node节点开放一个静态端口，通过NodeIP:NodePort访问服务|测试环境、小规模外部访问（无需负载均衡器）|
|LoadBalancer|集成云服务商负载均衡器（如阿里云SLB），自动分配公网IP|生产环境外部访问（需要高可用、高性能负载均衡）|
|ExternalName|将Service映射为外部域名（如xxx.com），无需关联Pod|访问集群外部服务（如第三方API、云数据库）|
### 二、Service实战配置与操作

#### 1. ClusterIP Service配置（内部服务通信）

```Plain Text

apiVersion: v1
kind: Service
metadata:
  name: fullstack-api-service
  namespace: fullstack-namespace
spec:
  type: ClusterIP  # Service类型
  selector:
    app: fullstack-api  # 关联标签为app:fullstack-api的Pod
  ports:
  - port: 8080  # Service暴露的端口（集群内访问端口）
    targetPort: 8080  # Pod容器的端口
    protocol: TCP  # 协议类型（默认TCP）
```

```Plain Text

#!/bin/bash
# 应用Service配置
kubectl apply -f service-fullstack-api.yaml
# 查看Service状态（获取ClusterIP）
kubectl get svc -n fullstack-namespace
# 查看Service详细信息（含关联的Pod）
kubectl describe svc fullstack-api-service -n fullstack-namespace
# 集群内测试访问（通过ClusterIP）
curl http://10.96.xxx.xxx:8080/health
```

#### 2. NodePort Service配置（测试环境外部访问）

```Plain Text

apiVersion: v1
kind: Service
metadata:
  name: fullstack-frontend-service
  namespace: fullstack-namespace
spec:
  type: NodePort
  selector:
    app: fullstack-frontend
  ports:
  - port: 80  # Service内部端口
    targetPort: 80  # 前端容器端口
    nodePort: 30080  # 节点开放的端口（范围：30000-32767，可选，不指定则自动分配）
  externalTrafficPolicy: Cluster  # 流量策略（Cluster：负载均衡到所有Pod；Local：仅负载均衡到本节点Pod）
```

```Plain Text

#!/bin/bash
# 应用配置
kubectl apply -f service-fullstack-frontend.yaml
# 外部访问测试（通过任意NodeIP:nodePort）
curl http://192.168.0.101:30080
```

#### 3. LoadBalancer Service配置（生产环境外部访问）

```Plain Text

apiVersion: v1
kind: Service
metadata:
  name: fullstack-prod-service
  namespace: fullstack-namespace
  annotations:
    # 阿里云SLB相关注解（根据云服务商调整）
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-type: "classic"  # SLB类型
    service.beta.kubernetes.io/alibaba-cloud-loadbalancer-instance-charge-type: "PayByTraffic"  # 按流量付费
spec:
  type: LoadBalancer
  selector:
    app: fullstack-api
  ports:
  - port: 80
    targetPort: 8080
  loadBalancerIP: "120.xxx.xxx.xxx"  # 可选，指定已有的SLB公网IP
```

```Plain Text

#!/bin/bash
# 应用配置
kubectl apply -f service-fullstack-prod.yaml
# 查看Service（获取外部IP）
kubectl get svc -n fullstack-namespace
# 外部访问测试（通过LoadBalancer的外部IP）
curl http://120.xxx.xxx.xxx:80
```

#### 4. ExternalName Service配置（访问外部服务）

```Plain Text

apiVersion: v1
kind: Service
metadata:
  name: external-db-service
  namespace: fullstack-namespace
spec:
  type: ExternalName
  externalName: db.xxx.com  # 外部数据库域名
```

```Plain Text

#!/bin/bash
# 应用配置
kubectl apply -f service-external-db.yaml
# 集群内访问外部服务（通过Service名称）
kubectl exec -it fullstack-api-pod -n fullstack-namespace -- ping external-db-service.fullstack-namespace.svc.cluster.local
```

### 三、Service访问不可靠问题排查实战

全栈项目中，Service访问常见问题包括“无法访问服务、访问超时、负载均衡不均”等，以下是针对性排查步骤与解决方案。

#### 1. 问题一：Service无法访问Pod

核心排查步骤：

- 检查Service与Pod的标签是否匹配：

```Plain Text

# 查看Service的标签选择器
kubectl get svc fullstack-api-service -n fullstack-namespace -o jsonpath='{.spec.selector}'
# 查看Pod的标签
kubectl get pods -n fullstack-namespace -l app=fullstack-api -o jsonpath='{.items[0].metadata.labels}'
```

- 检查Pod是否就绪（就绪探针是否通过）：

```Plain Text

kubectl get pods -n fullstack-namespace -l app=fullstack-api -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}'
```

- 检查Pod内部服务是否正常运行：

```Plain Text

kubectl exec -it fullstack-api-pod -n fullstack-namespace -- curl http://localhost:8080/health
```

- 检查Service端口与Pod容器端口是否一致：

```Plain Text

kubectl get svc fullstack-api-service -n fullstack-namespace -o jsonpath='{.spec.ports}'
kubectl get pods -n fullstack-namespace -l app=fullstack-api -o jsonpath='{.items[0].spec.containers[0].ports}'
```

#### 2. 问题二：外部访问Service超时

核心排查步骤：

- NodePort类型：检查节点防火墙是否开放nodePort端口：

```Plain Text

# 查看防火墙规则
firewall-cmd --list-ports
# 开放30080端口
firewall-cmd --add-port=30080/tcp --permanent
firewall-cmd --reload
```

- LoadBalancer类型：检查云服务商负载均衡器配置（如阿里云SLB的监听规则、安全组）：

解决方案：确认SLB监听端口与Service的port一致，安全组开放外部访问端口（如80、443）。

- 检查kube-proxy状态（负责Service流量转发）：

```Plain Text

kubectl get pods -n kube-system -l k8s-app=kube-proxy
kubectl logs -f kube-proxy-xxx -n kube-system
```

#### 3. 问题三：Service负载均衡不均

核心排查步骤与解决方案：

- 检查Pod副本分布：确保Pod均匀分布在不同Node节点，避免单节点负载过高：

```Plain Text

kubectl get pods -n fullstack-namespace -l app=fullstack-api -o wide
```

- 调整externalTrafficPolicy策略：若为Local，可能导致负载不均，可改为Cluster：

```Plain Text

spec:
  externalTrafficPolicy: Cluster
```

- 检查kube-proxy模式：推荐使用ipvs模式（负载均衡算法更丰富），而非iptables模式：

```Plain Text

# 查看kube-proxy模式
kubectl get configmap kube-proxy -n kube-system -o yaml | grep mode
# 若为iptables，修改为ipvs（需重启kube-proxy）
```

### 四、Service高级配置：会话亲和性

全栈项目中，部分场景需要保持用户会话连续性（如用户登录状态），可通过Service的会话亲和性配置，将同一用户的请求转发到同一Pod：

```Plain Text

apiVersion: v1
kind: Service
metadata:
  name: fullstack-api-service
  namespace: fullstack-namespace
spec:
  type: ClusterIP
  selector:
    app: fullstack-api
  ports:
  - port: 8080
    targetPort: 8080
  sessionAffinity: ClientIP  # 会话亲和性基于客户端IP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800  # 会话保持时间（3小时）
```
> （注：文档部分内容可能由 AI 生成）
