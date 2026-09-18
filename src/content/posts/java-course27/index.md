---
title: "Kubernetes 部署实战（Java 课程 27 · 全 10 节合订）"
published: 2026-09-18
description: "用 Kubernetes 部署仿小红书项目：K8s 编排实战。"
image: ''
tags: [Kubernetes, K8s, 部署]
category: 指南
collections: [java-fullstack, java-fullstack-ai-cloud]
draft: false
lang: ''
slug: java-course27
pinned: false
comment: true
---
> 本页为原「Java 课程 27」全部 10 个分节的合订本；原分节链接会自动跳转到本页。


## 1.1 全栈工程师如何使用Kubernetes部署仿“小红书”项目

仿“小红书”项目作为典型的全栈应用，涵盖前端应用、后端API、数据库、缓存、对象存储等多组件，部署复杂度较高。Kubernetes（K8s）作为容器编排平台，能通过容器化标准化部署流程、通过编排能力实现组件协同、通过弹性伸缩适配流量波动，是全栈工程师实现仿“小红书”项目高效部署与运维的最优解之一。


* 使用Docker Desktop中的Kubernetes	
  * 在Docker Desktop中启用Kubernetes
  * Kubernetes常用命令演示
* Kubernetes部署仿“小红书”全栈项目
  * 如何进行全栈视角下的后端项目K8s改造？
  * 如何实现后台管理微服务K8s改造？
  * 如何实现AI微服务K8s改造？
  * 如何实现内容微服务K8s改造？
  * 如何实现网关微服务K8s改造？
  * 如何实现用户微服务K8s改造？
  * 如何实现用前端项目K8s改造？

### 核心需求确认
你需要为仿“小红书”项目补充部署7个核心微服务（admin、ai、content、user、file、gateway、ui）的Kubernetes YAML文件，适配Docker Desktop内置的K8s集群特性（单节点、轻量资源、本地镜像、NodePort访问），且与已部署的网关服务协同工作。

### 通用适配说明（所有微服务均遵循）
1. 环境：Docker Desktop K8s（单节点），副本数均设为1；
2. 镜像：使用本地构建镜像（`imagePullPolicy: Never`），需提前`docker build`构建对应镜像；
3. 网络：通过`ClusterIP`服务实现内部通信，网关通过服务名转发请求；
4. 资源：适配本地机器性能，CPU/内存配置轻量化；
5. 依赖：统一依赖Redis/MySQL/Kafka/MongoDB（后续可补充这些组件的部署YAML），环境变量中通过K8s服务名访问。


## 2.2 Kubernetes常用命令演示

```
# 检查 Pod 的状态
kubectl get pods
kubectl get deployments 
kubectl get services
```

```bash
# 查看命名空间下的Pod
kubectl get pods -n rednote
# 查看Service（确认NodePort端口）
kubectl get svc -n rednote
# 查看日志（排查异常）
kubectl logs -f <pod-name> -n rednote
```


## 3.1 如何进行全栈视角下的后端项目K8s改造？

### 后端API部署（Namespace+Deployment+Service）


新建rednote-gateway-microservice-deployment.yaml文件，内容如下

```Plain Text
# 定义命名空间
apiVersion: v1
kind: Namespace
metadata:
  name: rednote
# 定义部署Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rednote-gateway-microservice
  namespace: rednote
  labels:
    app: rednote-gateway
spec:
  replicas: 1 # 副本数
  selector:
    matchLabels:
      app: rednote-gateway
  strategy:
    type: RollingUpdate # 滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: rednote-gateway
    spec:
      containers:
        - name: rednote-gateway-microservice
          image: rednote-gateway-microservice:1.0.0
          imagePullPolicy: Never  # 使用本地镜像
          ports:
            - containerPort: 8080
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
  name: rednote-gateway-microservice
  namespace: rednote
spec:
  type: NodePort
  selector:
    app: rednote-gateway
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 30080
      protocol: TCP
```


### 关键配置说明
- `imagePullPolicy: Never`：Docker Desktop中优先使用本地构建的镜像，避免去外网拉取（需先执行`docker build -t rednote-gateway-microservice:1.0.0 .`构建镜像）；
- `NodePort: 30080`：本地可通过`http://localhost:30080`访问网关服务；
- 资源限制：适配Docker Desktop的轻量特性，CPU/内存配置远低于生产环境；
- 依赖服务地址：格式为`服务名.命名空间.svc.cluster.local`，需确保网关等依赖服务已部署在`rednote`命名空间。


应用后端API部署配置：

```Plain Text

kubectl apply -f rednote-gateway-microservice-deployment.yaml
```


## 3.2 如何实现后台管理微服务K8s改造？

### 后端API部署（Deployment+Service）


新建rednote-admin-microservice-deployment.yaml文件，内容如下

```Plain Text
# 定义部署Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rednote-admin-microservice
  namespace: rednote
  labels:
    app: rednote-admin
spec:
  replicas: 1 # 副本数
  selector:
    matchLabels:
      app: rednote-admin
  strategy:
    type: RollingUpdate # 滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: rednote-admin
    spec:
      containers:
        - name: rednote-admin-microservice
          image: rednote-admin-microservice:1.0.0
          imagePullPolicy: Never  # 使用本地镜像
          ports:
            - containerPort: 9040
              protocol: TCP
          # 资源限制
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi  
          # 环境变量
          env:
            - name: spring.cloud.nacos.discovery.server-addr
              value: host.docker.internal:8280
            - name: spring.cloud.nacos.config.server-addr
              value: host.docker.internal:8280  
            - name: seata.registry.nacos.server-addr
              value: host.docker.internal:8280    
            - name: spring.data.redis.host
              value: host.docker.internal
            - name: spring.kafka.bootstrap-servers
              value: host.docker.internal:9092    
# 定义服务Service
apiVersion: v1
kind: Service
metadata:
  name: rednote-admin-microservice
  namespace: rednote
spec:
  type: ClusterIP # 集群内访问
  selector:
    app: rednote-admin
  ports:
    - port: 9040
      targetPort: 9040
      protocol: TCP
```

应用后端API部署配置：

```Plain Text

kubectl apply -f rednote-admin-microservice-deployment.yaml
```


## 3.3 如何实现AI微服务K8s改造？

### 后端API部署（Deployment+Service）


新建rednote-ai-microservice-deployment.yaml文件，内容如下

```Plain Text
# 定义部署Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rednote-ai-microservice
  namespace: rednote
  labels:
    app: rednote-ai
spec:
  replicas: 1 # 副本数
  selector:
    matchLabels:
      app: rednote-ai
  strategy:
    type: RollingUpdate # 滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: rednote-ai
    spec:
      containers:
        - name: rednote-ai-microservice
          image: rednote-ai-microservice:1.0.0
          imagePullPolicy: Never  # 使用本地镜像
          ports:
            - containerPort: 9050
              protocol: TCP
          # 资源限制
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi  
          # 环境变量
          env:
            - name: spring.cloud.nacos.discovery.server-addr
              value: host.docker.internal:8280
            - name: spring.cloud.nacos.config.server-addr
              value: host.docker.internal:8280  
            - name: seata.registry.nacos.server-addr
              value: host.docker.internal:8280    
# 定义服务Service
apiVersion: v1
kind: Service
metadata:
  name: rednote-ai-microservice
  namespace: rednote
spec:
  type: ClusterIP # 集群内访问
  selector:
    app: rednote-ai
  ports:
    - port: 9050
      targetPort: 9050
      protocol: TCP
```

应用后端API部署配置：

```Plain Text

kubectl apply -f rednote-ai-microservice-deployment.yaml
```


## 3.4 如何实现内容微服务K8s改造？

### 后端API部署（Deployment+Service）


新建rednote-content-microservice-deployment.yaml文件，内容如下

```
# 定义部署Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rednote-content-microservice
  namespace: rednote
  labels:
    app: rednote-content
spec:
  replicas: 1 # 副本数
  selector:
    matchLabels:
      app: rednote-content
  strategy:
    type: RollingUpdate # 滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: rednote-content
    spec:
      containers:
        - name: rednote-content-microservice
          image: rednote-content-microservice:1.0.0
          imagePullPolicy: Never  # 使用本地镜像
          ports:
            - containerPort: 9030
              protocol: TCP
          # 资源限制
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi  
          # 环境变量
          env:
            - name: spring.cloud.nacos.discovery.server-addr
              value: host.docker.internal:8280
            - name: spring.cloud.nacos.config.server-addr
              value: host.docker.internal:8280  
            - name: seata.registry.nacos.server-addr
              value: host.docker.internal:8280    
            - name: spring.data.redis.host
              value: host.docker.internal
            - name: spring.kafka.bootstrap-servers
              value: host.docker.internal:9092  
            - name: spring.datasource.url
              value: jdbc:mysql://host.docker.internal:3306/rednote_content_domain?useUnicode=true&characterEncoding=utf-8&zeroDateTimeBehavior=convertToNull&transformedBitIsBoolean=true&allowMultiQueries=true&useSSL=false&allowPublicKeyRetrieval=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=
# 定义服务Service
apiVersion: v1
kind: Service
metadata:
  name: rednote-content-microservice
  namespace: rednote
spec:
  type: ClusterIP # 集群内访问
  selector:
    app: rednote-content
  ports:
    - port: 9030
      targetPort: 9030
      protocol: TCP
```

应用后端API部署配置：

```

kubectl apply -f rednote-content-microservice-deployment.yaml
```


## 3.5 如何实现文件微服务K8s改造？

### 后端API部署（Deployment+Service）


新建rednote-file-microservice-deployment.yaml文件，内容如下

```
# 定义部署Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rednote-file-microservice
  namespace: rednote
  labels:
    app: rednote-file
spec:
  replicas: 1 # 副本数
  selector:
    matchLabels:
      app: rednote-file
  strategy:
    type: RollingUpdate # 滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: rednote-file
    spec:
      containers:
        - name: rednote-file-microservice
          image: rednote-file-microservice:1.0.0
          imagePullPolicy: Never  # 使用本地镜像
          ports:
            - containerPort: 9010
              protocol: TCP
          # 资源限制
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 1000m
              memory: 1024Mi  
          # 环境变量
          env:
            - name: spring.cloud.nacos.discovery.server-addr
              value: host.docker.internal:8280
            - name: spring.cloud.nacos.config.server-addr
              value: host.docker.internal:8280  
            - name: seata.registry.nacos.server-addr
              value: host.docker.internal:8280    
            - name: spring.data.mongodb.host
              value: host.docker.internal
# 定义服务Service
apiVersion: v1
kind: Service
metadata:
  name: rednote-file-microservice
  namespace: rednote
spec:
  type: ClusterIP # 集群内访问
  selector:
    app: rednote-file
  ports:
    - port: 9010
      targetPort: 9010
      protocol: TCP
```

应用后端API部署配置：

```
kubectl apply -f rednote-file-microservice-deployment.yaml
```


## 3.6 如何实现用户微服务K8s改造？

### 后端API部署（Deployment+Service）


新建rednote-user-microservice-deployment.yaml文件，内容如下

```
# 定义部署Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rednote-user-microservice
  namespace: rednote
  labels:
    app: rednote-user
spec:
  replicas: 1 # 副本数
  selector:
    matchLabels:
      app: rednote-user
  strategy:
    type: RollingUpdate # 滚动更新
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: rednote-user
    spec:
      containers:
        - name: rednote-user-microservice
          image: rednote-user-microservice:1.0.0
          imagePullPolicy: Never  # 使用本地镜像
          ports:
            - containerPort: 9020
              protocol: TCP
          # 资源限制
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi  
          # 环境变量
          env:
            - name: spring.cloud.nacos.discovery.server-addr
              value: host.docker.internal:8280
            - name: spring.cloud.nacos.config.server-addr
              value: host.docker.internal:8280  
            - name: seata.registry.nacos.server-addr
              value: host.docker.internal:8280    
            - name: spring.datasource.url
              value: jdbc:mysql://host.docker.internal:3306/rednote_user_domain?useUnicode=true&characterEncoding=utf-8&zeroDateTimeBehavior=convertToNull&transformedBitIsBoolean=true&allowMultiQueries=true&useSSL=false&allowPublicKeyRetrieval=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=
# 定义服务Service
apiVersion: v1
kind: Service
metadata:
  name: rednote-user-microservice
  namespace: rednote
spec:
  type: ClusterIP # 集群内访问
  selector:
    app: rednote-user
  ports:
    - port: 9020
      targetPort: 9020
      protocol: TCP
```

应用后端API部署配置：

```
kubectl apply -f rednote-user-microservice-deployment.yaml
```


## 3.7 如何实现用前端项目K8s改造？

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


## 4.1 课程总结

1. 核心适配点：所有微服务均为轻量配置，适配Docker Desktop K8s单节点特性；
2. 服务通信：通过`服务名.命名空间.svc.cluster.local`实现内部访问，网关统一转发，适配K8s服务发现。
3. Docker Desktop K8s适配核心：
   - 使用`NodePort`暴露服务，无需Ingress；
   - 镜像拉取策略设为`Never`，优先本地镜像；
   - 资源限制适配本地机器性能，副本数设为1；
4. 前端关键：修改Nginx配置，实现API请求自动转发到网关


未来优化点：如果需要部署Redis/MySQL等依赖服务，可基于相同思路编写YAML，核心是使用`hostPath`挂载宿主机目录实现数据持久化（Docker Desktop中宿主机目录可映射到`/mnt/c/`（Windows）或`/Users/`（Mac））。
