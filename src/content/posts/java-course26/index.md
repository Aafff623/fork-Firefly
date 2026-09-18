---
title: "Docker Compose 编排（Java 课程 26 · 全 9 节合订）"
published: 2026-09-18
description: "Docker Compose 容器化部署的问题与解法。"
image: ''
tags: [Docker, Compose, 编排]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course26
pinned: false
comment: true
---
> 本页为原「Java 课程 26」全部 9 个分节的合订本；原分节链接会自动跳转到本页。


## 1.1 全栈项目Docker Compose容器化部署存在哪些问题？

在云原生浪潮下，全栈项目的部署架构正从“单机容器化”向“集群化、自动化”演进。Docker Compose虽能解决单机多容器编排问题，但在规模化、高可用、弹性伸缩等企业级需求面前尽显短板。Kubernetes（简称K8s）作为容器编排领域的事实标准，凭借强大的集群管理、资源调度、服务治理能力，成为云时代全栈工程师必备的核心技术。本文将从痛点解决、核心认知、实战落地三个维度，系统拆解K8s的核心知识与应用技巧。

### 一、Docker Compose的核心部署痛点


Docker Compose作为单机容器编排工具，适合开发、测试或小型单机部署场景，但当全栈项目进入生产环境，面临“规模化部署、高可用保障、弹性伸缩、跨节点协同”等需求时，会暴露出诸多致命问题。而K8s通过分布式架构设计，精准解决了这些企业级部署痛点。


1. 单机局限，无法规模化扩展：Docker Compose的所有容器均运行在单台宿主机上，当全栈项目的用户量增长、请求量激增时，无法通过横向扩展节点来分担压力。一旦宿主机宕机，整个服务集群将完全不可用，单点故障风险极高。

2. 缺乏弹性伸缩能力：全栈项目的流量往往存在波峰波谷（如电商促销、活动推广），Docker Compose无法根据CPU、内存使用率或业务指标（如QPS）自动调整容器实例数量。高峰期需手动扩容，低谷期无法自动缩容，导致资源浪费或服务过载。

3. 服务发现与负载均衡能力薄弱：在多容器协同的全栈项目中（如前端+后端+数据库+缓存），Docker Compose仅能通过“容器名”在单机内实现服务发现，跨节点部署时完全失效。同时，其内置的负载均衡仅支持简单的轮询，不具备健康检查、故障自动切换能力，服务访问可靠性低。

4. 无统一的监控与运维体系：Docker Compose不提供原生的集群监控、日志收集、故障告警能力。对于生产环境的全栈项目，需额外搭建ELK、Prometheus等工具，且无法与容器编排深度集成，运维复杂度高。

5. 配置管理与版本控制混乱：当全栈项目包含多个服务、多个环境（开发/测试/生产）时，Docker Compose的配置文件易冗余，环境变量、服务依赖的管理混乱。且缺乏对配置变更的版本控制，回滚难度大，易引发配置不一致问题。

6. 不支持滚动更新与回滚：Docker Compose更新服务时，需停止旧容器再启动新容器，存在服务中断时间（即“停机更新”）。同时，若更新失败，无法快速回滚到上一稳定版本，生产环境可用性无法保障。

### 二、K8s解决Docker Compose痛点的核心方案

|Docker Compose痛点|K8s解决方案|技术原理说明|
|---|---|---|
|单机局限，单点故障|分布式集群架构+高可用部署|K8s集群由多个节点（Master+Node）组成，服务容器可跨节点部署。通过控制平面高可用（多Master节点）和Pod副本机制，避免单点故障，保障服务持续可用。|
|缺乏弹性伸缩|Horizontal Pod Autoscaler（HPA）|HPA可根据CPU/内存使用率、自定义指标（如QPS）自动调整Pod副本数量，高峰期扩容应对流量，低谷期缩容节省资源，实现资源弹性调度。|
|服务发现与负载均衡薄弱|Service+CoreDNS+Ingress|CoreDNS提供集群内服务名解析，Service通过标签关联Pod，实现跨节点服务发现；Service内置负载均衡（轮询、会话亲和等），并配合健康检查自动剔除故障Pod；Ingress实现集群外流量入口的负载均衡与域名管理。|
|无统一监控运维体系|Metrics Server+Prometheus+Grafana+ELK|Metrics Server采集集群资源指标，Prometheus+Grafana实现监控可视化与告警；ELK（Elasticsearch+Logstash+Kibana）集成日志收集与分析，形成“监控-日志-告警”全链路运维体系。|
|配置管理混乱|ConfigMap+Secret+Helm|ConfigMap存储非敏感配置（如数据库地址），Secret加密存储敏感信息（如API密钥）；Helm通过“Chart”封装服务配置与依赖，实现配置版本控制、一键部署与回滚，简化多环境管理。|
|不支持滚动更新与回滚|Deployment滚动更新+版本历史|Deployment支持滚动更新策略（如每次更新1个副本，确保服务不中断）；记录每个版本的配置，更新失败时可通过`kubectl rollout undo`快速回滚到上一稳定版本。|

### 三、核心结论：从“单机编排”到“集群治理”的本质跨越

Docker Compose的核心定位是“单机多容器协同”，而K8s的核心定位是“分布式集群的容器全生命周期管理”。全栈项目从Docker Compose迁移到K8s，本质是从“小作坊式部署”升级为“企业级云原生架构”，不仅解决了规模化、高可用等痛点，更契合云时代“弹性伸缩、按需付费、自动化运维”的核心需求，是全栈项目走向生产环境的必然选择。


## 2.1 Kubernetes概述，快速了解容器编排核心技术

### 一、K8s的核心定义与起源

Kubernetes（简称K8s，“K”和“s”之间有8个字母）是Google基于Borg系统开源的容器编排平台，核心目标是“自动化容器的部署、扩展与管理”。它将容器按逻辑单元（Pod）组织，通过声明式配置定义服务期望状态，由控制平面自动协调实际状态与期望状态的差异，实现容器集群的自动化运维。

K8s的开源背景与社区支持：2014年开源，2015年加入CNCF（Cloud Native Computing Foundation，云原生计算基金会），成为云原生技术的核心项目。目前已形成庞大的社区生态，支持几乎所有主流容器技术（Docker、containerd等），并被阿里云、AWS、Azure等主流云厂商全面支持。

### 二、K8s的核心价值（全栈项目视角）


2. 弹性伸缩，适配流量波动：结合HPA与云服务商的弹性计算资源，全栈项目可根据实际流量自动扩缩容，既避免高峰期服务过载，又节省低谷期资源成本。

3. 服务高可用，保障业务连续性：通过跨节点部署、故障自动切换、滚动更新等机制，K8s确保全栈项目的服务可用性（SLA）达到99.9%以上，满足生产环境要求。

4. 环境一致性，简化交付流程：K8s通过声明式配置定义服务，确保开发、测试、生产环境的配置一致，解决“本地能跑，部署就崩”的问题，实现全栈项目的标准化交付。

5. 可扩展性强，支撑业务增长：K8s的插件化架构（如CRD、Operator）支持自定义资源与业务逻辑扩展，可轻松集成AI模型服务、大数据处理等组件，支撑全栈项目的业务迭代。

### 三、K8s的适用场景与不适用场景

#### 1. 适用场景

- 中大型全栈项目：包含多个微服务（前端、后端、数据库、缓存、消息队列等），需要跨节点部署与协同。

- 高可用要求的生产环境：如电商平台、金融系统、企业级应用，需要保障服务持续可用。

- 流量波动大的场景：如直播平台、促销活动、在线教育，需要弹性伸缩应对流量变化。

- 云原生架构转型：全栈项目希望迁移到公有云、私有云或混合云环境，实现“一次构建，多环境部署”。

#### 2. 不适用场景

- 小型单机项目：如个人博客、简单工具类应用，Docker Compose足以满足需求，K8s会增加架构复杂度。

- 对资源敏感的极简环境：K8s控制平面会占用一定的CPU、内存资源，极简环境（如边缘设备、嵌入式系统）可选择更轻量的编排工具（如K3s、MicroK8s）。

### 四、K8s与其他容器编排工具的对比

|工具|核心优势|核心劣势|适用场景|
|---|---|---|---|
|Kubernetes|功能全面、生态完善、高可用、弹性伸缩、可扩展性强|学习成本高、配置复杂、控制平面占用资源多|中大型全栈项目、生产环境、云原生架构|
|Docker Compose|简单易用、配置简洁、学习成本低|单机局限、无弹性伸缩、高可用能力弱|小型项目、开发/测试环境|
|Swarm（Docker原生）|与Docker兼容性好、配置简单、学习成本低|功能单一、生态薄弱、社区活跃度低|小型集群、Docker生态深度用户|
|Mesos|资源调度能力强、支持多种任务类型（容器、大数据）|配置复杂、学习成本高、容器编排功能需额外集成Marathon|大型混合任务集群（容器+大数据）|


## 2.2 Kubernetes核心解析，快速建立容器编排系统思维

K8s的核心设计思想是“声明式API+控制平面协调”，通过一系列核心组件与资源对象，搭起一套完整的容器集群管理机制。要掌握K8s，得先理解“组件架构”与“核心资源”这两块，脑子里先有一张全景图。

### 一、K8s核心组件架构（Master+Node节点）

K8s集群采用“控制平面（Control Plane）+ 工作节点（Node）”的分布式架构，各组件协同工作实现容器的全生命周期管理。

#### 1. 控制平面组件（Master节点，集群的“大脑”）

控制平面负责决策集群的运行状态，如调度容器、维护服务期望状态、处理故障等，生产环境需部署多个Master节点实现高可用。

- kube-apiserver：核心入口组件，提供RESTful API接口，所有集群操作（如创建Pod、部署Service）均通过API Server执行。API Server是各组件之间的通信枢纽，实现权限控制（RBAC）、数据验证与存储。

- etcd：分布式键值数据库，存储集群的所有状态信息（如Pod配置、Service信息、节点状态）。etcd是K8s的“数据中心”，确保集群状态的一致性与高可用。

- kube-scheduler：调度组件，负责将Pod调度到合适的Node节点。调度算法考虑节点资源使用率、Pod资源需求、亲和性/反亲和性、污点/容忍度等因素，确保资源高效利用。

- kube-controller-manager：控制器管理器，运行多个控制器进程（如Node控制器、Pod控制器、Deployment控制器）。控制器通过“调谐循环”（Reconciliation Loop）监控集群状态，当实际状态与期望状态不一致时，自动执行修复操作（如Pod故障时重启、节点故障时迁移Pod）。

- cloud-controller-manager：云控制器管理器，仅在使用公有云（如阿里云、AWS）时需要。集成云服务商的API，实现云资源的自动化管理（如自动创建负载均衡器、持久化存储卷）。

#### 2. 工作节点组件（Node节点，集群的“手脚”）

工作节点负责运行实际的容器应用，接收控制平面的调度指令，执行容器的启动、停止、监控等操作。

- kubelet：节点代理，运行在每个Node节点上，负责与API Server通信，执行控制平面下发的指令（如创建Pod、启动容器）。kubelet还会监控容器的健康状态，定期向控制平面汇报节点与Pod状态。

- kube-proxy：网络代理，运行在每个Node节点上，负责维护节点的网络规则。实现Service的负载均衡功能，将集群内的服务请求转发到对应的Pod，同时处理跨节点的网络通信。

- 容器运行时（Container Runtime）：负责运行容器的软件，如Docker、containerd、CRI-O等。K8s通过CRI（容器运行时接口）与容器运行时交互，屏蔽不同运行时的差异。

- Pod：K8s的最小部署单元，包含一个或多个容器，共享网络命名空间与存储卷。Pod是容器的“逻辑包装”，K8s通过管理Pod来间接管理容器。

### 二、K8s核心资源对象（声明式配置的核心）

K8s通过“资源对象”描述集群的期望状态，所有资源对象均通过API Server存储到etcd中。核心资源对象包括：

#### 1. 基础资源：Pod、Service、ConfigMap、Secret

- Pod：最小部署单元，是容器的集合。每个Pod有唯一的IP地址，容器共享Pod的网络与存储。Pod的生命周期短暂，故障后会被重新调度，因此不适合存储数据（数据需通过Volume挂载）。

- Service：服务抽象，通过标签（Label）关联一组Pod，提供稳定的访问地址（ClusterIP/NodePort/LoadBalancer）。Service实现Pod的负载均衡与服务发现，即使Pod的IP地址变化，Service地址也保持不变。

- ConfigMap：配置存储对象，用于存储非敏感的配置信息（如数据库连接地址、应用端口）。ConfigMap可通过环境变量或文件挂载的方式注入Pod，实现“配置与代码分离”，便于多环境配置管理。

- Secret：敏感配置存储对象，用于存储API密钥、数据库密码等敏感信息。Secret会被加密存储，同样可通过环境变量或文件挂载注入Pod，避免敏感信息硬编码到代码中。

#### 2. 控制器资源：Deployment、StatefulSet、DaemonSet

控制器资源用于管理Pod的生命周期，实现Pod的自动部署、扩展、更新与故障恢复。

- Deployment：最常用的控制器，用于管理无状态服务（如前端应用、API服务）。支持滚动更新、版本回滚、副本扩缩容，可通过声明式配置定义Pod的期望状态（如副本数、镜像版本）。

- StatefulSet：用于管理有状态服务（如数据库、分布式缓存）。为Pod提供稳定的网络标识（域名）与持久化存储，确保Pod的有序部署、更新与删除（如数据库主从节点的顺序启动）。

- DaemonSet：用于在集群的所有Node节点或指定Node节点上运行一个Pod副本（如日志收集组件、监控代理）。确保每个节点都有相同的服务实例，适合节点级别的运维工具部署。

#### 3. 存储资源：Volume、PersistentVolume（PV）、PersistentVolumeClaim（PVC）

- Volume：Pod的存储卷，用于容器间共享数据或持久化数据。Volume的生命周期与Pod绑定，Pod删除后Volume数据可能丢失（取决于Volume类型）。

- PersistentVolume（PV）：集群级别的持久化存储资源，由管理员创建，独立于Pod生命周期。PV可使用本地存储、云存储（如阿里云OSS、AWS EBS）等多种存储类型。

- PersistentVolumeClaim（PVC）：用户对存储资源的请求，类似“存储订单”。用户通过PVC申请PV资源，无需关心PV的具体实现，实现存储资源的动态分配与管理。

### 三、K8s核心工作流程（以Deployment部署服务为例）

理解K8s的工作流程，能快速建立系统思维，以下是通过Deployment部署全栈项目后端服务的核心流程：

1. 开发者通过`kubectl apply -f deployment.yaml`提交Deployment配置，请求发送到API Server。

2. API Server验证配置的合法性，将Deployment信息存储到etcd中。

3. Deployment控制器通过API Server监控到新的Deployment资源，根据配置中的副本数（replicas）生成对应的ReplicaSet资源。

4. ReplicaSet控制器监控到新的ReplicaSet资源，发现实际Pod数量为0，与期望副本数不一致，向API Server请求创建Pod。

5. kube-scheduler监控到未调度的Pod，通过调度算法选择合适的Node节点，将Pod调度到该节点。

6. 目标Node节点上的kubelet接收到API Server的指令，通过容器运行时启动Pod中的容器。

7. kubelet定期向API Server汇报Pod状态，当Pod启动完成后，API Server更新etcd中的Pod状态。

8. 开发者通过`kubectl get pods`查看Pod状态，通过`kubectl expose deployment 服务名 --port=8080 --type=NodePort`创建Service，实现Pod的服务发现与负载均衡。

整个流程中，K8s各组件通过API Server协同工作，控制器持续监控集群状态，确保实际状态与期望状态一致，实现服务的自动化部署与管理。


## 3.1 如何实现不同场景下的部署策略？

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


## 3.2 实战生产级集群搭建，快速 掌握集群环境标准化交付流程

生产级K8s集群搭建的核心要求是“高可用、标准化、可复用”，需兼顾控制平面高可用、网络插件选型、存储配置、安全加固等关键环节。以下以“阿里云ECS+containerd+Calico+高可用控制平面”为例，讲解生产级集群的标准化搭建流程。

### 一、前置准备（环境标准化）

#### 1. 服务器规划（生产级最小配置）

|节点类型|数量|配置要求|作用|
|---|---|---|---|
|Master节点|3台|4核8GB内存，50GB SSD硬盘|控制平面高可用，运行API Server、etcd等组件|
|Node节点|2台及以上|8核16GB内存，100GB SSD硬盘（根据业务调整）|运行业务容器，承载全栈项目服务|
|负载均衡器|1台（阿里云SLB）|按需配置|分发Master节点的API Server流量，实现控制平面高可用|
#### 2. 操作系统配置（所有节点）

统一使用CentOS 7.9操作系统，执行以下初始化脚本，确保环境一致性：

```bash

#!/bin/bash
# 生产级K8s节点初始化脚本

# 1. 关闭防火墙
systemctl stop firewalld
systemctl disable firewalld

# 2. 关闭SELinux
setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=disabled/' /etc/selinux/config

# 3. 关闭Swap（K8s要求）
swapoff -a
sed -i '/swap/s/^/#/' /etc/fstab

# 4. 配置内核参数，开启IP转发
cat >> /etc/sysctl.d/k8s.conf << EOF
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF
sysctl --system

# 5. 配置时间同步（确保集群节点时间一致）
yum install -y chrony
systemctl start chronyd
systemctl enable chronyd
chronyc sources

# 6. 安装容器运行时依赖
yum install -y yum-utils device-mapper-persistent-data lvm2

```

#### 3. 安装容器运行时（containerd）

生产环境推荐使用containerd（Docker的底层运行时，更轻量、稳定），安装流程如下：

```bash

#!/bin/bash
# 安装containerd

# 1. 配置Docker镜像源（containerd属于Docker生态）
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 2. 安装containerd
yum install -y containerd.io

# 3. 初始化containerd配置
containerd config default > /etc/containerd/config.toml

# 4. 修改配置（适配K8s）
sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/' /etc/containerd/config.toml  # 开启SystemdCgroup
sed -i 's#k8s.gcr.io/pause:3.6#registry.aliyuncs.com/google_containers/pause:3.9#' /etc/containerd/config.toml  # 替换pause镜像为阿里云源

# 5. 启动containerd并设置开机自启
systemctl start containerd
systemctl enable containerd

```

### 二、部署高可用K8s集群（使用kubeadm）

kubeadm是K8s官方提供的集群部署工具，可快速实现生产级集群搭建，核心流程包括“初始化控制平面、加入Node节点、部署网络插件、配置高可用”。

#### 1. 安装kubeadm、kubelet、kubectl（所有节点）

```bash

#!/bin/bash
# 安装K8s组件

# 1. 配置K8s阿里云镜像源
cat >> /etc/yum.repos.d/kubernetes.repo << EOF
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF

# 2. 安装指定版本的kubeadm、kubelet、kubectl（推荐1.27.x稳定版）
yum install -y kubeadm-1.27.3 kubelet-1.27.3 kubectl-1.27.3

# 3. 设置kubelet开机自启
systemctl enable kubelet

```

#### 2. 初始化第一个Master节点

通过kubeadm初始化控制平面，指定负载均衡器地址（实现多Master高可用）、Pod网络网段等参数：

```bash

#!/bin/bash
# 初始化Master节点

# 1. 定义变量
LOAD_BALANCER_IP="192.168.0.100"  # 负载均衡器IP（阿里云SLB地址）
K8S_VERSION="1.27.3"
POD_CIDR="10.244.0.0/16"  # Pod网络网段（需与Calico网络插件一致）
SERVICE_CIDR="10.96.0.0/12"  # Service网络网段

# 2. 初始化控制平面
kubeadm init \
  --control-plane-endpoint "${LOAD_BALANCER_IP}:6443" \
  --image-repository registry.aliyuncs.com/google_containers \
  --kubernetes-version v${K8S_VERSION} \
  --pod-network-cidr ${POD_CIDR} \
  --service-cidr ${SERVICE_CIDR} \
  --upload-certs  # 上传证书（用于其他Master节点加入）

# 3. 配置kubectl（root用户）
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

# 4. 记录加入Master节点的命令（后续其他Master节点使用）
# 示例输出：kubeadm join 192.168.0.100:6443 --token xxx --discovery-token-ca-cert-hash sha256:xxx --control-plane --certificate-key xxx

```

#### 3. 部署网络插件（Calico）

K8s集群必须部署网络插件，实现Pod之间的跨节点通信。生产环境推荐使用Calico（性能好、支持网络策略）：

```bash

#!/bin/bash
# 部署Calico网络插件

# 1. 下载Calico配置文件（适配Pod网段10.244.0.0/16）
kubectl apply -f https://docs.projectcalico.org/v3.26/manifests/calico.yaml

# 2. 验证网络插件状态（确保所有Calico Pod正常运行）
kubectl get pods -n kube-system -l k8s-app=calico-node

```

#### 4. 加入其他Master节点（实现控制平面高可用）

在其他两个Master节点上，执行第一步初始化时记录的加入命令：

```bash

#!/bin/bash
# 其他Master节点加入集群
kubeadm join 192.168.0.100:6443 \
  --token xxx \
  --discovery-token-ca-cert-hash sha256:xxx \
  --control-plane \
  --certificate-key xxx

# 配置kubectl
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

```

#### 5. 加入Node节点

在所有Node节点上，执行以下命令加入集群（token可通过`kubeadm token create --print-join-command`在Master节点生成）：

```bash

#!/bin/bash
# Node节点加入集群
kubeadm join 192.168.0.100:6443 \
  --token xxx \
  --discovery-token-ca-cert-hash sha256:xxx

```

#### 6. 验证集群状态

```bash

#!/bin/bash
# 验证集群节点状态（所有节点Ready）
kubectl get nodes

# 验证控制平面组件状态（所有组件Running）
kubectl get pods -n kube-system

# 验证集群信息
kubectl cluster-info

```

### 三、生产级集群必备配置（标准化交付关键）

#### 1. 配置容器镜像仓库镜像加速

为containerd配置阿里云镜像加速，解决镜像拉取慢的问题：

```bash

#!/bin/bash
# 配置containerd镜像加速
cat >> /etc/containerd/config.toml << EOF
[plugins."io.containerd.grpc.v1.cri".registry.mirrors]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
    endpoint = ["https://xxx.mirror.aliyuncs.com"]  # 阿里云镜像加速地址
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."registry.aliyuncs.com"]
    endpoint = ["https://registry.aliyuncs.com"]
EOF

# 重启containerd
systemctl restart containerd

```

#### 2. 部署Metrics Server（资源监控）

Metrics Server用于采集集群资源指标，支持HPA弹性伸缩：

```bash

#!/bin/bash
# 部署Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 验证Metrics Server状态
kubectl get pods -n kube-system -l k8s-app=metrics-server

# 验证指标采集（查看节点资源使用情况）
kubectl top nodes

```

#### 3. 配置默认存储类（动态存储）

生产环境推荐使用云存储（如阿里云OSS）作为默认存储类，实现PVC的动态分配：

```yaml

# aliyun-oss-storageclass.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: aliyun-oss
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"  # 设置为默认存储类
provisioner: ossplugin.csi.alibabacloud.com  # 阿里云OSS CSI插件
parameters:
  bucket: "my-k8s-storage"  # OSS桶名称
  endpoint: "oss-cn-hangzhou.aliyuncs.com"  # OSS endpoints
reclaimPolicy: Retain  # 存储卷回收策略（Retain=保留，Delete=删除
```
> （注：文档部分内容可能由 AI 生成）


## 4.1 Pod管理实战，拆解资源调度核心技术

## 4-1 Pod管理实战，拆解资源调度核心技术

Pod作为Kubernetes的最小部署单元，是资源调度的核心载体。全栈项目的所有业务容器最终都以Pod形式运行，掌握Pod的创建、配置、调度、监控及故障处理，是K8s集群高效运维的基础。下面从实战出发，拆解Pod管理的核心技术与操作技巧。

### 一、Pod基础创建与配置实战

#### 1. Pod的两种创建方式

- 命令行快速创建：适用于临时测试场景，通过kubectl run直接创建Pod，示例如下：

```Plain Text

#!/bin/bash
# 创建Nginx测试Pod
kubectl run nginx-test --image=nginx:1.24 --port=80
# 查看Pod状态
kubectl get pods
# 查看Pod详细信息
kubectl describe pod nginx-test
# 删除Pod
kubectl delete pod nginx-test
```

- YAML配置文件创建：适用于生产环境，配置可版本控制、复用性强，完整YAML示例如下：

```Plain Text

apiVersion: v1
kind: Pod
metadata:
  name: fullstack-api-pod  # Pod名称
  labels:
    app: fullstack-api     # 标签，用于关联Service
spec:
  containers:
  - name: api-container    # 容器名称
    image: fullstack-api:v1.0  # 业务镜像
    ports:
    - containerPort: 8080  # 容器暴露端口
    resources:             # 资源需求与限制
      requests:            # 申请资源（调度依据）
        cpu: "200m"        # 200毫核CPU
        memory: "256Mi"    # 256MB内存
      limits:              # 资源上限（防止资源滥用）
        cpu: "500m"
        memory: "512Mi"
    env:                   # 环境变量配置
    - name: SPRING_PROFILES_ACTIVE
      value: "prod"
    - name: DB_HOST
      valueFrom:
        configMapKeyRef:   # 从ConfigMap获取配置
          name: fullstack-config
          key: db_host
    volumeMounts:          # 存储卷挂载
    - name: log-volume
      mountPath: /app/logs # 容器内挂载路径
  volumes:                 # 定义存储卷
  - name: log-volume
    emptyDir: {}           # 临时存储卷（Pod生命周期内有效）
```

通过YAML创建与管理命令：

```Plain Text

#!/bin/bash
# 应用YAML创建Pod
kubectl apply -f pod-fullstack-api.yaml
# 查看Pod运行日志
kubectl logs -f fullstack-api-pod
# 进入Pod容器内部
kubectl exec -it fullstack-api-pod -- /bin/bash
```

### 二、Pod资源调度核心配置与优化

K8s通过调度算法将Pod分配到合适的Node节点，默认调度策略已能满足基础需求，但全栈项目中常需根据业务特性（如资源密集型、GPU依赖）自定义调度规则，避免资源浪费或调度不合理。

#### 1. 资源需求与限制配置（避免资源竞争）

通过resources字段配置Pod的CPU、内存需求（requests）和上限（limits），是调度的核心依据：

- requests：Pod运行所需的最小资源，调度器会选择资源充足的Node节点；

- limits：Pod可使用的最大资源，超出上限会被K8s限制（CPU节流、内存OOM终止）。

实战注意事项：

- 避免requests设置过低：导致Pod调度到资源不足的节点，运行时资源竞争；

- 避免limits设置过高：浪费资源，可根据全栈项目业务压力测试结果合理配置；

- GPU资源配置：AI全栈项目若包含模型推理服务，需配置GPU资源，示例如下：

```Plain Text

spec:
  containers:
  - name: ai-inference-container
    image: ai-inference:v1.0
    resources:
      requests:
        nvidia.com/gpu: 1  # 申请1块GPU
      limits:
        nvidia.com/gpu: 1  # 限制使用1块GPU
```

#### 2. 自定义调度策略（节点选择与亲和性）

全栈项目中，部分服务可能需要部署在特定节点（如高性能节点、本地存储节点），可通过节点标签与亲和性配置实现精准调度。

- 节点标签与选择器：先为Node节点打标签，再通过nodeSelector指定Pod调度到对应节点：

```Plain Text

#!/bin/bash
# 为Node节点打标签（标记为高性能节点）
kubectl label nodes node-1 node-type=high-performance
# 查看节点标签
kubectl get nodes --show-labels
```

```Plain Text

spec:
  nodeSelector:  # 调度到带有node-type=high-performance标签的节点
    node-type: high-performance
  containers:
  - name: high-performance-service
    image: high-performance-service:v1.0
```

- 节点亲和性：比nodeSelector更灵活，支持软策略（优先调度）和硬策略（必须满足），示例如下：

```Plain Text

spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:  # 硬策略（必须满足）
        nodeSelectorTerms:
        - matchExpressions:
          - key: node-type
            operator: In
            values:
            - high-performance
      preferredDuringSchedulingIgnoredDuringExecution:  # 软策略（优先满足）
      - weight: 100
        preference:
          matchExpressions:
          - key: zone
            operator: In
            values:
            - zone-1
```

#### 3. Pod亲和性与反亲和性（服务协同调度）

全栈项目中，部分服务需就近部署（如前端Pod与后端API Pod），部分服务需分散部署（如数据库主从Pod），可通过Pod亲和性与反亲和性实现：

```Plain Text

spec:
  affinity:
    # Pod亲和性：优先调度到有fullstack-api Pod的节点（前端与后端就近部署）
    podAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - fullstack-api
          topologyKey: "kubernetes.io/hostname"
    # Pod反亲和性：避免调度到有fullstack-db Pod的节点（数据库从节点分散部署）
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: app
            operator: In
            values:
            - fullstack-db
        topologyKey: "kubernetes.io/hostname"
  containers:
  - name: fullstack-frontend
    image: fullstack-frontend:v1.0
```

### 三、Pod监控与故障处理实战

#### 1. Pod健康检查配置（保障服务可用性）

K8s通过存活探针（livenessProbe）、就绪探针（readinessProbe）和启动探针（startupProbe）监控Pod状态，及时发现并处理故障：

```Plain Text

spec:
  containers:
  - name: fullstack-api
    image: fullstack-api:v1.0
    ports:
    - containerPort: 8080
    # 存活探针：检测容器是否运行正常，失败则重启容器
    livenessProbe:
      httpGet:
        path: /actuator/health/liveness
        port: 8080
      initialDelaySeconds: 60  # 容器启动60秒后开始检查
      periodSeconds: 10        # 检查间隔10秒
      timeoutSeconds: 5        # 超时时间5秒
      failureThreshold: 3      # 失败3次判定为异常
    # 就绪探针：检测容器是否可提供服务，失败则移除Service负载均衡列表
    readinessProbe:
      httpGet:
        path: /actuator/health/readiness
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 5
    # 启动探针：适用于启动慢的服务（如AI模型加载），启动完成前不进行存活检查
    startupProbe:
      httpGet:
        path: /actuator/health/startup
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
      failureThreshold: 20     # 允许20次失败（100秒内启动完成）
```

#### 2. 常见Pod故障排查方法

全栈项目部署中，Pod常出现Pending、Running异常、CrashLoopBackOff等状态，核心排查步骤如下：

- 状态为Pending：调度失败，通过describe查看原因：

```Plain Text

kubectl describe pod fullstack-api-pod
# 常见原因：资源不足、节点亲和性不满足、镜像拉取失败
# 解决方案：增加节点资源、调整亲和性配置、检查镜像地址与拉取权限
```

- 状态为CrashLoopBackOff：容器启动后立即退出，通过logs查看日志：

```Plain Text

kubectl logs -f fullstack-api-pod --previous
# 常见原因：配置错误、依赖服务未就绪、代码异常
# 解决方案：检查环境变量/配置文件、确认依赖服务状态、排查业务代码
```

- 状态为Running但服务不可访问：检查就绪探针、网络配置：

```Plain Text

# 检查就绪探针状态
kubectl get pod fullstack-api-pod -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'
# 检查Pod网络
kubectl exec -it fullstack-api-pod -- ping 网关IP
# 检查容器端口是否监听
kubectl exec -it fullstack-api-pod -- netstat -tuln
```


## 4.2 -2 Deployment 管理实战，搭一套可扩展的服务更新流程

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


## 4.3 -3 Service管理实战，解决服务访问不可靠难题

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


## 5.1 课程总结

* Docker Compose容器化部署存在哪些问题？
* Kubernetes基础入门
  * Kubernetes概述
  * Kubernetes核心解析
* Kubernetes集群搭建
  * 如何实现不同场景下的部署策略？
  * 仿“小红书”项目Kubernetes部署
