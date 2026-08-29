---
title: "数据采集：Exporter与数据暴露"
published: 2026-08-25
description: "在 Prometheus 生态中，数据采集是监控体系的“数据源入口”，而 Exporter 是实现这一环节的核心工具。其核心逻辑是通过标准化的 HTTP 接口暴露指标、按规则配置采集策略，最终将分散的…"
image: ''
tags: [Prometheus, 监控, Grafana]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course15-3-1
pinned: false
comment: true
---

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
