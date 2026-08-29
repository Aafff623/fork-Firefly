---
title: "课程总结"
published: 2026-08-25
description: "Prometheus作为一款强大的开源监控与告警工具，在系统监控领域发挥着关键作用。其核心功能涵盖数据抓取、存储、查询以及告警等多个方面。"
image: ''
tags: [Prometheus, 监控, Grafana]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course15-4-1
pinned: false
comment: true
---

Prometheus作为一款强大的开源监控与告警工具，在系统监控领域发挥着关键作用。其核心功能涵盖数据抓取、存储、查询以及告警等多个方面。

在数据抓取环节，Prometheus Server主要通过HTTP从监控目标拉取数据，这些目标包括Exporter、PushGateway以及通过服务发现机制识别的各类服务实例。Exporter负责将第三方服务的监控数据转化为Prometheus可识别的格式，PushGateway则为短生命周期服务提供了数据推送的途径。

Prometheus采用时序数据库（TSDB）进行数据存储，其本地存储机制依赖块存储结构。新采集的数据先写入WAL以保障数据持久化，随后进入Head Block进行实时查询，后台会定期对数据进行Compaction操作，将小粒度块合并为大粒度块，去除重复数据并执行降采样，以此提升存储效率。同时，通过Retention策略，依据设定的数据保留时间或存储大小限制，自动清理过期数据块，维持存储资源的合理利用。在存储配置优化方面，可灵活调整数据保留时间（retention.time）和存储大小限制（retention.size），还能通过启用WAL压缩、优化块压缩与索引等手段，进一步减少磁盘占用并提升查询性能。当本地存储无法满足需求时，Prometheus可借助远程存储集成扩展能力，与Thanos、Cortex等方案对接。以Thanos为例，通过Thanos Sidecar将本地块同步至对象存储，Thanos Query实现跨集群统一查询，从而突破本地存储的局限。 

PromQL作为Prometheus的查询语言，功能丰富且灵活。基础语法通过指标选择器精准定位时序数据，结合时间范围查询筛选特定时段的数据。常用操作符支持算术运算（如计算CPU使用率）、比较运算（如设置磁盘使用率告警阈值）以及逻辑运算（如多条件过滤节点状态），满足多样化的数据分析需求。聚合函数包括基础聚合（sum、avg、max、min等）和高级聚合（topk、quantile等），用于对多时序数据进行汇总分析，例如按实例或业务线统计资源使用总量、获取前N个高负载节点等。在常见查询场景中，PromQL能够轻松应对系统指标（如CPU、内存、磁盘IO、网络流量）、应用指标（如接口QPS、响应时间、错误率）以及中间件指标（如MySQL连接数、Redis内存占用、Nginx请求量）的查询与分析，为运维和开发人员提供有力的数据洞察支持。 

告警方面，Prometheus与Alertmanager协同工作。告警流程始于Prometheus Server依据配置的告警规则触发告警，这些规则在Prometheus.yml中定义，包含告警名称、PromQL表达式、触发时长（for）、标签与注释等关键要素。当告警条件满足且持续达到设定时长，告警事件便会发送至Alertmanager。Alertmanager具备强大的告警处理功能，告警分组可按实例或业务线聚合相似告警，有效避免告警风暴；告警抑制能在高优先级告警触发时抑制低优先级告警，减少冗余通知；告警路由则依据标签将告警精准路由至不同接收者。在通知渠道配置上，支持邮件（需配置SMTP服务器）、即时通讯工具（如钉钉机器人、企业微信机器人、Slack Webhook）等多种方式，并且能够根据告警级别（如critical、warning）灵活映射到不同的通知策略，确保相关人员及时且精准地接收告警信息，以便快速响应和处理系统异常 。
