---
title: "内容领域微服务数据同步"
published: 2026-08-25
description: "应用启动之后，会初始化tnote等表。"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-6-8
pinned: false
comment: true
---

应用启动之后，会初始化t_note等表。

```
mysql> SHOW tables;
+----------------------------------+
| Tables_in_rednote_content_domain |
+----------------------------------+
| note_images                      |
| note_topics                      |
| t_comment                        |
| t_comment_seq                    |
| t_like                           |
| t_like_seq                       |
| t_note                           |
| t_note_seq                       |
| undo_log                         |
+----------------------------------+
9 rows in set (0.030 sec)
```


### 同步数据

从rednote同步用户数据到rednote_content_domain，主要涉及t_note、t_like、t_comment、note_topics、note_images、t_note_seq、t_like_seq、t_comment_seq等表。


同步t_note表：

```sql
-- 清空表数据
TRUNCATE TABLE rednote_content_domain.t_note;

-- 前提：确保目标库 rednote_content_domain 已存在 t_note 表，且表结构与源表一致
INSERT INTO rednote_content_domain.t_note 
(
  note_id, user_id, title, category, content, create_at, update_at
)
SELECT 
  note_id, user_id, title, category, content, create_at, update_at
FROM rednote.t_note;
```


同步t_like表：

```sql
-- 清空表数据
TRUNCATE TABLE rednote_content_domain.t_like;

-- 前提：确保目标库 rednote_content_domain 已存在 t_like 表，且表结构与源表一致
INSERT INTO rednote_content_domain.t_like 
(
  note_id, user_id, like_id, create_at
)
SELECT 
  note_id, user_id, like_id, create_at
FROM rednote.t_like;
```


同步t_comment表：

```sql
-- 清空表数据
TRUNCATE TABLE rednote_content_domain.t_comment;

-- 前提：确保目标库 rednote_content_domain 已存在 t_comment 表，且表结构与源表一致
INSERT INTO rednote_content_domain.t_comment 
(
  note_id, user_id, comment_id, content, create_at, parent_id
)
SELECT 
  note_id, user_id, comment_id, content, create_at, parent_id
FROM rednote.t_comment;
```


同步note_topics表：

```sql
-- 清空表数据
TRUNCATE TABLE rednote_content_domain.note_topics;

-- 前提：确保目标库 rednote_content_domain 已存在 note_topics 表，且表结构与源表一致
INSERT INTO rednote_content_domain.note_topics 
(
  note_note_id, topics
)
SELECT 
  note_note_id, topics
FROM rednote.note_topics;
```


同步note_images表：

```sql
-- 清空表数据
TRUNCATE TABLE rednote_content_domain.note_images;

-- 前提：确保目标库 rednote_content_domain 已存在 note_images 表，且表结构与源表一致
INSERT INTO rednote_content_domain.note_images 
(
  note_note_id, images
)
SELECT 
  note_note_id, images
FROM rednote.note_images;
```


同步t_note_seq表：

```sql
-- 清空表数据
TRUNCATE TABLE rednote_content_domain.t_note_seq;

-- 前提：确保目标库 rednote_content_domain 已存在 t_note_seq 表，且表结构与源表一致
INSERT INTO rednote_content_domain.t_note_seq 
(
  next_val
)
SELECT 
  next_val
FROM rednote.t_note_seq;
```

同步t_like_seq表：

```sql
-- 清空表数据
TRUNCATE TABLE rednote_content_domain.t_like_seq;

-- 前提：确保目标库 rednote_content_domain 已存在 t_like_seq 表，且表结构与源表一致
INSERT INTO rednote_content_domain.t_like_seq 
(
  next_val
)
SELECT 
  next_val
FROM rednote.t_like_seq;
```


同步t_comment_seq表：

```sql
-- 清空表数据
TRUNCATE TABLE rednote_content_domain.t_comment_seq;

-- 前提：确保目标库 rednote_content_domain 已存在 t_comment_seq 表，且表结构与源表一致
INSERT INTO rednote_content_domain.t_comment_seq 
(
  next_val
)
SELECT 
  next_val
FROM rednote.t_comment_seq;
```
