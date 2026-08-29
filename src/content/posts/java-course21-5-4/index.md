---
title: "针对用户领域微服务的数据库配置"
published: 2026-08-25
description: "创建名为“rednoteuserdomain”新的数据库"
image: ''
tags: [微服务, 实战, 改造]
category: 指南
collections: [java-fullstack, java-fullstack-microservices]
draft: false
lang: ''
slug: java-course21-5-4
pinned: false
comment: true
---

### 初始化数据库和表

创建名为“rednote_user_domain”新的数据库：

```sql
CREATE DATABASE rednote_user_domain;
```

Seata 的 AT 模式需要通过 undo_log 表来实现分布式事务的回滚功能。因此，需要手动创建 undo_log 表。


```sql
CREATE TABLE `undo_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `branch_id` bigint(20) NOT NULL,
  `xid` varchar(100) NOT NULL,
  `context` varchar(128) NOT NULL,
  `rollback_info` longblob NOT NULL,
  `log_status` int(11) NOT NULL,
  `log_created` datetime NOT NULL,
  `log_modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
```


### 修改数据库配置


rednote改为rednote_user_domain

```
spring.datasource.url=jdbc:mysql://localhost:3306/rednote_user_domain
```

应用启动之后，会初始化t_user等表。

```
mysql> SHOW tables;
+-------------------------------+
| Tables_in_rednote_user_domain |
+-------------------------------+
| t_user                        |
| t_user_seq                    |
| undo_log                      |
+-------------------------------+
3 rows in set (0.019 sec)
```


### 同步数据

从rednote同步用户数据到rednote_user_domain：

```sql
-- 清空表数据
TRUNCATE TABLE rednote_user_domain.t_user;

-- 前提：确保目标库 rednote_user_domain 已存在 t_user 表，且表结构与源表一致
INSERT INTO rednote_user_domain.t_user 
(
  user_id, username, password, role, bio, phone, avatar
)
SELECT 
  user_id, username, password, role, bio, phone, avatar
FROM rednote.t_user
ON DUPLICATE KEY UPDATE 
  -- 当主键/唯一键冲突时，更新指定字段（按需调整）
  username = VALUES(username),
  password = VALUES(password),
  role = VALUES(role),
  bio = VALUES(bio),
  phone = VALUES(phone),
  avatar = VALUES(avatar);
```  


同步t_user_seq表：

```sql
-- 清空表数据
TRUNCATE TABLE rednote_user_domain.t_user_seq;

-- 前提：确保目标库 rednote_user_domain 已存在 t_user_seq 表，且表结构与源表一致
INSERT INTO rednote_user_domain.t_user_seq 
(
  next_val
)
SELECT 
  next_val
FROM rednote.t_user_seq;
```


### 删除多余的配置文件


将`rednote-common`模块下的resources目录删除。

### 移除Spring Boot DevTools

启动应用会报这个错：`ClassNotFoundException: com.example.rednote.common.config.WebMvcConfig$$SpringCGLIB$$0`

这个错误表明Seata在扫描业务Bean时试图加载一个不存在的CGLIB代理类。这是由于Seata与Spring Boot DevTools之间的兼容性问题导致的。

错误分析如下。

- 发生位置：Seata的`GlobalTransactionScanner`在扫描需要增强的业务Bean时
- 根本原因：Seata尝试加载由Spring CGLIB创建的代理类，但该类在类路径中不存在

解决方案排除DevTools重启类加载器影响。可以从父模块的pom.xml中移除DevTools依赖：

```xml
<!-- 暂时移除这段依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```
