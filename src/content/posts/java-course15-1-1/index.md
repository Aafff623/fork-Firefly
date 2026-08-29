---
title: "全栈工程师必学的分布式监控体系Prometheus"
published: 2026-08-25
description: "分布式架构的监控痛点（节点多、链路复杂、数据量大）"
image: ''
tags: [Prometheus, 监控, Grafana]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course15-1-1
pinned: false
comment: true
---

### 一、入门基础：理解分布式监控与 Prometheus 定位

#### 1. 分布式监控核心认知


*   分布式架构的监控痛点（节点多、链路复杂、数据量大）

*   监控体系的核心目标：可观测性（Metrics/Logs/Tracing 三大支柱）

*   主流监控工具对比：Prometheus vs Zabbix vs Grafana Loki vs ELK Stack

*   Prometheus 的核心优势：时序数据存储、灵活查询、原生告警、分布式部署

#### 2. Prometheus基础架构与核心组件


*   核心流程：数据采集→存储→查询→告警→可视化

*   核心组件解析：


    *   Prometheus Server（数据存储与查询引擎）

    *   Exporter（数据采集器，如 Node Exporter、MySQL Exporter）

    *   PushGateway（接收短生命周期任务的推送数据）

    *   Alertmanager（告警聚合、路由与分发）

    *   Grafana（可视化仪表盘，与 Prometheus 无缝集成）

*   时序数据模型：Metric 名称、标签（Labels）、样本值（Value）、时间戳（Timestamp）

#### 3. 环境搭建：快速部署 Prometheus 生态


*   单机部署（适合学习 / 测试）：


    *   二进制包安装 Prometheus Server

    *   Docker 容器化部署（Docker Compose 一键启动 Prometheus+Grafana）

*   分布式部署（贴近生产）：


    *   多 Prometheus Server 联邦集群（Federation）

    *   远程存储配置（对接 Thanos/Cortex，解决长期存储问题）

*   基础配置验证：访问 Prometheus UI（:9090）、Grafana UI（:3000）

### 二、Prometheus核心原理深度剖析与实战：数据采集、存储、PromQL、告警体系

#### 1. 数据采集：Exporter 与数据暴露


*   Exporter 工作原理：HTTP 接口暴露 Metrics（/metrics 端点）

*   常用 Exporter 实战：


    *   系统监控：Node Exporter（CPU / 内存 / 磁盘 / 网络）

    *   中间件监控：MySQL Exporter、Redis Exporter、Nginx Exporter

    *   应用监控：


        *   自定义 Exporter（Go 语言开发基础，暴露业务 Metrics）

        *   埋点规范：Counter（计数）、Gauge（瞬时值）、Histogram（直方图）、Summary（摘要）类型使用场景

    *   短任务采集：PushGateway 使用（如定时脚本、CI/CD 任务）

*   采集配置：Prometheus.yml 中 Scrape Config（目标地址、采集间隔、标签重写）

#### 2. 时序数据存储原理


*   本地存储机制：TSDB（Time Series Database）的块存储结构（ WAL→Head Block→Compaction→Retention）

*   存储配置优化：


    *   数据保留时间（retention.time）与存储大小限制（retention.size）

    *   块压缩与索引优化（减少磁盘占用）

*   远程存储集成：


    *   长期存储方案：Thanos（高可用、跨集群查询）、Cortex（多租户支持）

    *   存储对接流程（remote\_write/remote\_read 配置）


#### 3. PromQL：Prometheus 查询语言实战


*   基础语法：


    *   指标选择器（Metric 名称 + 标签过滤，如`node_cpu_seconds_total{mode="idle"}`）

    *   时间范围查询（`[5m]`表示过去 5 分钟，`@timestamp`指定时间点）

*   常用操作符：


    *   算术运算（CPU 使用率计算：`100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance) * 100)`）

    *   比较运算（磁盘使用率告警阈值：`node_filesystem_usage_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} > 0.8`）

    *   逻辑运算（多条件过滤：`up{job="node"} == 1 and node_load1{job="node"} > 5`）

*   聚合函数：


    *   基础聚合（sum/avg/max/min，如`sum(node_memory_used_bytes) by (job)`）

    *   高级聚合（topk/quantile，如`topk(3, sum(node_cpu_seconds_total{mode!="idle"}) by (instance))`）

*   常见查询场景实战：


    *   系统指标：CPU 使用率、内存使用率、磁盘 IO、网络流量

    *   应用指标：接口 QPS、响应时间（P95/P99）、错误率

    *   中间件指标：MySQL 连接数、Redis 内存占用、Nginx 请求量


#### 4. Alertmanager：告警配置与分发


*   告警流程：Prometheus Server 触发告警→Alertmanager 处理→通知接收

*   告警规则配置（Prometheus.yml）：


    *   基础规则：告警名称、表达式、触发时长（for）、标签与注释


*   Alertmanager 核心功能：


    *   告警分组（Grouping，按实例 / 业务线聚合，避免告警风暴）

    *   告警抑制（Inhibition，高优先级告警触发时抑制低优先级告警）

    *   告警路由（Routing，按标签路由到不同接收者，如邮件 / 钉钉 / 企业微信）

*   通知渠道配置：


    *   邮件通知（SMTP 服务器配置）

    *   即时通讯通知（钉钉机器人、企业微信机器人、Slack Webhook）

    *   告警级别映射（critical→电话 + 短信，warning→钉钉）
