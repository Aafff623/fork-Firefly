---
title: "实战生产级集群搭建，快速 掌握集群环境标准化交付流程"
published: 2026-08-25
description: "生产级K8s集群搭建的核心要求是“高可用、标准化、可复用”，需兼顾控制平面高可用、网络插件选型、存储配置、安全加固等关键环节。以下以“阿里云ECS+containerd+Calico+高可用控制平面”…"
image: ''
tags: [Kubernetes, K8s, 编排]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course26-3-2
pinned: false
comment: true
---

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
