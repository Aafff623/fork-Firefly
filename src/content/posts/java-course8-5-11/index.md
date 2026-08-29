---
title: "安全经验总结及性能优化技巧"
published: 2026-08-25
description: "1. 登录处理"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-5-11
pinned: false
comment: true
---

### 经验总结

1. 登录处理：
   - 示例中使用简单的用户名密码比对
   - 实际项目中应使用 Spring Security 进行安全认证
   - 密码应使用 BCrypt 等强哈希算法加密存储

2. 错误处理：
   - 登录失败时通过重定向传递错误参数
   - 登录页面根据错误参数显示相应错误信息

3. 安全处理：
   - 永远不要明文存储密码
   - 实现密码加密和盐值处理
   - 添加 CSRF 保护（Spring Security 默认启用）

4. 会话超时配置：
   - 在 `application.properties` 中设置全局超时

5. 合理配置最大会话数：
   - 根据业务需求设置 `maximumSessions`
   - 考虑是否允许新登录踢掉旧会话（`maxSessionsPreventsLogin`）

### 优化建议


1. 安全建议：
   - 使用 HTTPS 保护登录过程

2. 监控会话使用情况：
   - 通过 SessionRegistry 实现会话监控仪表盘
   - 定期清理过期会话数据

3. 分布式环境处理：
   - 使用 Redis 或其他分布式存储实现 SessionRegistry
   - 考虑会话序列化和反序列化问题

4. 性能优化：
   - 在高并发场景下，注意 SessionRegistry 实现的线程安全性
   - 避免频繁查询 SessionRegistry，考虑缓存策略
