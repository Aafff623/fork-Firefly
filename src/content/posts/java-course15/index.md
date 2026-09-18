---
title: "分布式监控体系（Prometheus）（Java 课程 15 · 全 9 节合订）"
published: 2026-09-18
description: "Prometheus + Grafana：分布式监控体系实战。"
image: ''
tags: [Prometheus, 监控]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course15
pinned: false
comment: true
---
> 本页为原「Java 课程 15」全部 9 个分节的合订本；原分节链接会自动跳转到本页。


## 1.1 全栈工程师必学的分布式监控体系Prometheus

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


## 2.1 分布式监控核心认知：从痛点到工具与核心优势

在分布式架构成为企业级系统主流形态的背景下，传统单体架构的监控思路已完全失效。分布式系统通过多节点、多服务的协同实现高可用与高扩展性，但也带来了监控维度的指数级增长。理解分布式监控的核心认知，是保障系统稳定运行、快速定位故障的关键前提。


### 一、分布式架构的监控痛点：三大核心挑战
分布式架构的本质是“资源与任务的拆分”，这种拆分直接转化为监控层面的三大核心痛点，也是区别于传统单体监控的根本差异。

#### 1. 节点数量庞大，监控覆盖面难以保障
分布式系统通常由成百上千个节点（物理机、虚拟机、容器）组成，且节点可能分布在不同地域、不同集群中。
- 动态性难题：基于K8s等容器编排平台的系统，节点会随业务负载动态扩缩容（如自动扩容/缩容），静态配置的监控规则无法实时覆盖新上线节点，易出现“监控盲区”。
- 资源消耗矛盾：若为每个节点部署完整监控代理（Agent），会占用大量节点CPU、内存与网络资源；若简化监控粒度，则会丢失关键指标，导致故障排查时“无数据可用”。

#### 2. 链路关系复杂，故障定位链路断裂
分布式系统的业务逻辑依赖多服务间的跨节点调用（如用户请求需经过“网关→API服务→缓存→数据库→消息队列”等链路），这种链路的复杂性直接导致监控难点：
- 调用链追踪难：单个请求的调用路径可能跨越10+服务、20+节点，传统监控只能孤立展示单个节点/服务的状态，无法串联成完整调用链，故障发生时难以判断“哪个环节出了问题”。
- 依赖关系动态变化：微服务架构下，服务间的依赖关系可能通过注册中心动态调整（如服务发现、负载均衡），监控系统难以实时同步依赖拓扑，导致“故障影响范围无法快速评估”。

#### 3. 监控数据量爆炸，存储与分析压力陡增
分布式系统产生的监控数据维度极广（包括系统指标、业务指标、日志、调用轨迹等），数据量呈“TB级/天”甚至“PB级/天”增长，带来两大挑战：
- 存储成本高：传统关系型数据库无法高效存储海量时序数据（如每10秒采集一次的CPU使用率），若采用普通磁盘存储，会导致查询速度极慢；若采用高性能存储（如SSD），则成本过高。
- 数据分析效率低：海量数据下，传统“全量检索”方式无法满足故障排查的实时性需求（如“查询30分钟前某服务的错误日志”可能需要数分钟），易错过故障处理的黄金时间。


### 二、监控体系的核心目标：可观测性（Observability）
为解决分布式架构的监控痛点，行业提出了“可观测性”这一核心目标——即通过采集系统的输出数据，反向推导系统内部状态的能力。可观测性的实现依赖Metrics（指标）、Logs（日志）、Tracing（追踪）三大支柱，三者协同覆盖“宏观状态-微观细节-链路关联”的全维度监控需求。

| 支柱（Pillar） | 核心定位 | 典型场景 | 数据特点 |
|----------------|----------|----------|----------|
| Metrics（指标） | 宏观系统状态量化，用于“发现异常” | 服务器CPU使用率、接口QPS、错误率、数据库连接数 | 结构化、时序化（按时间戳存储）、数据量小（每10秒/分钟一条） |
| Logs（日志） | 微观事件记录，用于“定位根因” | 接口调用错误详情、数据库SQL执行失败日志、用户操作记录 | 非结构化/半结构化、事件化（记录单次事件）、数据量大（每条请求可能产生多条日志） |
| Tracing（追踪） | 跨服务调用链路串联，用于“梳理依赖” | 单个用户请求的调用路径（网关→服务A→服务B→数据库）、各环节耗时 | 结构化、链路化（含唯一Trace ID串联全链路）、数据量中等（每条请求对应一条Trace） |

三者的协同逻辑：当Metrics发现“接口错误率突增”（异常信号）→ 通过Tracing定位到“服务B调用数据库超时”（链路异常点）→ 查看服务B的Logs，获取“数据库连接池耗尽”的具体错误信息（根因）。


### 三、主流监控工具对比：四大工具栈的差异与适用场景
分布式监控领域不存在“万能工具”，不同工具栈在设计理念、核心能力上差异显著，需根据业务场景选择。以下对比当前主流的四大监控工具栈：

| 对比维度 | Prometheus | Zabbix | Grafana Loki | ELK Stack（Elasticsearch+Logstash+Kibana） |
|----------|------------|--------|--------------|--------------------------------------------|
| 核心定位 | 时序指标监控（Metrics-first） | 传统IT基础设施监控（服务器/网络设备） | 轻量级日志聚合（Logs-first） | 全量日志采集、存储与分析 |
| 数据类型 | 时序指标（支持少量日志/Tracing） | 系统指标、设备状态（日志能力弱） | 日志（支持与Prometheus指标联动） | 日志（结构化/非结构化）、少量指标 |
| 存储能力 | 本地时序数据库（TSDB），支持远程存储（如S3） | 关系型数据库（MySQL/PostgreSQL）+ 历史数据归档 | 日志索引与存储分离（索引小，原始日志存廉价存储） | Elasticsearch（分布式搜索引擎，支持高效日志检索） |
| 查询能力 | PromQL（专为时序数据设计，支持聚合、过滤） | 自定义宏、简单条件查询（复杂查询能力弱） | LogQL（支持日志过滤、聚合，与PromQL语法相似） | Lucene查询（支持全文检索、模糊匹配，灵活但复杂） |
| 告警能力 | 原生告警规则（基于PromQL），支持告警分组、抑制 | 支持阈值告警、触发条件复杂（需配置触发器） | 依赖Grafana告警或Prometheus Alertmanager | 依赖Kibana告警（功能弱）或第三方告警工具（如ElastAlert） |
| 部署复杂度 | 轻量级（单节点可部署，分布式扩展简单） | 架构重（需部署Server、Agent、数据库，扩展复杂） | 轻量级（与Grafana无缝集成，部署成本低） | 重（需部署3+组件，Elasticsearch集群维护成本高） |
| 适用场景 | 云原生架构（K8s、容器）、微服务指标监控 | 传统IT架构（物理机、虚拟机、网络设备）监控 | 云原生场景下的轻量级日志监控（需与Prometheus联动） | 全量日志分析（如用户行为分析、安全审计） |
| 典型缺点 | 原生不支持全量日志，Tracing需依赖Jaeger等工具 | 不适应云原生动态环境，自定义指标扩展难 | 不支持全量日志检索（仅支持标签过滤） | 存储成本高（全量日志存Elasticsearch），查询性能随数据量下降 |


### 四、Prometheus 的核心优势：为何成为云原生监控首选
在云原生（K8s、容器）场景下，Prometheus凭借对分布式架构的深度适配，成为事实上的监控标准。其核心优势集中在时序数据存储、灵活查询、原生告警、分布式部署四大维度，完美解决了分布式监控的核心痛点。

#### 1. 时序数据存储：高效应对海量指标
Prometheus采用自研的时序数据库（TSDB） ，专为分布式场景下的指标存储设计，具备三大特点：
- 本地存储+远程分级：默认采用本地存储（避免分布式存储的网络延迟），同时支持将历史数据（如超过15天）迁移到远程存储（如S3、GCS），平衡性能与成本。
- 高写入吞吐量：单节点Prometheus支持每秒数十万条指标写入，可覆盖数千个容器节点的监控需求，无需复杂的集群分片。

#### 2. 灵活查询：PromQL实现“精准定位异常”
Prometheus提供专为时序数据设计的查询语言PromQL（Prometheus Query Language） ，支持复杂的指标计算与过滤，让工程师能快速定位异常：
- 多维度过滤：指标支持添加自定义标签（如`service=user-service`、`env=production`、`node=node-1`），通过PromQL可快速筛选“生产环境下user-service的错误率”（如`http_requests_total{status=~"5..", service="user-service", env="production"}`）。
- 实时聚合计算：支持求和（sum）、平均值（avg）、最大值（max）等聚合函数，可计算“整个集群的CPU使用率”（`avg(rate(node_cpu_usage[5m])) by (cluster)`）。
- 时序趋势分析：支持基于时间窗口的计算（如`rate(http_requests_total[5m])`计算5分钟内的请求增长率），快速发现指标的异常波动。

#### 3. 原生告警：从“发现异常”到“主动通知”
Prometheus内置Alertmanager组件，实现告警规则定义、分组、抑制与路由，解决分布式系统中“告警风暴”与“告警延迟”问题：
- 基于PromQL的告警规则：直接通过PromQL定义告警阈值（如“当http_requests_5xx_total的5分钟增长率超过10%时触发告警”），规则配置简单直观。
- 告警分组与抑制：支持将同一服务、同一节点的多个告警合并为一个分组（如“user-service的3个实例同时报错，只发送1条告警”），避免告警风暴；同时支持告警抑制（如“当节点宕机时，抑制该节点上所有服务的告警”），减少无效告警。
- 多渠道路由：可将告警路由到不同通知渠道（如邮件、Slack、钉钉、PagerDuty），并根据告警级别（如P0、P1）指定不同接收人，确保关键告警优先处理。

#### 4. 分布式部署：适配动态扩展的云原生环境
Prometheus的架构设计天然支持分布式部署，无需复杂的集群协调，即可覆盖大规模分布式系统：
- 基于Pull模式的采集：Prometheus主动从目标节点（如容器、服务）拉取指标（默认HTTP协议），无需在目标节点部署复杂的Agent（仅需部署轻量级的`node_exporter`或`cadvisor`），适配K8s容器的动态扩缩容（新容器上线后自动被Prometheus发现）。
- 联邦集群（Federation）：支持按业务域或地域拆分Prometheus集群（如“北京集群”“上海集群”“支付业务集群”），再通过联邦集群将子集群的指标汇总到顶层集群，实现“全局监控+局部细节”的分层管理。
- 高可用（HA）部署：通过部署多个Prometheus实例采集相同的目标，避免单点故障；Alertmanager也支持多实例部署，通过一致性哈希实现告警数据的分片存储，确保告警服务不中断。


### 总结
分布式监控的核心是“以可观测性为目标，通过工具链协同解决节点多、链路复杂、数据量大的痛点”。在实际落地中，Prometheus凭借对时序指标的高效处理能力，成为云原生场景的首选；Zabbix更适合传统IT基础设施监控；ELK Stack用于全量日志分析；Grafana Loki则是轻量级日志监控的性价比之选。三者（Metrics/Logs/Tracing）协同、工具链按需组合，才能构建起覆盖分布式系统全生命周期的监控体系。


## 2.2 Prometheus基础架构与核心组件

Prometheus作为云原生领域主流的开源监控系统，其架构设计围绕“时序数据”全生命周期展开，具备高可扩展性、灵活查询能力和原生告警机制。以下从核心流程、核心组件、时序数据模型三个维度，系统解析其基础架构与核心组件的功能逻辑。


### 一、Prometheus核心流程：时序数据的“全生命周期管理”
Prometheus的工作流程遵循“数据采集→存储→查询→告警→可视化”的闭环，各环节紧密衔接，确保监控数据从产生到消费的完整链路可控。具体流程如下：

1. 数据采集：通过“拉取（Pull）”为主、“推送（Push，需配合PushGateway）”为辅的方式，从目标对象（如服务器、数据库、容器）中采集时序数据。默认采用HTTP协议定期拉取Exporter暴露的指标接口（通常为`/metrics`），也支持通过PushGateway接收短生命周期任务（如临时脚本、一次性Job）的推送数据。  
2. 数据存储：采集到的原始数据先进入Prometheus Server的内存缓冲区，经过“样本压缩”“标签索引构建”后，按预定义规则（默认保留15天，可配置）持久化到本地磁盘的时序数据库中（基于TSDB时序引擎，优化了时间序列数据的写入与查询性能）。  
3. 数据查询：用户通过PromQL（Prometheus Query Language）——一种专为时序数据设计的查询语言，向Prometheus Server发起查询请求（如“过去5分钟内服务器CPU使用率平均值”），查询引擎会从本地存储或远程存储中检索数据并计算结果。  
4. 告警触发：Prometheus Server内置“告警规则引擎”，定期评估用户配置的告警规则（如“CPU使用率持续10分钟超过90%”）。当规则触发时，会将告警事件发送至Alertmanager进行后续处理。  
5. 可视化呈现：查询结果或告警数据可通过两种方式可视化：一是Prometheus Server自带的简易Web UI（用于快速验证查询）；二是与Grafana深度集成，通过自定义仪表盘展示多维度监控指标（如系统资源、业务接口QPS、错误率等），支持折线图、柱状图、仪表盘等多种图表类型。


### 二、Prometheus核心组件解析
Prometheus的架构由多个功能独立的组件构成，各组件分工明确、可单独部署扩展，共同支撑监控能力。

#### 1. Prometheus Server：核心中枢
作为整个架构的“大脑”，Prometheus Server整合了数据存储、查询引擎、告警规则评估三大核心能力，是数据流转的核心节点。  
- 核心功能：  
  - 主动拉取Exporter或PushGateway的监控数据；  
  - 将数据存储到本地TSDB（时序数据库），支持配置数据保留周期（如30天），也可对接远程存储（如Thanos、Ceph）实现海量数据持久化；  
  - 提供PromQL查询接口，支持用户或Grafana发起指标查询；  
  - 定期评估用户定义的告警规则（配置在`rules.yml`中），当指标满足告警条件时，生成告警事件并发送给Alertmanager。  
- 部署特点：支持单机部署（中小规模场景）或联邦集群（Federation，大规模场景下按业务/区域拆分，实现监控数据分级聚合）。

#### 2. Exporter：数据采集器
Exporter是Prometheus的“数据探针”，负责将非Prometheus格式的监控数据（如服务器CPU、MySQL连接数、Redis内存）转换为标准时序格式，并通过HTTP接口（`/metrics`）暴露，供Prometheus Server拉取。  
- 分类与典型示例：  
  - 系统级Exporter：Node Exporter（最常用，采集服务器CPU、内存、磁盘IO、网络流量等基础指标）；  
  - 中间件Exporter：MySQL Exporter（采集MySQL的连接数、慢查询数、表空间大小）、Redis Exporter（采集Redis的内存使用、键数量、命中率）、Nginx Exporter（采集Nginx的请求量、错误率、响应时间）；  
  - 自定义Exporter：若业务指标（如订单量、接口成功率）无现成Exporter，可基于Prometheus提供的SDK（如Go的`client_golang`、Python的`prometheus_client`）开发自定义Exporter，将业务数据封装为时序指标。  
- 工作方式：Exporter通常部署在被监控目标所在的节点（如服务器、容器），无需主动推送数据，仅被动暴露`/metrics`接口，等待Prometheus Server定期拉取（拉取频率可在Prometheus配置文件中定义，如每15秒一次）。

#### 3. PushGateway：短生命周期任务适配层
Prometheus默认的“拉取模式”无法覆盖短生命周期任务（如临时执行的Shell脚本、Kubernetes Job）——这类任务在Prometheus拉取前可能已结束，导致数据无法采集。PushGateway的核心作用是“接收这类任务的主动推送数据，并暂存起来，供Prometheus Server拉取”。  
- 核心功能：  
  - 提供HTTP推送接口（如`/metrics/job/<job-name>`），短生命周期任务可将指标主动推送到PushGateway；  
  - 暂存推送的指标数据（默认内存存储，重启后丢失，可配置持久化到本地文件），等待Prometheus Server按常规拉取流程获取数据；  
- 使用场景：仅用于短生命周期任务，长生命周期服务（如Web应用、数据库）仍建议使用Exporter+拉取模式，避免PushGateway成为性能瓶颈。

#### 4. Alertmanager：告警管理中心
Alertmanager是Prometheus的“告警管家”，负责接收Prometheus Server发送的告警事件，进行聚合、降噪、路由、分发，确保告警精准触达负责人，避免“告警风暴”。  
- 核心功能：  
  - 告警聚合：将同一类型、同一目标的多个告警合并为一个（如“10台服务器CPU超标”合并为“Web集群CPU使用率异常”），减少重复告警；  
  - 降噪与抑制：支持“告警抑制”（如“服务器宕机”告警触发后，抑制该服务器上的“应用不可用”告警，避免冗余通知）和“静默期”（告警触发后，在指定时间内不再重复发送，如10分钟内只通知一次）；  
  - 路由与分发：按用户配置的路由规则（如“数据库告警发送给DBA团队，服务器告警发送给运维团队”），将告警分发到不同通知渠道（如邮件、Slack、钉钉、企业微信机器人、PagerDuty）；  
- 配置关键：通过`alertmanager.yml`定义路由树（Route Tree）和接收者（Receiver），实现告警的精细化管理。

#### 5. Grafana：可视化仪表盘
Prometheus Server自带的Web UI仅支持简单查询，而Grafana是Prometheus的“可视化利器”——支持通过拖拽配置多维度、高颜值的监控仪表盘，且与Prometheus无缝集成。  
- 核心功能：  
  - 数据源集成：默认支持Prometheus作为数据源，可直接调用PromQL查询指标；  
  - 仪表盘自定义：提供丰富的图表组件（折线图、柱状图、仪表盘、热力图等），支持按时间范围（如近1小时、近7天）、标签（如按服务器IP、业务集群）筛选数据；  
  - 模板与共享：支持导出/导入仪表盘模板（可在[Grafana Labs](https://grafana.com/grafana/dashboards/)获取现成模板，如Node Exporter的服务器监控模板），方便团队共享；  
  - 告警联动：除了展示Prometheus的告警，Grafana也支持基于仪表盘指标配置“面板告警”（如当图表中“错误率超过5%”时触发告警）。


### 三、Prometheus时序数据模型：监控数据的“结构化定义”
Prometheus的核心是“时序数据”（Time-Series Data），即按时间顺序排列的、随时间变化的指标数据。其数据模型严格定义了指标的组成结构，确保数据可被高效查询和聚合。  

Prometheus的每一条时序数据（称为一个“样本”）由4个核心部分组成：Metric名称、标签（Labels）、样本值（Value）、时间戳（Timestamp），格式可抽象为：  
`{<metric_name>, <label_key1>=<label_value1>, <label_key2>=<label_value2>, ...} <value> <timestamp>`

#### 1. 各组成部分解析
| 组成部分       | 作用与说明                                                                 | 示例                                                                 |
|----------------|----------------------------------------------------------------------------|----------------------------------------------------------------------|
| Metric名称     | 标识指标的“类型”，需符合“字母开头+数字/下划线/冒号”规则，描述指标含义       | `node_cpu_seconds_total`（Node Exporter的CPU总占用时间指标）、`http_requests_total`（HTTP请求总数指标） |
| 标签（Labels） | 键值对（Key-Value），用于“维度区分”，是PromQL查询和聚合的核心依据           | `cpu="0"`（CPU核心0）、`mode="idle"`（CPU空闲状态）、`instance="192.168.1.100:9100"`（被监控节点IP+端口）、`status="200"`（HTTP响应状态码） |
| 样本值（Value） | 指标的具体数值，为64位浮点数                                               | `125.5`（如CPU空闲时间125.5秒）、`3890`（如HTTP请求总数3890次）       |
| 时间戳（Timestamp） | 样本采集的时间，精确到毫秒（ms），由Prometheus Server在拉取时自动生成       | `1690000000000`（对应2023-07-22 12:26:40）                           |

#### 2. 数据模型的核心优势
- 多维度灵活查询：通过标签（Labels）可快速筛选特定维度的数据，例如查询“192.168.1.100节点CPU核心0的空闲时间”，PromQL语句为：`node_cpu_seconds_total{instance="192.168.1.100:9100", cpu="0", mode="idle"}`；  
- 支持指标聚合：基于标签进行聚合计算（如求和、平均值、最大值），例如查询“所有Web节点的HTTP 5xx错误总数”，PromQL语句为：`sum(http_requests_total{status=~"5.."}) by (instance)`；  
- 兼容动态环境：在Kubernetes等动态环境中，容器IP、实例名称频繁变化，通过标签（如`pod="web-xxx-yyy"`、`namespace="prod"`）可轻松关联动态变化的目标，无需修改监控配置。


## 2.3 环境搭建：快速部署Prometheus生态

Prometheus 生态的部署需根据场景（学习测试、生产环境）选择不同方案，核心目标是实现“数据采集-存储-可视化-告警”的全链路打通。以下从单机部署（轻量场景）、分布式部署（生产场景）和基础配置验证三个维度，提供可落地的部署指南。


### 一、单机部署（适合学习 / 测试）
单机部署侧重“快速启动、低复杂度”，无需考虑高可用或数据扩容，适合新手熟悉 Prometheus 核心流程。主流方案分为二进制包安装（原生部署，便于理解组件交互）和Docker Compose 容器化部署（一键启动，节省环境配置时间）。


#### 1. 二进制包安装 Prometheus Server（以 Linux 系统为例）
二进制部署需手动下载组件包、配置文件，适合需要深入理解配置细节的场景。

###### 步骤 1：环境准备
- 操作系统：CentOS 7+/Ubuntu 18.04+（需关闭防火墙或开放端口，如 9090、9100）；
- 依赖：无特殊依赖，确保系统有 `wget` 或 `curl` 工具用于下载包。

###### 步骤 2：下载并解压 Prometheus Server
1. 进入 [Prometheus 官方下载页](https://prometheus.io/download/)，获取对应系统的最新版本（以 v3.4.2 为例）：
   ```bash
   # 下载二进制包
   wget https://github.com/prometheus/prometheus/releases/download/v3.4.2/prometheus-3.4.2.linux-amd64.tar.gz
   # 解压到指定目录（如 /opt/prometheus）
   tar -zxvf prometheus-3.4.2.linux-amd64.tar.gz -C /opt/
   # 重命名目录（简化操作）
   mv /opt/prometheus-3.4.2.linux-amd64 /opt/prometheus
   ```

###### 步骤 3：修改核心配置文件（prometheus.yml）
Prometheus 启动时默认加载 `prometheus.yml`，需配置“数据采集目标（Targets）”和“全局参数”：
```yaml
global:
  scrape_interval: 15s  # 全局采集间隔（默认15秒，可按需调整）
  evaluation_interval: 15s  # 告警规则评估间隔

# 配置 Prometheus 自身为采集目标（监控 Prometheus Server 状态）
scrape_configs:
  - job_name: "prometheus"  # 任务名称（自定义，需唯一）
    static_configs:
      - targets: ["localhost:9090"]  # 采集地址（Prometheus Server 监听端口）
```

###### 步骤 4：启动 Prometheus Server
- 前台启动（适合测试，关闭终端即停止）：
  ```bash
  cd /opt/prometheus
  ./prometheus --config.file=prometheus.yml
  ```
- 后台启动（适合长期运行，通过 `nohup` 或系统服务管理）：
  ```bash
  nohup ./prometheus --config.file=prometheus.yml > prometheus.log 2>&1 &
  ```


#### 2. Docker Compose 一键部署（Prometheus + Grafana）
容器化部署通过 `docker-compose.yml` 定义服务依赖，一键启动 Prometheus（数据存储/查询）和 Grafana（可视化），无需手动配置环境依赖。

###### 步骤 1：环境准备
- 安装 Docker：参考 [Docker 官方文档](https://docs.docker.com/engine/install/)（确保 Docker 服务正常运行）；
- 安装 Docker Compose：参考 [Docker Compose 官方文档](https://docs.docker.com/compose/install/)。

###### 步骤 2：编写 docker-compose.yml
在任意目录（如 `/opt/prometheus-docker`）创建配置文件，定义两个服务：
```yaml
version: '3.8'  # Docker Compose 版本（需与本地版本兼容）
services:
  # Prometheus 服务
  prometheus:
    image: prom/prometheus:v3.4.2  # 使用指定版本镜像（避免最新版兼容性问题）
    container_name: prometheus  # 容器名称
    ports:
      - "9090:9090"  # 宿主机端口:容器端口（外部通过 9090 访问 Prometheus）
    volumes:
      # 挂载本地配置文件到容器（修改本地文件即可同步生效）
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      # 挂载数据目录（持久化存储时序数据，避免容器删除后数据丢失）
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'  # 指定配置文件路径
    restart: always  # 容器异常时自动重启

  # Grafana 服务
  grafana:
    image: grafana/grafana:12.0.2  # Grafana 镜像（10.x 版本兼容性较好）
    container_name: grafana
    ports:
      - "3000:3000"  # 外部通过 3000 访问 Grafana
    volumes:
      - grafana-data:/var/lib/grafana  # 持久化 Grafana 配置和仪表盘数据
    depends_on:
      - prometheus  # 依赖 Prometheus 服务（确保 Prometheus 先启动）
    restart: always

# 定义数据卷（持久化存储，独立于容器生命周期）
volumes:
  prometheus-data:
  grafana-data:
```

###### 步骤 3：编写 Prometheus 配置文件（prometheus.yml）
在与 `docker-compose.yml` 同级目录下，创建 `prometheus.yml`（配置逻辑与二进制部署一致）：
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["prometheus:9090"]  # 注意：容器间通信使用服务名（而非 localhost）
  # （可选）添加 Node Exporter 采集宿主机数据（需先启动 Node Exporter 容器）
  # - job_name: "node"
  #   static_configs:
  #     - targets: ["node-exporter:9100"]
```

###### 步骤 4：一键启动服务
在 `docker-compose.yml` 所在目录执行命令，Docker 会自动拉取镜像并启动服务：
```bash
# 启动服务（后台运行，加 -d 参数）
docker-compose up -d
# 查看服务状态（确认 Prometheus 和 Grafana 均为 Up 状态）
docker-compose ps
```


#### 3. 二进制包安装 Prometheus Server（以 Windows 系统为例）

从Prometheus官方（<https://prometheus.io/download/>）下载3.4.2版本编译文件压缩包（如`prometheus-3.4.2.windows-amd64.zip`）。


解压至目标目录（如`D:\dev\monitor\prometheus-3.4.2.windows-amd64`）。其中，该目录下有以下几个文件：

* prometheus.exe
* promtool.exe
* prometheus.yml


###### 步骤 1：配置Prometheus

prometheus.yml默认配置如下：

```yml
# my global config
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: "prometheus"

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
      - targets: ["localhost:9090"]
       # The label name is added as a label `label_name=<label_value>` to any timeseries scraped from this config.
        labels:
          app: "prometheus"
```


* scrape_interval：控制数据抓取频率，默认1分钟，建议缩短至15秒以提升实时性。
* targets：指定监控目标的地址和端口（如Prometheus默认端口为9090）。


###### 步骤 2：启动Prometheus


在Windows下，执行如下命令启动：

```cmd
.\prometheus.exe
```


看到如下日志，则证明启动成功：

```
time=2025-07-03T07:20:53.094Z level=INFO source=main.go:1287 msg="filesystem information" fs_type=unknown
time=2025-07-03T07:20:53.094Z level=INFO source=main.go:1290 msg="TSDB started"
time=2025-07-03T07:20:53.094Z level=INFO source=main.go:1475 msg="Loading configuration file" filename=prometheus.yml
time=2025-07-03T07:20:53.116Z level=INFO source=main.go:1514 msg="updated GOGC" old=100 new=75
time=2025-07-03T07:20:53.116Z level=INFO source=main.go:1524 msg="Completed loading of configuration file" db_storage=0s remote_storage=0s web_handler=0s query_engine=0s scrape=21.489ms scrape_sd=0s notify=0s notify_sd=0s rules=0s tracing=0s filename=prometheus.yml totalDuration=22.0476ms
time=2025-07-03T07:20:53.116Z level=INFO source=main.go:1251 msg="Server is ready to receive web requests."
time=2025-07-03T07:20:53.116Z level=INFO source=manager.go:175 msg="Starting rule manager..." component="rule manager"
```


### 二、分布式部署（贴近生产）
生产环境需解决“高可用（避免单点故障）”“长期数据存储（Prometheus 本地存储有限）”“大规模节点采集（跨集群/跨地域）”三大问题，主流方案是 “多 Prometheus 联邦集群 + 远程存储”。


#### 1. 多 Prometheus Server 联邦集群（Federation）
Prometheus 联邦通过“层级架构”实现分布式采集：
- 下层 Prometheus（子节点）：负责采集单个集群/业务域的本地数据（如 Node、MySQL 指标），仅存储短期数据（如 7 天）；
- 上层 Prometheus（联邦节点）：通过“拉取子节点的聚合指标”实现全局数据汇总，支持跨子节点的查询分析（如“所有集群的 CPU 使用率总和”）。

###### 核心配置（以上层联邦节点为例）
在联邦节点的 `prometheus.yml` 中，通过 `federate` 任务拉取子节点数据：
```yaml
scrape_configs:
  # 联邦任务：拉取子节点的指标
  - job_name: "federate"
    scrape_interval: 15s
    honor_labels: true  # 保留子节点的标签（避免标签冲突）
    metrics_path: "/federate"  # 子节点提供的联邦接口
    params:
      "match[]":  # 筛选需要拉取的指标（支持正则，避免全量拉取）
        - '{job=~"node|mysql"}'  # 拉取子节点中 job 为 node 或 mysql 的指标
    static_configs:
      # 子节点 Prometheus 的地址列表（多个子节点用逗号分隔）
      - targets: ["sub-prometheus-1:9090", "sub-prometheus-2:9090"]
```

###### 优势
- 降低单 Prometheus 负载：子节点分摊采集压力，避免单节点处理上万指标；
- 隔离故障域：单个子节点故障不影响全局监控，仅丢失该域数据；
- 灵活扩展：新增业务域时，只需部署新的子节点并接入联邦层。


#### 2. 远程存储配置（对接 Thanos/Cortex）
Prometheus 本地存储基于 TSDB（时序数据库），默认仅保留 15 天数据（可通过 `--storage.tsdb.retention.time` 调整，但长期存储会占用大量磁盘且查询效率下降）。生产环境需对接 Thanos 或 Cortex 实现“长期存储 + 全局查询”。

###### 以对接 Thanos 为例（核心流程）
Thanos 是 Prometheus 生态的长期存储方案，支持将 Prometheus 数据备份到对象存储（如 S3、MinIO），并提供全局查询层。

1. 部署 Thanos Sidecar：
   - 作为 Sidecar 容器与 Prometheus 部署在同一节点，负责将 Prometheus 数据同步到对象存储；
   - 修改 Prometheus 启动参数，启用远程写功能：
     ```bash
     ./prometheus --config.file=prometheus.yml \
       --web.enable-remote-write-receiver \  # 启用远程写接收
       --thanos.store.sd-dns-resolver=default  # 配置 Thanos 存储发现
     ```

2. 配置 Thanos Store Gateway：
   - 连接对象存储（如 MinIO），提供历史数据查询接口；
   - 核心配置（`store.yml`）：
     ```yaml
     type: S3
     config:
       bucket: "thanos-data"  # 对象存储桶名称
       endpoint: "minio:9000"  # MinIO 地址
       access_key: "minio-access-key"  # 访问密钥
       secret_key: "minio-secret-key"  # 秘密密钥
       insecure: true  # 测试环境可关闭 HTTPS（生产需启用）
     ```

3. 部署 Thanos Query：
   - 作为全局查询入口，聚合 Prometheus 本地数据和 Thanos 存储的历史数据，提供统一查询接口；
   - 启动命令：
     ```bash
     thanos query --store=prometheus-sidecar:10901 --store=thanos-store:10901
     ```

###### 优势
- 无限存储：依赖对象存储（如 S3），突破本地磁盘限制；
- 历史数据查询：支持查询数月甚至数年的历史指标；
- 降本增效：本地存储保留短期热数据（如 7 天），历史冷数据存到低成本对象存储。


### 三、基础配置验证
部署完成后，需通过 UI 确认 Prometheus 和 Grafana 服务正常运行，避免后续采集/可视化环节报错。


#### 1. 验证 Prometheus Server（访问 :9090）
通过浏览器访问 `http://[服务器IP]:9090`（如 `http://192.168.1.100:9090`），进入 Prometheus 原生 UI：

###### 核心验证点：
- Target 状态：进入 `Status > Targets` 页面，确认 `prometheus` 任务的 `State` 为 UP（若为 DOWN，需检查端口是否开放、配置文件中 targets 地址是否正确）；
- 指标查询：在顶部查询框输入 `up`（`up` 是 Prometheus 内置指标，1 表示目标存活，0 表示离线），点击 `Execute`，若返回 `up{job="prometheus",instance="localhost:9090"} 1`，说明 Prometheus 自身监控正常。


#### 2. 验证 Grafana（访问 :3000）
通过浏览器访问 `http://[服务器IP]:3000`（如 `http://192.168.1.100:3000`），进入 Grafana 登录页面：

###### 核心验证点：
- 首次登录：默认用户名/密码为 `admin`/`admin`，首次登录需修改密码；
- 添加 Prometheus 数据源：
  1. 登录后进入 `Configuration > Data Sources`，点击 `Add data source`；
  2. 选择 `Prometheus` 作为数据源类型；
  3. 在 `HTTP > URL` 中输入 Prometheus 地址（容器部署填 `http://prometheus:9090`，二进制部署填 `http://[服务器IP]:9090`）；
  4. 点击 `Save & test`，若提示 `Data source is working`，说明 Grafana 与 Prometheus 连接正常；
- 导入预置仪表盘：（可选）进入 `Dashboards > Import`，输入 Prometheus 官方仪表盘 ID（如 `1860`，对应 Node Exporter 系统监控仪表盘），选择已添加的 Prometheus 数据源，即可快速查看系统指标可视化图表。


通过以上步骤，即可完成 Prometheus 生态的基础部署与验证：单机部署适合快速上手，分布式部署满足生产高可用与长期存储需求，最终通过 Grafana 实现指标的可视化呈现。


## 3.1 数据采集：Exporter与数据暴露

在 Prometheus 生态中，数据采集是监控体系的“数据源入口”，而 Exporter 是实现这一环节的核心工具。其核心逻辑是通过标准化的 HTTP 接口暴露指标、按规则配置采集策略，最终将分散的监控数据统一汇聚到 Prometheus Server，为后续存储、查询和告警提供基础。以下从工作原理、实战场景到配置细节展开介绍。


### 一、Exporter 工作原理：HTTP 接口暴露 Metrics
Exporter 的本质是“指标翻译器”：它将目标对象（如服务器、MySQL、自定义应用）的原始状态（如 CPU 使用率、数据库连接数、订单成功率）转换为 Prometheus 能识别的标准化时序数据，并通过固定的 HTTP 端点对外暴露。

#### 核心工作流程
1. 指标采集：Exporter 主动或被动获取目标对象的状态数据（如 Node Exporter 读取 Linux 系统 `/proc` 目录下的 CPU/内存信息，MySQL Exporter 通过 SQL 语句查询数据库连接数）。
2. 格式转换：将采集到的原始数据，按照 Prometheus 定义的文本格式规范（如 `node_cpu_seconds_total{mode="idle",cpu="0"} 1234.56 1690000000`）进行封装。
3. HTTP 暴露：Exporter 启动一个 HTTP 服务（默认端口因类型而异，如 Node Exporter 是 9100），并将转换后的指标数据挂载到 `/metrics` 端点。
4. Prometheus 拉取：Prometheus Server 根据配置的“采集规则”（Scrape Config），定期（如每 15 秒）向 Exporter 的 `/metrics` 端点发送 HTTP GET 请求，拉取指标数据并存储到本地时序数据库。

#### 关键特点
- 拉模式（Pull）优先：Prometheus 采用“拉取”而非“推送”数据，更易排查网络问题（如 Exporter 离线可快速发现），也更符合分布式架构的弹性扩展需求。
- 无状态设计：Exporter 本身不存储数据，仅负责“采集-转换-暴露”，重启后不影响历史数据（历史数据由 Prometheus Server 管理）。


### 二、常用 Exporter 实战
不同类型的监控目标（系统、中间件、应用）对应不同的 Exporter，以下是生产中最常用的 Exporter 及配置要点：

#### 1. 系统监控：Node Exporter
作用：监控 Linux/Windows 服务器的核心指标，如 CPU、内存、磁盘、网络、磁盘 I/O 等，是服务器级监控的“标配”。

###### 部署与验证（以 Linux 为例）
1. 下载启动：
   ```bash
   # 下载最新版本（可替换为实际版本号）
   wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
   tar -zxvf node_exporter-1.6.1.linux-amd64.tar.gz
   cd node_exporter-1.6.1.linux-amd64/
   # 启动 Exporter（默认端口 9100）
   ./node_exporter
   ```
2. 验证指标：浏览器访问 `http://[服务器IP]:9100/metrics`，可看到 `node_cpu_seconds_total`（CPU 时间）、`node_memory_usage_bytes`（内存使用）等核心指标。

###### 核心监控指标示例
| 指标名称                | 含义                  | 标签（Labels）示例          |
|-------------------------|-----------------------|-----------------------------|
| `node_cpu_seconds_total` | CPU 累计占用时间（秒）| `mode="idle"`（空闲）、`cpu="0"`（CPU 核心） |
| `node_memory_usage_bytes`| 内存已使用字节数      | `device="MemTotal"`（总内存）、`device="MemFree"`（空闲内存） |
| `node_disk_usage_bytes`  | 磁盘已使用字节数      | `mountpoint="/"`（根目录）、`fstype="ext4"`（文件系统） |


#### 2. 中间件监控：MySQL/Redis/Nginx Exporter
针对主流中间件，社区已提供成熟的 Exporter，无需自定义开发，只需简单配置即可接入。

| Exporter 类型       | 作用                          | 默认端口 | 核心配置（需对接中间件）                | 关键监控指标示例                  |
|---------------------|-------------------------------|----------|-----------------------------------------|-----------------------------------|
| MySQL Exporter  | 监控 MySQL/MariaDB 运行状态   | 9104     | 需指定数据库连接地址（`--mysqld-exporter.login-file=/etc/mysql/.my.cnf`） | `mysql_up`（数据库是否在线）、`mysql_connections`（当前连接数）、`mysql_slow_queries_total`（慢查询总数） |
| Redis Exporter  | 监控 Redis 缓存服务           | 9121     | 需指定 Redis 地址（`--redis.addr=127.0.0.1:6379`），有密码需加 `--redis.password=xxx` | `redis_up`（Redis 是否在线）、`redis_used_memory`（内存使用）、`redis_keyspace_hits`（Key 命中数） |
| Nginx Exporter  | 监控 Nginx 服务（需开启 stub_status） | 9113     | 需指定 Nginx 的 stub_status 地址（`--nginx.scrape-uri=http://127.0.0.1/nginx_status`） | `nginx_up`（Nginx 是否在线）、`nginx_active_connections`（活跃连接数）、`nginx_requests_total`（总请求数） |


#### 3. 应用监控：自定义 Exporter 与埋点规范
当需要监控业务指标（如订单成功率、接口响应时间、用户在线数）时，社区 Exporter 无法满足需求，需开发自定义 Exporter，或在应用中直接埋点暴露指标。

###### （1）自定义 Exporter 开发基础（Go 语言）
Prometheus 官方提供 Go 语言 SDK（`github.com/prometheus/client_golang/prometheus`），开发流程简单，核心是“定义指标类型 → 注册指标 → 暴露指标”。

示例：暴露“订单支付成功数”指标
```go
package main

import (
    "net/http"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
    // 1. 定义指标（Counter 类型，用于计数）
    orderPaySuccessTotal := prometheus.NewCounter(
        prometheus.CounterOpts{
            Name: "order_pay_success_total", // 指标名称（需符合 Prometheus 规范：小写+下划线）
            Help: "Total number of successful order payments", // 指标说明
            Labels: prometheus.Labels{"payment_method": "alipay"}, // 固定标签（如支付方式）
        },
    )

    // 2. 注册指标到默认注册器
    prometheus.MustRegister(orderPaySuccessTotal)

    // 3. 模拟业务逻辑：每 5 秒增加 1 次支付成功数（实际场景需对接业务代码）
    go func() {
        for range time.Tick(5 * time.Second) {
            orderPaySuccessTotal.Inc() // Counter 类型的“自增”方法
        }
    }()

    // 4. 暴露 /metrics 端点（默认端口 8080）
    http.Handle("/metrics", promhttp.Handler())
    http.ListenAndServe(":8080", nil)
}
```

###### （2）埋点规范：4 类核心指标类型
Prometheus 定义了 4 种核心指标类型，需根据业务场景选择，避免滥用导致数据混乱：

| 指标类型   | 作用                                  | 使用场景示例                                  | 核心方法（Go SDK）          |
|------------|---------------------------------------|-----------------------------------------------|-----------------------------|
| Counter | 单调递增的计数器（仅增不减，重启重置） | 接口调用总数、订单支付成功数、错误发生次数      | `Inc()`（+1）、`Add(n)`（+n） |
| Gauge   | 瞬时值（可增可减，反映当前状态）      | 实时在线用户数、内存使用率、数据库连接数        | `Set(n)`（设值）、`Inc()`、`Dec()` |
| Histogram | 对数据进行分桶统计（如响应时间分布）  | 接口响应时间（统计 0-100ms、100-500ms 等区间的请求数） | `Observe(n)`（记录样本值）   |
| Summary | 对数据进行聚合统计（如分位数）        | 接口响应时间的 P50/P95/P99 分位数（直接计算结果，无需分桶） | `Observe(n)`                |

注意：Histogram 和 Summary 都用于统计“分布类指标”，区别在于：
- Histogram 存储分桶数据，支持后续通过 PromQL 计算任意分位数，但占用存储更多；
- Summary 直接存储预计算的分位数（如 P95），占用存储少，但分位数无法后续调整。


#### 4. 短任务采集：PushGateway 使用
问题背景：Prometheus 拉模式无法采集“短生命周期任务”（如定时脚本、CI/CD 流水线、临时数据处理任务）—— 任务启动后很快结束，Exporter 还没来得及被拉取就已退出。

解决方案：PushGateway 作为“中间代理”，接收短任务主动推送的指标，再由 Prometheus Server 从 PushGateway 拉取数据。

###### 核心流程与配置
1. 启动 PushGateway（默认端口 9091）：
   ```bash
   docker run -d -p 9091:9091 prom/pushgateway
   ```
2. 短任务推送指标（以 Shell 脚本为例，使用 `curl` 推送）：
   ```bash
   # 推送“CI 构建成功数”指标到 PushGateway
   echo 'ci_build_success_total{project="prometheus-demo",branch="main"} 1' | \
   curl --data-binary @- http://[PushGatewayIP]:9091/metrics/job/ci-job/instance/ci-server-1
   ```
   - `job/ci-job`：指定任务所属的“Job 名称”（Prometheus 采集时的标签）；
   - `instance/ci-server-1`：指定任务运行的“实例名称”（用于区分不同节点的同一任务）。
3. Prometheus 配置拉取 PushGateway：在 `prometheus.yml` 中添加采集规则，从 PushGateway 拉取指标。


### 三、采集配置：Prometheus.yml 中 Scrape Config
所有 Exporter（或 PushGateway）的指标，都需要在 Prometheus 的核心配置文件 `prometheus.yml` 中通过 Scrape Config（采集配置） 定义，Prometheus Server 才会按规则拉取数据。

#### Scrape Config 核心结构
```yaml
global:
  scrape_interval: 15s # 全局默认采集间隔（所有 Job 未指定时生效）
  evaluation_interval: 15s # 告警规则评估间隔

scrape_configs:
  # 1. 采集 Prometheus Server 自身指标（用于监控 Prometheus 本身）
  - job_name: "prometheus" # Job 名称（自定义，会作为标签 `job="prometheus"` 附加到指标）
    static_configs:
      - targets: ["localhost:9090"] # 采集目标地址（Exporter/自身的 IP:端口）

  # 2. 采集 Node Exporter（系统监控）
  - job_name: "node"
    scrape_interval: 10s # 覆盖全局间隔，每 10 秒采集一次
    static_configs:
      - targets: ["192.168.1.100:9100", "192.168.1.101:9100"] # 多节点用逗号分隔
    # 标签重写（可选，为指标添加额外标签）
    relabel_configs:
      - source_labels: [__address__] # 源标签（__address__ 是目标地址）
        regex: "([0-9.]+):9100" # 正则提取 IP
        target_label: "server_ip" # 新增标签 server_ip，值为提取的 IP
        replacement: "$1"

  # 3. 采集 PushGateway（短任务指标）
  - job_name: "pushgateway"
    static_configs:
      - targets: ["192.168.1.102:9091"]
    # 关键配置：禁止自动添加 instance 标签（PushGateway 需手动指定 instance）
    honor_labels: true
```

#### 关键配置项说明
| 配置项               | 作用                                                                 |
|----------------------|----------------------------------------------------------------------|
| `job_name`           | 采集任务的名称，会作为标签 `job="<job_name>"` 附加到所有拉取的指标中，用于区分不同类型的采集目标。 |
| `scrape_interval`    | 该 Job 的采集间隔，可覆盖 `global` 中的默认值（如系统指标需高频采集，设为 10s；业务指标可设为 30s）。 |
| `static_configs.targets` | 静态指定采集目标列表（IP:端口），适合目标地址固定的场景（如物理机、固定云服务器）。 |
| `relabel_configs`    | 标签重写规则，支持新增、修改、删除指标的标签（如提取 IP 作为 `server_ip` 标签，方便后续筛选）。 |
| `honor_labels`       | 当采集目标的指标标签与 Prometheus 自动添加的标签（如 `instance`）冲突时，是否保留目标的标签（PushGateway 场景需设为 `true`）。 |


通过以上 Exporter 的选型、部署与 Prometheus 采集配置，可实现从“系统层”到“中间件层”再到“业务应用层”的全链路数据采集，为后续的监控可视化（Grafana）和告警（Alertmanager）奠定基础。


## 3.2 Prometheus时序数据存储原理：从本地机制到远程扩展

Prometheus 作为时序数据库（Time Series Database, TSDB）的典型实现，其存储设计围绕“高效采集、压缩存储、快速查询”核心目标展开。以下从本地存储机制、存储配置优化、远程存储集成三个维度，详细解析其时序数据存储原理。


### 一、本地存储机制：TSDB 的块存储生命周期
Prometheus 本地存储依赖内置的 TSDB 模块，采用“块存储（Block-based）”架构管理时序数据，核心是通过“写时 WAL 缓冲、读时块索引、后台压缩合并”的流程，平衡写入性能与存储效率。其完整生命周期分为 WAL 阶段→Head Block 阶段→Compaction 阶段→Retention 阶段，各阶段职责如下：

#### 1. 阶段1：WAL（Write-Ahead Log，预写日志）
- 作用：确保数据写入的“持久性”，避免进程崩溃导致数据丢失。  
  当 Prometheus 从 Exporter 采集到时序数据（或接收 PushGateway 推送的数据）时，不会直接写入持久化存储，而是先写入 WAL 文件（位于 `data/wal` 目录，以 `.wal` 为后缀）。  
- 特性：  
  - WAL 文件为二进制格式，按固定大小（默认 128MB）滚动生成，支持“顺序写入”（比随机写入性能高 10-100 倍）；  
  - 数据写入 WAL 后，会同步到内存中的 Head Block，确保后续查询能实时获取最新数据。

#### 2. 阶段2：Head Block（内存活跃块）
- 作用：存储“近期未完成压缩”的活跃时序数据，是数据查询的主要内存层。  
  Head Block 本质是内存中的有序数据结构，包含所有时序的最新样本（Metric + Labels + Value + Timestamp），支持快速插入和即时查询（如查看“当前 CPU 使用率”）。  
- 触发刷盘：当 Head Block 满足以下任一条件时，会被刷写成 持久化块（Persistent Block）：  
  - 时间跨度达到阈值（默认 2 小时，由 `--storage.tsdb.min-block-duration` 控制）；  
  - 内存占用达到上限（或手动触发刷盘）。

#### 3. 阶段3：Compaction（压缩合并）
- 作用：减少存储占用、优化查询性能，是 TSDB 存储效率的核心环节。  
  刷盘生成的 Persistent Block 为“小粒度块”（默认 2 小时/块），后台 Compaction 进程会将多个相邻的小 block 合并为“大粒度块”（如将 10 个 2 小时块合并为 1 个 20 小时块），同时完成两项关键操作：  
  - 数据去重：同一时序、同一时间戳的重复样本会被合并；  
  - 降采样（Downsampling）：对合并后的块生成“低精度数据”（如原始数据是 10s 间隔，降采样后保留 5min 间隔的平均值/最大值），后续查询老数据时可直接使用低精度数据，减少计算量。  
- 存储目录：压缩后的块存储在 `data/blocks` 目录，每个块是一个独立文件夹，包含：  
  - `meta.json`：块的元数据（时间范围、块大小、校验和等）；  
  - `index`：时序索引文件（映射 Metric + Labels 到具体样本的位置）；  
  - `chunks`：样本数据文件（采用自定义压缩算法，压缩率可达 10:1~20:1）。

#### 4. 阶段4：Retention（数据保留）
- 作用：清理过期数据，避免本地磁盘被占满。  
  TSDB 会定期检查所有 Persistent Block 的时间范围，当块的“最大时间戳”超过配置的 保留期限 或 存储大小限制 时，会自动删除该块。  
- 注意：WAL 文件和 Head Block 不受 Retention 直接控制，WAL 会在对应的 Block 完成压缩后自动清理，Head Block 则在刷盘后转为 Persistent Block 再参与 Retention 判断。


### 二、存储配置优化：平衡性能与资源占用
Prometheus 本地存储的默认配置（如保留 15 天、块大小 2 小时）仅适用于小规模场景，生产环境需根据“数据量、查询需求、磁盘资源”调整配置，核心优化方向如下：

#### 1. 核心保留策略配置
通过 Prometheus 启动参数或配置文件（`prometheus.yml`）设置，控制数据生命周期：
| 配置项                | 说明                                                                 | 默认值       | 建议场景                     |
|-----------------------|----------------------------------------------------------------------|--------------|------------------------------|
| `retention.time`      | 数据保留时间（超过则删除）                                           | 15d（15天）  | 测试环境可设 3d，生产可设 30d~90d |
| `retention.size`      | 存储大小上限（超过则按“最早数据优先”删除）                           | 无限制       | 磁盘有限时设置（如 100GB）   |
| `storage.tsdb.path`   | 本地存储目录（需确保磁盘空间充足、IO 性能高）                         | `./data`     | 建议挂载独立数据盘（如 `/data/prometheus`） |
| `storage.tsdb.wal-compression` | 启用 WAL 文件压缩（减少磁盘占用）                                   | 关闭         | 生产环境建议开启             |

示例配置（启动参数）：
```bash
./prometheus \
  --storage.tsdb.path=/data/prometheus \
  --storage.tsdb.retention.time=30d \
  --storage.tsdb.retention.size=100GB \
  --storage.tsdb.wal-compression
```

#### 2. 块压缩与索引优化
TSDB 已内置高效优化，无需手动配置，但需理解其原理以避免误操作：
- 块压缩：样本数据采用“Delta 编码+Snappy 压缩”，对时序数据（连续、变化平缓）的压缩率极高（如 CPU 使用率数据可压缩至原始大小的 5%~10%）；  
- 索引优化：索引文件（`index`）采用“倒排索引”结构，快速通过 Labels（标签） 筛选目标时序（如查询 `job="node_exporter"` 且 `instance="192.168.1.100"` 的数据）；  
- 避免过度细分标签：Labels 过多或取值基数过大（如用 UUID 作为标签值）会导致索引膨胀，降低查询性能，建议标签数量控制在 10 个以内，单个标签取值基数不超过 1000。


### 三、远程存储集成：解决本地存储的局限性
Prometheus 本地存储存在明显短板：无法跨节点共享数据、长期存储成本高、单节点故障风险。生产环境需通过“远程存储”扩展，核心方案是对接 Thanos 或 Cortex，实现“长期存储、高可用、跨集群查询”。

#### 1. 主流长期存储方案对比
Thanos 和 Cortex 是 Prometheus 生态中最成熟的远程存储方案，二者定位不同，需根据场景选择：

| 特性维度         | Thanos（开源）                                  | Cortex（开源，Cloud Native Computing Foundation 毕业项目） |
|------------------|-------------------------------------------------|------------------------------------------------------------|
| 核心优势         | 轻量、原生兼容 Prometheus、跨集群统一查询       | 多租户隔离（适合私有云/公有云场景）、弹性扩缩容            |
| 长期存储对接     | 支持 S3、GCS、Azure Blob 等对象存储（成本低）   | 支持对象存储、Cassandra、S3 等                             |
| 高可用能力       | 通过“多 Prometheus 副本 + Thanos Sidecar”实现   | 所有组件（存储、查询、告警）均支持分布式部署               |
| 适用场景         | 企业内部多集群监控、对成本敏感的场景            | 云服务商提供监控服务（如阿里云 ARMS、AWS Managed Service for Prometheus） |

#### 2. 远程存储对接流程（以 Thanos 为例）
Prometheus 通过 remote_write（远程写入） 和 remote_read（远程读取） 接口与远程存储交互，核心流程如下：

###### 步骤1：部署 Thanos 核心组件
Thanos 需部署 4 个关键组件，与 Prometheus 协同工作：
- Thanos Sidecar：部署在 Prometheus 节点，作为“代理”，负责将 Prometheus 的本地块同步到对象存储（如 S3），并响应 Thanos Query 的查询请求；  
- Thanos Query：接收用户查询请求，聚合多个 Prometheus/Sidecar 的数据（跨集群统一查询）；  
- Thanos Store Gateway：从对象存储读取历史块数据，提供查询能力；  
- 对象存储：如 MinIO（私有部署）、AWS S3（公有云），存储长期历史数据。

###### 步骤2：配置 Prometheus 远程写入
在 `prometheus.yml` 中添加 `remote_write` 配置，将数据实时推送到 Thanos Sidecar（或直接推送到对象存储）：
```yaml
global:
  scrape_interval: 15s

remote_write:
  - url: "http://thanos-sidecar:19291/api/v1/write"  # Thanos Sidecar 的写入地址
    queue_config:
      capacity: 10000  # 队列容量，避免数据堆积
      max_shards: 30  # 分片数量，提升写入并发

scrape_configs:
  - job_name: "node_exporter"
    static_configs:
      - targets: ["node-exporter:9100"]
```

###### 步骤3：配置远程读取（可选）
若需查询远程存储的历史数据，添加 `remote_read` 配置，让 Prometheus 查询时自动从 Thanos 拉取历史数据：
```yaml
remote_read:
  - url: "http://thanos-query:10902/api/v1/read"  # Thanos Query 的读取地址
    read_recent: true  # 优先读取本地数据（近期），老数据从远程读取
```

###### 步骤4：验证长期存储
- 数据写入：Prometheus 采集的数据会通过 Sidecar 同步到对象存储（如 S3 的 `thanos-bucket` 目录）；  
- 数据查询：通过 Thanos Query 的 UI（默认端口 10902）或 Grafana 对接 Thanos Query，可查询“本地 30 天 + 远程 1 年”的全量数据。


### 总结
Prometheus 时序数据存储的核心是 TSDB 块存储架构：通过 WAL 保证写入安全，Head Block 保障实时查询，Compaction 优化存储效率，Retention 控制本地数据生命周期；而 远程存储（Thanos/Cortex） 则解决了本地存储的“容量瓶颈”和“跨集群问题”，是生产环境的必备扩展方案。理解这一存储原理，能帮助开发者更好地优化 Prometheus 性能、规划存储资源，避免因存储配置不当导致的查询缓慢或数据丢失问题。


## 3.3 PromQL：Prometheus查询语言

PromQL（Prometheus Query Language）是 Prometheus 生态的“查询核心”，用于从时序数据库中提取、计算和分析监控数据，支撑可视化仪表盘与告警规则配置。其设计围绕时序数据特性展开，支持灵活的指标过滤、多维度运算与聚合分析，是实现监控数据价值的关键工具。


### 一、基础语法：精准定位时序数据
PromQL 的核心是通过“指标选择器”定位目标时序，并结合“时间范围”筛选数据，是所有复杂查询的基础。

#### 1. 指标选择器（Metric Selector）
指标选择器用于从 Prometheus 存储的所有指标中，筛选出符合条件的时序，分为指标名称匹配和标签过滤两部分，格式为：  
`{指标名称}{标签过滤条件}`

###### （1）指标名称匹配
- 精确匹配：直接指定指标名称，如 `node_cpu_seconds_total`（筛选所有名为“节点CPU累计秒数”的时序）。
- 模糊匹配（可选）：通过通配符 `*` 匹配多个指标，如 `node_*_seconds_total`（匹配所有以“node_”开头、“_seconds_total”结尾的指标）。

###### （2）标签过滤
标签（Labels）是时序数据的“维度属性”（如 `instance` 表示节点IP、`mode` 表示CPU状态），通过标签过滤可缩小数据范围，支持三种匹配逻辑：
| 操作符 | 含义                 | 示例                                  | 说明                                  |
|--------|----------------------|---------------------------------------|---------------------------------------|
| `=`    | 精确匹配             | `node_cpu_seconds_total{mode="idle"}` | 筛选“CPU空闲状态”的时序               |
| `!=`   | 不匹配               | `node_cpu_seconds_total{mode!="idle"}`| 筛选“CPU非空闲状态”的时序（如用户态、系统态） |
| `=~`   | 正则匹配（符合规则） | `node_cpu_seconds_total{instance=~"10.0.0.(1|2)"}` | 筛选IP为10.0.0.1或10.0.0.2的节点时序 |
| `!~`   | 正则不匹配（不符合） | `node_cpu_seconds_total{instance!~"10.0.0.*"}` | 排除IP以10.0.0.开头的节点时序         |

示例：筛选“job为node、instance为10.0.0.1的节点空闲CPU”时序  
`node_cpu_seconds_total{job="node", instance="10.0.0.1", mode="idle"}`


#### 2. 时间范围查询
PromQL 支持按“相对时间”或“绝对时间”筛选数据，默认查询“当前时间”的最新样本，如需历史数据需指定时间范围。

###### （1）相对时间范围
格式：`[时间长度]`，表示“过去N时间内的所有样本”，常用单位：`s`（秒）、`m`（分）、`h`（时）、`d`（天）。  
- 示例1：查询过去5分钟的空闲CPU数据  
  `node_cpu_seconds_total{mode="idle"}[5m]`  
- 示例2：查询过去1小时的节点内存使用数据  
  `node_memory_used_bytes[1h]`

###### （2）绝对时间点
格式：`@时间戳`（毫秒级），表示“指定时间点的样本”，需结合相对时间范围使用（定位该时间点前后的样本）。  
- 示例：查询1699996800000（2023-11-14 00:00:00）这个时间点前后10秒的CPU数据  
  `node_cpu_seconds_total{mode="idle"}[10s]@1699996800000`


### 二、常用操作符：实现数据计算与过滤
PromQL 支持算术运算、比较运算、逻辑运算三类操作符，可对时序数据进行数值计算或条件筛选，满足监控指标的“衍生分析”需求（如CPU使用率、磁盘使用率）。

#### 1. 算术运算：指标数值计算
用于对时序数据的样本值进行加减乘除等计算，支持 `+`、`-`、`*`、`/`、`%`（取余）、`^`（幂运算），常用于“比率计算”或“单位转换”。

###### 典型场景：CPU使用率计算
CPU使用率的核心逻辑是：`100% - 空闲CPU时间占比`，需结合 `rate()` 函数（计算指标在时间窗口内的平均增长率，处理累计指标）。  
公式：  
```promql
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance) * 100)
```
- 拆解：
  1. `rate(node_cpu_seconds_total{mode="idle"}[5m])`：计算每个节点过去5分钟空闲CPU的平均增长率（单位：秒/秒）；
  2. `avg(...) by (instance)`：按 `instance`（节点）分组，计算每个节点的空闲CPU平均增长率；
  3. 乘以100转为百分比，再用100减去，得到每个节点的CPU使用率。


#### 2. 比较运算：指标阈值筛选
用于判断样本值是否满足指定条件，结果为“布尔值”（1表示满足，0表示不满足），支持 `==`、`!=`、`>`、`<`、`>=`、`<=`，常用于“告警阈值判断”或“异常数据筛选”。

###### 典型场景：磁盘使用率告警阈值
筛选“根目录（/）使用率超过80%”的节点，核心逻辑是“已用磁盘空间 / 总磁盘空间 > 0.8”。  
公式：  
```promql
node_filesystem_usage_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} > 0.8
```
- 说明：
  - `node_filesystem_usage_bytes`：已用磁盘空间（字节）；
  - `node_filesystem_size_bytes`：总磁盘空间（字节）；
  - 结果为“1”的时序表示该节点根目录使用率超80%，可直接用于告警规则。


#### 3. 逻辑运算：多条件组合过滤
用于结合多个比较条件进行筛选，支持 `and`（同时满足）、`or`（满足其一）、`unless`（排除满足条件的时序），常用于“多维度异常判断”。

###### 典型场景：节点存活且负载过高
筛选“节点存活（up=1）且1分钟负载（load1）超过5”的节点，确保只监控“存活但异常”的节点。  
公式：  
```promql
up{job="node"} == 1 and node_load1{job="node"} > 5
```
- 说明：
  - `up{job="node"} == 1`：`up` 指标是 Prometheus 内置指标，1表示节点存活、0表示离线；
  - `node_load1`：节点1分钟平均负载，超过5通常表示负载过高；
  - `and` 确保两个条件同时满足，避免对离线节点误判。


### 三、聚合函数：多时序数据汇总分析
聚合函数用于将多个时序数据按指定维度（标签）汇总，得到“聚合后的单一或分组时序”，解决“多节点/多实例数据汇总”需求。PromQL 提供10+聚合函数，核心分为基础聚合和高级聚合。

#### 1. 基础聚合：常规统计（sum/avg/max/min）
- sum：求和，常用于“总流量”“总请求数”等汇总指标；
- avg：求平均值，常用于“平均响应时间”“平均使用率”；
- max/min：求最大值/最小值，常用于“峰值负载”“最低磁盘空间”。

###### 典型场景：
- 示例1：按 `job` 分组，计算所有节点的总内存使用量  
  `sum(node_memory_used_bytes) by (job)`  
- 示例2：按 `instance` 分组，计算每个节点的平均CPU使用率（基于前面的CPU使用率公式）  
  `avg(100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance) * 100)) by (instance)`  
- 示例3：查询所有节点的最大1分钟负载  
  `max(node_load1) by (instance)`

> 注意：`by (标签名)` 表示“按指定标签分组聚合”，若不写 `by`，则将所有时序聚合为1个（全局汇总）。


#### 2. 高级聚合：特殊场景统计（topk/quantile）
- topk(N, 指标)：取前N个最大的时序，常用于“Top N高负载节点”“Top N高QPS接口”；
- quantile(φ, 指标)：计算分位数（φ取值0~1），常用于“响应时间P95/P99”（95%/99%的请求响应时间低于该值），是衡量服务稳定性的核心指标。

###### 典型场景：
- 示例1：取CPU非空闲时间累计值前3的节点（定位高负载节点）  
  `topk(3, sum(node_cpu_seconds_total{mode!="idle"}) by (instance))`  
- 示例2：计算接口响应时间的P95值（按 `path` 分组，确保95%请求响应时间达标）  
  `quantile(0.95, http_request_duration_seconds_sum / http_request_duration_seconds_count) by (path)`  
  - 拆解：`http_request_duration_seconds_sum`（请求总耗时）/ `http_request_duration_seconds_count`（请求总数）= 平均响应时间，再用 `quantile(0.95)` 计算P95值。


### 四、常见查询场景实战：覆盖核心监控维度
PromQL 的价值最终落地于“实际监控场景”，以下按系统指标、应用指标、中间件指标三类核心场景，提供可直接复用的查询公式。

#### 1. 系统指标：服务器硬件监控
| 监控目标       | PromQL 查询公式                                                                 |
|----------------|---------------------------------------------------------------------------------|
| CPU使用率（%） | `100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance) * 100)` |
| 内存使用率（%）| `(node_memory_used_bytes - node_memory_cached_bytes - node_memory_buffers_bytes) / node_memory_total_bytes * 100` |
| 根目录使用率（%） | `node_filesystem_usage_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100` |
| 磁盘读IO（MB/s） | `rate(node_disk_read_bytes_total[5m]) / 1024 / 1024`                             |
| 网络出流量（MB/s） | `rate(node_network_transmit_bytes_total{device!~"lo|docker0"}[5m]) / 1024 / 1024` |
| 节点存活状态   | `up{job="node"}`（1=存活，0=离线）                                               |


#### 2. 应用指标：业务接口监控
假设应用通过自定义 Exporter 暴露了 `http_requests_total`（请求总数，Counter类型）、`http_request_duration_seconds`（请求耗时，Histogram类型），查询公式如下：

| 监控目标       | PromQL 查询公式                                                                 |
|----------------|---------------------------------------------------------------------------------|
| 接口QPS        | `rate(http_requests_total{path="/api/login"}[5m]) by (path, method)`             |
| 接口错误率（%） | `rate(http_requests_total{path="/api/login", status=~"5.."}[5m]) / rate(http_requests_total{path="/api/login"}[5m]) * 100` |
| 接口响应时间P95（秒） | `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (path, le))` |
| 接口请求总量   | `sum(http_requests_total{path="/api/login"}) by (path)`                          |


#### 3. 中间件指标：数据库/缓存/代理监控
###### （1）MySQL 监控（基于 MySQL Exporter）
| 监控目标         | PromQL 查询公式                                                                 |
|------------------|---------------------------------------------------------------------------------|
| 活跃连接数       | `mysql_connections{state="active"} by (instance)`                                |
| 慢查询总数       | `mysql_slow_queries_total by (instance)`                                         |
| 增删改查请求量   | `sum(rate(mysql_statement_seconds_count{operation=~"insert|update|delete|select"}[5m])) by (operation, instance)` |

###### （2）Redis 监控（基于 Redis Exporter）
| 监控目标         | PromQL 查询公式                                                                 |
|------------------|---------------------------------------------------------------------------------|
| 内存占用（MB）   | `redis_memory_used_bytes / 1024 / 1024 by (instance)`                            |
| 已使用数据库数量 | `redis_db_keys by (instance, db)`                                                |
| 客户端连接数     | `redis_connected_clients by (instance)`                                          |

###### （3）Nginx 监控（基于 Nginx Exporter）
| 监控目标         | PromQL 查询公式                                                                 |
|------------------|---------------------------------------------------------------------------------|
| 总请求数         | `sum(rate(nginx_http_requests_total[5m])) by (instance)`                          |
| 4xx错误数        | `sum(rate(nginx_http_requests_total{status=~"4.."}[5m])) by (instance)`           |
| 平均响应时间（秒） | `sum(rate(nginx_http_request_duration_seconds_sum[5m])) by (instance) / sum(rate(nginx_http_request_duration_seconds_count[5m])) by (instance)` |


通过上述实战场景，可快速掌握 PromQL 的应用逻辑：先通过指标选择器定位基础指标，再结合操作符/聚合函数实现衍生分析，最终落地为业务可理解的监控指标。实际使用中，可基于这些公式灵活调整标签、时间窗口或函数，适配具体业务场景。


## 3.4 Alertmanager：告警配置与分发

Alertmanager是Prometheus生态中负责告警管理的核心组件，它能够对Prometheus Server触发的告警进行有效处理和分发。以下是关于Alertmanager告警配置与分发的详细介绍：

### 告警流程
1. Prometheus Server触发告警：Prometheus Server根据配置的告警规则（在Prometheus.yml中定义），使用PromQL表达式对监控数据进行评估。当表达式的条件满足时，且达到了触发时长（for）的要求，Prometheus Server就会生成告警事件，并将其发送给Alertmanager。
2. Alertmanager处理：Alertmanager接收到来自Prometheus Server的告警事件后，会依次进行去重、分组、抑制和路由等处理。它会根据配置的分组规则将相似的告警聚合成组，根据抑制规则判断是否抑制某些告警，再根据路由规则确定告警应该发送到哪个接收器。
3. 通知接收：Alertmanager根据最终确定的接收器，将告警通知通过相应的渠道发送出去，如邮件、即时通讯工具等，以便相关人员能够及时收到告警信息并进行处理。

### 告警规则配置（Prometheus.yml）
你提供的示例配置如下：
```yaml
groups:
- name: node_alerts
  rules:
  - alert: HighCPUUsage
    expr: avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance) > 0.8
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "实例{{ $labels.instance }}CPU使用率过高"
      description: "{{ $labels.instance }} CPU使用率已持续2分钟超过80%，当前值：{{ $value | humanizePercentage }}"
```
- alert：告警名称，如“HighCPUUsage”，用于标识该告警的具体类型。
- expr：PromQL表达式，是告警规则的核心，用于定义触发告警的条件。在这个例子中，表达式`avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance) > 0.8`表示计算过去5分钟内每个实例的非空闲CPU时间的平均速率，并判断其是否大于0.8。
- for：触发时长，即告警条件持续满足多长时间后才会真正触发告警。这里设置为2m，意味着CPU使用率超过80%的情况持续2分钟后，才会生成告警。
- labels：标签，用于为告警添加额外的元数据信息，方便在Alertmanager中进行分组、路由等操作。这里添加了`severity: critical`标签，表示该告警的严重级别为“critical”。
- annotations：注释，主要用于提供更详细的告警描述信息，这些信息会在告警通知中显示。

### Alertmanager核心功能
- 告警分组（Grouping）：Alertmanager可以根据用户在配置文件中定义的分组规则，将具有相同标签的告警归为一组。例如，配置`group_by: ('alertname','severity')`表示告警将根据`alertname`和`severity`标签进行分组。通过合理的分组策略，可以减少通知的数量，避免告警风暴，使告警更易于管理和响应。
- 告警抑制（Inhibition）：告警抑制是指当一个高优先级的告警触发时，自动抑制掉一些低优先级的相关告警。例如，当“MySQL服务挂掉”的高优先级告警触发时，可能会导致“MySQL主从不同步”的低优先级告警也会产生，此时可以通过配置告警抑制规则，抑制掉“MySQL主从不同步”的告警，避免重复发送，只发送主要告警原因。
- 告警路由（Routing）：Alertmanager的路由功能基于告警信息中的标签进行匹配。用户可以在配置文件中定义多个路由规则，每个规则可以包含一个或多个匹配条件。当告警信息到达Alertmanager时，它会按照配置文件中定义的顺序依次匹配路由规则，直到找到匹配的规则并将告警发送到相应的接收器。例如，配置`- match: severity: 'critical' receiver: 'critical_alerts'`表示当告警的`severity`标签为`critical`时，将告警发送到名为`critical_alerts`的接收器。

### 通知渠道配置
- 邮件通知（SMTP服务器配置）：在Alertmanager的配置文件中，可以通过全局配置段来配置邮件通知。例如：
```yaml
global:
  smtp_from: "alertmanager@example.com"
  smtp_smarthost: "smtp.example.com:587"
  smtp_auth_username: "user"
  smtp_require_tls: true
```
其中，`smtp_from`指定发件人地址，`smtp_smarthost`指定SMTP服务器地址和端口，`smtp_auth_username`指定认证用户名，`smtp_require_tls`指定是否要求TLS加密。
- 即时通讯通知（钉钉机器人、企业微信机器人、Slack Webhook）：对于钉钉机器人、企业微信机器人和Slack Webhook等即时通讯通知渠道，也可以在Alertmanager的配置文件中进行配置。以Slack为例，在全局配置段中添加如下配置：
```yaml
global:
  slack_api_url: "https://hooks.slack.com/services/..."
```
然后在接收器配置中，指定使用Slack接收器即可。
- 告警级别映射（critical→电话+短信，warning→钉钉）：可以通过在Alertmanager的路由配置中，根据告警的级别（如`severity`标签的值）来选择不同的接收器，从而实现告警级别映射。例如：
```yaml
route:
  group_by: ('alertname','severity')
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 3h
  receiver: 'default'
  routes:
  - match: severity: 'critical'
    receiver: 'critical_alerts'
  - match: severity: 'warning'
    receiver: 'warning_alerts'
```
其中，`critical_alerts`接收器可以配置为电话+短信通知方式，`warning_alerts`接收器可以配置为钉钉通知方式。


## 4.1 课程总结

Prometheus作为一款强大的开源监控与告警工具，在系统监控领域发挥着关键作用。其核心功能涵盖数据抓取、存储、查询以及告警等多个方面。

在数据抓取环节，Prometheus Server主要通过HTTP从监控目标拉取数据，这些目标包括Exporter、PushGateway以及通过服务发现机制识别的各类服务实例。Exporter负责将第三方服务的监控数据转化为Prometheus可识别的格式，PushGateway则为短生命周期服务提供了数据推送的途径。

Prometheus采用时序数据库（TSDB）进行数据存储，其本地存储机制依赖块存储结构。新采集的数据先写入WAL以保障数据持久化，随后进入Head Block进行实时查询，后台会定期对数据进行Compaction操作，将小粒度块合并为大粒度块，去除重复数据并执行降采样，以此提升存储效率。同时，通过Retention策略，依据设定的数据保留时间或存储大小限制，自动清理过期数据块，维持存储资源的合理利用。在存储配置优化方面，可灵活调整数据保留时间（retention.time）和存储大小限制（retention.size），还能通过启用WAL压缩、优化块压缩与索引等手段，进一步减少磁盘占用并提升查询性能。当本地存储无法满足需求时，Prometheus可借助远程存储集成扩展能力，与Thanos、Cortex等方案对接。以Thanos为例，通过Thanos Sidecar将本地块同步至对象存储，Thanos Query实现跨集群统一查询，从而突破本地存储的局限。 

PromQL作为Prometheus的查询语言，功能丰富且灵活。基础语法通过指标选择器精准定位时序数据，结合时间范围查询筛选特定时段的数据。常用操作符支持算术运算（如计算CPU使用率）、比较运算（如设置磁盘使用率告警阈值）以及逻辑运算（如多条件过滤节点状态），满足多样化的数据分析需求。聚合函数包括基础聚合（sum、avg、max、min等）和高级聚合（topk、quantile等），用于对多时序数据进行汇总分析，例如按实例或业务线统计资源使用总量、获取前N个高负载节点等。在常见查询场景中，PromQL能够轻松应对系统指标（如CPU、内存、磁盘IO、网络流量）、应用指标（如接口QPS、响应时间、错误率）以及中间件指标（如MySQL连接数、Redis内存占用、Nginx请求量）的查询与分析，为运维和开发人员提供有力的数据洞察支持。 

告警方面，Prometheus与Alertmanager协同工作。告警流程始于Prometheus Server依据配置的告警规则触发告警，这些规则在Prometheus.yml中定义，包含告警名称、PromQL表达式、触发时长（for）、标签与注释等关键要素。当告警条件满足且持续达到设定时长，告警事件便会发送至Alertmanager。Alertmanager具备强大的告警处理功能，告警分组可按实例或业务线聚合相似告警，有效避免告警风暴；告警抑制能在高优先级告警触发时抑制低优先级告警，减少冗余通知；告警路由则依据标签将告警精准路由至不同接收者。在通知渠道配置上，支持邮件（需配置SMTP服务器）、即时通讯工具（如钉钉机器人、企业微信机器人、Slack Webhook）等多种方式，并且能够根据告警级别（如critical、warning）灵活映射到不同的通知策略，确保相关人员及时且精准地接收告警信息，以便快速响应和处理系统异常 。
