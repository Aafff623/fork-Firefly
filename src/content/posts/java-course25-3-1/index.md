---
title: "Docker Compose编排仿“小红书”全栈项目"
published: 2026-08-25
description: "yml"
image: ''
tags: [Docker, 容器化, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course25-3-1
pinned: false
comment: true
---

```yml
services:
  rednote-file-microservice:
    image: rednote-file-microservice:1.0.0
    hostname: rednote-file-microservice
    container_name: rednote-file-microservice
    deploy:
      resources:
        limits:
          memory: 1G
    ports:
      - "9010:9010"
  rednote-user-microservice:
    image: rednote-user-microservice:1.0.0
    hostname: rednote-user-microservice
    container_name: rednote-user-microservice
    deploy:
      resources:
        limits:
          memory: 1G
    ports:
      - "9020:9020"    
  rednote-content-microservice:
    image: rednote-content-microservice:1.0.0
    hostname: rednote-content-microservice
    container_name: rednote-content-microservice
    deploy:
      resources:
        limits:
          memory: 1G
    ports:
      - "9030:9030"     
  rednote-admin-microservice:
    image: rednote-admin-microservice:1.0.0
    hostname: rednote-admin-microservice
    container_name: rednote-admin-microservice
    deploy:
      resources:
        limits:
          memory: 1G
    ports:
      - "9040:9040"           
  rednote-ai-microservice:
    image: rednote-ai-microservice:1.0.0
    hostname: rednote-ai-microservice
    container_name: rednote-ai-microservice
    deploy:
      resources:
        limits:
          memory: 1G
    ports:
      - "9050:9050"    
  rednote-gateway-microservice:
    image: rednote-gateway-microservice:1.0.0
    hostname: rednote-gateway-microservice
    container_name: rednote-gateway-microservice
    deploy:
      resources:
        limits:
          memory: 1G
    ports:
      - "8080:8080"       
  rednote-ui:
    image: rednote-ui:1.0.0
    hostname: rednote-ui
    container_name: rednote-ui
    deploy:
      resources:
        limits:
          memory: 1G
    ports:
      - "80:80" 
    depends_on:
      - rednote-file-microservice
      - rednote-user-microservice  
      - rednote-content-microservice  
      - rednote-admin-microservice
      - rednote-ai-microservice  
      - rednote-gateway-microservice 
```

```
docker-compose up -d

docker-compose down
```
