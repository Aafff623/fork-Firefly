---
title: "环境搭建：快速部署Prometheus生态"
published: 2026-08-25
description: "Prometheus 生态的部署需根据场景（学习测试、生产环境）选择不同方案，核心目标是实现“数据采集-存储-可视化-告警”的全链路打通。以下从单机部署（轻量场景）、分布式部署（生产场景）和基础配置验…"
image: ''
tags: [Prometheus, 监控, Grafana]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course15-2-3
pinned: false
comment: true
---

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
