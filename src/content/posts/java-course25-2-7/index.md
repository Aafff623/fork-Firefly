---
title: "如何实现前端项目容器化改造？"
published: 2026-08-25
description: "在领域微服务根目录下创建Dockerfile文件"
image: ''
tags: [Docker, 容器化, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course25-2-7
pinned: false
comment: true
---

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
