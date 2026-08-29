---
title: "Kubernetes常用命令演示"
published: 2026-08-25
description: "kubectl get pods"
image: ''
tags: [Kubernetes, K8s, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course27-2-2
pinned: false
comment: true
---

```
# 检查 Pod 的状态
kubectl get pods
kubectl get deployments 
kubectl get services
```

```bash
# 查看命名空间下的Pod
kubectl get pods -n rednote
# 查看Service（确认NodePort端口）
kubectl get svc -n rednote
# 查看日志（排查异常）
kubectl logs -f <pod-name> -n rednote
```
