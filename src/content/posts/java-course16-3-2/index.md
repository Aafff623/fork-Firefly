---
title: "Kafka在用户行为日志收集中的深度应用"
published: 2026-08-25
description: "在仿“小红书”项目中，用户行为日志（如浏览、点赞、收藏、评论等）是非常宝贵的数据资产。使用 Kafka 实现日志收集，可以帮助你构建高性能、可扩展的日志处理系统。以下是详细的实现方案"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-3-2
pinned: false
comment: true
---

在仿“小红书”项目中，用户行为日志（如浏览、点赞、收藏、评论等）是非常宝贵的数据资产。使用 Kafka 实现日志收集，可以帮助你构建高性能、可扩展的日志处理系统。以下是详细的实现方案：


### 一、日志收集系统架构

```
+----------------+    +----------------+    +----------------+    +----------------+
|   前端应用     |    |   后端服务     |    |    Kafka       |    |  日志处理系统  |
+----------------+    +----------------+    +----------------+    +----------------+
      |                      |                      |                      |
      v                      v                      v                      v
+----------------+    +----------------+    +----------------+    +----------------+
|  用户行为埋点  |    | Kafka Producer |    |  日志主题       |    | Kafka Consumer |
+----------------+    +----------------+    +----------------+    +----------------+
                                                         |                      |
                                                         v                      v
                                                  +----------------+    +----------------+
                                                  |  数据存储      |    |  实时分析      |
                                                  +----------------+    +----------------+
```


### 二、用户行为数据模型设计

#### 1. 基础行为日志模型


所有行为日志的基类

```java
package com.example.rednote.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * UserActionEvent 行为日志的基类
 *
 * @version 2025/09/05
 **/
@Getter
@Setter
public abstract class UserActionEvent {
    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户代理
     */
    private String userAgent;

    /**
     * 时间戳
     */
    private LocalDateTime timestamp;
}
```


浏览事件

```java
package com.example.rednote.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * BrowseEvent 浏览事件
 *
 * @version 2025/09/05
 **/
@Getter
@Setter
public class BrowseEvent extends UserActionEvent {
    /**
     * 笔记ID
     */
    private Long noteId;

    /**
     * 浏览时长（秒）
     */
    private long browseTime;
}
```


点赞事件

```java
package com.example.rednote.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * LikeEvent 点赞事件
 *
 * @version 2025/09/05
 **/
@Getter
@Setter
public class LikeEvent extends UserActionEvent {
    /**
     * 笔记ID
     */
    private Long noteId;

    /**
     * 点赞/取消点赞
     */
    private boolean isLike;
}
```


评论事件

```java
package com.example.rednote.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * CommentEvent 评论事件
 *
 * @version 2025/09/05
 **/
@Getter
@Setter
public class CommentEvent extends UserActionEvent {
    /**
     * 笔记ID
     */
    private Long noteId;
    /**
     * 评论ID
     */
    private Long commentId;
    /**
     * 评论内容
     */
    private String content;
}
```


### 三、Kafka 主题与分区设计

主题与分区配置如下：

```java
package com.example.rednote.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.config.TopicConfig;
import org.springframework.kafka.config.TopicBuilder;

/**
 * KafkaConfig Kafka配置
 *
 * @version 2025/09/05
 **/
public class KafkaConfig {
    /**
     * 用户行为的主题
     */
    public static final String TOPIC_USER_ACTION = "user-action";

    /**
     * 创建用户行为的主题
     */
    public NewTopic userActionTopic() {
        return TopicBuilder.name(TOPIC_USER_ACTION)
                // 根据浏览设置分区数
                .partitions(3)
                // 数据保留1天
                .config(TopicConfig.RETENTION_MS_CONFIG, "86400000")
                .build();
    }
}
```
