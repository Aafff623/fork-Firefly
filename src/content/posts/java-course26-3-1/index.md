---
title: "如何实现不同场景下的部署策略？"
published: 2026-08-25
description: "全栈项目的部署场景多样（如无状态服务、有状态服务、节点级服务），不同场景对部署的要求差异较大。K8s提供了多种部署策略，通过不同的控制器资源适配不同场景，核心包括“无状态部署、有状态部署、节点级部署、…"
image: ''
tags: [Kubernetes, K8s, 编排]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course26-3-1
pinned: false
comment: true
---

全栈项目的部署场景多样（如无状态服务、有状态服务、节点级服务），不同场景对部署的要求差异较大。K8s提供了多种部署策略，通过不同的控制器资源适配不同场景，核心包括“无状态部署、有状态部署、节点级部署、滚动更新与蓝绿部署”等。

### 一、无状态服务部署策略（Deployment）

#### 1. 适用场景

无状态服务是指服务实例之间无差异，不存储本地状态，可随意扩容、缩容或迁移（如全栈项目的前端应用、RESTful API后端服务、静态资源服务）。

#### 2. 核心特性

- Pod副本无差异：所有Pod实例使用相同的配置（镜像、环境变量、存储），可相互替代。

- 支持滚动更新：更新服务时，逐步替换旧Pod，确保服务不中断。

- 支持弹性伸缩：通过HPA自动调整Pod副本数，适配流量波动。

- 服务发现简单：通过Service关联Pod，实现负载均衡与稳定访问。

#### 3. 实战配置示例（部署全栈项目前端服务）

```yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment  # Deployment名称
  labels:
    app: frontend  # 标签，用于关联Service
spec:
  replicas: 3  # 期望Pod副本数
  selector:
    matchLabels:
      app: frontend  # 匹配标签为app:frontend的Pod
  strategy:
    type: RollingUpdate  # 滚动更新策略
    rollingUpdate:
      maxSurge: 1  # 更新过程中最多可超出的副本数
      maxUnavailable: 0  # 更新过程中最少可用的副本数（0表示不允许服务中断）
  template:
    metadata:
      labels:
        app: frontend  # Pod标签
    spec:
      containers:
      - name: frontend  # 容器名称
        image: my-frontend:v1.0  # 前端镜像
        ports:
        - containerPort: 80  # 容器端口
        resources:  # 资源限制
          requests:
            cpu: "100m"  # 申请100毫核CPU
            memory: "128Mi"  # 申请128MB内存
          limits:
            cpu: "500m"  # 限制最大500毫核CPU
            memory: "256Mi"  # 限制最大256MB内存
        livenessProbe:  # 存活探针（检测容器是否运行正常）
          httpGet:
            path: /  # 健康检查路径
            port: 80
          initialDelaySeconds: 30  # 容器启动30秒后开始检查
          periodSeconds: 10  # 检查间隔10秒
        readinessProbe:  # 就绪探针（检测容器是否可提供服务）
          httpGet:
            path: /  # 健康检查路径
            port: 80
          initialDelaySeconds: 5  # 容器启动5秒后开始检查
          periodSeconds: 5  # 检查间隔5秒
```

### 二、有状态服务部署策略（StatefulSet）

#### 1. 适用场景

有状态服务是指服务实例之间存在差异，需要存储本地状态，或依赖稳定的网络标识（如全栈项目的数据库服务、分布式缓存服务、消息队列服务）。

#### 2. 核心特性

- 稳定的网络标识：每个Pod有唯一的域名（格式：`Pod名称.服务名称.命名空间.svc.cluster.local`），即使Pod迁移，域名也保持不变。

- 稳定的持久化存储：通过PVC模板为每个Pod分配独立的PV资源，确保Pod的数据持久化，即使Pod删除，数据也不丢失。

- 有序部署与更新：部署时按顺序启动Pod（0→1→2...），更新时按逆序替换Pod（2→1→0...），确保有状态服务的集群一致性（如数据库主从同步）。

#### 3. 实战配置示例（部署MySQL数据库服务）

```yaml

apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql-statefulset
  labels:
    app: mysql
spec:
  serviceName: mysql-service  # 关联的Service名称，用于提供稳定网络标识
  replicas: 2  # 2个副本（主从架构）
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret  # 从Secret中获取密码
              key: root-password
        volumeMounts:
        - name: mysql-data  # 挂载持久化存储卷
          mountPath: /var/lib/mysql
  volumeClaimTemplates:  # PVC模板，为每个Pod自动创建PVC
  - metadata:
      name: mysql-data
    spec:
      accessModes: [ "ReadWriteOnce" ]  # 只能被一个Pod挂载读写
      resources:
        requests:
          storage: 10Gi  # 申请10GB存储

# 关联的Service（Headless Service，不分配ClusterIP，用于提供稳定域名）
apiVersion: v1
kind: Service
metadata:
  name: mysql-service
spec:
  selector:
    app: mysql
  ports:
  - port: 3306
    targetPort: 3306
  clusterIP: None  # Headless Service标识
```

### 三、节点级服务部署策略（DaemonSet）

#### 1. 适用场景

节点级服务是指需要在集群的所有Node节点或指定Node节点上运行的服务（如全栈项目的日志收集组件、监控代理、网络插件）。

#### 2. 核心特性

- 每个节点一个副本：确保集群内符合条件的Node节点上都有一个Pod副本，新增节点时自动部署Pod，删除节点时自动删除Pod。

- 支持节点选择：通过节点标签（Node Label）选择需要部署的节点，灵活适配不同场景。

- 适合运维工具：常用于部署日志收集（如Fluentd）、监控（如Prometheus Node Exporter）、网络插件（如Calico）等运维组件。

#### 3. 实战配置示例（部署Prometheus Node Exporter监控节点资源）

```yaml

apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter-daemonset
  labels:
    app: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      hostNetwork: true  # 使用主机网络，便于采集节点网络指标
      tolerations:  # 容忍污点，允许部署在Master节点
      - key: node-role.kubernetes.io/master
        effect: NoSchedule
      containers:
      - name: node-exporter
        image: prom/node-exporter:v1.5.0
        ports:
        - containerPort: 9100
        volumeMounts:
        - name: proc
          mountPath: /host/proc
          readOnly: true
        - name: sys
          mountPath: /host/sys
          readOnly: true
      volumes:
      - name: proc
        hostPath:
          path: /proc
      - name: sys
        hostPath:
          path: /sys
```

### 四、服务更新策略（滚动更新、蓝绿部署、金丝雀部署）

全栈项目的服务更新需要避免停机，保障业务连续性。K8s提供了多种更新策略，适配不同的更新风险与业务需求。

#### 1. 滚动更新（Rolling Update）

最常用的更新策略，通过逐步替换旧Pod实现服务更新，适用于无状态服务。

- 核心逻辑：每次停止一个旧Pod，启动一个新Pod，直到所有旧Pod被替换。

- 关键参数：
        

    - `maxSurge`：更新过程中最多可超出的副本数（默认25%），确保服务容量不低于预期。

    - `maxUnavailable`：更新过程中最少可用的副本数（默认25%），确保服务不中断。

- 适用场景：常规无状态服务更新（如前端应用、API服务），更新风险低。

#### 2. 蓝绿部署（Blue-Green Deployment）

通过部署两套相同的服务（蓝环境=旧版本，绿环境=新版本），切换流量实现更新，适用于更新风险高的服务。

- 核心逻辑：
       

    1. 部署绿环境（新版本服务），确保绿环境正常运行。

    2. 切换Service的流量路由，将用户流量从蓝环境切换到绿环境。

    3. 若更新失败，快速切换流量回蓝环境，实现秒级回滚。

- 实现方式：通过两个Deployment（蓝/绿）+ 一个Service，切换Service的标签选择器实现流量切换。

- 适用场景：核心业务服务更新（如支付服务、订单服务），要求零停机、快速回滚。

#### 3. 金丝雀部署（Canary Deployment）

将少量流量导向新版本服务，验证无问题后逐步扩大流量比例，适用于重大更新或新版本稳定性未知的场景。

- 核心逻辑：


    1. 部署少量新版本Pod（如10%的流量），其余流量仍指向旧版本。

    2. 监控新版本服务的稳定性（如错误率、响应时间）。

    3. 若稳定，逐步增加新版本Pod数量，减少旧版本Pod数量，直至完成更新。

    4. 若不稳定，立即停止新版本，回滚到旧版本。

- 实现方式：通过两个Deployment（旧版本=多副本，新版本=少副本）+ 一个Service，或使用Istio等服务网格工具实现流量精准控制。

- 适用场景：重大版本更新、AI模型服务更新、稳定性未知的新版本发布。
