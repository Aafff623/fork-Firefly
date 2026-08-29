---
title: "课程总结"
published: 2026-08-25
description: "1. 核心适配点：所有微服务均为轻量配置，适配Docker Desktop K8s单节点特性；"
image: ''
tags: [Kubernetes, K8s, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course27-4-1
pinned: false
comment: true
---

1. 核心适配点：所有微服务均为轻量配置，适配Docker Desktop K8s单节点特性；
2. 服务通信：通过`服务名.命名空间.svc.cluster.local`实现内部访问，网关统一转发，适配K8s服务发现。
3. Docker Desktop K8s适配核心：
   - 使用`NodePort`暴露服务，无需Ingress；
   - 镜像拉取策略设为`Never`，优先本地镜像；
   - 资源限制适配本地机器性能，副本数设为1；
4. 前端关键：修改Nginx配置，实现API请求自动转发到网关


未来优化点：如果需要部署Redis/MySQL等依赖服务，可基于相同思路编写YAML，核心是使用`hostPath`挂载宿主机目录实现数据持久化（Docker Desktop中宿主机目录可映射到`/mnt/c/`（Windows）或`/Users/`（Mac））。
