---
title: "如何实现用前端项目K8s改造？"
published: 2026-08-25
description: "前端暴露服务，实现域名访问。"
image: ''
tags: [Kubernetes, K8s, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course27-3-7
pinned: false
comment: true
---

### 前端部署（Deployment+Service）

前端暴露服务，实现域名访问。

```Plain Text
# 定义部署Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rednote-ui
  namespace: rednote
  labels:
    app: rednote-ui
spec:
  replicas: 1 # 副本数
  selector:
    matchLabels:
      app: rednote-ui
  strategy:
    type: RollingUpdate # 滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: rednote-ui
    spec:
      containers:
        - name: rednote-ui
          image: rednote-ui:1.0.0
          imagePullPolicy: Never  # 使用本地镜像
          ports:
            - containerPort: 80
              protocol: TCP
          # 资源限制
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi    
# 定义服务Service
apiVersion: v1
kind: Service
metadata:
  name: rednote-ui
  namespace: rednote
spec:
  type: NodePort
  selector:
    app: rednote-ui
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30081
      protocol: TCP

```


### 关键配置说明
- 将`/api`请求转发到网关服务（地址为`rednote-gateway-service.rednote.svc.cluster.local:8080`），无需前端硬编码网关IP；
- 前端页面可通过`http://localhost:30081`访问，API请求自动转发到网关；


### 修改镜像配置


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
        server_name  localhost;  # 修改点1

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
		server rednote-gateway-microservice.rednote.svc.cluster.local:8080;  # 修改点2
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


### 启动


构建前端镜像（进入前端项目目录）

```
docker build -t rednote-ui:1.0.0 .
```


应用前端部署配置：

```Plain Text
kubectl apply -f rednote-ui-deployment.yaml
```
