---
title: "MongoDB从安装到核心架构：快速搭建文档存储系统"
published: 2026-08-25
description: "MongoDB作为最流行的文档型数据库，以其灵活的 schema 设计、强大的查询能力和优秀的可扩展性，成为处理非结构化和半结构化数据的首选。本文将从安装部署开始，逐步深入到核心架构，帮助你快速搭建并…"
image: ''
tags: [MongoDB, NoSQL]
category: 指南
collections: [java-fullstack, java-fullstack-distributed]
draft: false
lang: ''
slug: java-course13-2-1
pinned: false
comment: true
---

MongoDB作为最流行的文档型数据库，以其灵活的 schema 设计、强大的查询能力和优秀的可扩展性，成为处理非结构化和半结构化数据的首选。本文将从安装部署开始，逐步深入到核心架构，帮助你快速搭建并理解MongoDB文档存储系统。

### 一、MongoDB Community Server在Windows下通过zip方式安装

本文主要介绍在Windows系统下通过ZIP文件安装MongoDB Community Server 8.0.11。

<!-- more -->


#### 1. 安装前准备

1. 确认系统要求：MongoDB 8.0.11社区版支持64位的Windows 11、Windows 10及Windows Server 2022等系统，需确保系统为64位版本。
2. 下载安装包：访问MongoDB官方下载页面（<https://www.mongodb.com/try/download/community>），选择版本为8.0.11、平台为Windows x64、安装包类型为zip的MongoDB Community Server安装包进行下载。

#### 2. 安装步骤

1. 解压安装包：

	* 将下载的ZIP文件解压到目标目录，例如`D:\dev\database\mongodb-win32-x86_64-windows-8.0.11`。
	* 解压后，确保目录中包含`bin`文件夹，其中包含`mongod.exe`（MongoDB服务端）和`mongosh.exe`（MongoDB Shell，需单独安装）等关键文件。

2. 创建数据目录和日志目录：

	* 在合适的位置创建数据目录，例如`D:\data\mongodb\db`，用于存储MongoDB的数据文件。
	* 如需记录日志，可创建日志目录，例如`D:\data\mongodb\log`。

3. 配置环境变量（可选）：

	* 为了方便在命令行中直接运行MongoDB相关命令，可将MongoDB的`bin`目录添加到系统的`PATH`环境变量中。

4. 安装MongoDB Shell（mongosh）：

	* MongoDB Shell（mongosh）不会随MongoDB Server一起安装，需单独下载并安装。
	* 访问MongoDB官方下载页面（<https://www.mongodb.com/try/download/shell>），下载适用于Windows的mongosh安装包。
	* 运行安装包，按照提示完成安装，并确保在安装过程中将`mongosh.exe`的路径添加到`PATH`环境变量中。

#### 3. 启动MongoDB服务

1. 以管理员身份打开命令提示符：


右键点击“命令提示符”或“PowerShell”，选择“以管理员身份运行”。

2. 启动MongoDB服务：


导航到MongoDB的`bin`目录，例如`cd D:\dev\database\mongodb-win32-x86_64-windows-8.0.11\bin`。运行以下命令启动MongoDB服务，指定数据目录路径：

```bash
mongod.exe --dbpath="D:\data\mongodb\db"
```


如果创建了日志目录，并希望通过配置文件启动服务，可在`bin`目录下创建`mongod.cfg`文件，并添加以下内容：

```yaml
systemLog:
  destination: file
  path: "D:\\data\\mongodb\\log\\mongod.log"
  logAppend: true
storage:
  dbPath: "D:\\data\\mongodb\\db"
net:
  bindIp: 127.0.0.1
  port: 27017
```


然后运行以下命令启动服务：

```bash
mongod.exe --config "D:\dev\database\mongodb-win32-x86_64-windows-8.0.11\bin\mongod.cfg"
```

3. 验证服务是否启动成功：


如果服务启动成功，可在浏览器中访问`http://127.0.0.1:27017`，如果看到`It looks like you are trying to access MongoDB over HTTP on the native driver port.`的提示，说明服务已成功启动。


### 二、安装、使用MongoDB Shell 2.5.3

在Windows系统下通过ZIP文件安装MongoDB Shell 2.5.3，可按照以下步骤进行：

#### 1. 下载MongoDB Shell 2.5.3 ZIP文件

1. 访问MongoDB官方下载页面：https://www.mongodb.com/try/download/shell。
2. 在下载页面中，选择适合Windows系统的版本，并确保版本号为2.5.3（或最新稳定版，如果2.5.3不可用）。
3. 选择ZIP格式作为安装包类型，然后点击“Download”按钮开始下载。

#### 2. 解压安装包

1. 下载完成后，选择一个合适的目录来解压MongoDB Shell ZIP文件，例如`D:\dev\database\mongosh-2.5.3-win32-x64`。
2. 右键点击下载的ZIP文件，选择“解压到当前文件夹”或使用解压工具将其解压到指定目录。

#### 3. 配置环境变量（可选）

为了方便在命令行中直接运行MongoDB Shell命令，可将MongoDB Shell的`bin`目录添加到系统的`PATH`环境变量中。

1. 右键点击“此电脑”或“我的电脑”，选择“属性”。
2. 点击“高级系统设置”，然后点击“环境变量”。
3. 在“系统变量”部分，找到并选择`Path`变量，然后点击“编辑”。
4. 在“编辑环境变量”窗口中，点击“新建”，然后输入MongoDB Shell的`bin`目录路径，例如`D:\dev\database\mongosh-2.5.3-win32-x64\bin`。
5. 点击“确定”保存更改。

#### 4. 验证安装

1. 打开命令提示符（CMD）或PowerShell。
2. 输入`mongosh --version`命令，然后按Enter键。
3. 如果安装成功，将显示MongoDB Shell的版本信息，其中应包含2.5.3或您安装的版本号。

#### 1. 使用MongoDB Shell

1. 在命令提示符或PowerShell中，输入`mongosh`命令，然后按Enter键。
2. 如果MongoDB服务器运行在本地默认端口（27017），MongoDB Shell将自动连接到该服务器。输出内容如下

```
>mongosh
Current Mongosh Log ID: 6862ae96944d498931748a5e
Connecting to:          mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.3
Using MongoDB:          8.0.11
Using Mongosh:          2.5.3

For mongosh info see: https://www.mongodb.com/docs/mongodb-shell/


To help improve our products, anonymous usage data is collected and sent to MongoDB periodically (https://www.mongodb.com/legal/privacy-policy).
You can opt-out by running the disableTelemetry() command.

------
   The server generated these startup warnings when booting
   2025-06-30T17:37:01.619+08:00: Access control is not enabled for the database. Read and write access to data and configuration is unrestricted
------

test> 
```

连接成功后，可以执行各种MongoDB数据库操作。

### 三、在其他平台安装MongoDB

#### 1. Linux系统安装（以Ubuntu为例）

```bash
# 导入MongoDB公共GPG密钥
wget -qO - https://www.mongodb.org/static/pgp/server-8.0.11.asc | sudo apt-key add -

# 创建列表文件
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/8.0.11 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.11.list

# 更新包数据库
sudo apt-get update

# 安装MongoDB
sudo apt-get install -y mongodb-org

# 启动MongoDB服务
sudo systemctl start mongod

# 设置开机自启
sudo systemctl enable mongod

# 检查服务状态
sudo systemctl status mongod
```

#### 2. macOS系统安装


```bash
# 使用Homebrew安装
brew tap mongodb/brew
brew install mongodb-community@8.0.11

# 启动MongoDB
brew services start mongodb-community@8.0.11

# 停止MongoDB
brew services stop mongodb-community@8.0.11
```


### 四、MongoDB核心概念与数据模型

#### 1. 核心概念解析

MongoDB的核心概念与关系型数据库有所不同，对应关系如下：

| MongoDB概念 | 关系型数据库概念 | 说明 |
|------------|-----------------|------|
| Database | Database | 数据库，一个MongoDB实例可以包含多个数据库 |
| Collection | Table | 集合，类似于表，但不需要固定结构 |
| Document | Row | 文档，类似于行，以BSON格式存储 |
| Field | Column | 字段，类似于列 |
| Index | Index | 索引，功能类似 |
| ObjectId | Primary Key | 文档唯一标识，自动生成 |

#### 2. 文档模型详解

MongoDB使用BSON（Binary JSON）格式存储数据，它是JSON的二进制扩展，支持更多数据类型：

```json
{
  "_id": ObjectId("60d21b4667d0d8992e610c85"),  // 自动生成的唯一标识
  "name": "MongoDB Guide",
  "author": {  // 嵌套文档
    "firstName": "John",
    "lastName": "Doe"
  },
  "tags": ["database", "mongodb", "nosql"],  // 数组
  "published": true,  // 布尔值
  "publishDate": ISODate("2023-06-20T08:00:00Z"),  // 日期类型
  "pages": 250,  // 整数
  "rating": 4.5  // 浮点数
}
```

主要BSON数据类型：
- 基本类型：字符串、整数、浮点数、布尔值、null
- 特殊类型：ObjectId、ISODate、正则表达式、二进制数据
- 复合类型：数组、嵌套文档

#### 3. 数据库与集合操作

```javascript
// 创建/切换数据库
use mydatabase

// 查看当前数据库
db

// 删除当前数据库
db.dropDatabase()

// 创建集合
db.createCollection("users")

// 查看集合列表
show collections

// 删除集合
db.users.drop()
```

### 三、MongoDB核心架构

#### 1. 整体架构概览

MongoDB的架构可以从简单到复杂分为几个层次：
- 单实例架构：适合开发和测试环境
- 副本集架构：提供高可用性和数据冗余
- 分片集群架构：支持大规模数据存储和高并发访问


#### 2. 单实例架构

单实例架构是最基础的部署方式，由一个mongod进程组成：

```
[客户端] <--> [mongod进程] <--> [磁盘存储]
```

组件说明：
- mongod：MongoDB的核心进程，负责处理所有数据库操作
- 内存缓存：用于缓存热点数据，提高查询性能
- 磁盘存储：数据持久化存储的位置
- 日志系统：确保数据完整性和提供故障恢复能力

单实例优点：部署简单、资源占用少；

单实例缺点：无高可用保障，适合开发测试环境

#### 3. 副本集架构（高可用）

副本集是一组维护相同数据的mongod实例，提供高可用性和数据冗余：

```
[客户端]
     |
     v
[主节点(Primary)] <--> [从节点(Secondary)]
     ^                        ^
     |                        |
     +------------------------+
                |
                v
        [仲裁节点(Arbiter)]
```

副本集角色：
- 主节点（Primary）：处理所有写操作和部分读操作
- 从节点（Secondary）：复制主节点的数据，可处理读操作
- 仲裁节点（Arbiter）：不存储数据，仅参与选举投票

副本集工作原理：
1. 主节点接收所有写操作，并记录到 oplog（操作日志）
2. 从节点定期从主节点同步 oplog 并应用到自己的数据集
3. 当主节点故障时，从节点会自动选举新的主节点
4. 默认情况下，读操作只在主节点执行，可配置读偏好让读操作分布到从节点


#### 4. 分片集群架构（水平扩展）

当数据量达到TB级别或需要极高的读写性能时，分片集群是理想选择：

```
[客户端] <--> [mongos路由] <--> [配置服务器(Config Server)]
                   |
         +---------+---------+
         |         |         |
  [分片1(副本集)] [分片2(副本集)] [分片3(副本集)]
```

分片集群组件：
- mongos：路由服务器，负责将请求分发到合适的分片
- 分片（Shard）：存储部分数据，每个分片都是一个副本集
- 配置服务器（Config Server）：存储集群的元数据和分片信息

分片工作原理：
1. 数据按照"分片键"被划分到不同的分片
2. mongos根据配置服务器中的元数据，将请求路由到正确的分片
3. 应用程序通过mongos访问数据，无需关心数据存储在哪个分片

常见的分片策略：
- 范围分片：根据分片键的范围划分数据
- 哈希分片：对分片键进行哈希计算，均匀分布数据

创建分片集群的基本步骤：
1. 部署配置服务器副本集
2. 部署mongos路由服务器
3. 部署多个分片（每个分片是一个副本集）
4. 配置分片集群并启用分片功能
5. 为集合创建分片键并启用分片


### 总结

MongoDB提供了从简单到复杂的多种部署方案，满足不同规模应用的需求：

1. 开发测试环境：选择单实例部署，简单易用
2. 生产环境（中小规模）：使用副本集架构，确保高可用性
3. 大规模生产环境：采用分片集群，实现水平扩展

通过本文介绍的安装配置、核心架构和基本操作，你已经具备了搭建和使用MongoDB文档存储系统的基础知识。在实际应用中，还需要根据具体业务需求进行性能优化和架构调整，充分发挥MongoDB在处理非结构化数据方面的优势。
