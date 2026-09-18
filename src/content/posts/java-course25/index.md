---
title: "文件服务容器化改造（Java 课程 25 · 全 8 节合订）"
published: 2026-09-18
description: "全栈视角下的文件服务容器化改造。"
image: ''
tags: [Docker, 容器化, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course25
pinned: false
comment: true
---
> 本页为原「Java 课程 25」全部 8 个分节的合订本；原分节链接会自动跳转到本页。


## 2.1 如何进行全栈视角下的实现文件服务容器化改造？

### MongoDB设置账号密码


#### 接到 MongoDB
打开另一个终端窗口，使用 mongosh 命令连接到 MongoDB：


列出当前 MongoDB 实例的可用数据库：

```
db.getMongo().getDBNames()
```


#### 切换到 rednote 数据库
使用 rednote 数据库来创建用户：


```
use rednote
```


#### 创建用户
使用以下命令创建一个具有权限的用户：


```js
db.createUser({
    user: "admin",           // 替换为你的用户名
    pwd: "admin123",      // 替换为你的密码
    roles: [{ role: "readWrite", db: "rednote" }]
})
```

验证下

```
db.auth("admin", "admin123")
```


#### 修改MonngoDB配置文件

# 原为 127.0.0.1，改为 0.0.0.0 允许所有IP访问

```
net:
  bindIp: 0.0.0.0  # 原为 127.0.0.1，改为 0.0.0.0 允许所有IP访问
```


### 开放 MySQL 远程连接

默认情况下 MySQL 仅允许本地访问。以下是开启 MySQL 远程连接的详细步骤。

#### 1. 修改 MySQL 用户权限

登录 MySQL：

```
mysql -u root -p
```


顾名思义，该方法就是直接修改更改“mysql”数据库里的“user”表里的“host”列，将“localhost”改为“%”。

```
use mysql;
select user,host from user;
update user set host='%' where user='root';
```


### 修改服务地址


将所有领域微服务应用的配置中的localhost、127.0.0.1 改为实际IP地址：


```
# 配置 MongoDB
#spring.data.mongodb.uri=mongodb://localhost:27017
spring.data.mongodb.grid-fs-database=rednote_files
spring.data.mongodb.host=192.168.68.157
spring.data.mongodb.port=27017
spring.data.mongodb.username=admin
spring.data.mongodb.password=admin123
spring.data.mongodb.database=rednote
spring.data.mongodb.authentication-database=rednote

# 数据库配置
spring.datasource.url=jdbc:mysql://192.168.68.157:3306/rednote_content_domain?useUnicode=true&characterEncoding=utf-8&zeroDateTimeBehavior=convertToNull&transformedBitIsBoolean=true&allowMultiQueries=true&useSSL=false&allowPublicKeyRetrieval=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=

spring.datasource.url=jdbc:mysql://192.168.68.157:3306/rednote_user_domain?useUnicode=true&characterEncoding=utf-8&zeroDateTimeBehavior=convertToNull&transformedBitIsBoolean=true&allowMultiQueries=true&useSSL=false&allowPublicKeyRetrieval=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=

# 配置 Nacos
spring.cloud.nacos.discovery.server-addr=192.168.68.157:8280

spring.cloud.nacos.config.server-addr=192.168.68.157:8280

seata.registry.nacos.server-addr=192.168.68.157:8280
```


### 制作Docker镜像

在领域微服务根目录下创建Dockerfile文件

```
# 指定基础镜像
FROM openjdk:24-ea-17-slim

# 创建目录，作为工作目录
RUN mkdir -p /rednote-file-microservice
WORKDIR /rednote-file-microservice

# 将文件复制到镜像中
COPY ./target/rednote-file-microservice-0.0.1-SNAPSHOT.jar app.jar

# 设置TZ时区
ENV TZ=Asia/Shanghai

# 声明要暴露的端口
EXPOSE 9010

# 启动应用
CMD ["java", "-jar", "app.jar"]
```


先执行Maven构建，生成rednote-file-microservice-0.0.1-SNAPSHOT.jar文件，而后在执行docker构建：


```
docker build -t rednote-file-microservice:1.0.0 .
```


容器启动

```bash
# 启动容器（核心参数）
docker run -d --name rednote-file-microservice -p 9010:9010 rednote-file-microservice:1.0.0 
```


## 2.2 如何实现后台管理微服务容器化改造？

### 制作Docker镜像

在领域微服务根目录下创建Dockerfile文件

```
# 指定基础镜像
FROM openjdk:24-ea-17-slim

# 创建目录，作为工作目录
RUN mkdir -p /rednote-admin-microservice
WORKDIR /rednote-admin-microservice

# 将文件复制到镜像中
COPY ./target/rednote-admin-microservice-0.0.1-SNAPSHOT.jar app.jar

# 设置TZ时区
ENV TZ=Asia/Shanghai

# 声明要暴露的端口
EXPOSE 9040

# 启动应用
CMD ["java", "-jar", "app.jar"]
```


### 构建镜像及运行


```
docker build -t rednote-admin-microservice:1.0.0 .


docker run -d --name rednote-admin-microservice -p 9040:9040 rednote-admin-microservice:1.0.0 
```


## 2.3 如何实现AI微服务容器化改造？

### 制作Docker镜像

在领域微服务根目录下创建Dockerfile文件

```
# 指定基础镜像
FROM openjdk:24-ea-17-slim

# 创建目录，作为工作目录
RUN mkdir -p /rednote-ai-microservice
WORKDIR /rednote-ai-microservice

# 将文件复制到镜像中
COPY ./target/rednote-ai-microservice-0.0.1-SNAPSHOT.jar app.jar

# 设置TZ时区
ENV TZ=Asia/Shanghai

# 声明要暴露的端口
EXPOSE 9050

# 启动应用
CMD ["java", "-jar", "app.jar"]
```


### 构建镜像及运行


```
docker build -t rednote-ai-microservice:1.0.0 .


docker run -d --name rednote-ai-microservice -p 9050:9050 rednote-ai-microservice:1.0.0 
```


## 2.4 如何实现内容微服务容器化改造？

### 制作Docker镜像

在领域微服务根目录下创建Dockerfile文件

```
# 指定基础镜像
FROM openjdk:24-ea-17-slim

# 创建目录，作为工作目录
RUN mkdir -p /rednote-content-microservice
WORKDIR /rednote-content-microservice

# 将文件复制到镜像中
COPY ./target/rednote-content-microservice-0.0.1-SNAPSHOT.jar app.jar

# 设置TZ时区
ENV TZ=Asia/Shanghai

# 声明要暴露的端口
EXPOSE 9030

# 启动应用
CMD ["java", "-jar", "app.jar"]
```


### 构建镜像及运行


```
docker build -t rednote-content-microservice:1.0.0 .


docker run -d --name rednote-content-microservice -p 9030:9030 rednote-content-microservice:1.0.0 
```


## 2.5 如何实现网关微服务容器化改造？

### 制作Docker镜像

在领域微服务根目录下创建Dockerfile文件

```
# 指定基础镜像
FROM openjdk:24-ea-17-slim

# 创建目录，作为工作目录
RUN mkdir -p /rednote-gateway-microservice
WORKDIR /rednote-gateway-microservice

# 将文件复制到镜像中
COPY ./target/rednote-gateway-microservice-0.0.1-SNAPSHOT.jar app.jar

# 设置TZ时区
ENV TZ=Asia/Shanghai

# 声明要暴露的端口
EXPOSE 8080

# 启动应用
CMD ["java", "-jar", "app.jar"]
```


### 构建镜像及运行


```
docker build -t rednote-gateway-microservice:1.0.0 .


docker run -d --name rednote-gateway-microservice -p 8080:8080 rednote-gateway-microservice:1.0.0 
```


## 2.6 如何实现用户微服务容器化改造？

### 制作Docker镜像

在领域微服务根目录下创建Dockerfile文件

```
# 指定基础镜像
FROM openjdk:24-ea-17-slim

# 创建目录，作为工作目录
RUN mkdir -p /rednote-user-microservice
WORKDIR /rednote-user-microservice

# 将文件复制到镜像中
COPY ./target/rednote-user-microservice-0.0.1-SNAPSHOT.jar app.jar

# 设置TZ时区
ENV TZ=Asia/Shanghai

# 声明要暴露的端口
EXPOSE 9020

# 启动应用
CMD ["java", "-jar", "app.jar"]
```


### 构建镜像及运行


```
docker build -t rednote-user-microservice:1.0.0 .


docker run -d --name rednote-user-microservice -p 9020:9020 rednote-user-microservice:1.0.0 
```


## 2.7 如何实现前端项目容器化改造？

### 制作Docker镜像

在领域微服务根目录下创建Dockerfile文件

```
# 基础镜像
FROM node:22.17.0-alpine AS builder

# 工作目录
WORKDIR /app

# 复制项目依赖
COPY package*.json ./
COPY package-lock.json ./

# 安装依赖
RUN npm install

# 复制项目
COPY . .

# 构建
RUN npm run build

# 构建镜像
FROM nginx:1.29-alpine

# 复制构建文件
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 容器启动后默认的命令或参数
CMD ["nginx", "-g", "daemon off;"]
```


### 准备nginx.conf

在领域微服务根目录下创建nginx.conf文件


```

#user  nobody;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;
	gzip on;                    # 启用压缩
    gzip_types text/css application/javascript image/svg+xml; # 压缩类型
    gzip_min_length 1k;         # 最小压缩文件大小
    gzip_comp_level 4;          # 压缩级别（1-9，4为平衡点）
    gzip_disable "MSIE [1-6]\."; # 禁用旧版IE压缩
	
    server {
        listen       80;
        server_name  192.168.68.157;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

		# 修改允许客户端最大请求体大小，这里修改成10M，也就是客户端最大能发送10M的数据给服务器了
		client_max_body_size 10M;
  
		# 前端静态资源
        location / {
            #root   html;
            root   /usr/share/nginx/html;  # 更新路径
            index  index.html index.htm;
			try_files $uri $uri/ /index.html;
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            #root   html;
            root   /usr/share/nginx/html;  # 更新路径
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}
		
		#反向代理
		location /api/ {
			proxy_pass  http://rednote-gateway-microservice/;
		}
		
		location /file/ {
			proxy_pass  http://rednote-gateway-microservice/file/;
		}
		
		location /uploads/ {
			proxy_pass  http://rednote-gateway-microservice/uploads/;
		}
		
    }

	upstream rednote-gateway-microservice {
		server 192.168.68.157:8080;
	}

    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       8000;
    #    listen       somename:8080;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}


    # HTTPS server
    #
    #server {
    #    listen       443 ssl;
    #    server_name  localhost;

    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;

    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;

    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}

}

```

### 构建镜像及运行


```
docker build -t rednote-ui:1.0.0 .


docker run -d --name rednote-ui -p 80:80 rednote-ui:1.0.0 
```


## 3.1 Docker Compose编排仿“小红书”全栈项目

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
