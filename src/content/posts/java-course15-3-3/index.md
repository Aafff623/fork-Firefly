---
title: "PromQL：Prometheus查询语言"
published: 2026-08-25
description: "PromQL（Prometheus Query Language）是 Prometheus 生态的“查询核心”，用于从时序数据库中提取、计算和分析监控数据，支撑可视化仪表盘与告警规则配置。其设计围绕时…"
image: ''
tags: [Prometheus, 监控, Grafana]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course15-3-3
pinned: false
comment: true
---

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
