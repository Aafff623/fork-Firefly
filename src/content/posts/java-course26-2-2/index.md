---
title: "Kubernetes核心解析，快速建立容器编排系统思维"
published: 2026-08-25
description: "K8s的核心设计思想是“声明式API+控制平面协调”，通过一系列核心组件与资源对象，搭起一套完整的容器集群管理机制。要掌握K8s，得先理解“组件架构”与“核心资源”这两块，脑子里先有一张全景图。"
image: ''
tags: [Kubernetes, K8s, 编排]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course26-2-2
pinned: false
comment: true
---

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
