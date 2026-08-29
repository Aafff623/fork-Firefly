---
title: "善用AI，掌握校验、数据库操作、加密及性能优化技巧"
published: 2026-08-25
description: "1. 前端校验不可信，改为后端校验"
image: ''
tags: [Java, Spring Boot, 实战, 小红书]
category: 指南
collections: [java-fullstack, java-fullstack-monolith]
draft: false
lang: ''
slug: java-course8-4-10
pinned: false
comment: true
---

### 校验技巧

1. 前端校验不可信，改为后端校验
2. 使用Validation简化校验
3. 善用AI，但不要迷信AI

### 数据库操作技巧

1. JPA简化数据库操作
2. 开发环境：通常使用create-drop或create、update，以便每次启动应用时都有最新的数据库结构。
3. 测试环境：使用create-drop或create，确保每次测试都是在一个干净的环境中。
4. 生产环境：通常使用none或validate，以避免在生产数据库中不小心更改表结构或数据。
5. 开发、测试时可以打印SQL，以便于观察数据SQL的执行情况

### 加密技巧

1. 盐值自动生成：
   - BCrypt 会自动生成随机盐值，并将其包含在加密后的密码字符串中
   - 无需手动管理盐值，相同密码每次加密结果都不同

2. 密码强度：
   - 默认强度为 10，数值越大加密越慢但安全性更高
   - 可通过 `new BCryptPasswordEncoder(12)` 指定强度

3. 存储要求：
   - 加密后的密码长度固定为 60 个字符
   - 数据库字段应设置为 `VARCHAR(60)` 或更大

4. 安全建议：
   - 永远不要存储明文密码
   - 使用 HTTPS 保护密码传输
   - 定期升级 BCrypt 强度

### 前端性能优化

1. 使用压缩后的CSS、JS文件
2. LOGO等图片尺寸尽可能压缩到合适的最新尺寸。比如一张`300*300`分辨率的图片，占用的体积是7.97KB，经过压缩，将尺寸调整为`64*64`分辨率，则占用的体积为783B，仅原来的十分之一。
