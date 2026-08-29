---
title: "Alertmanager：告警配置与分发"
published: 2026-08-25
description: "Alertmanager是Prometheus生态中负责告警管理的核心组件，它能够对Prometheus Server触发的告警进行有效处理和分发。以下是关于Alertmanager告警配置与分发的详…"
image: ''
tags: [Prometheus, 监控, Grafana]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course15-3-4
pinned: false
comment: true
---

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
