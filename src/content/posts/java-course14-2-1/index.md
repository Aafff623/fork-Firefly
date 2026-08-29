---
title: "Nginx从安装到配置：快速搭建反向代理系统"
published: 2026-08-25
description: "Nginx作为高性能的HTTP和反向代理服务器，是全栈开发中处理高并发、实现流量调度的核心工具。下面将从Nginx安装、反向代理核心配置、基础命令使用，到快速搭建可用的反向代理系统，覆盖Linux（C…"
image: ''
tags: [Nginx, 反向代理]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course14-2-1
pinned: false
comment: true
---

Nginx作为高性能的HTTP和反向代理服务器，是全栈开发中处理高并发、实现流量调度的核心工具。下面将从Nginx安装、反向代理核心配置、基础命令使用，到快速搭建可用的反向代理系统，覆盖Linux（CentOS/Ubuntu）和Windows主流环境。


### 一、Nginx在Linux环境安装

在新机器上首次安装 Nginx 前，需先配置 Nginx 软件包仓库。配置完成后，即可从该仓库安装和更新 Nginx。


#### 1. RHEL 及其衍生版
本节适用于 Red Hat Enterprise Linux 及其衍生版（如 CentOS、Oracle Linux、Rocky Linux、AlmaLinux）。

1. 安装依赖工具：
   ```bash
   sudo yum install yum-utils
   ```

2. 配置 yum 仓库：创建 `/etc/yum.repos.d/nginx.repo` 文件，并写入以下内容：
   ```ini
   [nginx-stable]
   name=nginx stable repo
   baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
   gpgcheck=1
   enabled=1
   gpgkey=https://nginx.org/keys/nginx_signing.key
   module_hotfixes=true

   [nginx-mainline]
   name=nginx mainline repo
   baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
   gpgcheck=1
   enabled=0
   gpgkey=https://nginx.org/keys/nginx_signing.key
   module_hotfixes=true
   ```

3. （可选）启用主线版仓库：默认使用稳定版 Nginx 软件包仓库。若需使用主线版（mainline）软件包，执行以下命令：
   ```bash
   sudo yum-config-manager --enable nginx-mainline
   ```

4. 安装 Nginx：
   ```bash
   sudo yum install nginx
   ```

5. 验证 GPG 密钥：当提示接受 GPG 密钥时，验证指纹是否为 `573B FD6B 3D8F BC64 1079 A6AB ABF5 BD82 7BD9 BF62`，若一致则接受。


### 2. Debian/Ubuntu

1. 安装依赖工具：
   ```bash
   sudo apt install curl gnupg2 ca-certificates lsb-release debian-archive-keyring
   ```

2. 导入 Nginx 官方签名密钥（用于 apt 验证软件包真实性）：
   ```bash
   curl https://nginx.org/keys/nginx_signing.key | gpg --dearmor \
       | sudo tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
   ```

3. 验证密钥有效性：
   ```bash
   gpg --dry-run --quiet --no-keyring --import --import-options import-show /usr/share/keyrings/nginx-archive-keyring.gpg
   ```
   输出应包含完整指纹 `573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62`，格式如下：
   ```
   pub   rsa2048 2011-08-19 [SC] [expires: 2027-05-24]
         573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62
   uid                      nginx signing key <signing-key@nginx.com>
   ```
   注：输出中可能包含其他用于签名软件包的密钥。

4. 配置 apt 仓库（稳定版）：
   ```bash
   echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
   http://nginx.org/packages/debian `lsb_release -cs` nginx" \
       | sudo tee /etc/apt/sources.list.d/nginx.list
   ```
   若需使用主线版（mainline）软件包，替换为以下命令：
   ```bash
   echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] \
   http://nginx.org/packages/mainline/debian `lsb_release -cs` nginx" \
       | sudo tee /etc/apt/sources.list.d/nginx.list
   ```

5. 配置仓库优先级（优先使用 Nginx 官方包而非系统自带包）：
   ```bash
   echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" \
       | sudo tee /etc/apt/preferences.d/99nginx
   ```

6. 安装 Nginx：
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

### 二、Nginx在Windows环境安装


适合开发测试，步骤更直观：
1. 下载安装包：访问[Nginx官网](http://nginx.org/)，下载Windows版本（如`nginx-1.29.0.zip`）。
2. 解压部署：将压缩包解压到自定义目录（如`D:\dev\web\nginx-1.29.0`），注意路径不要包含中文或空格。
3. 启动Nginx：
   - 打开「命令提示符」（管理员权限），进入解压目录：`cd D:\dev\web\nginx-1.29.0`。
   - 启动命令：`start nginx`（无弹窗提示，进程后台运行）。
4. 验证安装：
   - 浏览器访问`http://localhost`，若显示「Welcome to nginx!」则成功。
   - 查看进程：任务管理器中找到`nginx.exe`（2个进程：主进程+工作进程）。


### 三、Nginx常用命令

```bash
# 1. 启动/停止/重启
nginx                  # 启动
nginx -s stop          # 强制停止
nginx -s quit          # 优雅停止（处理完当前请求后停止）
nginx -s reload        # 优雅重启（不中断服务，加载新配置）

# 2. 配置检查（修改配置后必做，避免配置错误导致服务无法启动）
nginx -t               # 检查配置文件语法
nginx -t -c /etc/nginx/nginx.conf # 指定配置文件检查

# 3. 查看日志（故障排查核心）
tail -f /var/log/nginx/access.log # 实时查看访问日志（请求路径、IP、状态码等）
tail -f /var/log/nginx/error.log  # 实时查看错误日志（配置错误、后端连接失败等）
```


### 四、核心配置：搭建反向代理系统
Nginx的配置文件是核心，默认路径如下：
- Linux（包管理安装）：`/etc/nginx/nginx.conf`
- Linux（源码安装）：`/usr/local/nginx/conf/nginx.conf`
- Windows：`D:\dev\web\nginx-1.29.0\conf\nginx.conf`


假设后端有一个服务（运行在`127.0.0.1:3000`），需通过Nginx（`http://localhost:80`）转发请求，配置步骤如下。


打开`nginx.conf`，找到`http`块下的`server`块，替换为以下内容：
```nginx
http {
    include       mime.types;  #  mime类型映射（静态文件类型识别）
    default_type  application/octet-stream;

    # 日志格式配置（可选，便于排查问题）
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;  # Linux日志路径
    # Windows日志路径：access_log  logs/access.log  main;

    sendfile        on;  # 启用高效文件传输模式
    keepalive_timeout  65;  # 客户端连接超时时间

    # 反向代理核心：定义后端服务（单服务）
    server {
        listen       80;  # Nginx监听端口（默认80，HTTP协议）
        server_name  localhost;  # 绑定的域名/IP（生产环境填真实域名，如www.example.com）

        # 所有请求转发到后端服务
        location / {
            proxy_pass http://127.0.0.1:3000;  # 后端服务地址（核心配置）
            proxy_set_header Host $host;  # 传递客户端Host头到后端
            proxy_set_header X-Real-IP $remote_addr;  # 传递客户端真实IP到后端
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # 传递代理链IP
        }
    }
}
```


关键配置说明

| 配置项 | 作用 | 必要性 |
|--------|------|--------|
| `proxy_pass` | 指定后端服务地址（如`http://IP:端口`），是反向代理的核心 | 必须 |
| `proxy_set_header Host $host` | 确保后端服务能获取客户端请求的真实域名（避免后端识别为`127.0.0.1`） | 推荐 |
| `proxy_set_header X-Real-IP` | 让后端服务获取客户端真实IP（否则后端看到的是Nginx的IP） | 推荐 |
| `X-Forwarded-For` | 记录代理链的IP地址（多代理场景下有用） | 可选 |


通过以上步骤，您已完成Nginx从安装到反向代理的全流程搭建，可根据实际业务需求扩展HTTPS（需配置SSL证书）、动静分离、缓存策略等高级功能，进一步提升系统的性能和安全性。
