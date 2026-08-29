---
title: "异步任务处理让系统吞吐量提升10倍的核心策略"
published: 2026-08-25
description: "定义 Kafka 生产者服务接口"
image: ''
tags: [分布式, 实战, 演进]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course16-3-4
pinned: false
comment: true
---

### Kafka 生产者实现


定义 Kafka 生产者服务接口：

```java
package com.example.rednote.service;

import com.example.rednote.dto.UserActionEvent;

/**
 * KafkaProducerService Kafka生产者服务
 *
 * @version 2025/09/05
 **/
public interface KafkaProducerService {
    /**
     * 发送用户行为事件
     *
     * @param userActionEvent
     */
    void sendUserActionEvent(UserActionEvent userActionEvent);
}
```

Kafka 生产者服务实现：

```java
package com.example.rednote.service.impl;

import com.example.rednote.config.KafkaConfig;
import com.example.rednote.dto.UserActionEvent;
import com.example.rednote.service.KafkaProducerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * KafkaProducerServiceImpl Kafka生产者服务
 *
 * @version 2025/09/05
 **/
@Service
public class KafkaProducerServiceImpl implements KafkaProducerService {

    private static final Logger log = LoggerFactory.getLogger(KafkaProducerServiceImpl.class);

    @Autowired
    private KafkaTemplate<String, UserActionEvent> kafkaTemplate;

    @Override
    public void sendUserActionEvent(UserActionEvent userActionEvent) {
        // 使用用户ID作为分区Key，确保相同用户的行为在同一分区内
        String key = String.valueOf(userActionEvent.getUserId());

        // 发送消息到Kafka
        CompletableFuture<SendResult<String, UserActionEvent>> future = kafkaTemplate.send(KafkaConfig.TOPIC_USER_ACTION, key, userActionEvent);

        // 添加回调
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("消息发送成功");
            } else {
                log.error("消息发送失败", ex);
            }
        });
    }
}
```


### 行为日志处理与存储

NoteService服务增加如下接口：

```java
/**
 * 递增访问量
 *
 * @param noteId
 */
void incrementBrowseCount(Long noteId);

/**
 * 递增访问时长
 *
 * @param noteId
 * @param browseTime
 */
void incrementBrowseTime(Long noteId, long browseTime);
```


NoteServiceImpl服务增加如下接口：

```java
private static final String BROWSE_COUNT_KEY = "rednote:note:browse_count";

private static final String BROWSE_TIME_KEY = "rednote:note:browse_time";

@Override
public void increaseBrowseCount(Long noteId) {
    redisTemplate.opsForZSet().incrementScore(BROWSE_COUNT_KEY, noteId.toString(), 1);
}

@Override
public void increaseBrowseTime(Long noteId, Long browseTime) {
    redisTemplate.opsForZSet().incrementScore(BROWSE_TIME_KEY, noteId.toString(), browseTime);
}
```

### 实时分析消费者


RealTimeAnalysisService接口如下：


```java
package com.example.rednote.service;

import com.example.rednote.dto.UserActionEvent;

/**
 * RealTimeAnalysisService 实时分析服务
 *
 * @version 2025/09/05
 **/
public interface RealTimeAnalysisService {
    /**
     * 实时统计热门笔记
     *
     * @return
     */
    void analyzeHotNotes(UserActionEvent userActionEvent);
}
```


RealTimeAnalysisServiceImpl接口如下：


```java
package com.example.rednote.service.impl;

import com.example.rednote.config.KafkaConfig;
import com.example.rednote.dto.BrowseEvent;
import com.example.rednote.dto.CommentEvent;
import com.example.rednote.dto.LikeEvent;
import com.example.rednote.dto.UserActionEvent;
import com.example.rednote.service.NoteService;
import com.example.rednote.service.RealTimeAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * RealTimeAnalysisServiceImpl 实时分析服务
 *
 * @version 2025/09/05
 **/
@Service
public class RealTimeAnalysisServiceImpl implements RealTimeAnalysisService {

    @Autowired
    private NoteService noteService;

    @Override
    @KafkaListener(topics = KafkaConfig.TOPIC_USER_ACTION)
    public void analyzeHotNotes(@Payload UserActionEvent userActionEvent) {
        if (userActionEvent instanceof BrowseEvent) {
            BrowseEvent browseEvent = (BrowseEvent) userActionEvent;

            Long noteId = browseEvent.getNoteId();
            long browseTime = browseEvent.getBrowseTime();

            // 调用服务增加笔记访问量
            noteService.incrementBrowseCount(noteId);

            // 调用服务增加笔记浏览时长
            noteService.incrementBrowseTime(noteId, browseTime);
        } else if (userActionEvent instanceof LikeEvent) {
            // TODO
        } else if (userActionEvent instanceof CommentEvent) {
            // TODO
        }
    }
}
```
